/**
 * @file simulation.c
 * @brief Crisis simulation engine, real-time clock, scenario generator, and mission tick.
 */
#include "simulation.h"
#include "emergency.h"
#include "resource.h"
#include "graph.h"
#include "common.h"
#include "ui.h"
#include "utils.h"

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>

static int g_sim_minutes = 0;

void simulation_init(void) {
    g_sim_minutes = 0;
}

int simulation_get_clock_minutes(void) {
    return g_sim_minutes;
}

void simulation_load_crisis_scenario(void) {
    emergency_db_init();
    resource_db_init();
    graph_load_demo_city();
    simulation_init();

    /* 1. Register fleet */
    static const struct {
        const char *id;
        const char *name;
        ResourceType type;
        NodeID base_node;
        int capacity;
        uint32_t caps;
    } fleet[] = {
        {"AMB-01", "Metro ALS Ambulance 1",      RES_AMBULANCE,    2, 4,  CAP_FIRST_AID | CAP_ADVANCED_LIFE},
        {"AMB-02", "Rapid Paramedic Unit 2",     RES_AMBULANCE,    0, 2,  CAP_FIRST_AID | CAP_ADVANCED_LIFE},
        {"ENG-01", "Heavy Pumper Engine 1",      RES_FIRE_TRUCK,   1, 6,  CAP_FIRE_SUPPRESS},
        {"ENG-02", "Ladder Tower Truck 2",       RES_FIRE_TRUCK,  11, 4,  CAP_FIRE_SUPPRESS},
        {"POL-01", "Tactical Patrol Cruiser 1",  RES_POLICE,       0, 4,  CAP_CROWD_CONTROL | CAP_FIRST_AID},
        {"COP-01", "Air Medevac SkyRescue 1",    RES_HELICOPTER,   5, 4,  CAP_AERIAL | CAP_SEARCH_RESCUE | CAP_FIRST_AID},
        {"HAZ-01", "HazMat Decon Mobile 1",      RES_HAZMAT_UNIT,  8, 3,  CAP_HAZMAT | CAP_FIRST_AID},
        {"RES-01", "Heavy Urban Rescue Squad 1", RES_RESCUE_TEAM,  3, 8,  CAP_SEARCH_RESCUE | CAP_FIRST_AID}
    };

    for (size_t i = 0; i < sizeof(fleet)/sizeof(fleet[0]); ++i) {
        Resource r;
        memset(&r, 0, sizeof(r));
        safe_strncpy(r.id, fleet[i].id, MAX_ID_LEN);
        safe_strncpy(r.name, fleet[i].name, MAX_NAME_LEN);
        safe_strncpy(r.base_location, graph_node_label(fleet[i].base_node), MAX_LABEL_LEN);
        r.type = fleet[i].type;
        r.base_node = fleet[i].base_node;
        r.current_node = fleet[i].base_node;
        r.capacity = fleet[i].capacity;
        r.capabilities = fleet[i].caps;
        r.status = RES_STATUS_AVAILABLE;
        r.last_updated = time(NULL);
        resource_add(&r);
    }

    /* 2. Register active crisis emergencies */
    static const struct {
        const char *id;
        const char *reporter;
        const char *desc;
        NodeID node_id;
        EmergencyType type;
        Severity sev;
        int affected;
    } incidents[] = {
        {"INC-F01", "Dr. Alan Vance",      "Multi-story server lab electrical fire spreading rapidly", 4, TYPE_FIRE,      SEV_HIGH,     85},
        {"INC-M02", "Officer Chen",        "Multi-car pileup with severe trauma injuries on highway",  6, TYPE_MEDICAL,   SEV_CRITICAL, 14},
        {"INC-H03", "Site Mgr. Kovacs",    "Corrosive chemical container breach, toxic vapor cloud",   8, TYPE_HAZMAT,    SEV_HIGH,     32},
        {"INC-A04", "Patrol Unit 4",       "Old building masonry façade collapse over pedestrian lane",7, TYPE_ACCIDENT,  SEV_MEDIUM,   18},
        {"INC-M05", "HQ Dispatcher",       "Sudden cardiac arrest at public concourse area",           0, TYPE_MEDICAL,   SEV_CRITICAL,  2},
        {"INC-L06", "Market Security",     "Drainage backup resulting in knee-deep flash flooding",   10, TYPE_FLOOD,     SEV_LOW,      40}
    };

    time_t now = time(NULL);
    for (size_t i = 0; i < sizeof(incidents)/sizeof(incidents[0]); ++i) {
        Emergency e;
        memset(&e, 0, sizeof(e));
        safe_strncpy(e.id, incidents[i].id, MAX_ID_LEN);
        safe_strncpy(e.reporter_name, incidents[i].reporter, MAX_NAME_LEN);
        safe_strncpy(e.description, incidents[i].desc, MAX_DESC_LEN);
        safe_strncpy(e.location_label, graph_node_label(incidents[i].node_id), MAX_LABEL_LEN);
        e.node_id = incidents[i].node_id;
        e.type = incidents[i].type;
        e.severity = incidents[i].sev;
        e.affected_count = incidents[i].affected;
        e.status = STATUS_PENDING;
        e.reported_at = now - (int)(i * 300); /* Staggered report times */
        e.updated_at = e.reported_at;
        emergency_add(&e);
    }
}

