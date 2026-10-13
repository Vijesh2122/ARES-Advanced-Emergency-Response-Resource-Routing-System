/**
 * @file test_emergency.c
 * @brief Unit tests for the emergency-record module (Phase 1).
 *
 * Compiled and run via:  make test
 * Each test prints PASS or FAIL. Exit code is 0 only if all pass.
 *
 * This is a minimal hand-rolled test harness -- no external framework
 * needed. Later phases may integrate a lightweight C framework such as
 * Unity or Check.
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include "emergency.h"
#include "utils.h"

/* --- Tiny test harness ------------------------------------------------ */
static int g_pass = 0;
static int g_fail = 0;

#define ASSERT(cond, msg)                                           \
    do {                                                            \
        if (cond) {                                                 \
            printf("  [PASS] %s\n", msg);                          \
            g_pass++;                                               \
        } else {                                                    \
            printf("  [FAIL] %s  (line %d)\n", msg, __LINE__);     \
            g_fail++;                                               \
        }                                                           \
    } while (0)

/* --- Helpers ---------------------------------------------------------- */
static EmergencyRecord make_record(const char *id,
                                    const char *name,
                                    EmergencyType type,
                                    Severity sev) {
    EmergencyRecord r;
    memset(&r, 0, sizeof(r));
    safe_strncpy(r.id,            id,   MAX_ID_LEN);
    safe_strncpy(r.reporter_name,  name, MAX_NAME_LEN);
    safe_strncpy(r.location_label, "Test Location", MAX_LABEL_LEN);
    safe_strncpy(r.description,    "Test description.", MAX_DESC_LEN);
    r.node_id        = 1;
    r.affected_count = 1;
    r.type        = type;
    r.severity    = sev;
    r.status      = STATUS_PENDING;
    r.reported_at = 1728000000; /* fixed timestamp for reproducibility */
    r.updated_at  = r.reported_at;
    return r;
}

/* --- Test suites ------------------------------------------------------ */

static void test_init(void) {
    printf("\n[Suite] DB init\n");
    emergency_db_init();
    ASSERT(emergency_db_count() == 0, "DB count is 0 after init");
}

static void test_add(void) {
    printf("\n[Suite] emergency_add\n");
    emergency_db_init();

    EmergencyRecord r1 = make_record("INC001", "Alice",
                                      TYPE_FIRE, SEV_HIGH);
    ASSERT(emergency_add(&r1) == ARES_OK,       "Add first record");
    ASSERT(emergency_db_count() == 1,           "Count is 1 after add");

    /* duplicate ID must be rejected */
    ASSERT(emergency_add(&r1) == ARES_ERR_DUPLICATE, "Duplicate rejected");
    ASSERT(emergency_db_count() == 1,           "Count unchanged after dup");

    /* null pointer */
    ASSERT(emergency_add(NULL) == ARES_ERR_NULL, "NULL record rejected");
}

static void test_find(void) {
    printf("\n[Suite] emergency_find_by_id\n");
    emergency_db_init();

    EmergencyRecord r = make_record("INC002", "Bob",
                                     TYPE_MEDICAL, SEV_CRITICAL);
    emergency_add(&r);

    EmergencyRecord found;
    ASSERT(emergency_find_by_id("INC002", &found) == ARES_OK,
           "Find existing record");
    ASSERT(strcmp(found.reporter_name, "Bob") == 0,
           "Found record has correct reporter");
    ASSERT(found.severity == SEV_CRITICAL,
           "Found record has correct severity");

    ASSERT(emergency_find_by_id("NOTEXIST", &found) == ARES_ERR_NOT_FOUND,
           "Find non-existent returns NOT_FOUND");
    ASSERT(emergency_find_by_id(NULL, &found) == ARES_ERR_NULL,
           "NULL id returns ERR_NULL");
}

