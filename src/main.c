/**
 * @file main.c
 * @brief ARES entry point -- top-level event loop and menu dispatch.
 *
 * Architecture: thin orchestration layer.
 *   - All I/O:      ui.c
 *   - Emergency DB: emergency/emergency.c
 *   - Resource DB:  resource/resource.c
 *   - (Phase 4+)    structures/linked_list.c, etc.
 *
 * Phase 2 feature set:
 *   [1] Emergency Management submenu (7 options)
 *   [2] Resource Management submenu (8 options)
 *   [3] System Statistics
 *   [0] Exit
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "common.h"
#include "types.h"
#include "emergency.h"
#include "resource.h"
#include "ui.h"
#include "utils.h"

/* --- Sequence counters for ID generation ------------------------------- */
static int g_emg_seq = 1;   /* emergency ID counter */
static int g_res_seq = 1;   /* resource  ID counter */

/* =======================================================================
 * Emergency submenu handlers
 * ======================================================================= */

static void emg_add(void) {
    Emergency e;
    memset(&e, 0, sizeof(e));
    ui_fill_new_emergency(&e);
    generate_emergency_id(e.id, g_emg_seq++);

    AresStatus st = emergency_add(&e);
    switch (st) {
        case ARES_OK:
            printf(COL_GREEN "\n  [OK] Emergency registered!\n" COL_RESET);
            printf(COL_CYAN  "  ID: %s   Priority: %.1f/100\n"
                   COL_RESET, e.id, e.priority_score);
            break;
        case ARES_ERR_OVERFLOW:
            printf(COL_RED "\n  [!] Database full.\n" COL_RESET); break;
        default:
            printf(COL_RED "\n  [!] Error (code %d).\n" COL_RESET, st); break;
    }
}

static void emg_list_all(void) {
    ui_print_header("ALL EMERGENCIES");
    printf("  Total: %d record(s)\n\n", emergency_db_count());
    emergency_list(-1);
}

static void emg_search(void) {
    char id[MAX_ID_LEN];
    ui_read_string("\n  Enter Emergency ID: ", id, MAX_ID_LEN);
    str_toupper(id);

    Emergency found;
    if (emergency_find_by_id(id, &found) == ARES_OK) {
        printf(COL_GREEN "\n  Record found:\n" COL_RESET);
        emergency_print(&found);
    } else {
        printf(COL_RED "\n  [!] Not found: %s\n" COL_RESET, id);
    }
}

static void emg_update(void) {
    char id[MAX_ID_LEN];
    ui_read_string("\n  Emergency ID to update: ", id, MAX_ID_LEN);
    str_toupper(id);

    printf("  New Status:\n");
    printf("    [0] Pending  [1] Active  [2] Resolved  [3] Cancelled\n");
    int ns = ui_read_int("  Status [0-3]: ", 0, 3);

    char desc[MAX_DESC_LEN] = {0};
    ui_read_string("  New description (Enter to keep): ", desc, MAX_DESC_LEN);

    AresStatus st = emergency_update_status(id, (RecordStatus)ns,
                                            desc[0] ? desc : NULL);
    if (st == ARES_OK)
        printf(COL_GREEN "\n  [OK] Updated.\n" COL_RESET);
    else
        printf(COL_RED "\n  [!] Not found: %s\n" COL_RESET, id);
}

static void emg_refresh_priority(void) {
    char id[MAX_ID_LEN];
    ui_read_string("\n  Emergency ID: ", id, MAX_ID_LEN);
    str_toupper(id);

    if (emergency_refresh_priority(id) == ARES_OK) {
        Emergency e;
        emergency_find_by_id(id, &e);
        printf(COL_GREEN "\n  [OK] Priority refreshed: %.1f/100\n"
               COL_RESET, e.priority_score);
    } else {
        printf(COL_RED "\n  [!] Not found: %s\n" COL_RESET, id);
    }
}

static void emg_delete(void) {
    char id[MAX_ID_LEN];
    ui_read_string("\n  Emergency ID to delete: ", id, MAX_ID_LEN);
    str_toupper(id);

    char confirm[8];
    printf(COL_RED "  WARNING: irreversible.\n" COL_RESET);
    ui_read_string("  Type YES to confirm: ", confirm, sizeof(confirm));
    str_toupper(confirm);
    if (strcmp(confirm, "YES") != 0) {
        printf("  Cancelled.\n");
        return;
    }
    if (emergency_delete(id) == ARES_OK)
        printf(COL_GREEN "\n  [OK] Deleted.\n" COL_RESET);
    else
        printf(COL_RED "\n  [!] Not found: %s\n" COL_RESET, id);
}