typedef struct {
    int minutes_advanced;
    int resolved_count;
    int moved_count;
} TickContext;

static bool process_unit_tick(const Resource *r, void *data) {
    TickContext *ctx = (TickContext *)data;
    if (r->status != RES_STATUS_DISPATCHED || r->assigned_emergency_id[0] == '\0') {
        return true;
    }

    Emergency emg;
    if (emergency_find_by_id(r->assigned_emergency_id, &emg) != ARES_OK) {
        return true;
    }

    AresRoute route;
    if (graph_shortest_path(r->current_node, emg.node_id, &route) != ARES_OK) {
        return true;
    }

    /* If unit is already at destination or travel cost fits in this tick */
    if (route.total_cost <= ctx->minutes_advanced) {
        /* Mission accomplished! */
        printf(COL_GREEN "  [MISSION SUCCESS] %s (%s) reached %s [%02d]!\n" COL_RESET,
               r->id, r->name, emg.location_label, emg.node_id);
        printf(COL_CYAN  "  Crisis %s (%s) successfully resolved!\n" COL_RESET,
               emg.id, type_to_str(emg.type));
        
        emergency_close(emg.id, STATUS_RESOLVED);
        resource_complete_mission(r->id);
        ctx->resolved_count++;
    } else {
        /* Unit is en route: advance along route hops if possible */
        int cumulative_time = 0;
        NodeID next_node = r->current_node;
        for (int i = 0; i < route.count - 1; ++i) {
            int step_cost = graph_get_road_cost(route.nodes[i], route.nodes[i + 1]);
            if (cumulative_time + step_cost <= ctx->minutes_advanced) {
                cumulative_time += step_cost;
                next_node = route.nodes[i + 1];
            } else {
                break;
            }
        }
        if (next_node != r->current_node) {
            Resource updated = *r;
            updated.current_node = next_node;
            resource_delete(r->id);
            resource_add(&updated);
            printf(COL_YELLOW "  [EN ROUTE] %s advanced to node [%02d] %s (ETA: %d min)\n" COL_RESET,
                   r->id, next_node, graph_node_label(next_node), route.total_cost - cumulative_time);
            ctx->moved_count++;
        }
    }
    return true;
}

static bool refresh_pending_emergency(const Emergency *e, void *data) {
    ARES_UNUSED(data);
    if (e->status == STATUS_PENDING) {
        emergency_refresh_priority(e->id);
    }
    return true;
}

int simulation_tick(int minutes) {
    if (minutes <= 0) return 0;
    g_sim_minutes += minutes;

    TickContext ctx = { minutes, 0, 0 };
    resource_foreach(process_unit_tick, &ctx);
    emergency_foreach(refresh_pending_emergency, NULL);

    return ctx.resolved_count;
}

