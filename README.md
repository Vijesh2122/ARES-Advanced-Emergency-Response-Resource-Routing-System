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

- **Interactive Tactical Visual Map (Web GUI)**: High-tech cyberpunk EOC dashboard featuring real-time spatial node graph, glowing Dijkstra laser paths, live animated response units, traffic particle flow, and Web Audio API telemetry chimes.
- **Terminal Topology Radar Map (ASCII / ANSI)**: 2D console city grid displaying active emergencies, severity rings, stationed fleet call signs, and Dijkstra route tracing.
- **Dynamic Dijkstra Routing & Road Obstructions**: Real-time road blocking / unblocking to simulate disasters or debris, with automatic dynamic shortest-path re-routing.
- **Smart Auto-Dispatch Engine**: Auto-selects the highest-priority incident from the binary Max-Heap, filters compatible response units, computes optimal Dijkstra paths, and dispatches units with live travel ETAs.
- **Crisis Simulation Engine & Real-Time Clock**: Step time by +5m or +15m, advance moving units along roads, resolve stabilized emergencies, update waiting times, and trigger multi-alarm random disaster scenarios.
- **Metro Crisis Scenario Generator**: Pre-loaded crisis scenario featuring 8 specialized response units and 6 multi-alarm emergency incidents across the city.
- **Versioned State Persistence & Live Telemetry Bridge**: Automatically syncs C backend state to `data/ares_state.bin`, `data/ares_live.json`, and `web/live_data.js`.

## Project layout

```text
include/                 Public module interfaces (graph, map, simulation, etc.)
src/emergency/           Emergency model, priority scoring, and registry
src/resource/            Resource fleet model, capability filtering, and registry
src/routing/graph.c      Weighted city graph, road blocking, and Dijkstra routing
src/simulation/          Crisis simulation engine, time stepping, and scenarios
src/structures/          Binary max-heap priority queue
src/storage/             Versioned binary snapshot persistence
src/ui/map.c             Visual ANSI terminal radar map & web telemetry bridge
src/ui/ui.c              Terminal menus, prompts, forms, and utilities
src/main.c               Top-level event loop and orchestration
web/                     Interactive Cyberpunk Tactical Map HUD (HTML5 Canvas/JS)
tests/                   Comprehensive unit tests (emergency, resource, algorithms)
data/                    Locally saved state and live JSON telemetry
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

1. Open **Tactical City Map → View Terminal City Radar Map** to inspect the 12-sector spatial topology and active alarms.
2. Select **Launch Interactive Visual Web HUD** to open the real-time cyberpunk visual map in your browser.
3. On the map, select two sectors (e.g., North Station and Industrial Zone) and click **ROUTE** to watch Dijkstra shortest path calculation with animated laser glow.
4. Click **AUTO-DISPATCH TOP CRISIS** to auto-triage the highest-priority Max-Heap incident, dispatch the nearest compatible unit, and watch the unit move across the city network.
5. In **Road Blockage Mode**, click on an active road to simulate a disaster blockage, and observe Dijkstra immediately compute an alternative detour route.
6. Use **Simulation Clock (+5m)** to advance time, witness units arrive at incidents, and see emergencies transition to RESOLVED.
7. Restart the program to demonstrate automated state persistence.

## Verification

The repository includes unit tests for emergency CRUD, resources, Dijkstra shortest-path routing, and max-heap ordering:

```sh
make tests
```

## Important note

ARES is an academic simulation. Its priority formula and dispatch decisions are illustrative and must not be used for real emergency operations.
