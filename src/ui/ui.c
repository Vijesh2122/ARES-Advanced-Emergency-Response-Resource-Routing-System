/**
 * @file ui.c
 * @brief Terminal UI implementation for ARES -- Phase 2.
 *
 * Handles all user-facing I/O.  Business logic stays in the respective
 * module files; main.c orchestrates calls between UI and logic layers.
 */

#include "ui.h"
#include "utils.h"
#include "common.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

/* --- Screen helpers --------------------------------------------------- */

void ui_clear_screen(void) {
#ifdef _WIN32
    system("cls");
#else
    system("clear");
#endif
}

void ui_print_separator(void) {
    printf(COL_CYAN "  --------------------------------------------------\n" COL_RESET);
}

void ui_print_header(const char *title) {
    ui_print_separator();
    printf(COL_BOLD COL_WHITE "  %s\n" COL_RESET, title);
    ui_print_separator();
}

void ui_print_banner(void) {
    printf("\n");
    ui_print_separator();
    printf(COL_BOLD COL_RED   "  ARES : Emergency Response & Resource Routing\n" COL_RESET);
    printf(COL_GRAY           "  Version %s | Anna University IT\n" COL_RESET, ARES_VERSION);
    ui_print_separator();
}

/* --- Input helpers ---------------------------------------------------- */

int ui_read_string(const char *prompt, char *buf, int len) {
    printf(COL_BOLD "%s" COL_RESET, prompt);
    fflush(stdout);
    if (!fgets(buf, len, stdin)) {
        buf[0] = '\0';
        return -1;
    }
    buf[strcspn(buf, "\n")] = '\0';
    str_trim(buf);
    return 0;
}

int ui_read_int(const char *prompt, int lo, int hi) {
    char tmp[32];
    int  val;
    while (1) {
        printf(COL_BOLD "%s" COL_RESET, prompt);
        fflush(stdout);
        if (!fgets(tmp, sizeof(tmp), stdin)) continue;
        if (sscanf(tmp, "%d", &val) == 1 && val >= lo && val <= hi)
            return val;
        printf(COL_RED "  [!] Enter a number between %d and %d.\n"
               COL_RESET, lo, hi);
    }
}

double ui_read_double(const char *prompt, double lo, double hi) {
    char   tmp[32];
    double val;
    while (1) {
        printf(COL_BOLD "%s" COL_RESET, prompt);
        fflush(stdout);
        if (!fgets(tmp, sizeof(tmp), stdin)) continue;
        if (sscanf(tmp, "%lf", &val) == 1 && val >= lo && val <= hi)
            return val;
        printf(COL_RED "  [!] Enter a number between %.1f and %.1f.\n"
               COL_RESET, lo, hi);
    }
}

/* --- Colour helpers --------------------------------------------------- */

const char *ui_severity_colour(Severity s) {
    switch (s) {
        case SEV_LOW:      return COL_GREEN;
        case SEV_MEDIUM:   return COL_YELLOW;
        case SEV_HIGH:     return COL_RED;
        case SEV_CRITICAL: return COL_MAGENTA;
        default:           return COL_RESET;
    }
}

const char *ui_status_colour(RecordStatus s) {
    switch (s) {
        case STATUS_PENDING:   return COL_YELLOW;
        case STATUS_ACTIVE:    return COL_RED;
        case STATUS_RESOLVED:  return COL_GREEN;
        case STATUS_CANCELLED: return COL_CYAN;
        default:               return COL_RESET;
    }
}

const char *ui_res_status_colour(ResourceStatus s) {
    switch (s) {
        case RES_STATUS_AVAILABLE:   return COL_GREEN;
        case RES_STATUS_DISPATCHED:  return COL_RED;
        case RES_STATUS_UNAVAILABLE: return COL_GRAY;
        case RES_STATUS_RETURNING:   return COL_YELLOW;
        default:                     return COL_RESET;
    }
}

/* --- Menus ------------------------------------------------------------ */

void ui_show_main_menu(void) {
    printf("\n");
    ui_print_header("MAIN MENU");
    printf("  " COL_GREEN  "[1]" COL_RESET " Emergency Management\n");
    printf("  " COL_CYAN   "[2]" COL_RESET " Resource Management\n");
    printf("  " COL_YELLOW "[3]" COL_RESET " System Statistics\n");
    printf("  " COL_RED    "[0]" COL_RESET " Exit ARES\n");
    ui_print_separator();
}

void ui_show_emergency_menu(void) {
    printf("\n");
    ui_print_header("EMERGENCY MANAGEMENT");
    printf("  " COL_GREEN  "[1]" COL_RESET " Register New Emergency\n");
    printf("  " COL_CYAN   "[2]" COL_RESET " List All Emergencies\n");
    printf("  " COL_CYAN   "[3]" COL_RESET " Search by ID\n");
    printf("  " COL_YELLOW "[4]" COL_RESET " Update Emergency Status\n");
    printf("  " COL_YELLOW "[5]" COL_RESET " Refresh Priority Score\n");
    printf("  " COL_RED    "[6]" COL_RESET " Delete Emergency\n");
    printf("  " COL_CYAN   "[7]" COL_RESET " Filter by Status\n");
    printf("  " COL_GRAY   "[0]" COL_RESET " Back to Main Menu\n");
    ui_print_separator();
}

