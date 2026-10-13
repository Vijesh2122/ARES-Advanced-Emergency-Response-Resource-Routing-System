/**
 * @file types.h
 * @brief Core type definitions, constants, and enumerations for ARES.
 *
 * Every ARES module depends on this file.  It must not include any
 * other ARES header (no circular dependencies).
 *
 * Phase 2 additions:
 *   - ResourceType, ResourceStatus
 *   - MissionStatus, DispatchCriteria
 *   - NodeID type alias
 *   - Expanded AresStatus codes
 *   - MAX_* constants for all models
 */

#ifndef ARES_TYPES_H
#define ARES_TYPES_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>
#include <time.h>

/* --- String-length constants ------------------------------------------ */
#define ARES_VERSION        "2.0.0-phase2"
#define MAX_ID_LEN          24    /* e.g. "INC20261013-0001\0"       */
#define MAX_NAME_LEN        64
#define MAX_LOCATION_LEN    128
#define MAX_DESC_LEN        256
#define MAX_LABEL_LEN       64    /* graph node / road label         */
#define MAX_PATH_LEN        512   /* file path                       */
#define MAX_ROUTE_NODES     256   /* maximum hops in a dispatch route */

/* --- Capacity limits -------------------------------------------------- */
#define MAX_EMERGENCIES     1000
#define MAX_RESOURCES       500
#define MAX_GRAPH_NODES     256
#define MAX_GRAPH_EDGES     2048
#define MAX_HISTORY_DEPTH   200   /* undo stack depth                */

/* --- Node identifier -------------------------------------------------- */
typedef int NodeID;               /* -1 = invalid / unset            */
#define NODE_INVALID  (-1)

/* --- Emergency severity ----------------------------------------------- */
typedef enum {
    SEV_LOW      = 1,   /* informational / minor             */
    SEV_MEDIUM   = 2,   /* significant, monitor closely      */
    SEV_HIGH     = 3,   /* urgent, dispatch resources        */
    SEV_CRITICAL = 4    /* life-threatening / mass-casualty  */
} Severity;

/* --- Emergency type --------------------------------------------------- */
typedef enum {
    TYPE_FIRE        = 0,
    TYPE_MEDICAL     = 1,
    TYPE_FLOOD       = 2,
    TYPE_ACCIDENT    = 3,
    TYPE_EARTHQUAKE  = 4,
    TYPE_HAZMAT      = 5,
    TYPE_OTHER       = 6,
    TYPE_COUNT       = 7    /* sentinel -- keep last */
} EmergencyType;

/* --- Emergency / record status ---------------------------------------- */
typedef enum {
    STATUS_PENDING    = 0,   /* received, waiting for dispatch  */
    STATUS_ACTIVE     = 1,   /* resource dispatched, en route   */
    STATUS_RESOLVED   = 2,   /* mission complete                */
    STATUS_CANCELLED  = 3    /* cancelled by operator           */
} RecordStatus;

/* --- Resource type ---------------------------------------------------- */
typedef enum {
    RES_AMBULANCE    = 0,
    RES_FIRE_TRUCK   = 1,
    RES_POLICE       = 2,
    RES_RESCUE_TEAM  = 3,
    RES_HELICOPTER   = 4,
    RES_HAZMAT_UNIT  = 5,
    RES_SHELTER      = 6,    /* fixed shelter node              */
    RES_WAREHOUSE    = 7,    /* fixed supply node               */
    RES_OTHER        = 8,
    RES_TYPE_COUNT   = 9
} ResourceType;

/* --- Resource availability status ------------------------------------ */
typedef enum {
    RES_STATUS_AVAILABLE   = 0,
    RES_STATUS_DISPATCHED  = 1,   /* en route / on scene          */
    RES_STATUS_UNAVAILABLE = 2,   /* maintenance / out of service */
    RES_STATUS_RETURNING   = 3    /* returning to base            */
} ResourceStatus;

/* --- Mission status --------------------------------------------------- */
typedef enum {
    MISSION_PENDING    = 0,
    MISSION_ACTIVE     = 1,
    MISSION_COMPLETE   = 2,
    MISSION_ABORTED    = 3
} MissionStatus;

/* --- Dispatch selection criterion ------------------------------------ */
typedef enum {
    DISPATCH_NEAREST    = 0,   /* resource with shortest path        */
    DISPATCH_FASTEST    = 1,   /* resource with shortest travel time */
    DISPATCH_COMPATIBLE = 2    /* first compatible available resource */
} DispatchCriteria;

/* --- Operation types for the undo/history stack ---------------------- */
typedef enum {
    OP_ADD_EMERGENCY     = 0,
    OP_CHANGE_PRIORITY   = 1,
    OP_BLOCK_ROAD        = 2,
    OP_UNBLOCK_ROAD      = 3,
    OP_CHANGE_RES_STATUS = 4,
    OP_DISPATCH          = 5
} OperationType;

/* --- Return codes ----------------------------------------------------- */
typedef enum {
    ARES_OK              =  0,
    ARES_ERR_NULL        = -1,   /* null pointer argument           */
    ARES_ERR_OVERFLOW    = -2,   /* storage limit reached           */
    ARES_ERR_NOT_FOUND   = -3,   /* record / node not found         */
    ARES_ERR_DUPLICATE   = -4,   /* ID already exists               */
    ARES_ERR_INVALID     = -5,   /* invalid argument / bad input    */
    ARES_ERR_IO          = -6,   /* file / I-O error                */
    ARES_ERR_NO_RESOURCE = -7,   /* no suitable resource available  */
    ARES_ERR_UNREACHABLE = -8,   /* destination unreachable (graph) */
    ARES_ERR_UNDERFLOW   = -9,   /* stack/queue underflow           */
    ARES_ERR_FULL        = -10   /* fixed-capacity structure full   */
} AresStatus;

#endif /* ARES_TYPES_H */
