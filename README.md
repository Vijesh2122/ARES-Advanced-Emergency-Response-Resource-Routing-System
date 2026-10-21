# ARES — Advanced Emergency Response & Resource Routing System

ARES is an enterprise-grade tactical command simulation that pairs a high-performance **C11 data-structures engine** with an **ultra-high-tech cybernetic web operations center (v3.5 PRO)**. Operators register incidents and response units, inspect real-time telemetry, calculate shortest routes with disaster road-block re-routing, and auto-dispatch units using prioritized Max-Heap triage and Dijkstra's algorithm.

---

## ⚡ What it Demonstrates

| Module / Capability | Data Structure & Algorithmic Concept | Web & Console Implementation |
|---|---|---|
| **Incident & Resource Registries** | Fixed-capacity arrays, linear search, full CRUD | Full-featured EOC tables with search, filter, edit, delete modals |
| **Real-Time Crisis Triage** | Binary Max-Heap ordered by dynamic multi-factor formula | Interactive Canvas Heap Tree topology + Array index visualizer ($2i+1, 2i+2$) |
| **Spatial Shortest-Path Routing** | Weighted graph ($|V|=12, |E|=16$) + Dijkstra algorithm | Animated glowing laser beams, relaxation table, adjacency matrix |
| **Disaster Roadway Obstructions** | Dynamic edge weight modification ($\infty$ blocked) | Real-time clickable road toggles with instant detour recalculation |
| **Smart Automated Fleet Dispatch** | Capability filtering + shortest reachable path heuristic | Multi-agent dispatch wizard, travel ETAs, animated vehicle motion |
| **Simulation Clock & Time Stepping** | Discrete-event simulation clock (+1m, +5m, +15m, +60m) | Multi-speed playback (1x, 2x, 5x), vehicle traversal, emergency stabilization |
| **State Persistence & Live Telemetry** | Versioned binary snapshots + Live JSON/JS telemetry bridge | `data/ares_state.bin`, `data/ares_live.json`, and `web/live_data.js` sync |
| **Tactical Voice & Auditory Feedback** | Web Audio API synthesizer + Web Speech API AI announcer | Radar sonar pings, laser route hum, alarm sirens, computerized AI voice |

---

## 🛰️ Tactical Operations Center (Web HUD v3.5 PRO)

The web dashboard is hosted locally at **`http://localhost:8080`** and features **7 dedicated tactical views**:

1. **🛰️ Tactical GIS Radar Map**: Interactive 2D spatial canvas with glowing sector nodes, animated Dijkstra laser paths, moving response units, traffic particle flow, coordinate HUD, and road blockage toggles.
2. **🌲 Binary Max-Heap Triage Tree**: Visual interactive binary tree diagram showing hierarchical node relationships, array index mapping `A[0..N-1]`, and mathematical breakdown of the 4-factor priority score formula:
   $$\text{Score} = 100 \times \left(0.40 \times \frac{\text{Severity}}{4} + 0.25 \times \frac{\min(\text{Affected}, 1000)}{1000} + 0.20 \times \text{Risk} + 0.15 \times \frac{\min(\text{WaitTime}, 3600)}{3600}\right)$$
3. **⚡ Dijkstra Routing Lab**: Shortest-path debugger with step-by-step relaxation table, unvisited sets, and city graph adjacency matrix.
4. **🚨 Emergency Operations Center (CRUD)**: Searchable, filterable master incident registry with modal inspection, status toggling, and priority recalculations.
5. **🛡️ Fleet Command Matrix (CRUD)**: Comprehensive response unit matrix with capacity tracking, status management, base station assignment, and manual dispatch.
6. **📊 Crisis Analytics Dashboard**: Real-time donut and bar charts for incident severity and classification distribution, sector casualty density rankings, and fleet utilization gauges.
7. **⏱️ Crisis Simulator & Disaster Lab**: Time controls, chronological event audit log, and 4 pre-packaged multi-alarm crisis scenarios (*Metro Crisis, 7.2 Richter Earthquake, Industrial Chemical Breach, River Flash Flood*).

