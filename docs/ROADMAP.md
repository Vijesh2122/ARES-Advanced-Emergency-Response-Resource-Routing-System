# ARES Roadmap

## Implemented in v3.0

- Emergency and resource command workflows.
- Capability-aware manual dispatch and safe mission completion.
- Weighted 12-node demo city graph.
- Dijkstra shortest-path route planning and ETA calculation.
- Smart nearest-compatible-resource auto-dispatch.
- Binary max-heap dashboard for live incident triage.
- Versioned local binary persistence.
- Automated unit tests for registry, graph, and heap behaviour.

## Next high-value enhancements

### 1. Linked-list registry + hash index

Replace fixed arrays with doubly-linked nodes and keep an ID hash index. This makes the original data-structures focus explicit while preserving the public APIs.

### 2. Undo/redo and dispatch queue

Add a stack of immutable action snapshots for undo/redo, plus a circular queue for incidents awaiting manual operator review.

### 3. Dynamic city operations

Let an operator add nodes and roads, close roads, and update resource movement while preserving route recalculation.

### 4. Better routing performance

Move from the educational adjacency matrix implementation to an adjacency list and min-heap Dijkstra implementation. The target complexity is O((V+E) log V).

### 5. Presentation package

Add screenshots or a demo recording, sample data, a one-page report, and an architecture diagram to make the GitHub/review submission complete.