static void emg_filter(void) {
    printf("  Filter: [0] Pending  [1] Active  [2] Resolved  [3] Cancelled\n");
    int f = ui_read_int("  Status [0-3]: ", 0, 3);
    printf(COL_BOLD "\n  Filtered: %s\n" COL_RESET, status_to_str((RecordStatus)f));
    emergency_list(f);
}

/* --- Emergency submenu loop -------------------------------------------- */
static void emergency_menu_loop(void) {
    int ch;
    char _pause[4];
    do {
        ui_show_emergency_menu();
        ch = ui_read_int("  Choice: ", 0, 7);
        switch (ch) {
            case 1: emg_add();              break;
            case 2: emg_list_all();         break;
            case 3: emg_search();           break;
            case 4: emg_update();           break;
            case 5: emg_refresh_priority(); break;
            case 6: emg_delete();           break;
            case 7: emg_filter();           break;
            case 0: break;
            default: printf(COL_RED "  Invalid.\n" COL_RESET);
        }
        if (ch != 0) {
            printf("\n");
            ui_read_string("  Press Enter to continue...", _pause, sizeof(_pause));
        }
    } while (ch != 0);
}

/* =======================================================================
 * Resource submenu handlers
 * ======================================================================= */

static void res_add(void) {
    Resource r;
    memset(&r, 0, sizeof(r));
    ui_fill_new_resource(&r);
    generate_resource_id(r.id, r.type, g_res_seq++);

    AresStatus st = resource_add(&r);
    switch (st) {
        case ARES_OK:
            printf(COL_GREEN "\n  [OK] Resource registered! ID: %s\n"
                   COL_RESET, r.id); break;
        case ARES_ERR_OVERFLOW:
            printf(COL_RED "\n  [!] Resource DB full.\n" COL_RESET); break;
        default:
            printf(COL_RED "\n  [!] Error (code %d).\n" COL_RESET, st); break;
    }
}

static void res_list_all(void) {
    ui_print_header("ALL RESOURCES");
    printf("  Total: %d resource(s)\n\n", resource_db_count());
    resource_list(-1);
}

static void res_search(void) {
    char id[MAX_ID_LEN];
    ui_read_string("\n  Resource ID: ", id, MAX_ID_LEN);
    str_toupper(id);
    Resource r;
    if (resource_find_by_id(id, &r) == ARES_OK) {
        printf(COL_GREEN "\n  Resource found:\n" COL_RESET);
        resource_print(&r);
    } else {
        printf(COL_RED "\n  [!] Not found: %s\n" COL_RESET, id);
    }
}

static void res_update_status(void) {
    char id[MAX_ID_LEN];
    ui_read_string("\n  Resource ID: ", id, MAX_ID_LEN);
    str_toupper(id);

    printf("  New Status:\n");
    printf("    [0] Available  [1] Dispatched  [2] Unavailable  [3] Returning\n");
    int ns = ui_read_int("  Status [0-3]: ", 0, 3);

    if (resource_set_status(id, (ResourceStatus)ns) == ARES_OK)
        printf(COL_GREEN "\n  [OK] Status updated.\n" COL_RESET);
    else
        printf(COL_RED "\n  [!] Not found: %s\n" COL_RESET, id);
}

static void res_dispatch(void) {
    char rid[MAX_ID_LEN], eid[MAX_ID_LEN];
    ui_read_string("\n  Resource ID   : ", rid, MAX_ID_LEN);
    str_toupper(rid);
    ui_read_string("  Emergency ID  : ", eid, MAX_ID_LEN);
    str_toupper(eid);

    /* Verify emergency exists */
    Emergency emg;
    if (emergency_find_by_id(eid, &emg) != ARES_OK) {
        printf(COL_RED "\n  [!] Emergency not found: %s\n" COL_RESET, eid);
        return;
    }

    AresStatus st = resource_dispatch(rid, eid);
    if (st == ARES_OK) {
        emergency_assign_resource(eid, rid);
        printf(COL_GREEN "\n  [OK] Resource %s dispatched to %s.\n"
               COL_RESET, rid, eid);
    } else if (st == ARES_ERR_INVALID) {
        printf(COL_RED "\n  [!] Resource is not available.\n" COL_RESET);
    } else {
        printf(COL_RED "\n  [!] Resource not found: %s (code %d)\n"
               COL_RESET, rid, st);
    }
}

