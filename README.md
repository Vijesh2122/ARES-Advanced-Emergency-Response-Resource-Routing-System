# ARES — Advanced Emergency Response & Resource Routing System

> **B.Tech Data Structures in C Project** | Phase 1 of 6

---

## Overview

ARES is a terminal-based emergency management system built in **C11** to demonstrate real-world applications of core data structures. Each phase introduces a new data structure layered on top of the previous work.

| Phase | Data Structure | Feature Added |
|-------|----------------|---------------|
| **1** ✅ | Flat Array | Emergency record CRUD, main menu |
| 2 | Doubly-Linked List | Dynamic record storage, O(1) insert/delete |
| 3 | Stack + Queue | Undo/redo, FIFO dispatch queue |
| 4 | Min-Heap + Hash Map | Priority triage, O(1) ID lookup |
| 5 | Adjacency List Graph | BFS / DFS / Dijkstra route finding |
| 6 | All of the above | Resource allocation, file persistence, dashboard |

---

## Project Structure

```
ARES/
├── include/          # Public header files
│   ├── types.h       # Enums, constants, AresStatus
│   ├── emergency.h   # EmergencyRecord struct + API
│   ├── ui.h          # Terminal UI helpers
│   └── utils.h       # String, ID, timestamp utilities
├── src/              # Implementation files
│   ├── main.c        # Entry point, event loop, menu dispatch
│   ├── emergency.c   # Record DB (Phase 1: flat array)
│   ├── ui.c          # Menus, prompts, colour output
│   └── utils.c       # Utility implementations
├── tests/            # Unit tests
│   └── test_emergency.c
├── data/             # Saved data files (Phase 6+)
├── docs/             # Design documents and phase notes
├── build/            # Compiled binaries (git-ignored)
├── Makefile
└── README.md
```

---

## Prerequisites

- **GCC ≥ 12** with C11 support  
  Windows: install via MSYS2 — see [`COMPILER_SETUP.md`](COMPILER_SETUP.md)
- **GNU Make ≥ 4.0**

Verify:
```sh
gcc --version
make --version
```

---

## Build & Run

### Debug build (recommended during development)
```sh
make
./build/ares.exe
```

### Release build
```sh
make release
./build/ares.exe
```

### Run unit tests
```sh
make test
```

### Clean
```sh
make clean
```

---

## Phase 1 Features

| Option | Feature |
|--------|---------|
| `1` | Add a new emergency record (guided wizard) |
| `2` | View all records |
| `3` | Search by Incident ID |
| `4` | Update record status & description |
| `5` | Delete record (with confirmation) |
| `6` | Filter records by status |
| `7` | System statistics |
| `0` | Exit |

### Record Fields
- **ID** — auto-generated (`INCYYYYMMDDnnnn`)
- **Reporter name, Location, Description**
- **Type** — Fire / Medical / Flood / Accident / Earthquake / HazMat / Other
- **Severity** — Low / Medium / High / Critical
- **Status** — Pending / Active / Resolved / Cancelled
- **Timestamps** — Reported at, Last updated

---

## Data Structure Notes (Phase 1)

The backing store is a **static flat array** (`EmergencyRecord ares_db[1000]`).

| Operation | Complexity |
|-----------|-----------|
| Add | O(n) — duplicate check |
| Find by ID | O(n) — linear scan |
| Delete | O(n) — array compaction |
| List all | O(n) |

This is intentionally simple. Phase 2 replaces it with a **doubly-linked list** for O(1) insert/delete; Phase 4 adds a **hash map** for O(1) lookup. The public API (`emergency.h`) does not change between phases.

---

## Testing

```
make test
```

Expected output:
```
═══════════════════════════════════════
  ARES Phase 1 — Unit Test Runner
═══════════════════════════════════════
[Suite] DB init
  [PASS] DB count is 0 after init
...
  Results: 22 passed, 0 failed
═══════════════════════════════════════
```

---

## What Was and Was Not Tested (Phase 1)

**Tested (automated):**
- DB initialisation, add, find, update, delete
- Duplicate rejection, NULL-pointer safety
- Array compaction after delete
- `safe_strncpy`, `str_trim`, `str_toupper`, `clamp_int`, `generate_id`

**Not yet tested (Phase 2+):**
- Overflow at MAX_RECORDS boundary (would require 1000 inserts)
- File I/O persistence
- Graph traversal algorithms
- Concurrent access

---

## Author & Licence

B.Tech Computer Science — Data Structures in C  
ARES is an educational project. MIT Licence.