---

## ⌨️ Command Hotkeys

| Key | Tactical Action |
|---|---|
| <kbd>1</kbd> – <kbd>7</kbd> | Switch views (Map, Max-Heap, Dijkstra, Incidents, Fleet, Analytics, Simulator) |
| <kbd>D</kbd> | Auto-Dispatch top crisis from Max-Heap queue |
| <kbd>R</kbd> | Calculate shortest Dijkstra route between selected sectors |
| <kbd>Space</kbd> | Start / Pause simulation clock |
| <kbd>S</kbd> | Step simulation clock +5 minutes |
| <kbd>B</kbd> | Toggle interactive road blockage mode |
| <kbd>M</kbd> | Mute / Unmute Web Audio synthesizer |
| <kbd>V</kbd> | Toggle Tactical AI Voice telemetry |
| <kbd>Esc</kbd> | Close active modal dialog or clear selection |

---

## 🚀 Quick Start Guide

### 1. Launch Web Operations Center (Recommended)

Run the Python REST server (listening on port 8080):

```bat
python server.py
```

Then open your browser to:
```text
http://localhost:8080
```

*(Or double-click `web\index.html` for 100% offline standalone usage).*

### 2. Build & Run C Native Terminal Engine

Compile with GCC (MinGW-w64 on Windows):

```bat
build_win.bat
build\ares.exe
```

Run comprehensive unit tests (80 test cases across Emergency, Resource, and Algorithm modules):

```bat
test_win.bat
```

---

## 📂 Repository Architecture

```text
ARES/
├── include/                 # Public C module headers
│   ├── common.h             # Common constants, color codes, return statuses
│   ├── emergency.h          # Incident registry declarations & scoring formula
│   ├── graph.h              # City graph, Dijkstra routing, road blockage APIs
│   ├── persistence.h        # Binary snapshot persistence interface
│   ├── priority_queue.h     # Binary Max-Heap priority queue interface
│   ├── resource.h           # Fleet registry & capability filtering
│   ├── simulation.h         # Time stepping & crisis scenario orchestration
│   └── types.h              # Core data models (Emergency, Resource, Route)
├── src/                     # C backend implementations
│   ├── emergency/           # Emergency model & CRUD operations
│   ├── resource/            # Fleet units model & compatibility matching
│   ├── routing/             # Weighted graph, Dijkstra solver, blockage states
│   ├── simulation/          # Discrete-event crisis simulation engine
│   ├── storage/             # Binary snapshot persistence
│   ├── structures/          # Binary max-heap priority queue
│   ├── ui/                  # ANSI radar map, console menus, JSON/JS exporter
│   └── main.c               # Top-level orchestration & terminal loop
├── web/                     # Tactical Operations Center Frontend (v3.5 PRO)
│   ├── index.html           # 7-view cybernetic HUD layout & modals
│   ├── style.css            # Tactical stylesheet, themes, animations, glassmorphism
│   ├── app.js               # Reactive frontend engine, Web Audio, Speech AI, Dijkstra
│   └── live_data.js         # Offline JS fallback data bridge
├── data/                    # Locally saved state & live telemetry
│   ├── ares_state.bin       # Native versioned binary snapshot
│   └── ares_live.json       # Real-time JSON telemetry exported by C backend
├── tests/                   # 80 unit tests (Emergency, Resource, Advanced Algorithms)
├── server.py                # Lightweight HTTP server with live REST API
├── build_win.bat            # Quick Windows compiler script
└── test_win.bat             # Automated unit test suite runner
```

---

## 🛡️ License & Notice

ARES is an academic and operational demonstration of fundamental data structures and algorithmic decision-making. Priority formulas and dispatch heuristics are illustrative.