static void res_complete(void) {
    char rid[MAX_ID_LEN];
    ui_read_string("\n  Resource ID: ", rid, MAX_ID_LEN);
    str_toupper(rid);

    /* Grab emergency ID before clearing it */
    Resource r;
    if (resource_find_by_id(rid, &r) != ARES_OK) {
        printf(COL_RED "\n  [!] Resource not found.\n" COL_RESET);
        return;
    }
    char eid[MAX_ID_LEN];
    safe_strncpy(eid, r.assigned_emergency_id, MAX_ID_LEN);

    if (resource_complete_mission(rid) == ARES_OK) {
        if (eid[0]) emergency_close(eid, STATUS_RESOLVED);
        printf(COL_GREEN "\n  [OK] Mission complete. Resource returned to base.\n"
               COL_RESET);
    } else {
        printf(COL_RED "\n  [!] Error completing mission.\n" COL_RESET);
    }
}

static void res_delete(void) {
    char id[MAX_ID_LEN];
    ui_read_string("\n  Resource ID to remove: ", id, MAX_ID_LEN);
    str_toupper(id);
    char confirm[8];
    ui_read_string("  Type YES to confirm: ", confirm, sizeof(confirm));
    str_toupper(confirm);
    if (strcmp(confirm, "YES") != 0) { printf("  Cancelled.\n"); return; }
    if (resource_delete(id) == ARES_OK)
        printf(COL_GREEN "\n  [OK] Removed.\n" COL_RESET);
    else
        printf(COL_RED "\n  [!] Not found.\n" COL_RESET);
}

static void res_filter(void) {
    printf("  Filter: [0] Available  [1] Dispatched  "
           "[2] Unavailable  [3] Returning\n");
    int f = ui_read_int("  Status [0-3]: ", 0, 3);
    printf(COL_BOLD "\n  Filtered: %s\n" COL_RESET,
           resource_status_to_str((ResourceStatus)f));
    resource_list(f);
}

/* --- Resource submenu loop --------------------------------------------- */
static void resource_menu_loop(void) {
    int ch;
    char _pause[4];
    do {
        ui_show_resource_menu();
        ch = ui_read_int("  Choice: ", 0, 8);
        switch (ch) {
            case 1: res_add();           break;
            case 2: res_list_all();      break;
            case 3: res_search();        break;
            case 4: res_update_status(); break;
            case 5: res_dispatch();      break;
            case 6: res_complete();      break;
            case 7: res_delete();        break;
            case 8: res_filter();        break;
            case 0: break;
            default: printf(COL_RED "  Invalid.\n" COL_RESET);
        }
        if (ch != 0) {
            printf("\n");
            ui_read_string("  Press Enter to continue...", _pause, sizeof(_pause));
        }
    } while (ch != 0);
}

/* =======================================================================
 * System statistics
 * ======================================================================= */

static void show_stats(void) {
    ui_print_header("SYSTEM STATISTICS");
    printf("  ARES Version      : %s\n", ARES_VERSION);
    printf("  Current Phase     : 2 -- Core Models + Resource Management\n");
    printf("\n");
    printf("  Emergencies       : %d / %d\n",
           emergency_db_count(), MAX_EMERGENCIES);
    printf("  Resources         : %d / %d\n",
           resource_db_count(),  MAX_RESOURCES);
    printf("\n");
    printf("  Active algorithms : Flat array (O(n) search)\n");
    printf("  Next phase (3)    : Linear data structures\n");
    printf("      SLL, DLL, CLL, Stack, Queue, Deque\n");
    printf("  Future            : Heap triage, Hash lookup, Dijkstra routing\n");
}

/* =======================================================================
 * main()
 * ======================================================================= */

int main(void) {
    /* Initialise subsystems */
    emergency_db_init();
    resource_db_init();

    ui_clear_screen();
    ui_print_banner();
    printf(COL_GREEN "  All subsystems initialised.\n" COL_RESET);

    int choice;
    char _pause[4];
    do {
        ui_show_main_menu();
        choice = ui_read_int("  Enter choice: ", 0, 3);
        switch (choice) {
            case 1: emergency_menu_loop(); break;
            case 2: resource_menu_loop();  break;
            case 3:
                show_stats();
                printf("\n");
                ui_read_string("  Press Enter to continue...", _pause, sizeof(_pause));
                break;
            case 0:
                printf(COL_CYAN
                       "\n  Thank you for using ARES. Stay safe.\n\n"
                       COL_RESET);
                break;
            default:
                printf(COL_RED "  Invalid option.\n" COL_RESET);
        }
    } while (choice != 0);

    return EXIT_SUCCESS;
}
