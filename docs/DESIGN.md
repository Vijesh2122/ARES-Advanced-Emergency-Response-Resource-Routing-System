# ARES Design Notes

## Architecture

`main.c` orchestrates the application. It does not own records or route data. Domain modules expose narrow public APIs through `include/`, so their internal implementation can be improved independently.

```text
UI -> main -> emergency/resource registries
           -> priority heap -> dashboard
           -> city graph -> Dijkstra route -> smart dispatch
           -> persistence -> binary snapshot
```

## Smart-dispatch decision

For a selected pending incident, ARES considers every resource that is:

1. available;
2. compatible with the incident type; and
3. connected to the incident node in the city graph.

It then chooses the resource with the smallest Dijkstra travel time. The chosen unit is assigned atomically at the application level and the incident becomes active.

## Complexity discussion

| Operation | Current complexity | Planned evolution |
|---|---:|---|
| Find incident/resource by ID | O(n) | Hash index: expected O(1) |
| Insert/delete registry record | O(n) due to duplicate search/compaction | Doubly-linked list + index |
| Dashboard priority ordering | O(n log n) to build heap | Persistent heap with O(log n) updates |
| Shortest route | O(V²) Dijkstra | Adjacency list + binary min-heap: O((V+E) log V) |

## Persistence format

`data/ares_state.bin` begins with a small magic/version header and record counts, followed by emergency and resource records. It is designed for local demonstration data and validates its counts before loading.
