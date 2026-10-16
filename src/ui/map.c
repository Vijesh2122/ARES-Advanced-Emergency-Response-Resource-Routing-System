/**
 * @file map.c
 * @brief Visual tactical city map, ANSI topology renderer, and live web HUD bridge.
 */
#include "map.h"
#include "common.h"
#include "types.h"
#include "graph.h"
#include "emergency.h"
#include "resource.h"
#include "simulation.h"
#include "ui.h"
#include "utils.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

/* Node telemetry summary accumulator */
typedef struct {
    char active_incidents[MAX_GRAPH_NODES][256];
    char stationed_fleet[MAX_GRAPH_NODES][256];
    int  incident_count[MAX_GRAPH_NODES];
    int  fleet_count[MAX_GRAPH_NODES];
} NodeTelemetry;

static bool collect_emergency_telemetry(const Emergency *e, void *data) {
    NodeTelemetry *telem = (NodeTelemetry *)data;
    if (e->status == STATUS_PENDING || e->status == STATUS_ACTIVE) {
        if (e->node_id >= 0 && e->node_id < MAX_GRAPH_NODES) {
            char tag[64];
            snprintf(tag, sizeof(tag), "[%s %s P:%.0f] ",
                     type_to_str(e->type),
                     severity_to_str(e->severity),
                     e->priority_score);
            strncat(telem->active_incidents[e->node_id], tag,
                    sizeof(telem->active_incidents[e->node_id]) - strlen(telem->active_incidents[e->node_id]) - 1);
            telem->incident_count[e->node_id]++;
        }
    }
    return true;
}

static bool collect_resource_telemetry(const Resource *r, void *data) {
    NodeTelemetry *telem = (NodeTelemetry *)data;
    if (r->current_node >= 0 && r->current_node < MAX_GRAPH_NODES) {
        char tag[48];
        snprintf(tag, sizeof(tag), "[%s:%s] ",
                 r->id,
                 r->status == RES_STATUS_AVAILABLE ? "AVL" : "DEP");
        strncat(telem->stationed_fleet[r->current_node], tag,
                sizeof(telem->stationed_fleet[r->current_node]) - strlen(telem->stationed_fleet[r->current_node]) - 1);
        telem->fleet_count[r->current_node]++;
    }
    return true;
}

