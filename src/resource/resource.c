/**
 * @file resource.c
 * @brief Resource management -- Phase 2 flat-array implementation.
 *
 * Backing store: g_res[MAX_RESOURCES].
 * Phase 4 swaps this for a doubly-linked list; Phase 9 adds a hash
 * table layer for O(1) ID lookup.  The resource.h API does not change.
 *
 * Compatibility table (resource_is_compatible):
 *
 *   Emergency Type  |  Required Capability
 *   -----------------------------------------
 *   FIRE            |  CAP_FIRE_SUPPRESS
 *   MEDICAL         |  CAP_FIRST_AID
 *   FLOOD           |  CAP_SEARCH_RESCUE
 *   ACCIDENT        |  CAP_FIRST_AID
 *   EARTHQUAKE      |  CAP_SEARCH_RESCUE
 *   HAZMAT          |  CAP_HAZMAT
 *   OTHER           |  (any -- no requirement)
 */

#include "resource.h"
#include "common.h"
#include "utils.h"

#include <stdio.h>
#include <string.h>
#include <time.h>

/* --- Internal storage ------------------------------------------------- */
static Resource g_res[MAX_RESOURCES];
static int      g_count = 0;

/* --- Required capability per emergency type --------------------------- */
static const uint32_t REQUIRED_CAP[TYPE_COUNT] = {
    /* FIRE */       CAP_FIRE_SUPPRESS,
    /* MEDICAL */    CAP_FIRST_AID,
    /* FLOOD */      CAP_SEARCH_RESCUE,
    /* ACCIDENT */   CAP_FIRST_AID,
    /* EARTHQUAKE */ CAP_SEARCH_RESCUE,
    /* HAZMAT */     CAP_HAZMAT,
    /* OTHER */      CAP_NONE
};

/* --- Private helpers -------------------------------------------------- */

static int find_idx(const char *id) {
    for (int i = 0; i < g_count; i++) {
        if (strcmp(g_res[i].id, id) == 0) return i;
    }
    return -1;
}

/* --- Public API ------------------------------------------------------- */

void resource_db_init(void) {
    memset(g_res, 0, sizeof(g_res));
    g_count = 0;
}

int resource_db_count(void) {
    return g_count;
}

AresStatus resource_add(const Resource *r) {
    if (!r)                   return ARES_ERR_NULL;
    if (g_count >= MAX_RESOURCES) return ARES_ERR_OVERFLOW;
    if (r->id[0] == '\0')     return ARES_ERR_INVALID;
    if (find_idx(r->id) >= 0) return ARES_ERR_DUPLICATE;

    g_res[g_count]              = *r;
    g_res[g_count].last_updated = time(NULL);
    g_count++;
    return ARES_OK;
}

AresStatus resource_find_by_id(const char *id, Resource *out) {
    if (!id || !out) return ARES_ERR_NULL;
    int idx = find_idx(id);
    if (idx < 0) return ARES_ERR_NOT_FOUND;
    *out = g_res[idx];
    return ARES_OK;
}

AresStatus resource_set_status(const char *id, ResourceStatus new_status) {
    if (!id) return ARES_ERR_NULL;
    int idx = find_idx(id);
    if (idx < 0) return ARES_ERR_NOT_FOUND;
    g_res[idx].status       = new_status;
    g_res[idx].last_updated = time(NULL);
    return ARES_OK;
}

AresStatus resource_set_node(const char *id, NodeID new_node) {
    if (!id) return ARES_ERR_NULL;
    int idx = find_idx(id);
    if (idx < 0) return ARES_ERR_NOT_FOUND;
    g_res[idx].current_node = new_node;
    g_res[idx].last_updated = time(NULL);
    return ARES_OK;
}

AresStatus resource_dispatch(const char *resource_id,
                             const char *emergency_id) {
    if (!resource_id || !emergency_id) return ARES_ERR_NULL;
    int idx = find_idx(resource_id);
    if (idx < 0) return ARES_ERR_NOT_FOUND;
    if (g_res[idx].status != RES_STATUS_AVAILABLE) return ARES_ERR_INVALID;

    g_res[idx].status = RES_STATUS_DISPATCHED;
    safe_strncpy(g_res[idx].assigned_emergency_id,
                 emergency_id, MAX_ID_LEN);
    g_res[idx].last_updated = time(NULL);
    return ARES_OK;
}

AresStatus resource_complete_mission(const char *resource_id) {
    if (!resource_id) return ARES_ERR_NULL;
    int idx = find_idx(resource_id);
    if (idx < 0) return ARES_ERR_NOT_FOUND;

    g_res[idx].status = RES_STATUS_AVAILABLE;
    g_res[idx].assigned_emergency_id[0] = '\0';
    g_res[idx].current_node  = g_res[idx].base_node;  /* teleport to base */
    g_res[idx].last_updated  = time(NULL);
    return ARES_OK;
}

