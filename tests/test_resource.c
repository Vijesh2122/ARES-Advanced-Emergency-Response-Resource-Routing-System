/**
 * @file test_resource.c
 * @brief Unit tests for resource.c -- Phase 2.
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>

#include "resource.h"
#include "utils.h"

static int g_pass = 0, g_fail = 0;

#define ASSERT(cond, msg) \
    do { \
        if (cond) { printf("  [PASS] %s\n", msg); g_pass++; } \
        else      { printf("  [FAIL] %s  (line %d)\n", msg, __LINE__); g_fail++; } \
    } while(0)

/* --- Build a test resource -------------------------------------------- */
static Resource make_res(const char *id, ResourceType type,
                         ResourceStatus status, NodeID node) {
    Resource r;
    memset(&r, 0, sizeof(r));
    safe_strncpy(r.id, id, MAX_ID_LEN);
    safe_strncpy(r.name, "Test Unit", MAX_NAME_LEN);
    r.type        = type;
    r.status      = status;
    r.current_node = node;
    r.base_node    = node;
    r.capacity     = 4;
    r.last_updated = time(NULL);

    /* Auto-assign capabilities */
    switch (type) {
        case RES_AMBULANCE:
            r.capabilities = CAP_FIRST_AID | CAP_ADVANCED_LIFE; break;
        case RES_FIRE_TRUCK:
            r.capabilities = CAP_FIRE_SUPPRESS; break;
        case RES_HAZMAT_UNIT:
            r.capabilities = CAP_HAZMAT | CAP_FIRST_AID; break;
        case RES_RESCUE_TEAM:
            r.capabilities = CAP_SEARCH_RESCUE | CAP_FIRST_AID; break;
        default:
            r.capabilities = CAP_NONE; break;
    }
    return r;
}

static void test_init(void) {
    printf("\n[Suite] resource_db_init\n");
    resource_db_init();
    ASSERT(resource_db_count() == 0, "Count is 0 after init");
}

static void test_add(void) {
    printf("\n[Suite] resource_add\n");
    resource_db_init();

    Resource r1 = make_res("AMB-0001", RES_AMBULANCE, RES_STATUS_AVAILABLE, 3);
    ASSERT(resource_add(&r1) == ARES_OK,           "Add first resource");
    ASSERT(resource_db_count() == 1,               "Count is 1");
    ASSERT(resource_add(&r1) == ARES_ERR_DUPLICATE,"Duplicate rejected");
    ASSERT(resource_add(NULL) == ARES_ERR_NULL,    "NULL rejected");
}

static void test_find(void) {
    printf("\n[Suite] resource_find_by_id\n");
    resource_db_init();
    Resource r = make_res("FTK-0001", RES_FIRE_TRUCK, RES_STATUS_AVAILABLE, 5);
    resource_add(&r);

    Resource out;
    ASSERT(resource_find_by_id("FTK-0001", &out) == ARES_OK,  "Find existing");
    ASSERT(out.type == RES_FIRE_TRUCK,                         "Correct type");
    ASSERT(resource_find_by_id("NOPE", &out) == ARES_ERR_NOT_FOUND,
           "Not found returns correct code");
    ASSERT(resource_find_by_id(NULL, &out) == ARES_ERR_NULL,  "NULL id");
}

static void test_dispatch(void) {
    printf("\n[Suite] resource_dispatch + complete_mission\n");
    resource_db_init();
    Resource r = make_res("AMB-0002", RES_AMBULANCE, RES_STATUS_AVAILABLE, 2);
    resource_add(&r);

    /* dispatch to a dummy emergency ID */
    ASSERT(resource_dispatch("AMB-0002", "INC0001") == ARES_OK, "Dispatch OK");

    Resource out;
    resource_find_by_id("AMB-0002", &out);
    ASSERT(out.status == RES_STATUS_DISPATCHED,  "Status = Dispatched");
    ASSERT(strcmp(out.assigned_emergency_id, "INC0001") == 0,
           "Emergency ID stored");

    /* Cannot dispatch again while dispatched */
    ASSERT(resource_dispatch("AMB-0002", "INC0002") == ARES_ERR_INVALID,
           "Double-dispatch rejected");

    /* Complete mission */
    ASSERT(resource_complete_mission("AMB-0002") == ARES_OK, "Mission complete");
    resource_find_by_id("AMB-0002", &out);
    ASSERT(out.status == RES_STATUS_AVAILABLE,       "Status = Available");
    ASSERT(out.assigned_emergency_id[0] == '\0',     "Assignment cleared");
    ASSERT(out.current_node == out.base_node,         "Node reset to base");
}

