/**
 * ARES TACTICAL COMMAND CENTER // GIS SPATIAL OPS ENGINE
 * High-Tech Interactive Tactical Map & Real-Time Emergency Dispatch
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER (Web Audio API) -----------------------------------
  class TacticalAudio {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    init() {
      if (!this.ctx && typeof AudioContext !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    ping() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    }

    chime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [587.33, 880, 1174.66].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.1, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.2);
      });
    }

    alarm() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(660, now + 0.15);
      osc.frequency.linearRampToValueAtTime(440, now + 0.3);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }

    dispatch() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  }

  const audio = new TacticalAudio();

  // --- DEFAULT CRISIS STATE FIXTURE ---------------------------------------
  const DEFAULT_CITY_DATA = {
    timestamp: Date.now(),
    simMinutes: 0,
    nodes: [
      { id: 0,  label: "Central HQ",      x: 48, y: 48 },
      { id: 1,  label: "North Station",   x: 34, y: 18 },
      { id: 2,  label: "City Hospital",   x: 20, y: 42 },
      { id: 3,  label: "University",      x: 32, y: 75 },
      { id: 4,  label: "Tech Park",       x: 58, y: 22 },
      { id: 5,  label: "Airport",         x: 84, y: 16 },
      { id: 6,  label: "River Bridge",    x: 38, y: 58 },
      { id: 7,  label: "Old Town",        x: 18, y: 86 },
      { id: 8,  label: "Industrial Zone", x: 78, y: 52 },
      { id: 9,  label: "East Shelter",    x: 92, y: 42 },
      { id: 10, label: "West Market",     x: 62, y: 76 },
      { id: 11, label: "South Station",   x: 46, y: 94 }
    ],
    roads: [
      { from: 0, to: 1, minutes: 4, blocked: false },
      { from: 0, to: 2, minutes: 3, blocked: false },
      { from: 0, to: 3, minutes: 5, blocked: false },
      { from: 1, to: 4, minutes: 6, blocked: false },
      { from: 2, to: 4, minutes: 4, blocked: false },
      { from: 2, to: 6, minutes: 5, blocked: false },
      { from: 3, to: 7, minutes: 4, blocked: false },
      { from: 4, to: 5, minutes: 7, blocked: false },
      { from: 4, to: 8, minutes: 5, blocked: false },
      { from: 5, to: 9, minutes: 6, blocked: false },
      { from: 6, to: 7, minutes: 3, blocked: false },
      { from: 6, to: 10, minutes: 4, blocked: false },
      { from: 7, to: 11, minutes: 6, blocked: false },
      { from: 8, to: 9, minutes: 3, blocked: false },
      { from: 8, to: 10, minutes: 5, blocked: false },
      { from: 10, to: 11, minutes: 4, blocked: false }
    ],
    emergencies: [
      {
        id: "INC-F01",
        reporter: "Dr. Alan Vance",
        description: "Multi-story server lab electrical fire spreading rapidly",
        nodeId: 4,
        location: "Tech Park",
        type: 0,
        typeStr: "Fire",
        severity: 3,
        severityStr: "HIGH",
        affected: 85,
        priority: 82.5,
        status: 0,
        statusStr: "Pending",
        assignedResource: "",
        reportedAt: Math.floor(Date.now() / 1000) - 1200
      },
      {
        id: "INC-M02",
        reporter: "Officer Chen",
        description: "Multi-car pileup with severe trauma injuries on highway",
        nodeId: 6,
        location: "River Bridge",
        type: 1,
        typeStr: "Medical",
        severity: 4,
        severityStr: "CRITICAL",
        affected: 14,
        priority: 94.2,
        status: 0,
        statusStr: "Pending",
        assignedResource: "",
        reportedAt: Math.floor(Date.now() / 1000) - 900
      },
      {
        id: "INC-H03",
        reporter: "Site Mgr. Kovacs",
        description: "Corrosive chemical container breach, toxic vapor cloud",
        nodeId: 8,
        location: "Industrial Zone",
        type: 5,
        typeStr: "HazMat",
        severity: 3,
        severityStr: "HIGH",
        affected: 32,
        priority: 86.0,
        status: 0,
        statusStr: "Pending",
        assignedResource: "",
        reportedAt: Math.floor(Date.now() / 1000) - 600
      },
      {
        id: "INC-A04",
        reporter: "Patrol Unit 4",
        description: "Old building masonry façade collapse over pedestrian lane",
        nodeId: 7,
        location: "Old Town",
        type: 3,
        typeStr: "Accident",
        severity: 2,
        severityStr: "MEDIUM",
        affected: 18,
        priority: 61.4,
        status: 0,
        statusStr: "Pending",
        assignedResource: "",
        reportedAt: Math.floor(Date.now() / 1000) - 450
      },
      {
        id: "INC-M05",
        reporter: "HQ Dispatcher",
        description: "Sudden cardiac arrest at public concourse area",
        nodeId: 0,
        location: "Central HQ",
        type: 1,
        typeStr: "Medical",
        severity: 4,
        severityStr: "CRITICAL",
        affected: 2,
        priority: 88.0,
        status: 0,
        statusStr: "Pending",
        assignedResource: "",
        reportedAt: Math.floor(Date.now() / 1000) - 200
      },
      {
        id: "INC-L06",
        reporter: "Market Security",
        description: "Drainage backup resulting in knee-deep flash flooding",
        nodeId: 10,
        location: "West Market",
        type: 2,
        typeStr: "Flood",
        severity: 1,
        severityStr: "LOW",
        affected: 40,
        priority: 45.8,
        status: 0,
        statusStr: "Pending",
        assignedResource: "",
        reportedAt: Math.floor(Date.now() / 1000) - 100
      }
    ],
    resources: [
      { id: "AMB-01", name: "Metro ALS Ambulance 1", type: 0, typeStr: "Ambulance", status: 0, statusStr: "Available", baseNode: 2, currentNode: 2, capacity: 4, currentLoad: 0, assignedEmergency: "" },
      { id: "AMB-02", name: "Rapid Paramedic Unit 2", type: 0, typeStr: "Ambulance", status: 0, statusStr: "Available", baseNode: 0, currentNode: 0, capacity: 2, currentLoad: 0, assignedEmergency: "" },
      { id: "ENG-01", name: "Heavy Pumper Engine 1", type: 1, typeStr: "Fire Truck", status: 0, statusStr: "Available", baseNode: 1, currentNode: 1, capacity: 6, currentLoad: 0, assignedEmergency: "" },
      { id: "ENG-02", name: "Ladder Tower Truck 2", type: 1, typeStr: "Fire Truck", status: 0, statusStr: "Available", baseNode: 11, currentNode: 11, capacity: 4, currentLoad: 0, assignedEmergency: "" },
      { id: "POL-01", name: "Tactical Patrol Cruiser 1", type: 2, typeStr: "Police", status: 0, statusStr: "Available", baseNode: 0, currentNode: 0, capacity: 4, currentLoad: 0, assignedEmergency: "" },
      { id: "COP-01", name: "Air Medevac SkyRescue 1", type: 4, typeStr: "Helicopter", status: 0, statusStr: "Available", baseNode: 5, currentNode: 5, capacity: 4, currentLoad: 0, assignedEmergency: "" },
      { id: "HAZ-01", name: "HazMat Decon Mobile 1", type: 5, typeStr: "HazMat", status: 0, statusStr: "Available", baseNode: 8, currentNode: 8, capacity: 3, currentLoad: 0, assignedEmergency: "" },
      { id: "RES-01", name: "Heavy Urban Rescue Squad 1", type: 3, typeStr: "Rescue Team", status: 0, statusStr: "Available", baseNode: 3, currentNode: 3, capacity: 8, currentLoad: 0, assignedEmergency: "" }
    ]
  };

  // Type risk table
  const TYPE_RISK = [0.85, 0.90, 0.70, 0.75, 1.00, 0.95, 0.40];

  // Unit type icons
  const UNIT_ICONS = {
    0: '🚑', // Ambulance
    1: '🚒', // Fire Truck
    2: '🚓', // Police
    3: '🛠️', // Rescue
    4: '🚁', // Helicopter
    5: '☣️', // HazMat
    6: '🏠', // Shelter
    7: '📦', // Warehouse
    8: '🚐'  // Other
  };

  // --- APPLICATION STATE --------------------------------------------------
  let state = JSON.parse(JSON.stringify(DEFAULT_CITY_DATA));
  let simMinutes = 0;
  let isSimPlaying = false;
  let simSpeed = 1;
  let simInterval = null;

  // Active Dijkstra route
  let activeRoute = null; // { path: [0, 2, 6], totalCost: 8 }
  let activeDijkstraNodes = []; // for step animation
  let activeVehicleAnimations = []; // animated moving units [{ resourceId, route, progress, startTime, duration }]

  // Map canvas & interaction state
  let canvas, ctx;
  let viewPan = { x: 0, y: 0 };
  let viewZoom = 1.0;
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let hoveredNodeId = null;
  let hoveredRoad = null;
  let selectedNodeId = null;
  let selectedIncidentId = null;
  let blockRoadMode = false;
  let showRadarSweep = true;
  let showTrafficFlow = true;
  let radarAngle = 0;

  // --- INITIALIZATION -----------------------------------------------------
  function init() {
    canvas = document.getElementById('ares-map-canvas');
    ctx = canvas.getContext('2d');

    // Load data from live_data.js bridge if available
    if (window.ARES_LIVE_DATA && window.ARES_LIVE_DATA.nodes) {
      console.log('[ARES HUD] Loaded live data from window.ARES_LIVE_DATA');
      state = JSON.parse(JSON.stringify(window.ARES_LIVE_DATA));
      simMinutes = state.simMinutes || 0;
    }

    setupCanvas();
    setupEventListeners();
    populateSelectDropdowns();
    updateUI();
    recalculateAllPriorities();

    // Start render animation loop
    requestAnimationFrame(renderLoop);

    // Initial log message
    logEvent('ARES Tactical Operations Center online. 12 urban sectors monitored.');
  }

  // --- CANVAS RESIZE & COORDINATES ----------------------------------------
  function setupCanvas() {
    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resize);
    resize();
  }

  function getCanvasCenter() {
    const rect = canvas.parentElement.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }

  function nodeToScreen(node) {
    const { w, h } = getCanvasCenter();
    // Normalize coordinates: 0..100 -> screen space centered
    const padding = 80;
    const availW = w - padding * 2;
    const availH = h - padding * 2;
    const rawX = padding + (node.x / 100) * availW;
    const rawY = padding + (node.y / 100) * availH;

    const cx = w / 2;
    const cy = h / 2;
    return {
      x: cx + (rawX - cx) * viewZoom + viewPan.x,
      y: cy + (rawY - cy) * viewZoom + viewPan.y
    };
  }

  function screenToGrid(sx, sy) {
    const { w, h } = getCanvasCenter();
    const cx = w / 2;
    const cy = h / 2;
    const padding = 80;
    const availW = w - padding * 2;
    const availH = h - padding * 2;

    const unzoomedX = (sx - cx - viewPan.x) / viewZoom + cx;
    const unzoomedY = (sy - cy - viewPan.y) / viewZoom + cy;
    const gx = ((unzoomedX - padding) / availW) * 100;
    const gy = ((unzoomedY - padding) / availH) * 100;
    return { gx, gy };
  }

  // --- DIJKSTRA SHORTEST PATH ALGORITHM -----------------------------------
  function dijkstraShortestPath(startId, destId) {
    startId = parseInt(startId, 10);
    destId = parseInt(destId, 10);
    if (isNaN(startId) || isNaN(destId) || startId === destId) return null;

    const numNodes = state.nodes.length;
    const dist = {};
    const prev = {};
    const unvisited = new Set();

    state.nodes.forEach(n => {
      dist[n.id] = Infinity;
      prev[n.id] = null;
      unvisited.add(n.id);
    });

    dist[startId] = 0;

    while (unvisited.size > 0) {
      let u = null;
      for (const id of unvisited) {
        if (u === null || dist[id] < dist[u]) {
          u = id;
        }
      }

      if (u === null || dist[u] === Infinity) break;
      if (u === destId) break;

      unvisited.delete(u);

      // Find neighbors through non-blocked roads
      state.roads.forEach(road => {
        if (road.blocked) return;
        let v = null;
        if (road.from === u) v = road.to;
        else if (road.to === u) v = road.from;

        if (v !== null && unvisited.has(v)) {
          const alt = dist[u] + road.minutes;
          if (alt < dist[v]) {
            dist[v] = alt;
            prev[v] = u;
          }
        }
      });
    }

    if (dist[destId] === Infinity) return null;

    const path = [];
    let curr = destId;
    while (curr !== null) {
      path.unshift(curr);
      curr = prev[curr];
    }

    return {
      path: path,
      totalCost: dist[destId],
      hops: path.length
    };
  }

  // --- PRIORITY SCORE CALCULATION -----------------------------------------
  function calculatePriority(emg) {
    const sevNorm = emg.severity / 4.0;
    const affNorm = Math.min(Math.max(emg.affected, 0), 1000) / 1000.0;
    const riskNorm = TYPE_RISK[emg.type] !== undefined ? TYPE_RISK[emg.type] : 0.5;

    const now = Math.floor(Date.now() / 1000);
    const waitSeconds = Math.max(0, (now - (emg.reportedAt || now)) + (simMinutes * 60));
    const waitNorm = Math.min(waitSeconds, 3600) / 3600.0;

    let score = 100.0 * (0.40 * sevNorm + 0.25 * affNorm + 0.20 * riskNorm + 0.15 * waitNorm);
    return Math.min(Math.max(score, 0), 100);
  }

  function recalculateAllPriorities() {
    state.emergencies.forEach(e => {
      e.priority = calculatePriority(e);
    });
    // Sort pending emergencies by priority descending (Max-Heap order)
    state.emergencies.sort((a, b) => b.priority - a.priority);
  }

  // --- COMPATIBILITY FILTER -----------------------------------------------
  function isResourceCompatible(resource, emergencyType) {
    switch (resource.type) {
      case 0: // Ambulance
        return emergencyType === 1 || emergencyType === 3 || emergencyType === 6;
      case 1: // Fire Truck
        return emergencyType === 0 || emergencyType === 3 || emergencyType === 5;
      case 2: // Police
        return emergencyType === 3 || emergencyType === 2 || emergencyType === 6;
      case 3: // Rescue Team
        return emergencyType === 4 || emergencyType === 2 || emergencyType === 3 || emergencyType === 0;
      case 4: // Helicopter
        return true; // Aerial can assist in all
      case 5: // HazMat
        return emergencyType === 5 || emergencyType === 0;
      case 6: // Shelter
      case 7: // Warehouse
        return emergencyType === 2 || emergencyType === 4;
      default:
        return true;
    }
  }

  // --- SMART AUTO-DISPATCH ------------------------------------------------
  function autoDispatchTopEmergency() {
    recalculateAllPriorities();
    const pendingList = state.emergencies.filter(e => e.status === 0);
    if (pendingList.length === 0) {
      logEvent('Auto-Dispatch: No pending emergencies in the triage queue.');
      alert('Triage queue is clear! No pending emergencies require dispatch.');
      return;
    }

    const targetEmg = pendingList[0];
    let bestUnit = null;
    let bestRoute = null;

    // Search available compatible resources
    state.resources.forEach(res => {
      if (res.status !== 0) return; // Must be Available
      if (!isResourceCompatible(res, targetEmg.type)) return;

      const route = dijkstraShortestPath(res.currentNode, targetEmg.nodeId);
      if (!route) return;

      if (!bestRoute || route.totalCost < bestRoute.totalCost) {
        bestUnit = res;
        bestRoute = route;
      }
    });

    if (!bestUnit) {
      audio.alarm();
      logEvent(`Auto-Dispatch FAILED: No compatible available unit has a reachable route to ${targetEmg.id} (${targetEmg.location}).`);
      alert(`[DISPATCH ALERT] No available compatible unit has an unobstructed route to ${targetEmg.location}! Check for blocked road arteries.`);
      return;
    }

    // Execute Dispatch
    bestUnit.status = 1; // Dispatched
    bestUnit.assignedEmergency = targetEmg.id;
    targetEmg.status = 1; // Active
    targetEmg.assignedResource = bestUnit.id;

    audio.dispatch();
    logEvent(`SMART DISPATCH: ${bestUnit.id} (${bestUnit.name}) en route to ${targetEmg.id} at [${targetEmg.nodeId}] ${targetEmg.location}. ETA: ${bestRoute.totalCost} min.`);

    // Set active route on map
    activeRoute = bestRoute;
    showRouteInfoCard(bestRoute, targetEmg, bestUnit);

    // Launch animated vehicle travel
    startVehicleAnimation(bestUnit, bestRoute, targetEmg);

    updateUI();
  }

  // --- VEHICLE DISPATCH ANIMATION -----------------------------------------
  function startVehicleAnimation(unit, route, targetEmg) {
    const durationMs = Math.max(3000, route.totalCost * 600); // Scaled animation duration
    activeVehicleAnimations.push({
      unitId: unit.id,
      unitIcon: UNIT_ICONS[unit.type] || '🚐',
      route: route.path,
      totalCost: route.totalCost,
      startTime: Date.now(),
      duration: durationMs,
      targetEmgId: targetEmg.id,
      destNodeId: targetEmg.nodeId
    });
  }

  // --- SIMULATION TICK (+5 min / +15 min) ----------------------------------
  function stepSimulation(minutes) {
    simMinutes += minutes;
    let resolvedCount = 0;

    // Check dispatched units progress
    state.resources.forEach(res => {
      if (res.status === 1 && res.assignedEmergency) {
        const emg = state.emergencies.find(e => e.id === res.assignedEmergency);
        if (emg) {
          const route = dijkstraShortestPath(res.currentNode, emg.nodeId);
          if (!route || route.totalCost <= minutes) {
            // Arrival and resolution!
            res.currentNode = emg.nodeId;
            res.status = 0; // Return to available
            res.assignedEmergency = "";
            emg.status = 2; // Resolved
            resolvedCount++;
            audio.chime();
            logEvent(`MISSION RESOLVED: ${res.id} reached ${emg.location} & stabilized crisis ${emg.id}!`);
          } else {
            // Advanced along path
            if (route.path.length > 1) {
              res.currentNode = route.path[1];
            }
          }
        }
      }
    });

    recalculateAllPriorities();
    updateUI();
    if (resolvedCount > 0) {
      logEvent(`Simulation tick (+${minutes}m): ${resolvedCount} mission(s) successfully completed.`);
    }
  }

  // --- EVENT LOGGING TICKER -----------------------------------------------
  function logEvent(msg) {
    const ticker = document.getElementById('stream-ticker');
    const timeStr = new Date().toLocaleTimeString();
    ticker.textContent = `[${timeStr}] ${msg}`;
    console.log(`[ARES TICKER] ${msg}`);
  }

  // --- UI UPDATE & RENDERING ----------------------------------------------
  function updateUI() {
    // 1. KPI Bar
    const activeIncidents = state.emergencies.filter(e => e.status === 0 || e.status === 1).length;
    const pendingIncidents = state.emergencies.filter(e => e.status === 0).length;
    const availableFleet = state.resources.filter(r => r.status === 0).length;
    const deployedFleet = state.resources.filter(r => r.status === 1).length;

    document.getElementById('kpi-incidents-val').textContent = activeIncidents;
    document.getElementById('kpi-pending-val').textContent = `${pendingIncidents} pending triage`;
    document.getElementById('kpi-fleet-val').textContent = `${availableFleet} / ${state.resources.length}`;
    document.getElementById('kpi-deployed-val').textContent = `${deployedFleet} deployed`;
    document.getElementById('sim-clock-offset').textContent = `+${simMinutes}m elapsed`;
    document.getElementById('heap-count-badge').textContent = pendingIncidents;

    // Simulation clock formatting
    const d = new Date(Date.now() + simMinutes * 60000);
    document.getElementById('sim-clock-display').textContent = d.toTimeString().split(' ')[0];

    // 2. Incident List (Priority Queue Max-Heap)
    renderIncidentList();

    // 3. Fleet Matrix List
    renderFleetList();

    // 4. Update Inspector if something is selected
    if (selectedNodeId !== null) {
      inspectNode(selectedNodeId);
    }
  }

  function renderIncidentList() {
    const container = document.getElementById('incident-list-container');
    container.innerHTML = '';

    const pendingAndActive = state.emergencies.filter(e => e.status !== 2 && e.status !== 3);
    if (pendingAndActive.length === 0) {
      container.innerHTML = '<div class="inspector-placeholder">All emergencies stabilized. City sectors clear.</div>';
      return;
    }

    pendingAndActive.forEach((emg, idx) => {
      const card = document.createElement('div');
      card.className = `incident-card sev-${emg.severity} ${selectedIncidentId === emg.id ? 'selected' : ''}`;
      card.onclick = () => {
        audio.ping();
        selectIncident(emg.id);
      };

      const sevColor = emg.severity === 4 ? 'text-magenta' : emg.severity === 3 ? 'text-red' : emg.severity === 2 ? 'text-amber' : 'text-green';
      const statusBadge = emg.status === 1
        ? `<span class="badge badge-amber">DEPLOYED: ${emg.assignedResource}</span>`
        : `<span class="badge badge-red">PENDING</span>`;

      card.innerHTML = `
        <div class="inc-top-row">
          <span class="inc-rank">#${idx + 1} &bull; ${emg.id}</span>
          <span class="inc-score ${sevColor}">PRIORITY: ${emg.priority.toFixed(1)}</span>
        </div>
        <div class="inc-main-row">
          <span>${getEmergencyIcon(emg.type)} ${emg.typeStr}</span> &bull; <span>${emg.location} [${emg.nodeId}]</span>
        </div>
        <div class="inc-sub-row">
          <span>Severity: <strong class="${sevColor}">${emg.severityStr}</strong> &bull; ${emg.affected} affected</span>
          ${statusBadge}
        </div>
      `;
      container.appendChild(card);
    });
  }

  function getEmergencyIcon(type) {
    const icons = ['🔥', '🚑', '🌊', '🚗', '💥', '☣️', '⚠️'];
    return icons[type] || '🚨';
  }

  function renderFleetList() {
    const container = document.getElementById('fleet-list-container');
    container.innerHTML = '';

    const activeTab = document.querySelector('.fleet-filter-bar .filter-tab.active');
    const filter = activeTab ? activeTab.dataset.filter : 'all';

    let list = state.resources;
    if (filter === 'available') list = list.filter(r => r.status === 0);
    if (filter === 'dispatched') list = list.filter(r => r.status === 1);

    if (list.length === 0) {
      container.innerHTML = '<div class="inspector-placeholder">No units match filter criteria.</div>';
      return;
    }

    list.forEach(res => {
      const card = document.createElement('div');
      card.className = 'fleet-card';
      const statusClass = res.status === 0 ? 'status-available' : res.status === 1 ? 'status-dispatched' : 'status-returning';
      const statusText = res.status === 0 ? 'READY' : res.status === 1 ? `EN ROUTE (${res.assignedEmergency})` : 'RETURNING';

      card.innerHTML = `
        <div class="fleet-info">
          <span class="fleet-icon">${UNIT_ICONS[res.type] || '🚐'}</span>
          <div>
            <div class="fleet-id">${res.id} <span style="font-weight: normal; color: #798ba3;">[Sector ${res.currentNode}]</span></div>
            <div class="fleet-name">${res.name}</div>
          </div>
        </div>
        <span class="fleet-status-pill ${statusClass}">${statusText}</span>
      `;
      card.onclick = () => {
        audio.ping();
        selectNode(res.currentNode);
      };
      container.appendChild(card);
    });
  }

  // --- INSPECTOR LOGIC ----------------------------------------------------
  function selectIncident(id) {
    selectedIncidentId = id;
    const emg = state.emergencies.find(e => e.id === id);
    if (emg) {
      selectedNodeId = emg.nodeId;
      inspectNode(emg.nodeId);
      renderIncidentList();
    }
  }

  function selectNode(id) {
    selectedNodeId = id;
    inspectNode(id);
  }

  function inspectNode(nodeId) {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const inspector = document.getElementById('inspector-content');
    const stationFleet = state.resources.filter(r => r.currentNode === nodeId);
    const activeEmergencies = state.emergencies.filter(e => e.nodeId === nodeId && e.status !== 2 && e.status !== 3);
    const connectedRoads = state.roads.filter(r => r.from === nodeId || r.to === nodeId);

    let html = `
      <div class="insp-card">
        <div class="insp-title">
          <span>SECTOR [${node.id < 10 ? '0' + node.id : node.id}] ${node.label}</span>
          <span class="badge badge-cyan">ONLINE</span>
        </div>
        <div class="insp-row"><span>Spatial Coordinates:</span> <span class="insp-val">${node.x}.00E, ${node.y}.00N</span></div>
        <div class="insp-row"><span>Active Incidents:</span> <span class="insp-val ${activeEmergencies.length ? 'text-red' : 'text-green'}">${activeEmergencies.length} Active</span></div>
        <div class="insp-row"><span>Stationed Units:</span> <span class="insp-val text-cyan">${stationFleet.length} Units</span></div>
      </div>
    `;

    if (activeEmergencies.length > 0) {
      html += `<div class="insp-card" style="border-left: 3px solid var(--neon-red);">
        <div class="insp-title text-red">ACTIVE SECTOR EMERGENCIES</div>`;
      activeEmergencies.forEach(e => {
        html += `
          <div style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 4px;">
            <div style="font-weight: 700; color: #fff;">${e.id} &bull; ${getEmergencyIcon(e.type)} ${e.typeStr} (${e.severityStr})</div>
            <div style="color: #798ba3; font-size: 10px;">${e.description}</div>
            <div style="display: flex; justify-content: space-between; margin-top: 2px;">
              <span class="text-magenta">Score: ${e.priority.toFixed(1)}</span>
              <span>${e.affected} affected</span>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    if (stationFleet.length > 0) {
      html += `<div class="insp-card" style="border-left: 3px solid var(--neon-cyan);">
        <div class="insp-title text-cyan">STATIONED FLEET</div>`;
      stationFleet.forEach(r => {
        html += `
          <div class="insp-row">
            <span>${UNIT_ICONS[r.type] || '🚐'} ${r.id} (${r.typeStr})</span>
            <span class="insp-val ${r.status === 0 ? 'text-green' : 'text-red'}">${r.status === 0 ? 'READY' : 'DEPLOYED'}</span>
          </div>
        `;
      });
      html += `</div>`;
    }

    html += `<div class="insp-card">
      <div class="insp-title">CONNECTING ARTERIES</div>`;
    connectedRoads.forEach(road => {
      const neighborId = road.from === nodeId ? road.to : road.from;
      const neighbor = state.nodes.find(n => n.id === neighborId);
      html += `
        <div class="insp-row" style="cursor: pointer;" onclick="window.ARES_TOGGLE_ROAD(${road.from}, ${road.to})">
          <span>➔ [${neighbor.id}] ${neighbor.label} (${road.minutes}m)</span>
          <span class="insp-val ${road.blocked ? 'text-red' : 'text-green'}">${road.blocked ? 'BLOCKED 🚧' : 'OPEN'}</span>
        </div>
      `;
    });
    html += `</div>`;

    inspector.innerHTML = html;
  }

  // --- FLOATING ROUTE INFO CARD -------------------------------------------
  function showRouteInfoCard(route, emg, unit) {
    const card = document.getElementById('route-info-card');
    document.getElementById('route-cost-val').textContent = `${route.totalCost} min`;
    document.getElementById('route-hops-val').textContent = `${route.hops} nodes`;
    document.getElementById('route-eff-val').textContent = '100% (OPT)';

    const flowContainer = document.getElementById('route-nodes-flow');
    flowContainer.innerHTML = '';
    route.path.forEach((nodeId, idx) => {
      const node = state.nodes.find(n => n.id === nodeId);
      const chip = document.createElement('span');
      chip.className = 'node-chip';
      chip.textContent = `[${node.id}] ${node.label}`;
      flowContainer.appendChild(chip);

      if (idx < route.path.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'hop-arrow';
        arrow.textContent = '➔';
        flowContainer.appendChild(arrow);
      }
    });

    card.style.display = 'block';
  }

  // --- CANVAS RENDERING LOOP ----------------------------------------------
  function renderLoop() {
    drawMap();
    requestAnimationFrame(renderLoop);
  }

  function drawMap() {
    const { w, h } = getCanvasCenter();
    ctx.clearRect(0, 0, w, h);

    // 1. Cyber Grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40 * viewZoom;
    const startX = (viewPan.x % gridSize);
    const startY = (viewPan.y % gridSize);
    for (let x = startX; x < w; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = startY; y < h; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();

    // 2. Radar sweep cone
    if (showRadarSweep) {
      ctx.save();
      const cx = w / 2 + viewPan.x;
      const cy = h / 2 + viewPan.y;
      const radius = Math.max(w, h) * 0.9 * viewZoom;
      radarAngle += 0.012;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, radarAngle, radarAngle + 0.35);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Sweeping line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(radarAngle + 0.35) * radius, cy + Math.sin(radarAngle + 0.35) * radius);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // 3. Draw Roads (Edges)
    state.roads.forEach(road => {
      const u = state.nodes.find(n => n.id === road.from);
      const v = state.nodes.find(n => n.id === road.to);
      if (!u || !v) return;

      const p1 = nodeToScreen(u);
      const p2 = nodeToScreen(v);

      const isHovered = hoveredRoad && ((hoveredRoad.from === road.from && hoveredRoad.to === road.to) || (hoveredRoad.from === road.to && hoveredRoad.to === road.from));
      const isRouteSegment = activeRoute && isSegmentInRoute(road.from, road.to, activeRoute.path);

      ctx.save();
      if (road.blocked) {
        // Red dashed blocked road
        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 4 * viewZoom;
        ctx.setLineDash([8 * viewZoom, 6 * viewZoom]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (isRouteSegment) {
        // Blazing Dijkstra laser route!
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 6 * viewZoom;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Inner bright core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 * viewZoom;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      } else {
        // Standard normal road
        ctx.strokeStyle = isHovered ? '#00f0ff' : 'rgba(0, 240, 255, 0.25)';
        ctx.lineWidth = (isHovered ? 3.5 : 2) * viewZoom;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw road travel time badge at midpoint
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      ctx.fillStyle = 'rgba(6, 11, 20, 0.85)';
      ctx.strokeStyle = road.blocked ? '#ff3366' : isRouteSegment ? '#00f0ff' : 'rgba(0, 240, 255, 0.3)';
      ctx.lineWidth = 1;
      const badgeW = (road.blocked ? 48 : 28) * viewZoom;
      const badgeH = 14 * viewZoom;
      ctx.fillRect(midX - badgeW / 2, midY - badgeH / 2, badgeW, badgeH);
      ctx.strokeRect(midX - badgeW / 2, midY - badgeH / 2, badgeW, badgeH);

      ctx.fillStyle = road.blocked ? '#ff3366' : isRouteSegment ? '#00f0ff' : '#798ba3';
      ctx.font = `bold ${Math.max(8, 9 * viewZoom)}px JetBrains Mono`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(road.blocked ? 'BLOCKED' : `${road.minutes}m`, midX, midY);

      ctx.restore();
    });

    // 4. Traffic Flow Particles (energy pulses along clear roads)
    if (showTrafficFlow) {
      const now = Date.now();
      ctx.save();
      state.roads.forEach((road, idx) => {
        if (road.blocked) return;
        const u = state.nodes.find(n => n.id === road.from);
        const v = state.nodes.find(n => n.id === road.to);
        const p1 = nodeToScreen(u);
        const p2 = nodeToScreen(v);

        const speed = 0.0003 + (idx % 3) * 0.0001;
        const t = ((now * speed) + (idx * 0.2)) % 1.0;
        const px = p1.x + (p2.x - p1.x) * t;
        const py = p1.y + (p2.y - p1.y) * t;

        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(px, py, 2 * viewZoom, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // 5. Draw Animated Dispatched Vehicles
    const now = Date.now();
    for (let i = activeVehicleAnimations.length - 1; i >= 0; i--) {
      const anim = activeVehicleAnimations[i];
      const elapsed = now - anim.startTime;
      const progress = Math.min(1.0, elapsed / anim.duration);

      // Interpolate along route path
      const path = anim.route;
      const totalSegments = path.length - 1;
      const currentSegment = Math.min(totalSegments - 1, Math.floor(progress * totalSegments));
      const segmentProgress = (progress * totalSegments) - currentSegment;

      const fromNode = state.nodes.find(n => n.id === path[currentSegment]);
      const toNode = state.nodes.find(n => n.id === path[currentSegment + 1]);
      if (fromNode && toNode) {
        const p1 = nodeToScreen(fromNode);
        const p2 = nodeToScreen(toNode);
        const vx = p1.x + (p2.x - p1.x) * segmentProgress;
        const vy = p1.y + (p2.y - p1.y) * segmentProgress;

        // Vehicle icon & glowing marker
        ctx.save();
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(vx, vy, 16 * viewZoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `${Math.max(14, 16 * viewZoom)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(anim.unitIcon, vx, vy);
        ctx.restore();
      }

      if (progress >= 1.0) {
        activeVehicleAnimations.splice(i, 1);
      }
    }

    // 6. Draw City Nodes
    state.nodes.forEach(node => {
      const pos = nodeToScreen(node);
      const isHovered = hoveredNodeId === node.id;
      const isSelected = selectedNodeId === node.id;
      const activeEmg = state.emergencies.find(e => e.nodeId === node.id && (e.status === 0 || e.status === 1));
      const stationFleet = state.resources.filter(r => r.currentNode === node.id);

      ctx.save();

      // If active emergency, draw expanding alarm pulse rings
      if (activeEmg) {
        const ringTime = (Date.now() / 800) % 1.0;
        const ringRadius = (16 + ringTime * 28) * viewZoom;
        const ringAlpha = 1.0 - ringTime;

        ctx.strokeStyle = activeEmg.severity === 4 ? `rgba(244, 63, 94, ${ringAlpha})`
                        : activeEmg.severity === 3 ? `rgba(255, 51, 102, ${ringAlpha})`
                        : `rgba(255, 183, 3, ${ringAlpha})`;
        ctx.lineWidth = 2 * viewZoom;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Outer Selection Ring
      if (isSelected || isHovered) {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5 * viewZoom;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 22 * viewZoom, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Node Body Circle
      const baseRadius = 14 * viewZoom;
      ctx.fillStyle = activeEmg
        ? (activeEmg.severity === 4 ? '#f43f5e' : activeEmg.severity === 3 ? '#ff3366' : '#ffb703')
        : '#0a1424';
      ctx.strokeStyle = activeEmg ? '#ffffff' : '#00f0ff';
      ctx.lineWidth = 2 * viewZoom;
      ctx.shadowColor = activeEmg ? '#ff3366' : '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, baseRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Node ID Text inside
      ctx.fillStyle = activeEmg ? '#ffffff' : '#00f0ff';
      ctx.font = `bold ${Math.max(9, 10 * viewZoom)}px JetBrains Mono`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id < 10 ? '0' + node.id : node.id, pos.x, pos.y);

      // Node Label Banner below
      const labelY = pos.y + baseRadius + 10 * viewZoom;
      ctx.font = `600 ${Math.max(10, 11 * viewZoom)}px Chakra Petch`;
      const textMetrics = ctx.measureText(node.label);
      const textW = textMetrics.width;

      ctx.fillStyle = 'rgba(6, 11, 20, 0.85)';
      ctx.fillRect(pos.x - textW / 2 - 4, labelY - 7 * viewZoom, textW + 8, 14 * viewZoom);

      ctx.fillStyle = activeEmg ? '#ff3366' : '#ffffff';
      ctx.fillText(node.label, pos.x, labelY);

      // Stationed Fleet Icons on top of node
      if (stationFleet.length > 0) {
        const fleetIcons = stationFleet.map(r => UNIT_ICONS[r.type] || '🚐').slice(0, 3).join('');
        ctx.font = `${Math.max(10, 11 * viewZoom)}px sans-serif`;
        ctx.fillText(fleetIcons, pos.x, pos.y - baseRadius - 8 * viewZoom);
      }

      ctx.restore();
    });
  }

  function isSegmentInRoute(u, v, path) {
    if (!path || path.length < 2) return false;
    for (let i = 0; i < path.length - 1; i++) {
      if ((path[i] === u && path[i + 1] === v) || (path[i] === v && path[i + 1] === u)) {
        return true;
      }
    }
    return false;
  }

  // --- INTERACTION & EVENT LISTENERS --------------------------------------
  function setupEventListeners() {
    // 1. Mouse Drag & Pan on Canvas
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragStart = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (isDragging) {
        viewPan.x += (e.clientX - dragStart.x);
        viewPan.y += (e.clientY - dragStart.y);
        dragStart = { x: e.clientX, y: e.clientY };
      }

      // Hover detection on Nodes
      hoveredNodeId = null;
      state.nodes.forEach(node => {
        const pos = nodeToScreen(node);
        const dist = Math.hypot(pos.x - mouseX, pos.y - mouseY);
        if (dist <= 18 * viewZoom) {
          hoveredNodeId = node.id;
        }
      });

      // Hover detection on Roads
      hoveredRoad = null;
      if (hoveredNodeId === null) {
        state.roads.forEach(road => {
          const u = state.nodes.find(n => n.id === road.from);
          const v = state.nodes.find(n => n.id === road.to);
          const p1 = nodeToScreen(u);
          const p2 = nodeToScreen(v);
          const d = distToSegment({ x: mouseX, y: mouseY }, p1, p2);
          if (d < 12 * viewZoom) {
            hoveredRoad = road;
          }
        });
      }

      // Update Coordinate Readout
      const { gx, gy } = screenToGrid(mouseX, mouseY);
      document.getElementById('coord-readout').textContent =
        `GRID: ${gx.toFixed(1)}E, ${gy.toFixed(1)}N ${hoveredNodeId !== null ? `// SECTOR-${hoveredNodeId}` : ''}`;
    });

    // Zoom on wheel
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      viewZoom = Math.min(Math.max(viewZoom * zoomFactor, 0.6), 2.8);
    }, { passive: false });

    // Click on Canvas
    canvas.addEventListener('click', (e) => {
      audio.init();

      if (hoveredNodeId !== null) {
        audio.ping();
        selectNode(hoveredNodeId);

        // If route selectors are active, set start or dest
        const startSelect = document.getElementById('route-start-select');
        const destSelect = document.getElementById('route-dest-select');
        if (!startSelect.value) {
          startSelect.value = hoveredNodeId;
        } else if (!destSelect.value && startSelect.value !== String(hoveredNodeId)) {
          destSelect.value = hoveredNodeId;
          triggerDijkstraCalculation();
        }
      } else if (hoveredRoad !== null) {
        // Toggle road blocked status!
        audio.alarm();
        hoveredRoad.blocked = !hoveredRoad.blocked;
        logEvent(`ROAD UPDATE: Artery ${state.nodes[hoveredRoad.from].label} <---> ${state.nodes[hoveredRoad.to].label} is now ${hoveredRoad.blocked ? 'BLOCKED' : 'OPEN'}!`);

        // Re-compute active route if exists
        if (activeRoute) {
          triggerDijkstraCalculation();
        }
        updateUI();
      }
    });

    // 2. Toolbar & Button Handlers
    document.getElementById('btn-find-path').addEventListener('click', () => {
      audio.init();
      triggerDijkstraCalculation();
    });

    document.getElementById('btn-clear-path').addEventListener('click', () => {
      activeRoute = null;
      document.getElementById('route-start-select').value = '';
      document.getElementById('route-dest-select').value = '';
      document.getElementById('route-info-card').style.display = 'none';
    });

    document.getElementById('btn-close-route-info').addEventListener('click', () => {
      document.getElementById('route-info-card').style.display = 'none';
    });

    document.getElementById('btn-reset-view').addEventListener('click', () => {
      viewPan = { x: 0, y: 0 };
      viewZoom = 1.0;
    });

    document.getElementById('btn-toggle-flow').addEventListener('click', () => {
      showTrafficFlow = !showTrafficFlow;
    });

    document.getElementById('btn-toggle-radar').addEventListener('click', () => {
      showRadarSweep = !showRadarSweep;
    });

    document.getElementById('btn-toggle-block-mode').addEventListener('click', function () {
      blockRoadMode = !blockRoadMode;
      this.classList.toggle('active', blockRoadMode);
      document.getElementById('block-mode-status').textContent = blockRoadMode ? 'ON' : 'OFF';
    });

    // Auto Dispatch Top Button
    document.getElementById('btn-auto-dispatch-top').addEventListener('click', () => {
      audio.init();
      autoDispatchTopEmergency();
    });

    // Audio Mute Toggle
    document.getElementById('btn-audio-toggle').addEventListener('click', function () {
      audio.enabled = !audio.enabled;
      document.getElementById('audio-icon').textContent = audio.enabled ? '🔊' : '🔇';
      document.getElementById('audio-label').textContent = audio.enabled ? 'AUDIO: ON' : 'AUDIO: OFF';
    });

    // Sync with C Engine button
    document.getElementById('btn-sync-reload').addEventListener('click', () => {
      fetchLiveTelemetry();
    });

    // Fleet Filter Tabs
    document.querySelectorAll('.fleet-filter-bar .filter-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.fleet-filter-bar .filter-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        renderFleetList();
      });
    });

    // Simulation Controls
    document.getElementById('btn-sim-play').addEventListener('click', function () {
      audio.init();
      isSimPlaying = !isSimPlaying;
      if (isSimPlaying) {
        document.getElementById('sim-play-icon').textContent = '⏸';
        document.getElementById('sim-play-text').textContent = 'PAUSE';
        simInterval = setInterval(() => {
          stepSimulation(1);
        }, 1200 / simSpeed);
        logEvent('Simulation clock running.');
      } else {
        document.getElementById('sim-play-icon').textContent = '▶';
        document.getElementById('sim-play-text').textContent = 'START';
        clearInterval(simInterval);
        logEvent('Simulation clock paused.');
      }
    });

    document.getElementById('btn-sim-step5').addEventListener('click', () => {
      audio.init();
      stepSimulation(5);
    });

    document.getElementById('btn-sim-step15').addEventListener('click', () => {
      audio.init();
      stepSimulation(15);
    });

    document.querySelectorAll('.btn-speed').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.btn-speed').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        simSpeed = parseInt(this.dataset.speed, 10);
        document.getElementById('sim-speed-badge').textContent = `${simSpeed}x`;
        if (isSimPlaying) {
          clearInterval(simInterval);
          simInterval = setInterval(() => {
            stepSimulation(1);
          }, 1200 / simSpeed);
        }
      });
    });

    document.getElementById('btn-load-scenario').addEventListener('click', () => {
      state = JSON.parse(JSON.stringify(DEFAULT_CITY_DATA));
      simMinutes = 0;
      recalculateAllPriorities();
      updateUI();
      audio.chime();
      logEvent('Metro Crisis Scenario reloaded successfully.');
    });

    document.getElementById('btn-trigger-disaster').addEventListener('click', () => {
      triggerRandomDisaster();
    });

    // Modals
    setupModals();
  }

  // --- DIJKSTRA BUTTON TRIGGER --------------------------------------------
  function triggerDijkstraCalculation() {
    const startId = document.getElementById('route-start-select').value;
    const destId = document.getElementById('route-dest-select').value;
    if (!startId || !destId) {
      alert('Please select both a Start and Destination sector node.');
      return;
    }

    const route = dijkstraShortestPath(startId, destId);
    if (!route) {
      audio.alarm();
      activeRoute = null;
      document.getElementById('route-info-card').style.display = 'none';
      alert(`[UNREACHABLE] No route exists between [${startId}] and [${destId}] due to road obstructions.`);
      return;
    }

    audio.chime();
    activeRoute = route;
    showRouteInfoCard(route, null, null);
    logEvent(`Dijkstra Route calculated: [${startId}] ➔ [${destId}] &bull; Travel Time: ${route.totalCost} min (${route.hops} hops).`);
  }

  // Helper point-to-segment distance for road clicks
  function distToSegment(p, v, w) {
    const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  // Expose toggle road for inspector click
  window.ARES_TOGGLE_ROAD = function (u, v) {
    const road = state.roads.find(r => (r.from === u && r.to === v) || (r.from === v && r.to === u));
    if (road) {
      road.blocked = !road.blocked;
      audio.alarm();
      logEvent(`ROAD UPDATE: ${state.nodes[road.from].label} <---> ${state.nodes[road.to].label} is now ${road.blocked ? 'BLOCKED' : 'OPEN'}!`);
      if (activeRoute) triggerDijkstraCalculation();
      updateUI();
    }
  };

  // --- RANDOM DISASTER GENERATOR ------------------------------------------
  function triggerRandomDisaster() {
    audio.init();
    audio.alarm();

    const emergencyTypes = [
      { type: 0, str: "Fire", desc: "Chemical transformer burst, intense thermal radiation" },
      { type: 1, str: "Medical", desc: "Major tram derailment with critical passenger casualties" },
      { type: 2, str: "Flood", desc: "Canal levy failure flooding lower subway concourses" },
      { type: 3, str: "Accident", desc: "Overhead crane collapse over multilane traffic" },
      { type: 4, str: "Earthquake", desc: "Seismic tremor causing structural façade collapse" },
      { type: 5, str: "HazMat", desc: "Industrial valve rupture, hazardous vapor emission" }
    ];

    const randomNode = state.nodes[Math.floor(Math.random() * state.nodes.length)];
    const randomPick = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
    const randomSev = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
    const affected = Math.floor(Math.random() * 120) + 10;
    const newId = `INC-R${Math.floor(Math.random() * 899 + 100)}`;

    const newIncident = {
      id: newId,
      reporter: "Automated Sensor Net",
      description: randomPick.desc,
      nodeId: randomNode.id,
      location: randomNode.label,
      type: randomPick.type,
      typeStr: randomPick.str,
      severity: randomSev,
      severityStr: randomSev === 4 ? "CRITICAL" : randomSev === 3 ? "HIGH" : "MEDIUM",
      affected: affected,
      priority: 0,
      status: 0,
      statusStr: "Pending",
      assignedResource: "",
      reportedAt: Math.floor(Date.now() / 1000)
    };

    newIncident.priority = calculatePriority(newIncident);
    state.emergencies.unshift(newIncident);
    recalculateAllPriorities();
    updateUI();

    selectNode(randomNode.id);
    logEvent(`⚠️ CRISIS ALARM TRIGGERED: ${newIncident.id} (${newIncident.typeStr}) at [${randomNode.id}] ${randomNode.label}! Priority: ${newIncident.priority.toFixed(1)}/100.`);
  }

  // --- MODAL DIALOGS ------------------------------------------------------
  function setupModals() {
    const modalReport = document.getElementById('modal-report');
    const modalResource = document.getElementById('modal-resource');

    document.getElementById('btn-open-report-modal').addEventListener('click', () => {
      audio.init();
      modalReport.style.display = 'flex';
      updateScorePreview();
    });

    document.getElementById('btn-close-report-modal').addEventListener('click', () => modalReport.style.display = 'none');
    document.getElementById('btn-cancel-report').addEventListener('click', () => modalReport.style.display = 'none');

    document.getElementById('btn-open-resource-modal').addEventListener('click', () => {
      audio.init();
      modalResource.style.display = 'flex';
    });

    document.getElementById('btn-close-resource-modal').addEventListener('click', () => modalResource.style.display = 'none');
    document.getElementById('btn-cancel-resource').addEventListener('click', () => modalResource.style.display = 'none');

    // Dynamic Score Preview on inputs
    ['rep-type', 'rep-severity', 'rep-affected'].forEach(id => {
      document.getElementById(id).addEventListener('input', updateScorePreview);
    });

    function updateScorePreview() {
      const type = parseInt(document.getElementById('rep-type').value, 10);
      const sev = parseInt(document.getElementById('rep-severity').value, 10);
      const aff = parseInt(document.getElementById('rep-affected').value, 10) || 0;

      const dummy = { type, severity: sev, affected: aff, reportedAt: Math.floor(Date.now() / 1000) };
      const score = calculatePriority(dummy);
      document.getElementById('score-preview-val').textContent = `${score.toFixed(1)} / 100`;
    }

    // Submit Report Form
    document.getElementById('form-report-emergency').addEventListener('submit', (e) => {
      e.preventDefault();
      const nodeSelect = document.getElementById('rep-node');
      const nodeId = parseInt(nodeSelect.value, 10);
      const node = state.nodes.find(n => n.id === nodeId);
      const type = parseInt(document.getElementById('rep-type').value, 10);
      const sev = parseInt(document.getElementById('rep-severity').value, 10);
      const aff = parseInt(document.getElementById('rep-affected').value, 10) || 0;
      const desc = document.getElementById('rep-desc').value;
      const reporter = document.getElementById('rep-name').value;

      const newId = `INC-${Date.now().toString().slice(-4)}`;
      const typeStrs = ['Fire', 'Medical', 'Flood', 'Accident', 'Earthquake', 'HazMat', 'Other'];
      const sevStrs = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

      const newEmg = {
        id: newId,
        reporter: reporter,
        description: desc,
        nodeId: nodeId,
        location: node.label,
        type: type,
        typeStr: typeStrs[type],
        severity: sev,
        severityStr: sevStrs[sev],
        affected: aff,
        priority: 0,
        status: 0,
        statusStr: 'Pending',
        assignedResource: '',
        reportedAt: Math.floor(Date.now() / 1000)
      };

      newEmg.priority = calculatePriority(newEmg);
      state.emergencies.unshift(newEmg);
      recalculateAllPriorities();
      updateUI();
      modalReport.style.display = 'none';

      audio.alarm();
      logEvent(`NEW INCIDENT LOGGED: ${newEmg.id} (${newEmg.typeStr}) at [${nodeId}] ${node.label}. Priority: ${newEmg.priority.toFixed(1)}/100.`);
    });

    // Submit Resource Form
    document.getElementById('form-add-resource').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('res-id').value.toUpperCase();
      const name = document.getElementById('res-name').value;
      const type = parseInt(document.getElementById('res-type').value, 10);
      const nodeId = parseInt(document.getElementById('res-node').value, 10);
      const cap = parseInt(document.getElementById('res-capacity').value, 10);

      const typeStrs = ['Ambulance', 'Fire Truck', 'Police', 'Rescue Team', 'Helicopter', 'HazMat', 'Shelter', 'Warehouse', 'Other'];

      const newRes = {
        id: id,
        name: name,
        type: type,
        typeStr: typeStrs[type] || 'Other',
        status: 0,
        statusStr: 'Available',
        baseNode: nodeId,
        currentNode: nodeId,
        capacity: cap,
        currentLoad: 0,
        assignedEmergency: ''
      };

      state.resources.push(newRes);
      updateUI();
      modalResource.style.display = 'none';

      audio.chime();
      logEvent(`FLEET COMMISSIONED: Unit ${newRes.id} (${newRes.name}) stationed at Sector [${nodeId}].`);
    });
  }

  function populateSelectDropdowns() {
    const startSelect = document.getElementById('route-start-select');
    const destSelect = document.getElementById('route-dest-select');
    const repNodeSelect = document.getElementById('rep-node');
    const resNodeSelect = document.getElementById('res-node');

    state.nodes.forEach(node => {
      const opt1 = new Option(`[${node.id}] ${node.label}`, node.id);
      const opt2 = new Option(`[${node.id}] ${node.label}`, node.id);
      const opt3 = new Option(`[${node.id}] ${node.label}`, node.id);
      const opt4 = new Option(`[${node.id}] ${node.label}`, node.id);

      startSelect.add(opt1);
      destSelect.add(opt2);
      repNodeSelect.add(opt3);
      resNodeSelect.add(opt4);
    });
  }

  // --- C ENGINE TELEMETRY BRIDGE ------------------------------------------
  function fetchLiveTelemetry() {
    fetch('../data/ares_live.json?t=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.json();
      })
      .then(data => {
        if (data && data.nodes) {
          state = data;
          simMinutes = state.simMinutes || 0;
          recalculateAllPriorities();
          updateUI();
          audio.chime();
          document.getElementById('sync-status-indicator').textContent = 'SYNCED';
          document.getElementById('sync-timestamp').textContent = new Date().toLocaleTimeString();
          logEvent('Telemetry successfully synchronized from ARES C engine (ares_live.json).');
        }
      })
      .catch(err => {
        // Fallback: check if window.ARES_LIVE_DATA was updated
        if (window.ARES_LIVE_DATA && window.ARES_LIVE_DATA.nodes) {
          state = JSON.parse(JSON.stringify(window.ARES_LIVE_DATA));
          recalculateAllPriorities();
          updateUI();
          audio.chime();
          logEvent('Synchronized from local data bridge (live_data.js).');
        } else {
          logEvent('C Engine sync active in standalone simulated mode.');
          audio.ping();
        }
      });
  }

  // Run on startup
  window.addEventListener('DOMContentLoaded', init);

})();