static void test_update(void) {
    printf("\n[Suite] emergency_update\n");
    emergency_db_init();

    EmergencyRecord r = make_record("INC003", "Carol",
                                     TYPE_FLOOD, SEV_MEDIUM);
    emergency_add(&r);

    ASSERT(emergency_update_status("INC003", STATUS_ACTIVE, "Flooding confirmed")
               == ARES_OK,
           "Update existing record");

    EmergencyRecord found;
    emergency_find_by_id("INC003", &found);
    ASSERT(found.status == STATUS_ACTIVE,            "Status updated");
    ASSERT(strcmp(found.description, "Flooding confirmed") == 0,
           "Description updated");

    ASSERT(emergency_update_status("BAD_ID", STATUS_RESOLVED, NULL)
               == ARES_ERR_NOT_FOUND,
           "Update non-existent returns NOT_FOUND");
}

static void test_delete(void) {
    printf("\n[Suite] emergency_delete\n");
    emergency_db_init();

    EmergencyRecord r1 = make_record("INC010", "Dave", TYPE_ACCIDENT, SEV_LOW);
    EmergencyRecord r2 = make_record("INC011", "Eve",  TYPE_HAZMAT,   SEV_HIGH);
    EmergencyRecord r3 = make_record("INC012", "Frank",TYPE_OTHER,    SEV_MEDIUM);
    emergency_add(&r1);
    emergency_add(&r2);
    emergency_add(&r3);

    ASSERT(emergency_db_count() == 3,       "3 records before delete");
    ASSERT(emergency_delete("INC011") == ARES_OK, "Delete middle record");
    ASSERT(emergency_db_count() == 2,       "2 records after delete");

    EmergencyRecord found;
    ASSERT(emergency_find_by_id("INC011", &found) == ARES_ERR_NOT_FOUND,
           "Deleted record cannot be found");
    /* Surrounding records still present */
    ASSERT(emergency_find_by_id("INC010", &found) == ARES_OK,
           "Record before deleted one still present");
    ASSERT(emergency_find_by_id("INC012", &found) == ARES_OK,
           "Record after deleted one still present");

    ASSERT(emergency_delete("INC011") == ARES_ERR_NOT_FOUND,
           "Delete non-existent returns NOT_FOUND");
}

static void test_utils(void) {
    printf("\n[Suite] utils\n");

    char buf[64];
    safe_strncpy(buf, "Hello, World!", sizeof(buf));
    ASSERT(strcmp(buf, "Hello, World!") == 0, "safe_strncpy basic");

    /* safe_strncpy must always null-terminate */
    char small[5];
    safe_strncpy(small, "ABCDEFGH", sizeof(small));
    ASSERT(small[4] == '\0', "safe_strncpy always null-terminates");

    char ws[] = "  trim me  ";
    str_trim(ws);
    ASSERT(strcmp(ws, "trim me") == 0, "str_trim removes whitespace");

    char up[] = "hello";
    str_toupper(up);
    ASSERT(strcmp(up, "HELLO") == 0, "str_toupper works");

    /* ID generation smoke test */
    generate_emergency_id(buf, 42);
    ASSERT(strlen(buf) > 0 && strlen(buf) < MAX_ID_LEN,
           "generate_id produces non-empty string within MAX_ID_LEN");

    ASSERT(clamp_int(5,  0, 10) == 5,  "clamp_int in range");
    ASSERT(clamp_int(-3, 0, 10) == 0,  "clamp_int below range");
    ASSERT(clamp_int(15, 0, 10) == 10, "clamp_int above range");
}

/* --- main ------------------------------------------------------------- */

int main(void) {
    printf("=======================================\n");
    printf("  ARES Phase 1 -- Unit Test Runner\n");
    printf("=======================================\n");

    test_init();
    test_add();
    test_find();
    test_update();
    test_delete();
    test_utils();

    printf("\n=======================================\n");
    printf("  Results: %d passed, %d failed\n", g_pass, g_fail);
    printf("=======================================\n");

    return (g_fail == 0) ? EXIT_SUCCESS : EXIT_FAILURE;
}