static void trigger_random_incident(void) {
    static int g_rand_seq = 10;
    static const char *reporters[] = { "Citizen Alert", "Traffic Cam 9", "Patrol Car 2", "Store Owner", "Highway Sentry" };
    static const char *descriptions[] = {
        "High voltage transformer explosion with smoke",
        "Multiple pedestrian trauma after vehicle skid",
        "Underground gas line fracture detected",
        "Subway station overcrowding and heat distress",
        "Warehouse roof collapse under storm pressure"
    };

    Emergency e;
    memset(&e, 0, sizeof(e));
    snprintf(e.id, MAX_ID_LEN, "INC-R%02d", g_rand_seq++);
    int r_idx = rand() % 5;
    safe_strncpy(e.reporter_name, reporters[r_idx], MAX_NAME_LEN);
    safe_strncpy(e.description, descriptions[r_idx], MAX_DESC_LEN);
    e.node_id = rand() % 12;
    safe_strncpy(e.location_label, graph_node_label(e.node_id), MAX_LABEL_LEN);
    e.type = (EmergencyType)(rand() % 6);
    e.severity = (Severity)(1 + (rand() % 4));
    e.affected_count = 5 + (rand() % 150);
    e.status = STATUS_PENDING;
    e.reported_at = time(NULL);
    e.updated_at = e.reported_at;

    if (emergency_add(&e) == ARES_OK) {
        printf(COL_RED "\n  [CRISIS ALERT TRIGGERED] %s at %s (%s)!\n" COL_RESET,
               e.id, e.location_label, type_to_str(e.type));
        printf("  Severity: %s | Affected: %d | Computed Priority: %.1f/100\n",
               severity_to_str(e.severity), e.affected_count, e.priority_score);
    }
}

void simulation_menu_loop(void) {
    int choice;
    char pause[4];
    do {
        printf("\n");
        ui_print_header("CRISIS SIMULATION & REAL-TIME CLOCK");
        printf("  Simulation Time Elapsed: " COL_CYAN "+%d minutes" COL_RESET "\n\n", g_sim_minutes);
        printf("  " COL_GREEN  "[1]" COL_RESET " Advance Time (+5 minutes)\n");
        printf("  " COL_GREEN  "[2]" COL_RESET " Advance Time (+15 minutes)\n");
        printf("  " COL_YELLOW "[3]" COL_RESET " Trigger Random Emergency Event\n");
        printf("  " COL_CYAN   "[4]" COL_RESET " Reload Metro Crisis Scenario (8 Units, 6 Emergencies)\n");
        printf("  " COL_GRAY   "[0]" COL_RESET " Back to Main Menu\n");
        ui_print_separator();

        choice = ui_read_int("  Enter choice: ", 0, 4);
        switch (choice) {
            case 1: {
                printf(COL_BOLD "\n  Advancing simulation by 5 minutes...\n" COL_RESET);
                int res = simulation_tick(5);
                printf(COL_CYAN "  Tick complete. %d mission(s) resolved.\n" COL_RESET, res);
                break;
            }
            case 2: {
                printf(COL_BOLD "\n  Advancing simulation by 15 minutes...\n" COL_RESET);
                int res = simulation_tick(15);
                printf(COL_CYAN "  Tick complete. %d mission(s) resolved.\n" COL_RESET, res);
                break;
            }
            case 3:
                trigger_random_incident();
                break;
            case 4:
                simulation_load_crisis_scenario();
                printf(COL_GREEN "\n  [OK] Metro Crisis Scenario loaded!\n" COL_RESET);
                printf("  8 fleet units stationed, 6 active emergency incidents queued.\n");
                break;
            case 0:
                break;
        }
        if (choice != 0) {
            printf("\n");
            ui_read_string("  Press Enter to continue...", pause, sizeof(pause));
        }
    } while (choice != 0);
}
