#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "graph.h"
#include "persistence.h"
#include "priority_queue.h"
#include "resource.h"
#include "utils.h"

static int passed, failed;
#define ASSERT(c, m) do { if (c) { printf("  [PASS] %s\n", m); ++passed; } else { printf("  [FAIL] %s (line %d)\n", m, __LINE__); ++failed; } } while (0)

static Emergency incident(const char *id, double score) {
    Emergency e;
    memset(&e, 0, sizeof(e));
    safe_strncpy(e.id, id, MAX_ID_LEN);
    e.priority_score = score;
    e.status = STATUS_PENDING;
    return e;
}

int main(void) {
    printf("===========================================\n  ARES Advanced Algorithm Tests\n===========================================\n");
    graph_load_demo_city();
    AresRoute route;
    ASSERT(graph_node_count() == 12, "Demo city creates 12 graph nodes");
    ASSERT(graph_shortest_path(0, 9, &route) == ARES_OK, "Dijkstra finds a route");
    ASSERT(route.nodes[0] == 0 && route.nodes[route.count - 1] == 9, "Route has correct endpoints");
    ASSERT(route.total_cost == 15, "Dijkstra selects 15-minute shortest route");
    ASSERT(graph_shortest_path(0, 99, &route) == ARES_ERR_NOT_FOUND, "Invalid node is rejected");

    EmergencyHeap heap;
    Emergency low = incident("LOW", 20.0), high = incident("HIGH", 91.0), mid = incident("MID", 55.0), out;
    emergency_heap_init(&heap);
    ASSERT(emergency_heap_push(&heap, &low) == ARES_OK, "Heap accepts first incident");
    emergency_heap_push(&heap, &high); emergency_heap_push(&heap, &mid);
    ASSERT(strcmp(emergency_heap_peek(&heap)->id, "HIGH") == 0, "Heap peek is highest priority");
    emergency_heap_pop(&heap, &out);
    ASSERT(strcmp(out.id, "HIGH") == 0, "Heap pop returns highest priority");

    emergency_db_init();
    resource_db_init();
    Emergency saved = incident("SAVE-1", 60.0);
    saved.type = TYPE_MEDICAL; saved.severity = SEV_HIGH; saved.node_id = 2;
    ASSERT(emergency_add(&saved) == ARES_OK, "Snapshot fixture is added");
    ASSERT(persistence_save("build/advanced_test_state.bin") == ARES_OK, "State snapshot saves");
    emergency_db_init();
    bool loaded = false;
    ASSERT(persistence_load("build/advanced_test_state.bin", &loaded) == ARES_OK && loaded,
           "State snapshot loads");
    ASSERT(emergency_db_count() == 1, "Loaded snapshot restores incident");
    remove("build/advanced_test_state.bin");
    printf("===========================================\n  Results: %d passed, %d failed\n===========================================\n", passed, failed);
    return failed ? EXIT_FAILURE : EXIT_SUCCESS;
}
