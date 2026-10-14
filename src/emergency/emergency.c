/**
 * @file emergency.c
 * @brief Emergency record database -- Phase 2 implementation.
 *
 * Backing store: flat array (MAX_EMERGENCIES slots).
 * Phase 4 will swap this for a doubly-linked list; the API in
 * emergency.h does not change between phases.
 *
 * Priority formula (demonstration only -- NOT a clinical triage model):
 *
 *   score = 100 * ( 0.40 * sev_norm
 *                 + 0.25 * aff_norm
 *                 + 0.20 * risk_norm
 *                 + 0.15 * wait_norm )
 *
 *   sev_norm  = severity / 4.0
 *   aff_norm  = min(affected_count, 1000) / 1000.0
 *   risk_norm = type-risk table (see risk_for_type)
 *   wait_norm = min(seconds_since_report, 3600) / 3600.0
 */

#include "emergency.h"
#include "common.h"
#include "utils.h"

#include <stdio.h>
#include <string.h>
#include <time.h>
#include <math.h>

/* --- Internal storage ------------------------------------------------- */
static Emergency g_db[MAX_EMERGENCIES];
static int       g_count = 0;

/* --- Risk table: base risk score per emergency type (0.0 -- 1.0) ------ */
static const double RISK_BY_TYPE[TYPE_COUNT] = {
    /* FIRE */       0.85,
    /* MEDICAL */    0.90,
    /* FLOOD */      0.70,
    /* ACCIDENT */   0.75,
    /* EARTHQUAKE */ 1.00,
    /* HAZMAT */     0.95,
    /* OTHER */      0.40
};

/* --- Private helpers -------------------------------------------------- */

static int find_idx(const char *id) {
    for (int i = 0; i < g_count; i++) {
        if (strcmp(g_db[i].id, id) == 0) return i;
    }
    return -1;
}

/* --- Priority engine -------------------------------------------------- */

double emergency_priority_score(const Emergency *e) {
    if (!e) return 0.0;

    /* Severity: normalise to [0.25, 1.0] */
    double sev_norm = (double)e->severity / (double)SEV_CRITICAL;

    /* Affected count: clamp to [0, 1000] then normalise */
    double aff_norm = (double)(e->affected_count > 1000 ? 1000
                                : (e->affected_count < 0 ? 0 : e->affected_count))
                      / 1000.0;

    /* Risk: from type table */
    int tidx = (int)e->type;
    double risk_norm = (tidx >= 0 && tidx < TYPE_COUNT)
                       ? RISK_BY_TYPE[tidx] : 0.5;

    /* Wait time: clamp to 1 hour = 3600 s */
    time_t now  = time(NULL);
    double wait = (double)(now - e->reported_at);
    if (wait < 0.0) wait = 0.0;
    double wait_norm = (wait > 3600.0 ? 3600.0 : wait) / 3600.0;

    double score = 100.0 * (PW_SEVERITY * sev_norm
                          + PW_AFFECTED * aff_norm
                          + PW_RISK     * risk_norm
                          + PW_WAIT     * wait_norm);

    /* Clamp to [0, 100] in case of floating-point drift */
    if (score > 100.0) score = 100.0;
    if (score <   0.0) score = 0.0;
    return score;
}

AresStatus emergency_refresh_priority(const char *id) {
    if (!id) return ARES_ERR_NULL;
    int idx = find_idx(id);
    if (idx < 0) return ARES_ERR_NOT_FOUND;
    g_db[idx].priority_score = emergency_priority_score(&g_db[idx]);
    g_db[idx].updated_at     = time(NULL);
    return ARES_OK;
}

/* --- Public API ------------------------------------------------------- */

void emergency_db_init(void) {
    memset(g_db, 0, sizeof(g_db));
    g_count = 0;
}

int emergency_db_count(void) {
    return g_count;
}

AresStatus emergency_add(Emergency *e) {
    if (!e)                    return ARES_ERR_NULL;
    if (g_count >= MAX_EMERGENCIES) return ARES_ERR_OVERFLOW;
    if (e->id[0] == '\0')      return ARES_ERR_INVALID;
    if (e->type < TYPE_FIRE || e->type >= TYPE_COUNT ||
        e->severity < SEV_LOW || e->severity > SEV_CRITICAL ||
        e->status < STATUS_PENDING || e->status > STATUS_CANCELLED ||
        e->node_id < NODE_INVALID || e->node_id >= MAX_GRAPH_NODES ||
        e->affected_count < 0) return ARES_ERR_INVALID;
    if (find_idx(e->id) >= 0)  return ARES_ERR_DUPLICATE;

    if (e->reported_at == 0)  e->reported_at = time(NULL);
    if (e->updated_at == 0) e->updated_at = e->reported_at;
    /* Compute after normalising the timestamp. */
    e->priority_score = emergency_priority_score(e);

    g_db[g_count++] = *e;
    return ARES_OK;
}

AresStatus emergency_find_by_id(const char *id, Emergency *out) {
    if (!id || !out) return ARES_ERR_NULL;
    int idx = find_idx(id);
    if (idx < 0) return ARES_ERR_NOT_FOUND;
    *out = g_db[idx];
    return ARES_OK;
}