static void test_compatibility(void) {
    printf("\n[Suite] resource_is_compatible\n");
    resource_db_init();

    Resource amb  = make_res("AMB-X", RES_AMBULANCE,   RES_STATUS_AVAILABLE, 0);
    Resource fire = make_res("FTK-X", RES_FIRE_TRUCK,  RES_STATUS_AVAILABLE, 0);
    Resource haz  = make_res("HZM-X", RES_HAZMAT_UNIT, RES_STATUS_AVAILABLE, 0);

    ASSERT(resource_is_compatible(&amb,  TYPE_MEDICAL),  "Ambulance handles Medical");
    ASSERT(resource_is_compatible(&fire, TYPE_FIRE),     "FireTruck handles Fire");
    ASSERT(resource_is_compatible(&haz,  TYPE_HAZMAT),   "HazMat handles HazMat");

    ASSERT(!resource_is_compatible(&fire, TYPE_MEDICAL), "FireTruck NOT Medical");
    ASSERT(!resource_is_compatible(&amb,  TYPE_HAZMAT),  "Ambulance NOT HazMat");
}

static void test_find_available(void) {
    printf("\n[Suite] resource_find_available\n");
    resource_db_init();

    Resource a1 = make_res("AMB-A1", RES_AMBULANCE, RES_STATUS_AVAILABLE, 1);
    Resource a2 = make_res("AMB-A2", RES_AMBULANCE, RES_STATUS_DISPATCHED, 2);
    Resource a3 = make_res("AMB-A3", RES_AMBULANCE, RES_STATUS_AVAILABLE, 3);
    resource_add(&a1);
    resource_add(&a2);
    resource_add(&a3);

    char ids[10][MAX_ID_LEN];
    int found = resource_find_available(RES_AMBULANCE, ids, 10);
    ASSERT(found == 2, "2 ambulances available");
    ASSERT(strcmp(ids[0], "AMB-A1") == 0 || strcmp(ids[1], "AMB-A1") == 0,
           "AMB-A1 in results");
    ASSERT(strcmp(ids[0], "AMB-A3") == 0 || strcmp(ids[1], "AMB-A3") == 0,
           "AMB-A3 in results");

    /* Dispatched one is NOT in results */
    int in_results = 0;
    for (int i = 0; i < found; i++)
        if (strcmp(ids[i], "AMB-A2") == 0) in_results = 1;
    ASSERT(!in_results, "Dispatched AMB-A2 excluded");
}

static void test_delete(void) {
    printf("\n[Suite] resource_delete\n");
    resource_db_init();
    Resource r = make_res("POL-0001", RES_POLICE, RES_STATUS_AVAILABLE, 7);
    resource_add(&r);

    ASSERT(resource_delete("POL-0001") == ARES_OK, "Delete existing");
    ASSERT(resource_db_count() == 0,               "Count drops to 0");
    ASSERT(resource_delete("POL-0001") == ARES_ERR_NOT_FOUND,
           "Delete non-existent returns NOT_FOUND");
}

int main(void) {
    printf("===========================================\n");
    printf("  ARES Phase 2 -- Resource Unit Tests\n");
    printf("===========================================\n");

    test_init();
    test_add();
    test_find();
    test_dispatch();
    test_compatibility();
    test_find_available();
    test_delete();

    printf("\n===========================================\n");
    printf("  Results: %d passed, %d failed\n", g_pass, g_fail);
    printf("===========================================\n");
    return (g_fail == 0) ? EXIT_SUCCESS : EXIT_FAILURE;
}
