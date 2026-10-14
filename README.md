# ARES — Advanced Emergency Response & Resource Routing System

ARES is a terminal-based **C11 data-structures project** that simulates a city emergency command centre. Operators register incidents and response units, inspect a live dashboard, calculate shortest routes, and automatically dispatch the nearest compatible unit.

## What it demonstrates

| Feature | Data-structure / algorithm concept |
|---|---|
| Incident and resource registries | Fixed-capacity arrays, CRUD, linear search |
| Live incident triage | Binary max-heap ordered by computed priority |
| City route planner | Weighted graph + Dijkstra shortest-path algorithm |
| Smart auto-dispatch | Capability filtering + shortest reachable route |
| Saved command state | Versioned binary file I/O |
| Safe interaction | Input validation, state invariants, automated tests |

## Current capabilities

- Register, search, update, filter, and safely delete emergency incidents.
- Register ambulances, fire trucks, police, rescue, helicopter, HazMat, shelter, and warehouse resources.
- Calculate a transparent incident-priority score from severity, people affected, incident risk, and waiting time.
- View the 12-node demo city network and find a shortest route between any two active nodes.
- Auto-dispatch the closest **available and compatible** unit to a pending incident, with route and ETA.
- View a command dashboard with fleet readiness, incident counts, and the top five live incidents from the priority heap.
- Automatically restore and save local state to `data/ares_state.bin`.

## Project layout

```text
include/                 Public module interfaces
src/emergency/           Emergency model and registry
src/resource/            Resource model and registry
src/routing/graph.c      Weighted city graph and Dijkstra routing
src/structures/          Binary max-heap priority queue
src/storage/             Versioned binary snapshot persistence
src/ui/                  Terminal menus, forms, and utilities
tests/                   Emergency, resource, and algorithm tests
data/                    Locally saved state (generated at runtime)
```

## Build and run

### Windows (quickest)

Install a C11-capable MinGW-w64/MSYS2 GCC toolchain, then run:

```bat
build_win.bat
build\ares.exe
```

For setup help, see [COMPILER_SETUP.md](COMPILER_SETUP.md).

### CMake

```sh
cmake -S . -B build
cmake --build build
ctest --test-dir build --output-on-failure
```

### GNU Make

```sh
make
make tests
./build/ares.exe
```

## Demo flow for a project presentation

1. Open **Smart Dispatch & Route Planner → View City Network**.
2. Add a Fire, Medical, or HazMat emergency at a city node.
3. Add a compatible unit at another node.
4. Open **Live Command Dashboard** to show the priority heap ordering.
5. Select **Auto-Dispatch Nearest Compatible Unit** to show Dijkstra’s route and ETA.
6. Restart the program to demonstrate persistence.

## Verification

The repository includes unit tests for emergency CRUD, resources, Dijkstra shortest-path routing, and max-heap ordering:

```sh
make tests
```

## Important note

ARES is an academic simulation. Its priority formula and dispatch decisions are illustrative and must not be used for real emergency operations.
