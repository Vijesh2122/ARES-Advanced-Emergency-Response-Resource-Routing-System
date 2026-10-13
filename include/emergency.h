/**
 * @file emergency.h
 * @brief Emergency model and record-management API for ARES.
 *
 * The Emergency struct is the central data entity.  Phase 2 adds:
 *   - node_id        : city-graph location of the incident
 *   - affected_count : number of people affected
 *   - priority_score : computed triage score (0.0 -- 100.0)
 *   - assigned_res_id: ID of the dispatched resource (if any)
 *   - sim_time       : simulation-clock timestamp (separate from wall clock)
 *
 * The backing store is a flat array in Phase 2.  Phase 4 will replace it
 * with a doubly-linked list; the function signatures here will not change.
 */

#ifndef ARES_EMERGENCY_H
#define ARES_EMERGENCY_H

#include "types.h"
#include <time.h>

/* --- Priority formula weights (configurable at runtime) --------------- */
#define PW_SEVERITY    0.40   /* 40% weight                        */
#define PW_AFFECTED    0.25   /* 25% weight                        */
#define PW_RISK        0.20   /* 20% weight (type-based risk)      */
#define PW_WAIT        0.15   /* 15% weight (time waiting)         */
/* Sum must equal 1.0 -- validated in emergency_priority_score()    */

/* --- Emergency record ------------------------------------------------- */
typedef struct {
    /* Identity */
    char          id[MAX_ID_LEN];              /* auto-generated unique ID    */
    char          reporter_name[MAX_NAME_LEN]; /* person who reported it      */
    char          description[MAX_DESC_LEN];   /* free-text description       */

    /* Classification */
    EmergencyType type;
    Severity      severity;
    RecordStatus  status;

    /* Location */
    NodeID        node_id;                     /* city-graph node             */
    char          location_label[MAX_LABEL_LEN]; /* human-readable address    */

    /* Impact */
    int           affected_count;              /* people affected (>= 0)       */

    /* Triage */
    double        priority_score;              /* computed, 0.0--100.0         */

    /* Assignment */
    char          assigned_res_id[MAX_ID_LEN]; /* "" if unassigned            */

    /* Timing */
    time_t        reported_at;                 /* wall-clock UNIX timestamp   */
    time_t        updated_at;
    long          sim_time;                    /* simulation clock ticks      */
} Emergency;
typedef Emergency EmergencyRecord;
#define generate_id(buf, seq) generate_emergency_id((buf), (seq))

/* --- Emergency database API ------------------------------------------- */

/** Initialise the in-memory DB. Call once at startup. */
void emergency_db_init(void);

/** Return number of records currently stored. */
int  emergency_db_count(void);

/**
 * Add a new emergency.  The caller sets all fields except priority_score,
 * which this function computes before insertion.
 * Returns ARES_OK, ARES_ERR_OVERFLOW, or ARES_ERR_DUPLICATE.
 */
AresStatus emergency_add(Emergency *e);

/** Find by ID - copy into *out.  Returns ARES_OK or ARES_ERR_NOT_FOUND. */
AresStatus emergency_find_by_id(const char *id, Emergency *out);

/**
 * Update status and/or description.  Pass NULL for new_desc to keep
 * the existing description.  Recomputes priority_score after update.
 */
AresStatus emergency_update_status(const char *id,
                                   RecordStatus new_status,
                                   const char  *new_desc);

/** Assign a resource to this emergency (sets assigned_res_id + status). */
AresStatus emergency_assign_resource(const char *emergency_id,
                                     const char *resource_id);

/** Mark an emergency as resolved or cancelled. */
AresStatus emergency_close(const char *id, RecordStatus final_status);

/** Remove a record permanently.  Returns ARES_OK or ARES_ERR_NOT_FOUND. */
AresStatus emergency_delete(const char *id);

/**
 * List all records; pass -1 for status_filter to list all,
 * or a RecordStatus value to show only that status.
 */
void emergency_list(int status_filter);

/** Print one record in formatted form. */
void emergency_print(const Emergency *e);

/* --- Priority engine -------------------------------------------------- */

/**
 * Compute and return the priority score for an emergency.
 * Score = 100 * ( PW_SEVERITY * sev_norm
 *               + PW_AFFECTED * aff_norm
 *               + PW_RISK     * risk_norm
 *               + PW_WAIT     * wait_norm )
 *
 * sev_norm  : severity  / SEV_CRITICAL  (0.25 -- 1.0)
 * aff_norm  : min(affected_count, 1000) / 1000.0
 * risk_norm : type-specific risk table (0.0 -- 1.0)
 * wait_norm : min(seconds_waiting, 3600) / 3600.0
 *
 * This is a demonstration formula. It is NOT a medically or
 * operationally validated triage model.
 */
double emergency_priority_score(const Emergency *e);

/**
 * Recompute and store priority_score in the DB record identified by id.
 * Call after any field change that affects priority.
 */
AresStatus emergency_refresh_priority(const char *id);

/* --- Iteration helper ------------------------------------------------- */
/**
 * Visit every record.  cb receives (record, user_data) and may return
 * false to stop early.  Returns the number of records visited.
 */
typedef bool (*EmergencyVisitor)(const Emergency *e, void *user_data);
int emergency_foreach(EmergencyVisitor cb, void *user_data);

/* --- String converters ------------------------------------------------ */
const char *severity_to_str(Severity s);
const char *type_to_str(EmergencyType t);
const char *status_to_str(RecordStatus s);

#endif /* ARES_EMERGENCY_H */