AresStatus emergency_update_status(const char *id,
                                   RecordStatus new_status,
                                   const char  *new_desc) {
    if (!id) return ARES_ERR_NULL;
    if (new_status < STATUS_PENDING || new_status > STATUS_CANCELLED)
        return ARES_ERR_INVALID;
    int idx = find_idx(id);
    if (idx < 0) return ARES_ERR_NOT_FOUND;

    g_db[idx].status     = new_status;
    g_db[idx].updated_at = time(NULL);
    if (new_desc && new_desc[0] != '\0') {
        safe_strncpy(g_db[idx].description, new_desc, MAX_DESC_LEN);
    }
    g_db[idx].priority_score = emergency_priority_score(&g_db[idx]);
    return ARES_OK;
}

AresStatus emergency_assign_resource(const char *emergency_id,
                                     const char *resource_id) {
    if (!emergency_id || !resource_id) return ARES_ERR_NULL;
    if (resource_id[0] == '\0') return ARES_ERR_INVALID;
    int idx = find_idx(emergency_id);
    if (idx < 0) return ARES_ERR_NOT_FOUND;

    safe_strncpy(g_db[idx].assigned_res_id, resource_id, MAX_ID_LEN);
    g_db[idx].status     = STATUS_ACTIVE;
    g_db[idx].updated_at = time(NULL);
    return ARES_OK;
}

AresStatus emergency_close(const char *id, RecordStatus final_status) {
    if (!id) return ARES_ERR_NULL;
    if (final_status != STATUS_RESOLVED &&
        final_status != STATUS_CANCELLED) return ARES_ERR_INVALID;
    return emergency_update_status(id, final_status, NULL);
}

AresStatus emergency_delete(const char *id) {
    if (!id) return ARES_ERR_NULL;
    int idx = find_idx(id);
    if (idx < 0) return ARES_ERR_NOT_FOUND;

    /* Compact array */
    for (int i = idx; i < g_count - 1; i++) {
        g_db[i] = g_db[i + 1];
    }
    memset(&g_db[g_count - 1], 0, sizeof(Emergency));
    g_count--;
    return ARES_OK;
}

void emergency_list(int status_filter) {
    int printed = 0;
    for (int i = 0; i < g_count; i++) {
        if (status_filter < 0 ||
            g_db[i].status == (RecordStatus)status_filter) {
            emergency_print(&g_db[i]);
            printed++;
        }
    }
    if (printed == 0) {
        printf("  (no records match filter)\n");
    }
}

/* --- Iteration -------------------------------------------------------- */

int emergency_foreach(EmergencyVisitor cb, void *user_data) {
    if (!cb) return 0;
    int visited = 0;
    for (int i = 0; i < g_count; i++) {
        visited++;
        if (!cb(&g_db[i], user_data)) break;
    }
    return visited;
}

/* --- Display ---------------------------------------------------------- */

const char *severity_to_str(Severity s) {
    switch (s) {
        case SEV_LOW:      return "LOW";
        case SEV_MEDIUM:   return "MEDIUM";
        case SEV_HIGH:     return "HIGH";
        case SEV_CRITICAL: return "CRITICAL";
        default:           return "UNKNOWN";
    }
}

const char *type_to_str(EmergencyType t) {
    switch (t) {
        case TYPE_FIRE:       return "Fire";
        case TYPE_MEDICAL:    return "Medical";
        case TYPE_FLOOD:      return "Flood";
        case TYPE_ACCIDENT:   return "Accident";
        case TYPE_EARTHQUAKE: return "Earthquake";
        case TYPE_HAZMAT:     return "HazMat";
        case TYPE_OTHER:      return "Other";
        default:              return "Unknown";
    }
}

const char *status_to_str(RecordStatus s) {
    switch (s) {
        case STATUS_PENDING:   return "Pending";
        case STATUS_ACTIVE:    return "Active";
        case STATUS_RESOLVED:  return "Resolved";
        case STATUS_CANCELLED: return "Cancelled";
        default:               return "Unknown";
    }
}

void emergency_print(const Emergency *e) {
    if (!e) return;
    char ts_rep[20], ts_upd[20];
    format_timestamp(ts_rep, e->reported_at);
    format_timestamp(ts_upd, e->updated_at);

    printf("  +-------------------------------------------------\n");
    printf("  |  ID          : %-15s  Priority : %.1f/100\n",
           e->id, e->priority_score);
    printf("  |  Reporter    : %s\n",   e->reporter_name);
    printf("  |  Type        : %-12s  Severity : %s\n",
           type_to_str(e->type), severity_to_str(e->severity));
    printf("  |  Status      : %-12s  Node ID  : %d\n",
           status_to_str(e->status), e->node_id);
    printf("  |  Location    : %s\n",   e->location_label);
    printf("  |  Affected    : %d people\n", e->affected_count);
    printf("  |  Description : %s\n",   e->description);
    printf("  |  Resource    : %s\n",
           e->assigned_res_id[0] ? e->assigned_res_id : "(none)");
    printf("  |  Reported    : %s\n",   ts_rep);
    printf("  |  Updated     : %s\n",   ts_upd);
    printf("  +-------------------------------------------------\n");
}
