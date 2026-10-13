# ARES Phase Roadmap & Design Notes

## Phase 2 — Doubly-Linked List
- Replace `ares_db[]` array with `DLNode` linked list
- Add `list.h` / `list.c` — generic doubly-linked list
- O(1) head/tail insert, O(1) delete given pointer
- Keep `emergency.h` API unchanged

## Phase 3 — Stack + Queue
- `stack.h` / `stack.c` — action-history stack for undo/redo
- `queue.h` / `queue.c` — FIFO circular queue for dispatch order
- Operations: push/pop (stack), enqueue/dequeue (queue)

## Phase 4 — Min-Heap + Hash Map
- `heap.h` / `heap.c` — priority queue ordered by severity
- `hashmap.h` / `hashmap.c` — O(1) ID → record pointer lookup
- Triage: extract-min gives highest-severity pending incident first

## Phase 5 — Graph Algorithms
- `graph.h` / `graph.c` — adjacency list for location graph
- BFS: nearest available resource
- DFS: full connectivity check
- Dijkstra: shortest-path routing for resource dispatch

## Phase 6 — Persistence + Dashboard
- CSV / binary file save-load in `data/`
- Terminal dashboard: real-time stats, heat-map by severity
- Resource allocation engine

---

## Key Invariant (maintain through all phases)

> `include/emergency.h` is the *only* public contract.
> Internal storage may change; callers (main.c, ui.c) must not care.
