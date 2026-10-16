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

typedef struct {
    NodeID from;
    NodeID to;
    int cost;
    bool blocked;
} AresRoadInfo;

void graph_init(void);
AresStatus graph_add_node(NodeID id, const char *label);
AresStatus graph_set_node_coord(NodeID id, int x, int y);
AresStatus graph_get_node_coord(NodeID id, int *out_x, int *out_y);
AresStatus graph_add_road(NodeID from, NodeID to, int travel_minutes,
                          bool bidirectional);
AresStatus graph_set_road_blocked(NodeID from, NodeID to, bool blocked);
bool graph_is_road_blocked(NodeID from, NodeID to);
int graph_get_road_cost(NodeID from, NodeID to);
int graph_get_all_roads(AresRoadInfo *out_roads, int max_roads);
bool graph_node_exists(NodeID id);
const char *graph_node_label(NodeID id);
int graph_node_count(void);
AresStatus graph_shortest_path(NodeID start, NodeID destination,
                               AresRoute *out_route);
void graph_print_route(const AresRoute *route);
void graph_print_network(void);
void graph_load_demo_city(void);

#endif /* ARES_GRAPH_H */