void map_render_terminal(const AresRoute *highlight_route) {
    NodeTelemetry telem;
    memset(&telem, 0, sizeof(telem));
    emergency_foreach(collect_emergency_telemetry, &telem);
    resource_foreach(collect_resource_telemetry, &telem);

    printf("\n");
    ui_print_header("ARES METRO TOPOLOGY RADAR MAP");
    printf(COL_GRAY "  Tactical Spatial Grid // 12 Monitored Sectors\n" COL_RESET);
    printf("  " COL_GREEN "[00..11]" COL_RESET " Sector ID   "
           COL_RED "[*ALERT*]" COL_RESET " Active Incident   "
           COL_CYAN "[UNIT]" COL_RESET " Response Fleet\n\n");

    /* Visual 2D Grid Art */
    printf("  " COL_BOLD COL_WHITE
           "                  [01 North Station] --------- (6m) -------- [04 Tech Park] --- (7m) --- [05 Airport]\n"
           "                         |                                         | \\                       |\n"
           "                        (4m)                                      (4m)  (5m)                (6m)\n"
           "                         |                                         |      \\                  |\n"
           "  [02 City Hospital] -- (3m) -- [00 Central HQ]                    |    [08 Industrial] - (3m) - [09 East Shelter]\n"
           "        |                              |                           |             |\n"
           "       (5m)                           (5m)                         |            (5m)\n"
           "        |                              |                           |             |\n"
           "  [06 River Bridge]                    |                           |             |\n"
           "     /     \\                           |                           |             |\n"
           "   (3m)    (4m)                        |                           |             |\n"
           "   /         \\                         |                           |             |\n"
           "[07 Old Town] [10 West Market] --------+---------------------------+-------------+\n"
           "  \\             /\n"
           "  (6m)        (4m)\n"
           "    \\         /\n"
           " [11 South Station]\n" COL_RESET "\n");

    /* If a route is highlighted, print its exact sequence */
    if (highlight_route && highlight_route->count > 0) {
        printf(COL_CYAN "  ================ ACTIVE DIJKSTRA ROUTE ================\n" COL_RESET);
        printf(COL_GREEN "  Path : " COL_RESET);
        for (int i = 0; i < highlight_route->count; ++i) {
            NodeID nid = highlight_route->nodes[i];
            printf(COL_BOLD "[%02d %s]" COL_RESET, nid, graph_node_label(nid));
            if (i < highlight_route->count - 1) {
                int cost = graph_get_road_cost(nid, highlight_route->nodes[i + 1]);
                printf(COL_YELLOW " ==(%dm)==> " COL_RESET, cost);
            }
        }
        printf(COL_CYAN "\n  Total Route Travel Time: %d minutes (%d hops)\n" COL_RESET,
               highlight_route->total_cost, highlight_route->count);
        ui_print_separator();
    }

    /* Print Active Node Telemetry Feed */
    printf(COL_BOLD "  SECTOR TELEMETRY BREAKDOWN:\n" COL_RESET);
    int active_sectors = 0;
    for (int i = 0; i < 12; ++i) {
        if (!graph_node_exists(i)) continue;
        printf("  [%02d] %-16s | ", i, graph_node_label(i));
        if (telem.incident_count[i] > 0) {
            printf(COL_RED "%s" COL_RESET, telem.active_incidents[i]);
            active_sectors++;
        } else {
            printf(COL_GREEN "Clear  " COL_RESET);
        }
        if (telem.fleet_count[i] > 0) {
            printf(COL_CYAN " Fleet: %s" COL_RESET, telem.stationed_fleet[i]);
        }
        printf("\n");
    }
    printf(COL_GRAY "  Active Incident Sectors: %d / 12 monitored\n" COL_RESET, active_sectors);

    /* Check for blocked roads */
    AresRoadInfo roads[MAX_GRAPH_EDGES];
    int rcount = graph_get_all_roads(roads, MAX_GRAPH_EDGES);
    int blocked_count = 0;
    for (int i = 0; i < rcount; ++i) {
        if (roads[i].blocked) {
            if (blocked_count == 0) {
                printf(COL_RED "\n  WARNING -- ROADWAY OBSTRUCTIONS DETECTED:\n" COL_RESET);
            }
            printf(COL_RED "  [!] %s <---> %s : BLOCKED (Dijkstra re-routing active)\n" COL_RESET,
                   graph_node_label(roads[i].from), graph_node_label(roads[i].to));
            blocked_count++;
        }
    }
}

/* Helper writer for JSON serialization */
typedef struct {
    FILE *f;
    bool first;
} JsonExportCtx;

static bool write_json_emergency(const Emergency *e, void *data) {
    JsonExportCtx *ctx = (JsonExportCtx *)data;
    if (!ctx->first) fprintf(ctx->f, ",\n");
    ctx->first = false;

    fprintf(ctx->f,
            "    {\n"
            "      \"id\": \"%s\",\n"
            "      \"reporter\": \"%s\",\n"
            "      \"description\": \"%s\",\n"
            "      \"nodeId\": %d,\n"
            "      \"location\": \"%s\",\n"
            "      \"type\": %d,\n"
            "      \"typeStr\": \"%s\",\n"
            "      \"severity\": %d,\n"
            "      \"severityStr\": \"%s\",\n"
            "      \"affected\": %d,\n"
            "      \"priority\": %.2f,\n"
            "      \"status\": %d,\n"
            "      \"statusStr\": \"%s\",\n"
            "      \"assignedResource\": \"%s\",\n"
            "      \"reportedAt\": %lld\n"
            "    }",
            e->id, e->reporter_name, e->description,
            e->node_id, e->location_label,
            e->type, type_to_str(e->type),
            e->severity, severity_to_str(e->severity),
            e->affected_count, e->priority_score,
            e->status, status_to_str(e->status),
            e->assigned_res_id,
            (long long)e->reported_at);
    return true;
}