AresStatus resource_delete(const char *id) {
    if (!id) return ARES_ERR_NULL;
    int idx = find_idx(id);
    if (idx < 0) return ARES_ERR_NOT_FOUND;

    for (int i = idx; i < g_count - 1; i++) {
        g_res[i] = g_res[i + 1];
    }
    memset(&g_res[g_count - 1], 0, sizeof(Resource));
    g_count--;
    return ARES_OK;
}

/* --- Query helpers ---------------------------------------------------- */

int resource_find_available(ResourceType type,
                            char        out_ids[][MAX_ID_LEN],
                            int          max_results) {
    int found = 0;
    for (int i = 0; i < g_count && found < max_results; i++) {
        if (g_res[i].type   == type &&
            g_res[i].status == RES_STATUS_AVAILABLE) {
            safe_strncpy(out_ids[found], g_res[i].id, MAX_ID_LEN);
            found++;
        }
    }
    return found;
}

bool resource_is_compatible(const Resource *r, EmergencyType etype) {
    if (!r) return false;
    int tidx = (int)etype;
    if (tidx < 0 || tidx >= TYPE_COUNT) return true; /* OTHER: anything works */
    uint32_t required = REQUIRED_CAP[tidx];
    if (required == CAP_NONE) return true;            /* no requirement        */
    return (r->capabilities & required) == required;
}

/* --- Iteration -------------------------------------------------------- */

int resource_foreach(ResourceVisitor cb, void *user_data) {
    if (!cb) return 0;
    int visited = 0;
    for (int i = 0; i < g_count; i++) {
        visited++;
        if (!cb(&g_res[i], user_data)) break;
    }
    return visited;
}

/* --- Display ---------------------------------------------------------- */

const char *resource_type_to_str(ResourceType t) {
    switch (t) {
        case RES_AMBULANCE:   return "Ambulance";
        case RES_FIRE_TRUCK:  return "Fire Truck";
        case RES_POLICE:      return "Police Unit";
        case RES_RESCUE_TEAM: return "Rescue Team";
        case RES_HELICOPTER:  return "Helicopter";
        case RES_HAZMAT_UNIT: return "HazMat Unit";
        case RES_SHELTER:     return "Shelter";
        case RES_WAREHOUSE:   return "Warehouse";
        case RES_OTHER:       return "Other";
        default:              return "Unknown";
    }
}

const char *resource_status_to_str(ResourceStatus s) {
    switch (s) {
        case RES_STATUS_AVAILABLE:   return "Available";
        case RES_STATUS_DISPATCHED:  return "Dispatched";
        case RES_STATUS_UNAVAILABLE: return "Unavailable";
        case RES_STATUS_RETURNING:   return "Returning";
        default:                     return "Unknown";
    }
}

const char *resource_caps_to_str(uint32_t caps, char *buf, int buf_len) {
    if (!buf || buf_len <= 0) return "";
    buf[0] = '\0';
    if (caps == CAP_NONE) {
        safe_strncpy(buf, "None", (size_t)buf_len);
        return buf;
    }
    struct { uint32_t flag; const char *name; } table[] = {
        { CAP_FIRST_AID,     "FirstAid"     },
        { CAP_ADVANCED_LIFE, "AdvancedLife" },
        { CAP_FIRE_SUPPRESS, "FireSuppress" },
        { CAP_HAZMAT,        "HazMat"       },
        { CAP_SEARCH_RESCUE, "SearchRescue" },
        { CAP_AERIAL,        "Aerial"       },
        { CAP_CROWD_CONTROL, "CrowdControl" },
        { CAP_SHELTER_HOST,  "Shelter"      },
    };
    int first = 1;
    for (int i = 0; i < ARES_ARRAY_LEN(table); i++) {
        if (caps & table[i].flag) {
            if (!first) strncat(buf, "|", (size_t)buf_len - strlen(buf) - 1);
            strncat(buf, table[i].name, (size_t)buf_len - strlen(buf) - 1);
            first = 0;
        }
    }
    return buf;
}

void resource_list(int status_filter) {
    int printed = 0;
    for (int i = 0; i < g_count; i++) {
        if (status_filter < 0 ||
            g_res[i].status == (ResourceStatus)status_filter) {
            resource_print(&g_res[i]);
            printed++;
        }
    }
    if (printed == 0) printf("  (no resources match filter)\n");
}

void resource_print(const Resource *r) {
    if (!r) return;
    char cap_buf[256];
    resource_caps_to_str(r->capabilities, cap_buf, sizeof(cap_buf));

    printf("  +-------------------------------------------------\n");
    printf("  |  ID       : %-15s  Type   : %s\n",
           r->id, resource_type_to_str(r->type));
    printf("  |  Name     : %s\n", r->name);
    printf("  |  Status   : %-14s  Node   : %d (base: %d)\n",
           resource_status_to_str(r->status),
           r->current_node, r->base_node);
    printf("  |  Capacity : %d / %d\n", r->current_load, r->capacity);
    printf("  |  Caps     : %s\n", cap_buf);
    printf("  |  Assigned : %s\n",
           r->assigned_emergency_id[0] ? r->assigned_emergency_id : "(none)");
    printf("  +-------------------------------------------------\n");
}