void ui_show_resource_menu(void) {
    printf("\n");
    ui_print_header("RESOURCE MANAGEMENT");
    printf("  " COL_GREEN  "[1]" COL_RESET " Register New Resource\n");
    printf("  " COL_CYAN   "[2]" COL_RESET " List All Resources\n");
    printf("  " COL_CYAN   "[3]" COL_RESET " Search by ID\n");
    printf("  " COL_YELLOW "[4]" COL_RESET " Update Resource Status\n");
    printf("  " COL_YELLOW "[5]" COL_RESET " Dispatch Resource to Emergency\n");
    printf("  " COL_GREEN  "[6]" COL_RESET " Complete Mission\n");
    printf("  " COL_RED    "[7]" COL_RESET " Remove Resource\n");
    printf("  " COL_CYAN   "[8]" COL_RESET " Filter by Status\n");
    printf("  " COL_GRAY   "[0]" COL_RESET " Back to Main Menu\n");
    ui_print_separator();
}

/* --- Wizards ---------------------------------------------------------- */

void ui_fill_new_emergency(Emergency *e) {
    printf(COL_BOLD COL_GREEN "\n  -- Register New Emergency --\n" COL_RESET);

    ui_read_string("  Reporter Name    : ", e->reporter_name, MAX_NAME_LEN);
    ui_read_string("  Location Label   : ", e->location_label, MAX_LABEL_LEN);
    ui_read_string("  Description      : ", e->description,   MAX_DESC_LEN);

    e->node_id = ui_read_int("  City Node ID     : ", 0, MAX_GRAPH_NODES - 1);

    printf("\n  Emergency Type:\n");
    printf("    [0] Fire   [1] Medical  [2] Flood   [3] Accident\n");
    printf("    [4] Earthquake  [5] HazMat  [6] Other\n");
    e->type = (EmergencyType)ui_read_int("  Select type [0-6] : ", 0, 6);

    printf("\n  Severity:\n");
    printf("    [1] Low    [2] Medium   [3] High    [4] Critical\n");
    e->severity = (Severity)ui_read_int("  Select severity [1-4]: ", 1, 4);

    e->affected_count = ui_read_int("  People affected  : ", 0, 10000);

    e->status      = STATUS_PENDING;
    e->reported_at = time(NULL);
    e->updated_at  = e->reported_at;
    e->sim_time    = 0;
    e->assigned_res_id[0] = '\0';
    /* priority_score is computed by emergency_add() */
}

void ui_fill_new_resource(Resource *r) {
    printf(COL_BOLD COL_CYAN "\n  -- Register New Resource --\n" COL_RESET);

    ui_read_string("  Resource Name    : ", r->name, MAX_NAME_LEN);
    ui_read_string("  Base Location    : ", r->base_location, MAX_LABEL_LEN);
    r->base_node    = ui_read_int("  Base Node ID     : ", 0, MAX_GRAPH_NODES - 1);
    r->current_node = r->base_node;

    printf("\n  Resource Type:\n");
    printf("    [0] Ambulance     [1] Fire Truck  [2] Police Unit\n");
    printf("    [3] Rescue Team   [4] Helicopter  [5] HazMat Unit\n");
    printf("    [6] Shelter       [7] Warehouse   [8] Other\n");
    r->type = (ResourceType)ui_read_int("  Select type [0-8]: ", 0, 8);

    /* Auto-assign default capabilities by type */
    switch (r->type) {
        case RES_AMBULANCE:
            r->capabilities = CAP_FIRST_AID | CAP_ADVANCED_LIFE; break;
        case RES_FIRE_TRUCK:
            r->capabilities = CAP_FIRE_SUPPRESS; break;
        case RES_POLICE:
            r->capabilities = CAP_CROWD_CONTROL | CAP_FIRST_AID; break;
        case RES_RESCUE_TEAM:
            r->capabilities = CAP_SEARCH_RESCUE | CAP_FIRST_AID; break;
        case RES_HELICOPTER:
            r->capabilities = CAP_AERIAL | CAP_SEARCH_RESCUE | CAP_FIRST_AID; break;
        case RES_HAZMAT_UNIT:
            r->capabilities = CAP_HAZMAT | CAP_FIRST_AID; break;
        case RES_SHELTER:
            r->capabilities = CAP_SHELTER_HOST; break;
        default:
            r->capabilities = CAP_NONE; break;
    }

    r->capacity     = ui_read_int("  Capacity (seats) : ", 1, 1000);
    r->current_load = 0;
    r->status       = RES_STATUS_AVAILABLE;
    r->last_updated = time(NULL);
    r->assigned_emergency_id[0] = '\0';
}