static bool write_json_resource(const Resource *r, void *data) {
    JsonExportCtx *ctx = (JsonExportCtx *)data;
    if (!ctx->first) fprintf(ctx->f, ",\n");
    ctx->first = false;

    fprintf(ctx->f,
            "    {\n"
            "      \"id\": \"%s\",\n"
            "      \"name\": \"%s\",\n"
            "      \"type\": %d,\n"
            "      \"typeStr\": \"%s\",\n"
            "      \"status\": %d,\n"
            "      \"statusStr\": \"%s\",\n"
            "      \"baseNode\": %d,\n"
            "      \"currentNode\": %d,\n"
            "      \"capacity\": %d,\n"
            "      \"currentLoad\": %d,\n"
            "      \"assignedEmergency\": \"%s\"\n"
            "    }",
            r->id, r->name,
            r->type, resource_type_to_str(r->type),
            r->status, resource_status_to_str(r->status),
            r->base_node, r->current_node,
            r->capacity, r->current_load,
            r->assigned_emergency_id);
    return true;
}

AresStatus map_export_live_data(const char *json_path, const char *js_path) {
    /* 1. Write json_path */
    FILE *f = fopen(json_path, "w");
    if (!f) return ARES_ERR_IO;

    time_t now = time(NULL);
    fprintf(f, "{\n");
    fprintf(f, "  \"timestamp\": %lld,\n", (long long)now);
    fprintf(f, "  \"simMinutes\": %d,\n", simulation_get_clock_minutes());

    /* Nodes */
    fprintf(f, "  \"nodes\": [\n");
    for (int i = 0; i < 12; ++i) {
        if (!graph_node_exists(i)) continue;
        int x = 50, y = 50;
        graph_get_node_coord(i, &x, &y);
        fprintf(f, "    {\"id\": %d, \"label\": \"%s\", \"x\": %d, \"y\": %d}%s\n",
                i, graph_node_label(i), x, y, (i == 11) ? "" : ",");
    }
    fprintf(f, "  ],\n");

    /* Roads */
    AresRoadInfo roads[MAX_GRAPH_EDGES];
    int rcount = graph_get_all_roads(roads, MAX_GRAPH_EDGES);
    fprintf(f, "  \"roads\": [\n");
    for (int i = 0; i < rcount; ++i) {
        fprintf(f, "    {\"from\": %d, \"to\": %d, \"minutes\": %d, \"blocked\": %s}%s\n",
                roads[i].from, roads[i].to, roads[i].cost,
                roads[i].blocked ? "true" : "false",
                (i == rcount - 1) ? "" : ",");
    }
    fprintf(f, "  ],\n");

    /* Emergencies */
    fprintf(f, "  \"emergencies\": [\n");
    JsonExportCtx ectx = { f, true };
    emergency_foreach(write_json_emergency, &ectx);
    fprintf(f, "\n  ],\n");

    /* Resources */
    fprintf(f, "  \"resources\": [\n");
    JsonExportCtx rctx = { f, true };
    resource_foreach(write_json_resource, &rctx);
    fprintf(f, "\n  ]\n");
    fprintf(f, "}\n");
    fclose(f);

    /* 2. Write js_path if provided (wraps JSON in window.ARES_LIVE_DATA for local file:// access) */
    if (js_path) {
        FILE *jf = fopen(js_path, "w");
        if (jf) {
            fprintf(jf, "/* Auto-generated by ARES Tactical Engine */\nwindow.ARES_LIVE_DATA = ");
            FILE *rf = fopen(json_path, "r");
            if (rf) {
                char buf[512];
                size_t n;
                while ((n = fread(buf, 1, sizeof(buf), rf)) > 0) {
                    fwrite(buf, 1, n, jf);
                }
                fclose(rf);
            }
            fprintf(jf, ";\n");
            fclose(jf);
        }
    }

    return ARES_OK;
}

