/** @file graph.c @brief Adjacency-matrix graph with Dijkstra routing. */
#include "graph.h"
#include "utils.h"

#include <stdio.h>
#include <string.h>

static char g_labels[MAX_GRAPH_NODES][MAX_LABEL_LEN];
static bool g_present[MAX_GRAPH_NODES];
static int g_cost[MAX_GRAPH_NODES][MAX_GRAPH_NODES];
static int g_nodes;

void graph_init(void) {
    memset(g_labels, 0, sizeof(g_labels));
    memset(g_present, 0, sizeof(g_present));
    g_nodes = 0;
    for (int i = 0; i < MAX_GRAPH_NODES; ++i)
        for (int j = 0; j < MAX_GRAPH_NODES; ++j)
            g_cost[i][j] = (i == j) ? 0 : ARES_ROUTE_INFINITY;
}

bool graph_node_exists(NodeID id) {
    return id >= 0 && id < MAX_GRAPH_NODES && g_present[id];
}

AresStatus graph_add_node(NodeID id, const char *label) {
    if (!label) return ARES_ERR_NULL;
    if (id < 0 || id >= MAX_GRAPH_NODES) return ARES_ERR_INVALID;
    if (!g_present[id]) { g_present[id] = true; ++g_nodes; }
    safe_strncpy(g_labels[id], label, MAX_LABEL_LEN);
    return ARES_OK;
}

AresStatus graph_add_road(NodeID from, NodeID to, int minutes, bool bidirectional) {
    if (!graph_node_exists(from) || !graph_node_exists(to) || minutes <= 0) return ARES_ERR_INVALID;
    g_cost[from][to] = minutes;
    if (bidirectional) g_cost[to][from] = minutes;
    return ARES_OK;
}

const char *graph_node_label(NodeID id) { return graph_node_exists(id) ? g_labels[id] : "Unknown node"; }
int graph_node_count(void) { return g_nodes; }

AresStatus graph_shortest_path(NodeID start, NodeID destination, AresRoute *out_route) {
    if (!out_route) return ARES_ERR_NULL;
    if (!graph_node_exists(start) || !graph_node_exists(destination)) return ARES_ERR_NOT_FOUND;
    int dist[MAX_GRAPH_NODES], prev[MAX_GRAPH_NODES];
    bool used[MAX_GRAPH_NODES] = { false };
    for (int i = 0; i < MAX_GRAPH_NODES; ++i) { dist[i] = ARES_ROUTE_INFINITY; prev[i] = NODE_INVALID; }
    dist[start] = 0;
    for (int step = 0; step < g_nodes; ++step) {
        int u = NODE_INVALID;
        for (int i = 0; i < MAX_GRAPH_NODES; ++i)
            if (g_present[i] && !used[i] && (u == NODE_INVALID || dist[i] < dist[u])) u = i;
        if (u == NODE_INVALID || dist[u] == ARES_ROUTE_INFINITY) break;
        used[u] = true;
        if (u == destination) break;
        for (int v = 0; v < MAX_GRAPH_NODES; ++v) {
            if (!g_present[v] || used[v] || g_cost[u][v] == ARES_ROUTE_INFINITY) continue;
            if (dist[u] + g_cost[u][v] < dist[v]) { dist[v] = dist[u] + g_cost[u][v]; prev[v] = u; }
        }
    }
    if (dist[destination] == ARES_ROUTE_INFINITY) return ARES_ERR_UNREACHABLE;
    int reverse[MAX_ROUTE_NODES], count = 0;
    for (int node = destination; node != NODE_INVALID; node = prev[node]) {
        if (count == MAX_ROUTE_NODES) return ARES_ERR_FULL;
        reverse[count++] = node;
    }
    out_route->count = count; out_route->total_cost = dist[destination];
    for (int i = 0; i < count; ++i) out_route->nodes[i] = reverse[count - 1 - i];
    return ARES_OK;
}

void graph_print_route(const AresRoute *route) {
    if (!route || route->count == 0) return;
    printf("  Route (%d min): ", route->total_cost);
    for (int i = 0; i < route->count; ++i)
        printf("%s%s", graph_node_label(route->nodes[i]), i + 1 == route->count ? "\n" : " -> ");
}

void graph_print_network(void) {
    printf("  CITY NETWORK — %d operational nodes\n", g_nodes);
    for (int i = 0; i < MAX_GRAPH_NODES; ++i) if (g_present[i]) {
        printf("  [%02d] %-18s : ", i, g_labels[i]); bool first = true;
        for (int j = 0; j < MAX_GRAPH_NODES; ++j) if (g_present[j] && i != j && g_cost[i][j] != ARES_ROUTE_INFINITY) {
            printf("%s%s (%dm)", first ? "" : ", ", g_labels[j], g_cost[i][j]); first = false;
        }
        printf("\n");
    }
}

void graph_load_demo_city(void) {
    static const char *labels[] = { "Central HQ", "North Station", "City Hospital", "University", "Tech Park", "Airport", "River Bridge", "Old Town", "Industrial Zone", "East Shelter", "West Market", "South Station" };
    static const int roads[][3] = {{0,1,4},{0,2,3},{0,3,5},{1,4,6},{2,4,4},{2,6,5},{3,7,4},{4,5,7},{4,8,5},{5,9,6},{6,7,3},{6,10,4},{7,11,6},{8,9,3},{8,10,5},{10,11,4}};
    graph_init();
    for (int i = 0; i < (int)(sizeof(labels) / sizeof(labels[0])); ++i) graph_add_node(i, labels[i]);
    for (int i = 0; i < (int)(sizeof(roads) / sizeof(roads[0])); ++i) graph_add_road(roads[i][0], roads[i][1], roads[i][2], true);
}
