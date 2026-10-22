# ARES — Advanced Emergency Response & Resource Routing System

ARES is an academic emergency-response simulation that pairs a high-performance **C11 data-structures engine** with a cybernetic web operations center. Operators register simulated incidents and response units, inspect telemetry, calculate shortest routes with disaster road-block re-routing, and auto-dispatch units using prioritized Max-Heap triage and Dijkstra's algorithm.

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

The map works offline with its Chennai fallback data. PDF RAG requires the server.

### 1a. Enable PDF RAG (works without an API key)

RAG uses `pypdf`, SQLite (included with Python), and the built-in `ares-local-hash-v1` embedding backend by default. It has no model download, native dependency, or API-credit requirement, so it is a dependable option on Python 3.14/Windows. It performs local normalized word/character similarity plus keyword ranking; it is intentionally lightweight rather than a neural sentence-transformer model. No API key is ever sent to or stored in the browser.

```bat
python -m pip install -r requirements.txt
python server.py
```

Use the paperclip in **Document Assistant** to upload a PDF (100 MB default; configure `ARES_RAG_MAX_UPLOAD_MB` to a maximum of 250 MB). The server verifies the extension, MIME type and `%PDF-` signature, detects encrypted/scanned/empty PDFs, extracts text page by page, removes repeated page margins, makes sentence-aware overlapping chunks, and stores vectors plus page, heading, embedding model, dimension, and chunk metadata in `data/ares_rag.sqlite`. Documents are isolated by an HttpOnly browser-session cookie. Use the × beside a private source to remove its text and embeddings; original PDFs are never persisted.

To index the supplied authoritative PDF once for every local browser session, run:

```bat
python ingest_pdf.py "C:\Users\Vijesh\Downloads\ARESPDF1.pdf"
```

The index is persistent across restarts. Re-running the command with unchanged content is safe and reports `already_indexed`; a changed source becomes a separate managed index. The generated SQLite index is intentionally ignored by Git.

`ARESPDF1.pdf` is 805 pages and 79 MB. It contains predominantly digital text, so it can be indexed without OCR; any image-only pages are skipped unless optional OCR is enabled. After installing Tesseract and adding it to `PATH`, use OCR for those pages:

```bat
set ARES_RAG_OCR_ENABLED=true
set ARES_RAG_OCR_MAX_PAGES=900
python ingest_pdf.py "C:\Users\Vijesh\Downloads\ARESPDF1.pdf"
```

For each PDF query, ARES embeds a normalized (and, when needed, follow-up-expanded) query, uses hybrid similarity/keyword ranking, rejects chunks under `ARES_RAG_RELEVANCE_THRESHOLD`, and returns only retrieved evidence. The UI shows the cited filename and page(s); when evidence does not meet the threshold, it returns an explicit no-information message. By default, grounded answers are generated locally through Ollama using only a capped set of retrieved passages. No cloud API key is required. Set `ARES_LLM_ENABLED=false` to keep source-only answers, or explicitly set `ARES_LLM_PROVIDER=openai` and `OPENAI_API_KEY` to retain the optional OpenAI generator. Set `ARES_EMBEDDING_BACKEND=openai` only when intentionally rebuilding a separate OpenAI-embedded index. A model or vector-dimension mismatch is rejected with a rebuild instruction, not searched incorrectly.

### Local Ollama answers

Install Ollama, pull the configured model, then start ARES. ARES never downloads models automatically and sends PDF excerpts only to the local `127.0.0.1` Ollama daemon.

```powershell
ollama --version
ollama pull llama3.2:3b
ollama list
ollama serve
python server.py
```

The defaults are `ARES_LLM_PROVIDER=ollama`, `ARES_LLM_ENABLED=true`, `OLLAMA_BASE_URL=http://127.0.0.1:11434`, `OLLAMA_MODEL=llama3.2:3b`, and `OLLAMA_TIMEOUT_SECONDS=120`. Visit `http://localhost:8080/api/llm/health` to check reachability and whether the configured model is installed. If the model is unavailable, run `ollama pull <the configured OLLAMA_MODEL>`; if the daemon is unavailable, start it with `ollama serve`.

Run the Python RAG tests (they mock provider calls and do not need an API key):

```bat
python -m unittest tests.test_rag -v
```

Troubleshooting: install `requirements.txt` if upload reports missing PDF support. For a scanned PDF, install the free system [Tesseract OCR](https://github.com/tesseract-ocr/tesseract), ensure its executable is on `PATH`, then set `ARES_RAG_OCR_ENABLED=true`; `pdf2image` also needs Poppler on `PATH`. OCR is invoked only for pages with no extracted text and is capped by `ARES_RAG_OCR_MAX_PAGES`. Do not switch `ARES_EMBEDDING_BACKEND` for an existing index: delete/rebuild it with the intended backend. Set `OPENAI_API_KEY` only for optional answer generation or the optional OpenAI embedding backend.

Set optional model overrides with the server environment variables shown in `.env.example`. Do not commit a `.env` file.

## Chennai response zones

The 12 nodes are geographical response zones, not hospitals, stations, shelters, or operational emergency facilities. Latitude/longitude values are locality centroids verified against OpenStreetMap/GeoNames records. Canvas `x/y` values are only a projection for the existing custom renderer.

| ID | Zone | Latitude | Longitude |
|---:|---|---:|---:|
| 0 | Thiruvottiyur | 13.15823 | 80.30181 |
| 1 | Manali | 13.18106 | 80.26942 |
| 2 | Madhavaram | 13.14210 | 80.23240 |
| 3 | Tondiarpet | 13.12777 | 80.28959 |
| 4 | Royapuram | 13.11462 | 80.29403 |
| 5 | Perambur | 13.11212 | 80.24502 |
| 6 | Anna Nagar | 13.08825 | 80.20734 |
| 7 | T. Nagar | 13.04180 | 80.23410 |
| 8 | Kodambakkam | 13.04921 | 80.22428 |
| 9 | Guindy | 13.00871 | 80.22037 |
| 10 | Adyar | 13.00645 | 80.25778 |
| 11 | Sholinganallur | 12.89354 | 80.23206 |

The 16 links are estimated graph weights for illustrating Dijkstra's algorithm. They are not verified road distances, road-network routes, or travel times. Do not use ARES for live dispatch decisions.

For manually sourced official reference PDFs, use the Greater Chennai Corporation [City Disaster Management Perspective Plan](https://portal.chennaicorporation.gov.in/gcc/cdmp/), [Chennai Climate Action Plan](https://www.tngcc.tn.gov.in/wp-content/uploads/2025/10/Chennai_Climate_Action_Plan_ENG_5d827c7dec_compressed.pdf), or [Chennai District Disaster Management](https://chennai.nic.in/disaster-management/) pages. ARES does not automatically download or scrape them; download and review a PDF yourself, then upload it.

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