void map_launch_browser_hud(void) {
    ui_print_header("LAUNCHING VISUAL TACTICAL MAP HUD");
    printf(COL_CYAN "  [ARES] Exporting real-time city telemetry...\n" COL_RESET);
    if (map_export_live_data("data/ares_live.json", "web/live_data.js") == ARES_OK) {
        printf(COL_GREEN "  [OK] Exported to data/ares_live.json and web/live_data.js\n" COL_RESET);
    } else {
        printf(COL_YELLOW "  [!] Notice: could not write telemetry to data/ folder\n" COL_RESET);
    }

    printf(COL_CYAN "  [ARES] Launching Tactical EOC Command HUD in default browser...\n" COL_RESET);
#ifdef _WIN32
    system("cmd /c start web\\index.html");
#elif __APPLE__
    system("open web/index.html");
#else
    system("xdg-open web/index.html");
#endif
    printf(COL_GREEN "  [OK] Browser launched.\n" COL_RESET);
    printf("  Direct path: web/index.html\n");
}

static void toggle_road_block(void) {
    ui_print_header("ROADWAY BLOCKAGE CONTROL (DYNAMIC DIJKSTRA)");
    printf("  Select road endpoints to toggle block/unblock status:\n");
    NodeID u = ui_read_int("  Node A [0-11]: ", 0, 11);
    NodeID v = ui_read_int("  Node B [0-11]: ", 0, 11);

    if (u == v) {
        printf(COL_RED "  [!] Cannot block road to the same node.\n" COL_RESET);
        return;
    }
    bool is_blocked = graph_is_road_blocked(u, v);
    bool new_state = !is_blocked;
    if (graph_set_road_blocked(u, v, new_state) == ARES_OK) {
        printf(COL_GREEN "\n  [OK] Road %s <---> %s is now %s!\n" COL_RESET,
               graph_node_label(u), graph_node_label(v),
               new_state ? COL_RED "BLOCKED (Traffic Impassable)" COL_RESET
                         : COL_GREEN "CLEAR (Traffic Resumed)" COL_RESET);
    } else {
        printf(COL_RED "\n  [!] No direct road exists between %s and %s.\n" COL_RESET,
               graph_node_label(u), graph_node_label(v));
    }
}

void map_interactive_menu(void) {
    int choice;
    char pause[4];
    do {
        printf("\n");
        ui_print_header("TACTICAL CITY MAP & VISUAL OPERATIONS");
        printf("  " COL_GREEN  "[1]" COL_RESET " Launch Interactive Visual Web HUD (High-Tech Browser GUI)\n");
        printf("  " COL_CYAN   "[2]" COL_RESET " View Terminal City Radar Map (ASCII / ANSI Graphic)\n");
        printf("  " COL_CYAN   "[3]" COL_RESET " Calculate & Trace Shortest Path on Radar Map\n");
        printf("  " COL_YELLOW "[4]" COL_RESET " Block / Unblock Road (Dynamic Disaster Re-routing)\n");
        printf("  " COL_GREEN  "[5]" COL_RESET " Sync & Export Live Telemetry Data\n");
        printf("  " COL_GRAY   "[0]" COL_RESET " Back to Main Menu\n");
        ui_print_separator();

        choice = ui_read_int("  Enter choice: ", 0, 5);
        switch (choice) {
            case 1:
                map_launch_browser_hud();
                break;
            case 2:
                map_render_terminal(NULL);
                break;
            case 3: {
                NodeID from = ui_read_int("  Start node [0-11]: ", 0, 11);
                NodeID to   = ui_read_int("  Destination node [0-11]: ", 0, 11);
                AresRoute route;
                if (graph_shortest_path(from, to, &route) == ARES_OK) {
                    map_render_terminal(&route);
                } else {
                    printf(COL_RED "  [!] No reachable path exists between %s and %s (check for blocked roads).\n" COL_RESET,
                           graph_node_label(from), graph_node_label(to));
                }
                break;
            }
            case 4:
                toggle_road_block();
                break;
            case 5:
                if (map_export_live_data("data/ares_live.json", "web/live_data.js") == ARES_OK) {
                    printf(COL_GREEN "\n  [OK] Live telemetry exported to data/ares_live.json and web/live_data.js.\n" COL_RESET);
                } else {
                    printf(COL_RED "\n  [!] Failed to export telemetry.\n" COL_RESET);
                }
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
