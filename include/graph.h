/**
 * @file graph.h
 * @brief Weighted city graph and Dijkstra shortest-path routing.
 */
#ifndef ARES_GRAPH_H
#define ARES_GRAPH_H

#include "types.h"

#define ARES_ROUTE_INFINITY 1000000000

typedef struct {
    int nodes[MAX_ROUTE_NODES];
    int count;
    int total_cost;
} AresRoute;

void graph_init(void);
AresStatus graph_add_node(NodeID id, const char *label);
AresStatus graph_add_road(NodeID from, NodeID to, int travel_minutes,
                          bool bidirectional);
bool graph_node_exists(NodeID id);
const char *graph_node_label(NodeID id);
int graph_node_count(void);
AresStatus graph_shortest_path(NodeID start, NodeID destination,
                               AresRoute *out_route);
void graph_print_route(const AresRoute *route);
void graph_print_network(void);
void graph_load_demo_city(void);

#endif /* ARES_GRAPH_H */
