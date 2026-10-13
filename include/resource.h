/**
 * @file resource.h
 * @brief Resource model and management API for ARES.
 *
 * A Resource represents any dispatchable unit in the simulated city:
 * ambulances, fire trucks, police cars, rescue teams, helicopters, etc.
 *
 * The backing store in Phase 2 is a flat array.  It will be replaced
 * by a doubly-linked list in Phase 4 and augmented with a hash table
 * for O(1) ID lookup in Phase 9 -- this API does not change.
 */

#ifndef ARES_RESOURCE_H
#define ARES_RESOURCE_H

#include "types.h"

/* --- Capability flags (bitmask) --------------------------------------- */
#define CAP_NONE            0x00
#define CAP_FIRST_AID       0x01   /* basic medical response      */
#define CAP_ADVANCED_LIFE   0x02   /* paramedic / ICU capable     */
#define CAP_FIRE_SUPPRESS   0x04   /* active fire suppression     */
#define CAP_HAZMAT          0x08   /* hazardous material handling */
#define CAP_SEARCH_RESCUE   0x10   /* search and rescue           */
#define CAP_AERIAL          0x20   /* aerial operations           */
#define CAP_CROWD_CONTROL   0x40   /* law enforcement             */
#define CAP_SHELTER_HOST    0x80   /* can house displaced people  */

/* --- Resource record -------------------------------------------------- */
typedef struct {
    /* Identity */
    char           id[MAX_ID_LEN];
    char           name[MAX_NAME_LEN];         /* e.g. "Ambulance-A1"  */
    char           base_location[MAX_LABEL_LEN]; /* home station label  */

    /* Classification */
    ResourceType   type;
    ResourceStatus status;
    uint32_t       capabilities;               /* bitmask of CAP_*     */

    /* Location */
    NodeID         current_node;               /* current position on graph */
    NodeID         base_node;                  /* home node                 */

    /* Capacity */
    int            capacity;                   /* e.g. patient seats        */
    int            current_load;               /* currently occupied        */

    /* Assignment */
    char           assigned_emergency_id[MAX_ID_LEN]; /* "" if free        */

    /* Timing */
    time_t         last_updated;
} Resource;

/* --- Resource database API -------------------------------------------- */

/** Initialise the resource database. Call once at startup. */
void resource_db_init(void);

/** Return the number of resources currently stored. */
int  resource_db_count(void);

/**
 * Register a new resource.
 * Returns ARES_OK, ARES_ERR_OVERFLOW, or ARES_ERR_DUPLICATE.
 */
AresStatus resource_add(const Resource *r);

/** Find resource by ID. Returns ARES_OK or ARES_ERR_NOT_FOUND. */
AresStatus resource_find_by_id(const char *id, Resource *out);

/** Update a resource's status. */
AresStatus resource_set_status(const char *id, ResourceStatus new_status);

/** Update a resource's current node (called after movement). */
AresStatus resource_set_node(const char *id, NodeID new_node);

/**
 * Assign this resource to an emergency.
 * - Sets status = RES_STATUS_DISPATCHED
 * - Stores emergency ID in assigned_emergency_id
 * Returns ARES_ERR_INVALID if the resource is not available.
 */
AresStatus resource_dispatch(const char *resource_id,
                             const char *emergency_id);

/**
 * Mark mission complete; return resource to available.
 * - Sets status = RES_STATUS_AVAILABLE
 * - Clears assigned_emergency_id
 * - Sets current_node = base_node (simulation: teleport to base)
 */
AresStatus resource_complete_mission(const char *resource_id);

/** Remove resource from DB. */
AresStatus resource_delete(const char *id);

/**
 * List all resources; pass -1 to list all statuses,
 * or a ResourceStatus value to filter.
 */
void resource_list(int status_filter);

/** Print a single resource record. */
void resource_print(const Resource *r);

/* --- Query helpers ---------------------------------------------------- */

/**
 * Find all available resources of a given type.
 * out_ids must point to an array of at least max_results char[MAX_ID_LEN].
 * Returns number of matching resources found.
 */
int resource_find_available(ResourceType type,
                            char        out_ids[][MAX_ID_LEN],
                            int          max_results);

/**
 * Check whether a resource has the required capabilities for an
 * emergency type.  Returns true if compatible.
 */
bool resource_is_compatible(const Resource *r, EmergencyType etype);

/* --- Iteration helper ------------------------------------------------- */
typedef bool (*ResourceVisitor)(const Resource *r, void *user_data);
int resource_foreach(ResourceVisitor cb, void *user_data);

/* --- String converters ------------------------------------------------ */
const char *resource_type_to_str(ResourceType t);
const char *resource_status_to_str(ResourceStatus s);
const char *resource_caps_to_str(uint32_t caps, char *buf, int buf_len);

#endif /* ARES_RESOURCE_H */
