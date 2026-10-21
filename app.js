/**
 * ARES TACTICAL COMMAND CENTER // GIS SPATIAL OPS ENGINE
 * v3.5 PRO High-Tech Interactive Tactical Operations Center
 * Features: Dynamic Dijkstra Shortest Path, Binary Max-Heap Triage Tree,
 * Full CRUD Registries, Crisis Analytics, Web Audio & AI Speech Telemetry.
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
      try {
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
      } catch (e) {}
    }

    chime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [587.33, 880, 1174.66].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.09, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.22);
        });
      } catch (e) {}
    }

    alarm() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(720, now + 0.16);
        osc.frequency.linearRampToValueAtTime(440, now + 0.32);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
      } catch (e) {}
    }

    dispatch() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.28);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      } catch (e) {}
    }
  }

  const audio = new TacticalAudio();

  // --- AI TACTICAL VOICE TELEMETRY (Web Speech API) -----------------------
  class TacticalVoice {
    constructor() {
      this.enabled = true;
      this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
      this.queue = [];
    }

    speak(text) {
      if (!this.enabled || !this.synth) return;
      try {
        this.synth.cancel(); // Prioritize latest message
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.08;
        utterance.pitch = 0.95;
        // Try to pick an English voice
        const voices = this.synth.getVoices();
        const tacticalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Male')));
        if (tacticalVoice) utterance.voice = tacticalVoice;
        this.synth.speak(utterance);
      } catch (e) {
        console.warn('[VOICE] Speech synthesis notice:', e);
      }
    }
  }

  const voice = new TacticalVoice();

  // --- DEFAULT METRO CRISIS FIXTURE ---------------------------------------
  const DEFAULT_CITY_DATA = {
    timestamp: 1792155858,
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

  // Risk weighting constants
  const TYPE_RISK = [0.85, 0.90, 0.70, 0.75, 1.00, 0.95, 0.40];
  const TYPE_NAMES = ['Fire', 'Medical', 'Flood', 'Accident', 'Earthquake', 'HazMat', 'Other'];
  const SEVERITY_NAMES = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const UNIT_NAMES = ['Ambulance', 'Fire Truck', 'Police', 'Rescue Team', 'Helicopter', 'HazMat', 'Shelter', 'Warehouse', 'Other'];
  const UNIT_ICONS = {
    0: '🚑', 1: '🚒', 2: '🚓', 3: '🛠️', 4: '🚁', 5: '☣️', 6: '🏠', 7: '📦', 8: '🚐'
  };

  // --- APPLICATION STATE --------------------------------------------------
  let state = JSON.parse(JSON.stringify(DEFAULT_CITY_DATA));
  let simMinutes = 0;
  let isSimPlaying = false;
  let simSpeed = 1;
  let simInterval = null;
  let activeTab = 'view-map';

  // Active Dijkstra route
  let activeRoute = null;
  let activeVehicleAnimations = [];

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
  let showSectorLabels = true;
  let radarAngle = 0;

  // Filter states
  let incStatusFilter = 'all';
  let fleetStatusFilter = 'all';
  let incSearchQuery = '';
  let fleetSearchQuery = '';

  // Event audit log entries
  const eventLog = [];

  // --- INITIALIZATION -----------------------------------------------------
  function init() {
    canvas = document.getElementById('ares-map-canvas');
    ctx = canvas.getContext('2d');

    // Load initial data
    if (window.ARES_LIVE_DATA && window.ARES_LIVE_DATA.nodes) {
      state = JSON.parse(JSON.stringify(window.ARES_LIVE_DATA));
      simMinutes = state.simMinutes || 0;
    }

    setupCanvas();
    setupEventListeners();
    populateSelectDropdowns();
    recalculateAllPriorities();
    updateUI();

    // Start canvas animation loop
    requestAnimationFrame(renderLoop);

    // Initial audit log
    logEvent('ARES Tactical Operations Center online. 12 urban sectors monitored.', 'normal');
    voice.speak('ARES Tactical Emergency System online. All twelve sectors monitored.');

    // Fetch live state from server if running
    fetchLiveTelemetry();
  }

  // --- PERSISTENCE & REST API SYNC ----------------------------------------
  function persistState() {
    state.timestamp = Math.floor(Date.now() / 1000);
    state.simMinutes = simMinutes;

    // 1. LocalStorage
    try {
      localStorage.setItem('ARES_STATE', JSON.stringify(state));
    } catch (e) {}

    // 2. Server REST API (writes data/ares_live.json & web/live_data.js)
    if (window.location.protocol.startsWith('http')) {
      fetch('/api/save_state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      })
      .then(r => r.json())
      .then(() => {
        document.getElementById('sync-status-indicator').textContent = 'SYNCED';
        document.getElementById('sync-timestamp').textContent = new Date().toLocaleTimeString();
      })
      .catch(err => {
        document.getElementById('sync-status-indicator').textContent = 'LOCAL';
      });
    }
  }

  function fetchLiveTelemetry() {
    if (!window.location.protocol.startsWith('http')) return;
    fetch('/api/state?t=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.json();
      })
      .then(data => {
        if (data && data.nodes && data.emergencies) {
          state = data;
          simMinutes = state.simMinutes || 0;
          recalculateAllPriorities();
          updateUI();
          document.getElementById('sync-status-indicator').textContent = 'SYNCED';
          document.getElementById('sync-timestamp').textContent = new Date().toLocaleTimeString();
          logEvent('Telemetry successfully synchronized from data/ares_live.json.', 'normal');
        }
      })
      .catch(err => {
        console.log('[ARES] Standing by in offline simulated mode.');
      });
  }

  // --- CANVAS RESIZE & COORDINATES ----------------------------------------
  function setupCanvas() {
    function resize() {
      if (!canvas) return;
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
    const padding = 70;
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
    const padding = 70;
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

    const dist = {};
    const prev = {};
    const unvisited = new Set();
    const trace = []; // For algorithmic exploration lab

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

      const relaxedEdges = [];
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
            relaxedEdges.push({ from: u, to: v, newDist: alt, weight: road.minutes });
          }
        }
      });

      trace.push({
        currentNode: u,
        distTable: Object.assign({}, dist),
        relaxedEdges: relaxedEdges,
        unvisitedCount: unvisited.size
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
      hops: path.length,
      distTable: dist,
      prevTable: prev,
      trace: trace
    };
  }

  // --- PRIORITY SCORE CALCULATION -----------------------------------------
  function calculatePriority(emg) {
    const sevNorm = (emg.severity || 1) / 4.0;
    const affNorm = Math.min(Math.max(emg.affected || 0, 0), 1000) / 1000.0;
    const riskNorm = TYPE_RISK[emg.type] !== undefined ? TYPE_RISK[emg.type] : 0.5;

    const now = Math.floor(Date.now() / 1000);
    const waitSeconds = Math.max(0, (now - (emg.reportedAt || now)) + (simMinutes * 60));
    const waitNorm = Math.min(waitSeconds, 3600) / 3600.0;

    const score = 100.0 * (0.40 * sevNorm + 0.25 * affNorm + 0.20 * riskNorm + 0.15 * waitNorm);
    return Math.min(Math.max(score, 0), 100);
  }

  function recalculateAllPriorities() {
    state.emergencies.forEach(e => {
      e.priority = calculatePriority(e);
    });
    // Build binary max-heap order for pending incidents
    const pending = state.emergencies.filter(e => e.status === 0);
    pending.sort((a, b) => b.priority - a.priority);
  }

  // --- RESOURCE COMPATIBILITY FILTER --------------------------------------
  function isResourceCompatible(resource, emergencyType) {
    switch (resource.type) {
      case 0: return emergencyType === 1 || emergencyType === 3 || emergencyType === 6; // Ambulance
      case 1: return emergencyType === 0 || emergencyType === 3 || emergencyType === 5; // Fire Truck
      case 2: return emergencyType === 3 || emergencyType === 2 || emergencyType === 6; // Police
      case 3: return emergencyType === 4 || emergencyType === 2 || emergencyType === 3 || emergencyType === 0; // Rescue
      case 4: return true; // Helicopter
      case 5: return emergencyType === 5 || emergencyType === 0; // HazMat
      case 6: // Shelter
      case 7: return emergencyType === 2 || emergencyType === 4; // Warehouse
      default: return true;
    }
  }

  // --- SMART AUTO-DISPATCH ENGINE -----------------------------------------
  function autoDispatchTopEmergency() {
    recalculateAllPriorities();
    const pendingList = state.emergencies.filter(e => e.status === 0);
    if (pendingList.length === 0) {
      logEvent('Auto-Dispatch: No pending crises in the Max-Heap queue.', 'normal');
      voice.speak('Triage queue is clear. No pending emergencies require dispatch.');
      return;
    }

    const targetEmg = pendingList[0];
    let bestUnit = null;
    let bestRoute = null;

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
      logEvent(`DISPATCH ALERT: No available compatible unit has an unobstructed route to ${targetEmg.id} (${targetEmg.location})!`, 'alarm');
      voice.speak(`Dispatch failed. Unobstructed route unavailable to Sector ${targetEmg.nodeId}.`);
      alert(`[DISPATCH ALERT] No available compatible unit has an unobstructed route to ${targetEmg.location}! Check for blocked road arteries.`);
      return;
    }

    // Execute Dispatch
    bestUnit.status = 1; // Dispatched
    bestUnit.assignedEmergency = targetEmg.id;
    targetEmg.status = 1; // Active
    targetEmg.assignedResource = bestUnit.id;

    audio.dispatch();
    voice.speak(`Unit ${bestUnit.id} dispatched to ${targetEmg.location}. ETA ${bestRoute.totalCost} minutes.`);
    logEvent(`SMART DISPATCH: ${bestUnit.id} (${bestUnit.name}) en route to ${targetEmg.id} at [${targetEmg.nodeId}] ${targetEmg.location}. ETA: ${bestRoute.totalCost} min.`, 'dispatch');

    activeRoute = bestRoute;
    showRouteInfoCard(bestRoute, targetEmg, bestUnit);
    startVehicleAnimation(bestUnit, bestRoute, targetEmg);

    persistState();
    updateUI();
  }

  // --- VEHICLE ANIMATION CONTROLLER ---------------------------------------
  function startVehicleAnimation(unit, route, targetEmg) {
    const durationMs = Math.max(3000, route.totalCost * 700);
    activeVehicleAnimations.push({
      unitId: unit.id,
      unitIcon: UNIT_ICONS[unit.type] || '🚐',
      route: route.path,
      totalCost: route.totalCost,
      startTime: Date.now(),
      duration: durationMs,
      targetEmgId: targetEmg ? targetEmg.id : '',
      destNodeId: route.path[route.path.length - 1]
    });
  }

  // --- SIMULATION TICK (+1m, +5m, +15m, +60m) -----------------------------
  function stepSimulation(minutes) {
    simMinutes += minutes;
    let resolvedCount = 0;

    state.resources.forEach(res => {
      if (res.status === 1 && res.assignedEmergency) {
        const emg = state.emergencies.find(e => e.id === res.assignedEmergency);
        if (emg) {
          const route = dijkstraShortestPath(res.currentNode, emg.nodeId);
          if (!route || route.totalCost <= minutes) {
            // Arrived and stabilized!
            res.currentNode = emg.nodeId;
            res.status = 0; // Return to available
            res.assignedEmergency = "";
            emg.status = 2; // Resolved
            resolvedCount++;
            audio.chime();
            voice.speak(`Mission complete. Crisis at ${emg.location} has been stabilized by unit ${res.id}.`);
            logEvent(`MISSION RESOLVED: ${res.id} reached ${emg.location} & stabilized crisis ${emg.id}!`, 'resolve');
          } else {
            // Advanced along route
            if (route.path.length > 1) {
              res.currentNode = route.path[1];
            }
          }
        }
      }
    });

    recalculateAllPriorities();
    persistState();
    updateUI();
    if (resolvedCount > 0) {
      logEvent(`Simulation tick (+${minutes}m): ${resolvedCount} mission(s) successfully completed.`, 'resolve');
    }
  }

  // --- EVENT LOGGING TICKER -----------------------------------------------
  function logEvent(msg, type = 'normal') {
    const ticker = document.getElementById('stream-ticker');
    const timeStr = new Date().toLocaleTimeString();
    if (ticker) ticker.textContent = `[${timeStr}] ${msg}`;

    // Add to audit log
    eventLog.unshift({ time: timeStr, text: msg, type: type });
    if (eventLog.length > 80) eventLog.pop();

    renderAuditLog();
  }

  function renderAuditLog() {
    const container = document.getElementById('event-audit-log');
    if (!container) return;
    container.innerHTML = '';
    eventLog.forEach(item => {
      const el = document.createElement('div');
      el.className = `log-entry log-${item.type}`;
      el.innerHTML = `<span class="log-time">[${item.time}]</span> ${item.text}`;
      container.appendChild(el);
    });
  }

  // --- UI UPDATE & MULTI-VIEW RENDERING ------------------------------------
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

    const d = new Date(Date.now() + simMinutes * 60000);
    const clockStr = d.toTimeString().split(' ')[0];
    document.getElementById('sim-clock-display').textContent = clockStr;
    const labClock = document.getElementById('lab-clock-time');
    if (labClock) labClock.textContent = clockStr;
    const labElapsed = document.getElementById('lab-clock-elapsed');
    if (labElapsed) labElapsed.textContent = `+${simMinutes} minutes elapsed`;

    // 2. Incident List (Max-Heap order)
    renderIncidentList();

    // 3. Fleet Matrix Sidebar List
    renderFleetSidebarList();

    // 4. Update Inspector if a node is selected
    if (selectedNodeId !== null) {
      inspectNode(selectedNodeId);
    }

    // 5. Update Active View specific components
    if (activeTab === 'view-heap') {
      renderHeapVisualizer();
    } else if (activeTab === 'view-dijkstra') {
      renderDijkstraLab();
    } else if (activeTab === 'view-incidents') {
      renderEmergenciesTable();
    } else if (activeTab === 'view-fleet') {
      renderFleetMasterTable();
    } else if (activeTab === 'view-analytics') {
      renderAnalytics();
    }
  }

  // --- VIEW 1: MAP LIST RENDERING -----------------------------------------
  function renderIncidentList() {
    const container = document.getElementById('incident-list-container');
    if (!container) return;
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
        ? `<span class="badge badge-amber">ACTIVE: ${emg.assignedResource}</span>`
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
          <span>Sev: <strong class="${sevColor}">${emg.severityStr}</strong> &bull; ${emg.affected} affected</span>
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

  function renderFleetSidebarList() {
    const container = document.getElementById('fleet-list-container');
    if (!container) return;
    container.innerHTML = '';

    const activeFilterBtn = document.querySelector('.fleet-filter-bar .filter-tab.active');
    const filter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';

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
      const statusClass = res.status === 0 ? 'status-available' : res.status === 1 ? 'status-dispatched' : res.status === 2 ? 'status-unavailable' : 'status-returning';
      const statusText = res.status === 0 ? 'READY' : res.status === 1 ? `EN ROUTE (${res.assignedEmergency})` : res.status === 2 ? 'MAINTENANCE' : 'RETURNING';

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

  // --- INSPECTOR CONTROLLER -----------------------------------------------
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
    if (!inspector) return;

    const stationFleet = state.resources.filter(r => r.currentNode === nodeId);
    const activeEmergencies = state.emergencies.filter(e => e.nodeId === nodeId && e.status !== 2 && e.status !== 3);
    const connectedRoads = state.roads.filter(r => r.from === nodeId || r.to === nodeId);

    let html = `
      <div class="insp-card">
        <div class="insp-title">
          <span>SECTOR [${node.id < 10 ? '0' + node.id : node.id}] ${node.label}</span>
          <span class="badge badge-cyan">ONLINE</span>
        </div>
        <div class="insp-row"><span>Coordinates:</span> <span class="insp-val">${node.x}.00E, ${node.y}.00N</span></div>
        <div class="insp-row"><span>Active Incidents:</span> <span class="insp-val ${activeEmergencies.length ? 'text-red' : 'text-green'}">${activeEmergencies.length} Active</span></div>
        <div class="insp-row"><span>Stationed Units:</span> <span class="insp-val text-cyan">${stationFleet.length} Units</span></div>
      </div>
    `;

    if (activeEmergencies.length > 0) {
      html += `<div class="insp-card" style="border-left: 3px solid var(--neon-red);">
        <div class="insp-title text-red">ACTIVE SECTOR ALARMS</div>`;
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
            <span class="insp-val ${r.status === 0 ? 'text-green' : 'text-red'}">${r.status === 0 ? 'READY' : 'ACTIVE'}</span>
          </div>
        `;
      });
      html += `</div>`;
    }

    html += `<div class="insp-card">
      <div class="insp-title">CONNECTING ARTERIES (CLICK TO TOGGLE)</div>`;
    connectedRoads.forEach(road => {
      const neighborId = road.from === nodeId ? road.to : road.from;
      const neighbor = state.nodes.find(n => n.id === neighborId);
      html += `
        <div class="insp-row" style="cursor: pointer;" onclick="window.ARES_TOGGLE_ROAD(${road.from}, ${road.to})">
          <span>➔ [${neighbor.id}] ${neighbor.label} (${road.minutes}m)</span>
          <span class="insp-val ${road.blocked ? 'text-red' : 'text-green'}">${road.blocked ? 'BLOCKED 🚧' : 'CLEAR'}</span>
        </div>
      `;
    });
    html += `</div>`;

    inspector.innerHTML = html;
  }

  // --- FLOATING ROUTE INFO CARD -------------------------------------------
  function showRouteInfoCard(route, emg, unit) {
    const card = document.getElementById('route-info-card');
    if (!card) return;
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
    if (activeTab === 'view-map') {
      drawMap();
    }
    requestAnimationFrame(renderLoop);
  }

  function drawMap() {
    if (!canvas || !ctx) return;
    const { w, h } = getCanvasCenter();
    ctx.clearRect(0, 0, w, h);

    // 1. Cyber Grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
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
      const radius = Math.max(w, h) * 0.95 * viewZoom;
      radarAngle += 0.012;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.07)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, radarAngle, radarAngle + 0.35);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(radarAngle + 0.35) * radius, cy + Math.sin(radarAngle + 0.35) * radius);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.28)';
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
        // Blazing Dijkstra laser path!
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 6 * viewZoom;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 * viewZoom;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      } else {
        ctx.strokeStyle = isHovered ? '#00f0ff' : 'rgba(0, 240, 255, 0.25)';
        ctx.lineWidth = (isHovered ? 3.5 : 2) * viewZoom;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw road travel time badge
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      ctx.fillStyle = 'rgba(6, 11, 20, 0.88)';
      ctx.strokeStyle = road.blocked ? '#ff3366' : isRouteSegment ? '#00f0ff' : 'rgba(0, 240, 255, 0.3)';
      ctx.lineWidth = 1;
      const badgeW = (road.blocked ? 52 : 28) * viewZoom;
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

    // 4. Traffic Flow Particles
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

        ctx.save();
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'rgba(0, 240, 255, 0.28)';
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

    // 6. Draw City Sector Nodes
    state.nodes.forEach(node => {
      const pos = nodeToScreen(node);
      const isHovered = hoveredNodeId === node.id;
      const isSelected = selectedNodeId === node.id;
      const activeEmg = state.emergencies.find(e => e.nodeId === node.id && (e.status === 0 || e.status === 1));
      const stationFleet = state.resources.filter(r => r.currentNode === node.id);

      ctx.save();

      // Pulsing Alarm Ring
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

      // Selection Ring
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

      // Node ID Text
      ctx.fillStyle = activeEmg ? '#ffffff' : '#00f0ff';
      ctx.font = `bold ${Math.max(9, 10 * viewZoom)}px JetBrains Mono`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id < 10 ? '0' + node.id : node.id, pos.x, pos.y);

      // Node Label Banner
      if (showSectorLabels) {
        const labelY = pos.y + baseRadius + 10 * viewZoom;
        ctx.font = `600 ${Math.max(10, 11 * viewZoom)}px Chakra Petch`;
        const textMetrics = ctx.measureText(node.label);
        const textW = textMetrics.width;

        ctx.fillStyle = 'rgba(6, 11, 20, 0.88)';
        ctx.fillRect(pos.x - textW / 2 - 4, labelY - 7 * viewZoom, textW + 8, 14 * viewZoom);

        ctx.fillStyle = activeEmg ? '#ff3366' : '#ffffff';
        ctx.fillText(node.label, pos.x, labelY);
      }

      // Stationed Fleet Icons
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

  // --- VIEW 2: BINARY MAX-HEAP VISUALIZER ---------------------------------
  function renderHeapVisualizer() {
    recalculateAllPriorities();
    const pending = state.emergencies.filter(e => e.status === 0);
    document.getElementById('heap-tree-count-badge').textContent = `${pending.length} INCIDENTS`;

    // 1. Render Heap Array
    const arrayContainer = document.getElementById('heap-array-container');
    arrayContainer.innerHTML = '';
    pending.forEach((emg, idx) => {
      const card = document.createElement('div');
      card.className = 'heap-node-card';
      card.innerHTML = `
        <div class="heap-node-idx">INDEX [${idx}]</div>
        <div class="heap-node-id">${emg.id}</div>
        <div class="heap-node-score">${emg.priority.toFixed(1)}</div>
        <div style="font-size: 9px; color: #798ba3;">${emg.location}</div>
      `;
      arrayContainer.appendChild(card);
    });

    // 2. Render Ranked Table
    const tbody = document.querySelector('#heap-ranked-table tbody');
    tbody.innerHTML = '';
    pending.forEach((emg, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong class="text-cyan">A[${idx}]</strong></td>
        <td><strong>${emg.id}</strong></td>
        <td>${getEmergencyIcon(emg.type)} ${emg.typeStr}</td>
        <td>[${emg.nodeId}] ${emg.location}</td>
        <td><span class="badge badge-${emg.severity === 4 ? 'red' : emg.severity === 3 ? 'amber' : 'green'}">${emg.severityStr}</span></td>
        <td>${emg.affected}</td>
        <td><strong class="text-magenta">${emg.priority.toFixed(1)}</strong></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="window.ARES_DISPATCH_INCIDENT('${emg.id}')">DISPATCH</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // 3. Draw Tree on Canvas
    drawHeapTree(pending);
  }

  function drawHeapTree(heapArray) {
    const tCanvas = document.getElementById('heap-tree-canvas');
    if (!tCanvas) return;
    const tCtx = tCanvas.getContext('2d');
    const rect = tCanvas.parentElement.getBoundingClientRect();
    tCanvas.width = rect.width * 2;
    tCanvas.height = rect.height * 2;
    tCtx.scale(2, 2);

    tCtx.clearRect(0, 0, rect.width, rect.height);

    if (heapArray.length === 0) {
      tCtx.fillStyle = '#798ba3';
      tCtx.font = '13px JetBrains Mono';
      tCtx.textAlign = 'center';
      tCtx.fillText('Heap is empty. No pending emergencies.', rect.width / 2, rect.height / 2);
      return;
    }

    const n = Math.min(heapArray.length, 15); // Show top 15 nodes (4 levels)
    const positions = [];

    // Calculate node (x, y) coordinates
    for (let i = 0; i < n; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const levelNodes = Math.pow(2, level);
      const indexInLevel = i - (levelNodes - 1);
      const spacingX = rect.width / (levelNodes + 1);
      const x = spacingX * (indexInLevel + 1);
      const y = 45 + level * 75;
      positions.push({ x, y });
    }

    // Draw branch connecting lines
    for (let i = 0; i < n; i++) {
      const leftChild = 2 * i + 1;
      const rightChild = 2 * i + 2;

      tCtx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      tCtx.lineWidth = 1.5;

      if (leftChild < n) {
        tCtx.beginPath();
        tCtx.moveTo(positions[i].x, positions[i].y);
        tCtx.lineTo(positions[leftChild].x, positions[leftChild].y);
        tCtx.stroke();
      }
      if (rightChild < n) {
        tCtx.beginPath();
        tCtx.moveTo(positions[i].x, positions[i].y);
        tCtx.lineTo(positions[rightChild].x, positions[rightChild].y);
        tCtx.stroke();
      }
    }

    // Draw tree nodes
    for (let i = 0; i < n; i++) {
      const p = positions[i];
      const emg = heapArray[i];

      tCtx.save();
      // Outer Glow Circle
      tCtx.fillStyle = i === 0 ? 'rgba(255, 51, 102, 0.25)' : 'rgba(0, 240, 255, 0.15)';
      tCtx.strokeStyle = i === 0 ? '#ff3366' : '#00f0ff';
      tCtx.lineWidth = 2;
      tCtx.beginPath();
      tCtx.arc(p.x, p.y, 22, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.stroke();

      // Priority Score
      tCtx.fillStyle = '#fff';
      tCtx.font = 'bold 11px JetBrains Mono';
      tCtx.textAlign = 'center';
      tCtx.textBaseline = 'middle';
      tCtx.fillText(emg.priority.toFixed(1), p.x, p.y - 2);

      // Label below node
      tCtx.fillStyle = '#00f0ff';
      tCtx.font = '9px JetBrains Mono';
      tCtx.fillText(`[${i}] ${emg.id}`, p.x, p.y + 14);

      tCtx.restore();
    }
  }

  // --- VIEW 3: DIJKSTRA ROUTING LAB ---------------------------------------
  function renderDijkstraLab() {
    // 1. Roads Table
    const tbody = document.querySelector('#roads-table tbody');
    tbody.innerHTML = '';
    let blockedCount = 0;

    state.roads.forEach(road => {
      if (road.blocked) blockedCount++;
      const u = state.nodes.find(n => n.id === road.from);
      const v = state.nodes.find(n => n.id === road.to);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>[${u.id}] ${u.label}</strong> ➔ <strong>[${v.id}] ${v.label}</strong></td>
        <td>${road.minutes} min</td>
        <td><span class="badge badge-${road.blocked ? 'red' : 'green'}">${road.blocked ? 'BLOCKED 🚧' : 'CLEAR'}</span></td>
        <td>
          <button class="btn btn-sm btn-${road.blocked ? 'primary' : 'danger'}" onclick="window.ARES_TOGGLE_ROAD(${road.from}, ${road.to})">
            ${road.blocked ? 'UNBLOCK' : 'BLOCK ROAD'}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('blocked-roads-count-badge').textContent = `${blockedCount} ROADS BLOCKED`;
  }

  function computeDijkstraLabPath() {
    const startId = document.getElementById('dijkstra-lab-start').value;
    const destId = document.getElementById('dijkstra-lab-dest').value;

    if (!startId || !destId) {
      alert('Please select both Start and Destination sectors.');
      return;
    }

    const route = dijkstraShortestPath(startId, destId);
    const banner = document.getElementById('dijkstra-summary-banner');
    const tableBody = document.querySelector('#dijkstra-relaxation-table tbody');
    tableBody.innerHTML = '';

    if (!route) {
      audio.alarm();
      banner.innerHTML = `<span class="text-red">[UNREACHABLE] Destination Sector [${destId}] is currently cut off due to road obstructions.</span>`;
      document.getElementById('dijkstra-status-badge').textContent = 'DESTINATION UNREACHABLE';
      document.getElementById('dijkstra-status-badge').className = 'badge badge-red';
      return;
    }

    audio.chime();
    document.getElementById('dijkstra-status-badge').textContent = 'OPTIMAL SHORTEST PATH FOUND';
    document.getElementById('dijkstra-status-badge').className = 'badge badge-green';

    const pathLabels = route.path.map(id => `[${id}] ${state.nodes[id].label}`).join(' ➔ ');
    banner.innerHTML = `
      <div style="font-weight: 700; color: #00f0ff; margin-bottom: 4px;">Optimal Path: ${pathLabels}</div>
      <div>Total Travel Time: <strong class="text-cyan">${route.totalCost} minutes</strong> &bull; Hops: <strong>${route.hops} nodes</strong> &bull; Efficiency: <strong>100%</strong></div>
    `;

    // Populate Relaxation Table
    state.nodes.forEach(n => {
      const distVal = route.distTable[n.id] === Infinity ? '∞' : `${route.distTable[n.id]} min`;
      const prevVal = route.prevTable[n.id] !== null ? `Sector [${route.prevTable[n.id]}]` : (n.id === parseInt(startId, 10) ? 'START' : 'NONE');
      const inPath = route.path.includes(n.id);

      const tr = document.createElement('tr');
      if (inPath) tr.style.background = 'rgba(0, 240, 255, 0.1)';
      tr.innerHTML = `
        <td><strong>${n.id}</strong></td>
        <td>${n.label} ${inPath ? '⭐' : ''}</td>
        <td><strong class="${route.distTable[n.id] === Infinity ? 'text-red' : 'text-cyan'}">${distVal}</strong></td>
        <td>${prevVal}</td>
        <td><span class="badge badge-${inPath ? 'cyan' : 'green'}">${inPath ? 'IN OPTIMAL PATH' : 'RELAXED'}</span></td>
      `;
      tableBody.appendChild(tr);
    });

    logEvent(`Dijkstra shortest path computed: [${startId}] ➔ [${destId}]. Cost: ${route.totalCost} min.`, 'normal');
  }

  // --- VIEW 4: INCIDENT REGISTRY TABLE (FULL CRUD) ------------------------
  function renderEmergenciesTable() {
    const tbody = document.querySelector('#emergencies-master-table tbody');
    tbody.innerHTML = '';

    let list = state.emergencies;

    // Filter by status
    if (incStatusFilter !== 'all') {
      const s = parseInt(incStatusFilter, 10);
      list = list.filter(e => e.status === s);
    }

    // Filter by search query
    if (incSearchQuery.trim()) {
      const q = incSearchQuery.toLowerCase();
      list = list.filter(e => e.id.toLowerCase().includes(q) || e.reporter.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.location.toLowerCase().includes(q));
    }

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #798ba3; padding: 24px;">No emergencies match current filter.</td></tr>';
      return;
    }

    list.forEach(e => {
      const tr = document.createElement('tr');
      const sevColor = e.severity === 4 ? 'text-magenta' : e.severity === 3 ? 'text-red' : e.severity === 2 ? 'text-amber' : 'text-green';
      const statusBadge = e.status === 0 ? '<span class="badge badge-red">PENDING</span>'
                        : e.status === 1 ? `<span class="badge badge-amber">ACTIVE: ${e.assignedResource}</span>`
                        : e.status === 2 ? '<span class="badge badge-green">RESOLVED</span>'
                        : '<span class="badge" style="background:#555; color:#aaa;">CANCELLED</span>';

      tr.innerHTML = `
        <td><strong>${e.id}</strong></td>
        <td>${getEmergencyIcon(e.type)} ${e.typeStr}</td>
        <td>[${e.nodeId}] ${e.location}</td>
        <td><span class="${sevColor}">${e.severityStr}</span></td>
        <td>${e.affected}</td>
        <td><strong class="text-magenta">${e.priority.toFixed(1)}</strong></td>
        <td>${statusBadge}</td>
        <td>${e.assignedResource || '—'}</td>
        <td style="font-size: 10px; color: #798ba3;">${new Date((e.reportedAt || Date.now() / 1000) * 1000).toLocaleTimeString()}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="window.ARES_OPEN_EDIT_EMG('${e.id}')">EDIT</button>
          ${e.status === 0 ? `<button class="btn btn-sm btn-primary" onclick="window.ARES_DISPATCH_INCIDENT('${e.id}')">DISPATCH</button>` : ''}
          ${e.status === 1 ? `<button class="btn btn-sm btn-outline" onclick="window.ARES_RESOLVE_EMG('${e.id}')">RESOLVE</button>` : ''}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- VIEW 5: FLEET MATRIX TABLE (FULL CRUD) -----------------------------
  function renderFleetMasterTable() {
    const tbody = document.querySelector('#fleet-master-table tbody');
    tbody.innerHTML = '';

    let list = state.resources;

    // Filter by status
    if (fleetStatusFilter !== 'all') {
      const s = parseInt(fleetStatusFilter, 10);
      list = list.filter(r => r.status === s);
    }

    // Filter by search query
    if (fleetSearchQuery.trim()) {
      const q = fleetSearchQuery.toLowerCase();
      list = list.filter(r => r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.typeStr.toLowerCase().includes(q));
    }

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #798ba3; padding: 24px;">No units match current filter.</td></tr>';
      return;
    }

    list.forEach(r => {
      const tr = document.createElement('tr');
      const statusBadge = r.status === 0 ? '<span class="badge badge-green">AVAILABLE</span>'
                        : r.status === 1 ? `<span class="badge badge-amber">DISPATCHED</span>`
                        : r.status === 2 ? '<span class="badge badge-red">MAINTENANCE</span>'
                        : '<span class="badge badge-cyan">RETURNING</span>';

      const baseLabel = state.nodes[r.baseNode] ? state.nodes[r.baseNode].label : `Sector ${r.baseNode}`;
      const curLabel = state.nodes[r.currentNode] ? state.nodes[r.currentNode].label : `Sector ${r.currentNode}`;

      tr.innerHTML = `
        <td><strong class="text-cyan">${UNIT_ICONS[r.type] || '🚐'} ${r.id}</strong></td>
        <td>${r.name}</td>
        <td>${r.typeStr}</td>
        <td>[${r.baseNode}] ${baseLabel}</td>
        <td>[${r.currentNode}] ${curLabel}</td>
        <td>${r.capacity}</td>
        <td>${statusBadge}</td>
        <td>${r.assignedEmergency || '—'}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="window.ARES_OPEN_EDIT_RES('${r.id}')">EDIT</button>
          ${r.status === 1 ? `<button class="btn btn-sm btn-outline" onclick="window.ARES_COMPLETE_MISSION('${r.id}')">COMPLETE</button>` : ''}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- VIEW 6: CRISIS ANALYTICS -------------------------------------------
  function renderAnalytics() {
    const totalCrises = state.emergencies.length;
    const totalCasualties = state.emergencies.reduce((acc, e) => acc + (e.affected || 0), 0);
    const deployedUnits = state.resources.filter(r => r.status === 1).length;
    const resolvedCrises = state.emergencies.filter(e => e.status === 2).length;

    document.getElementById('an-total-incidents').textContent = totalCrises;
    document.getElementById('an-total-casualties').textContent = totalCasualties;
    document.getElementById('an-fleet-util').textContent = state.resources.length ? `${Math.round((deployedUnits / state.resources.length) * 100)}%` : '0%';
    document.getElementById('an-resolution-rate').textContent = totalCrises ? `${Math.round((resolvedCrises / totalCrises) * 100)}%` : '0%';

    // 1. Severity Distribution Canvas Chart
    drawSeverityChart();

    // 2. Types Distribution Canvas Chart
    drawTypesChart();

    // 3. Sector Casualty Density List
    renderSectorCasualties();
  }

  function drawSeverityChart() {
    const sCanvas = document.getElementById('chart-severity-canvas');
    if (!sCanvas) return;
    const sCtx = sCanvas.getContext('2d');
    const rect = sCanvas.parentElement.getBoundingClientRect();
    sCanvas.width = rect.width * 2;
    sCanvas.height = rect.height * 2;
    sCtx.scale(2, 2);
    sCtx.clearRect(0, 0, rect.width, rect.height);

    const counts = [0, 0, 0, 0]; // Low, Med, High, Crit
    state.emergencies.forEach(e => {
      if (e.severity >= 1 && e.severity <= 4) counts[e.severity - 1]++;
    });

    const colors = ['#00ff88', '#ffb703', '#ff3366', '#f43f5e'];
    const labels = ['Low', 'Medium', 'High', 'Critical'];
    const total = state.emergencies.length || 1;

    let startAngle = 0;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const radius = Math.min(cx, cy) - 20;

    counts.forEach((c, idx) => {
      const slice = (c / total) * Math.PI * 2;
      sCtx.beginPath();
      sCtx.moveTo(cx, cy);
      sCtx.arc(cx, cy, radius, startAngle, startAngle + slice);
      sCtx.closePath();
      sCtx.fillStyle = colors[idx];
      sCtx.fill();
      startAngle += slice;
    });

    // Donut hole
    sCtx.beginPath();
    sCtx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
    sCtx.fillStyle = '#0a111e';
    sCtx.fill();

    // Inner text
    sCtx.fillStyle = '#fff';
    sCtx.font = 'bold 16px JetBrains Mono';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText(`${total}`, cx, cy);

    // Legend
    const legend = document.getElementById('chart-severity-legend');
    legend.innerHTML = labels.map((l, i) => `
      <div style="display:flex;align-items:center;gap:4px;">
        <span style="width:10px;height:10px;background:${colors[i]};border-radius:2px;"></span>
        <span>${l}: <strong>${counts[i]}</strong></span>
      </div>
    `).join('');
  }

  function drawTypesChart() {
    const tCanvas = document.getElementById('chart-types-canvas');
    if (!tCanvas) return;
    const tCtx = tCanvas.getContext('2d');
    const rect = tCanvas.parentElement.getBoundingClientRect();
    tCanvas.width = rect.width * 2;
    tCanvas.height = rect.height * 2;
    tCtx.scale(2, 2);
    tCtx.clearRect(0, 0, rect.width, rect.height);

    const typeCounts = [0, 0, 0, 0, 0, 0, 0];
    state.emergencies.forEach(e => {
      if (e.type >= 0 && e.type < 7) typeCounts[e.type]++;
    });

    const maxCount = Math.max(...typeCounts, 1);
    const barWidth = (rect.width - 60) / 7;

    typeCounts.forEach((count, i) => {
      const barH = (count / maxCount) * (rect.height - 50);
      const x = 30 + i * barWidth;
      const y = rect.height - 30 - barH;

      tCtx.fillStyle = '#00f0ff';
      tCtx.fillRect(x + 4, y, barWidth - 8, barH);

      tCtx.fillStyle = '#fff';
      tCtx.font = '10px JetBrains Mono';
      tCtx.textAlign = 'center';
      tCtx.fillText(`${count}`, x + barWidth / 2, y - 6);

      tCtx.fillStyle = '#798ba3';
      tCtx.font = '9px Chakra Petch';
      tCtx.fillText(TYPE_NAMES[i].slice(0, 4), x + barWidth / 2, rect.height - 12);
    });

    const legend = document.getElementById('chart-types-legend');
    legend.innerHTML = TYPE_NAMES.map((t, i) => `
      <span style="color:#798ba3;">${t}: <strong style="color:#fff;">${typeCounts[i]}</strong></span>
    `).join(' &bull; ');
  }

  function renderSectorCasualties() {
    const container = document.getElementById('sector-density-list');
    container.innerHTML = '';

    const sectorStats = state.nodes.map(n => {
      const sectorEmgs = state.emergencies.filter(e => e.nodeId === n.id);
      const casualties = sectorEmgs.reduce((acc, e) => acc + (e.affected || 0), 0);
      return { id: n.id, label: n.label, casualties, incidentCount: sectorEmgs.length };
    });

    sectorStats.sort((a, b) => b.casualties - a.casualties);
    const maxCasualties = Math.max(...sectorStats.map(s => s.casualties), 1);

    sectorStats.forEach(s => {
      const pct = (s.casualties / maxCasualties) * 100;
      const row = document.createElement('div');
      row.className = 'sector-bar-row';
      row.innerHTML = `
        <div class="sector-bar-lbl">[${s.id}] ${s.label}</div>
        <div class="sector-bar-track">
          <div class="sector-bar-fill" style="width: ${pct}%;"></div>
        </div>
        <div class="sector-bar-val">${s.casualties} affected</div>
      `;
      container.appendChild(row);
    });
  }

  // --- EVENT LISTENERS & NAVIGATION ---------------------------------------
  function setupEventListeners() {
    // 1. Navigation Tab Switching
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        audio.ping();
        const targetView = this.dataset.view;
        activeTab = targetView;

        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(targetView);
        if (panel) panel.classList.add('active');

        updateUI();
      });
    });

    // 2. Canvas Mouse Interaction
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

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      viewZoom = Math.min(Math.max(viewZoom * zoomFactor, 0.6), 2.8);
    }, { passive: false });

    canvas.addEventListener('click', () => {
      audio.init();

      if (hoveredNodeId !== null) {
        audio.ping();
        selectNode(hoveredNodeId);

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
        logEvent(`ROAD UPDATE: Artery ${state.nodes[hoveredRoad.from].label} <---> ${state.nodes[hoveredRoad.to].label} is now ${hoveredRoad.blocked ? 'BLOCKED' : 'OPEN'}!`, 'alarm');

        if (activeRoute) triggerDijkstraCalculation();
        persistState();
        updateUI();
      }
    });

    // 3. Map Toolbar Controls
    document.getElementById('btn-find-path').addEventListener('click', triggerDijkstraCalculation);

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

    document.getElementById('btn-toggle-labels').addEventListener('click', () => {
      showSectorLabels = !showSectorLabels;
    });

    document.getElementById('btn-toggle-block-mode').addEventListener('click', function () {
      blockRoadMode = !blockRoadMode;
      this.classList.toggle('active', blockRoadMode);
      document.getElementById('block-mode-status').textContent = blockRoadMode ? 'ON' : 'OFF';
    });

    // 4. Auto-Dispatch Top Button
    document.getElementById('btn-auto-dispatch-top').addEventListener('click', () => {
      audio.init();
      autoDispatchTopEmergency();
    });

    // 5. Audio & Voice Toggles
    document.getElementById('btn-audio-toggle').addEventListener('click', function () {
      audio.enabled = !audio.enabled;
      document.getElementById('audio-icon').textContent = audio.enabled ? '🔊' : '🔇';
      document.getElementById('audio-label').textContent = audio.enabled ? 'AUDIO: ON' : 'AUDIO: OFF';
    });

    document.getElementById('btn-voice-toggle').addEventListener('click', function () {
      voice.enabled = !voice.enabled;
      document.getElementById('voice-icon').textContent = voice.enabled ? '🎙️' : '🔇';
      document.getElementById('voice-label').textContent = voice.enabled ? 'VOICE: ON' : 'VOICE: OFF';
      if (voice.enabled) voice.speak('Tactical AI voice telemetry active.');
    });

    // 6. Theme Switcher Menu
    const themeBtn = document.getElementById('btn-theme-menu');
    const themeDropdown = document.getElementById('theme-dropdown');
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown.style.display = themeDropdown.style.display === 'none' ? 'flex' : 'none';
    });

    window.addEventListener('click', () => {
      themeDropdown.style.display = 'none';
    });

    document.querySelectorAll('.theme-opt').forEach(opt => {
      opt.addEventListener('click', function () {
        const theme = this.dataset.theme;
        document.body.className = `cyber-hud ${theme}`;
        document.querySelectorAll('.theme-opt').forEach(o => o.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('theme-label').textContent = this.textContent.trim().toUpperCase();
      });
    });

    // 7. Sync Disk Button
    document.getElementById('btn-sync-reload').addEventListener('click', () => {
      fetchLiveTelemetry();
      audio.chime();
    });

    // 8. Fleet Filter Tabs (Sidebar)
    document.querySelectorAll('.fleet-filter-bar .filter-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.fleet-filter-bar .filter-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        renderFleetSidebarList();
      });
    });

    // 9. Simulation Controls (Sidebar & Lab)
    const playHandler = function () {
      audio.init();
      isSimPlaying = !isSimPlaying;
      if (isSimPlaying) {
        document.getElementById('sim-play-icon').textContent = '⏸';
        document.getElementById('sim-play-text').textContent = 'PAUSE';
        const labPlayText = document.getElementById('lab-play-text');
        if (labPlayText) labPlayText.textContent = 'PAUSE TIME ENGINE';
        const labPlayIcon = document.getElementById('lab-play-icon');
        if (labPlayIcon) labPlayIcon.textContent = '⏸';

        simInterval = setInterval(() => {
          stepSimulation(1);
        }, 1200 / simSpeed);
        logEvent('Simulation clock running.', 'normal');
      } else {
        document.getElementById('sim-play-icon').textContent = '▶';
        document.getElementById('sim-play-text').textContent = 'START';
        const labPlayText = document.getElementById('lab-play-text');
        if (labPlayText) labPlayText.textContent = 'START TIME ENGINE';
        const labPlayIcon = document.getElementById('lab-play-icon');
        if (labPlayIcon) labPlayIcon.textContent = '▶';

        clearInterval(simInterval);
        logEvent('Simulation clock paused.', 'normal');
      }
    };

    document.getElementById('btn-sim-play').addEventListener('click', playHandler);
    const labPlayBtn = document.getElementById('btn-lab-play');
    if (labPlayBtn) labPlayBtn.addEventListener('click', playHandler);

    document.getElementById('btn-sim-step5').addEventListener('click', () => stepSimulation(5));
    document.getElementById('btn-sim-step15').addEventListener('click', () => stepSimulation(15));
    const labStep1 = document.getElementById('btn-lab-step1');
    if (labStep1) labStep1.addEventListener('click', () => stepSimulation(1));
    const labStep5 = document.getElementById('btn-lab-step5');
    if (labStep5) labStep5.addEventListener('click', () => stepSimulation(5));
    const labStep15 = document.getElementById('btn-lab-step15');
    if (labStep15) labStep15.addEventListener('click', () => stepSimulation(15));
    const labStep60 = document.getElementById('btn-lab-step60');
    if (labStep60) labStep60.addEventListener('click', () => stepSimulation(60));

    // Speed buttons
    document.querySelectorAll('.btn-speed').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.btn-speed').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        simSpeed = parseInt(this.dataset.speed, 10);
        document.getElementById('sim-speed-badge').textContent = `${simSpeed}x`;
        if (isSimPlaying) {
          clearInterval(simInterval);
          simInterval = setInterval(() => stepSimulation(1), 1200 / simSpeed);
        }
      });
    });

    // Reset Scenario
    const resetHandler = () => {
      state = JSON.parse(JSON.stringify(DEFAULT_CITY_DATA));
      simMinutes = 0;
      recalculateAllPriorities();
      persistState();
      updateUI();
      audio.chime();
      voice.speak('Metro crisis scenario reloaded.');
      logEvent('Metro Crisis Scenario reloaded successfully.', 'normal');
    };
    document.getElementById('btn-load-scenario').addEventListener('click', resetHandler);

    // Trigger Random Crisis
    const disasterHandler = () => triggerRandomDisaster();
    document.getElementById('btn-trigger-disaster').addEventListener('click', disasterHandler);
    const labDisaster = document.getElementById('btn-lab-trigger-disaster');
    if (labDisaster) labDisaster.addEventListener('click', disasterHandler);

    // Scenario Preset Cards
    document.querySelectorAll('.btn-scenario').forEach(btn => {
      btn.addEventListener('click', function () {
        loadScenarioPreset(this.dataset.scenario);
      });
    });

    // 10. Dijkstra Lab Button
    const labComputeBtn = document.getElementById('btn-dijkstra-lab-compute');
    if (labComputeBtn) labComputeBtn.addEventListener('click', computeDijkstraLabPath);

    // 11. Heap Lab Buttons
    const heapPopBtn = document.getElementById('btn-heap-pop');
    if (heapPopBtn) heapPopBtn.addEventListener('click', () => {
      autoDispatchTopEmergency();
    });
    const heapRefreshBtn = document.getElementById('btn-heap-refresh');
    if (heapRefreshBtn) heapRefreshBtn.addEventListener('click', () => {
      recalculateAllPriorities();
      updateUI();
      audio.chime();
    });

    // 12. Registry Search & Filters
    const incSearch = document.getElementById('inc-search-input');
    if (incSearch) {
      incSearch.addEventListener('input', function () {
        incSearchQuery = this.value;
        renderEmergenciesTable();
      });
    }

    document.querySelectorAll('#inc-status-filter-group .filter-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('#inc-status-filter-group .filter-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        incStatusFilter = this.dataset.incFilter;
        renderEmergenciesTable();
      });
    });

    const fleetSearch = document.getElementById('fleet-search-input');
    if (fleetSearch) {
      fleetSearch.addEventListener('input', function () {
        fleetSearchQuery = this.value;
        renderFleetMasterTable();
      });
    }

    document.querySelectorAll('#fleet-status-filter-group .filter-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('#fleet-status-filter-group .filter-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        fleetStatusFilter = this.dataset.fleetFilter;
        renderFleetMasterTable();
      });
    });

    // 13. Audit Log Clear
    const clearLogBtn = document.getElementById('btn-clear-log');
    if (clearLogBtn) clearLogBtn.addEventListener('click', () => {
      eventLog.length = 0;
      renderAuditLog();
    });

    // 14. Keyboard Shortcuts Setup
    setupKeyboardShortcuts();

    // 15. Modals Setup
    setupModals();
  }

  // --- KEYBOARD SHORTCUTS -------------------------------------------------
  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger hotkeys if inside input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      const key = e.key.toUpperCase();
      if (key >= '1' && key <= '7') {
        const viewTabs = ['view-map', 'view-heap', 'view-dijkstra', 'view-incidents', 'view-fleet', 'view-analytics', 'view-simulation'];
        const targetView = viewTabs[parseInt(key, 10) - 1];
        if (targetView) {
          const tabBtn = document.querySelector(`.nav-tab[data-view="${targetView}"]`);
          if (tabBtn) tabBtn.click();
        }
      } else if (key === 'D') {
        autoDispatchTopEmergency();
      } else if (key === 'R') {
        triggerDijkstraCalculation();
      } else if (key === ' ') {
        e.preventDefault();
        document.getElementById('btn-sim-play').click();
      } else if (key === 'S') {
        stepSimulation(5);
      } else if (key === 'B') {
        document.getElementById('btn-toggle-block-mode').click();
      } else if (key === 'M') {
        document.getElementById('btn-audio-toggle').click();
      } else if (key === 'V') {
        document.getElementById('btn-voice-toggle').click();
      } else if (key === 'ESCAPE') {
        closeAllModals();
      }
    });

    document.getElementById('btn-shortcuts-help').addEventListener('click', () => {
      document.getElementById('modal-shortcuts').style.display = 'flex';
    });
    document.getElementById('btn-close-shortcuts-modal').addEventListener('click', () => {
      document.getElementById('modal-shortcuts').style.display = 'none';
    });
    document.getElementById('btn-dismiss-shortcuts').addEventListener('click', () => {
      document.getElementById('modal-shortcuts').style.display = 'none';
    });
  }

  // --- SCENARIO PRESETS ---------------------------------------------------
  function loadScenarioPreset(type) {
    audio.chime();
    state = JSON.parse(JSON.stringify(DEFAULT_CITY_DATA));
    simMinutes = 0;

    if (type === 'earthquake') {
      voice.speak('Emergency scenario activated. Severe 7.2 Richter seismic event.');
      // Block river bridge and university road
      state.roads.find(r => r.from === 6 && r.to === 7).blocked = true;
      state.roads.find(r => r.from === 3 && r.to === 7).blocked = true;
      state.emergencies.unshift({
        id: `INC-EQ1`,
        reporter: "USGS Seismic Network",
        description: "Catastrophic structural masonry collapse, multiple casualties trapped",
        nodeId: 7,
        location: "Old Town",
        type: 4,
        typeStr: "Earthquake",
        severity: 4,
        severityStr: "CRITICAL",
        affected: 210,
        priority: 98.5,
        status: 0,
        statusStr: "Pending",
        assignedResource: "",
        reportedAt: Math.floor(Date.now() / 1000)
      });
      logEvent('SCENARIO: 7.2 Richter Earthquake activated! Old Town isolated.', 'alarm');
    } else if (type === 'chemical') {
      voice.speak('Emergency scenario activated. Hazardous chemical vapor breach.');
      state.roads.find(r => r.from === 4 && r.to === 8).blocked = true;
      state.emergencies.unshift({
        id: `INC-HM1`,
        reporter: "Environmental Safety Agency",
        description: "Pressurized chlorine gas leak threatening adjacent commercial zone",
        nodeId: 8,
        location: "Industrial Zone",
        type: 5,
        typeStr: "HazMat",
        severity: 4,
        severityStr: "CRITICAL",
        affected: 95,
        priority: 96.0,
        status: 0,
        statusStr: "Pending",
        assignedResource: "",
        reportedAt: Math.floor(Date.now() / 1000)
      });
      logEvent('SCENARIO: Industrial Chemical Breach activated! HazMat containment required.', 'alarm');
    } else if (type === 'flood') {
      voice.speak('Emergency scenario activated. Flash flood inundation.');
      state.roads.find(r => r.from === 6 && r.to === 10).blocked = true;
      state.roads.find(r => r.from === 2 && r.to === 6).blocked = true;
      state.emergencies.unshift({
        id: `INC-FL1`,
        reporter: "Meteorological Service",
        description: "Rapid canal surcharge inundating low-lying residential sectors",
        nodeId: 6,
        location: "River Bridge",
        type: 2,
        typeStr: "Flood",
        severity: 3,
        severityStr: "HIGH",
        affected: 150,
        priority: 85.0,
        status: 0,
        statusStr: "Pending",
        assignedResource: "",
        reportedAt: Math.floor(Date.now() / 1000)
      });
      logEvent('SCENARIO: River Flash Flood activated! Bridge access severed.', 'alarm');
    } else {
      voice.speak('Metro crisis scenario initialized.');
      logEvent('SCENARIO: Metro Crisis Scenario initialized.', 'normal');
    }

    recalculateAllPriorities();
    persistState();
    updateUI();
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
    logEvent(`Dijkstra Route calculated: [${startId}] ➔ [${destId}] &bull; Travel Time: ${route.totalCost} min (${route.hops} hops).`, 'normal');
  }

  function distToSegment(p, v, w) {
    const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  // Window global for inline HTML onclick triggers
  window.ARES_TOGGLE_ROAD = function (u, v) {
    const road = state.roads.find(r => (r.from === u && r.to === v) || (r.from === v && r.to === u));
    if (road) {
      road.blocked = !road.blocked;
      audio.alarm();
      logEvent(`ROAD UPDATE: ${state.nodes[road.from].label} <---> ${state.nodes[road.to].label} is now ${road.blocked ? 'BLOCKED 🚧' : 'CLEAR'}!`, 'alarm');
      if (activeRoute) triggerDijkstraCalculation();
      persistState();
      updateUI();
    }
  };

  window.ARES_DISPATCH_INCIDENT = function (id) {
    const emg = state.emergencies.find(e => e.id === id);
    if (!emg || emg.status !== 0) return;

    let bestUnit = null;
    let bestRoute = null;

    state.resources.forEach(res => {
      if (res.status !== 0) return;
      if (!isResourceCompatible(res, emg.type)) return;
      const route = dijkstraShortestPath(res.currentNode, emg.nodeId);
      if (!route) return;
      if (!bestRoute || route.totalCost < bestRoute.totalCost) {
        bestUnit = res;
        bestRoute = route;
      }
    });

    if (!bestUnit) {
      audio.alarm();
      alert(`No available compatible unit has an unobstructed path to ${emg.location}!`);
      return;
    }

    bestUnit.status = 1;
    bestUnit.assignedEmergency = emg.id;
    emg.status = 1;
    emg.assignedResource = bestUnit.id;

    audio.dispatch();
    voice.speak(`Unit ${bestUnit.id} dispatched to ${emg.location}.`);
    logEvent(`MANUAL DISPATCH: Unit ${bestUnit.id} deployed to ${emg.id} at [${emg.nodeId}] ${emg.location}.`, 'dispatch');

    activeRoute = bestRoute;
    showRouteInfoCard(bestRoute, emg, bestUnit);
    startVehicleAnimation(bestUnit, bestRoute, emg);

    persistState();
    updateUI();
  };

  window.ARES_RESOLVE_EMG = function (id) {
    const emg = state.emergencies.find(e => e.id === id);
    if (!emg) return;

    emg.status = 2; // Resolved
    // Free assigned resource
    const res = state.resources.find(r => r.assignedEmergency === id);
    if (res) {
      res.status = 0;
      res.assignedEmergency = '';
    }

    audio.chime();
    logEvent(`INCIDENT RESOLVED: Emergency ${emg.id} at ${emg.location} closed.`, 'resolve');
    persistState();
    updateUI();
  };

  window.ARES_COMPLETE_MISSION = function (unitId) {
    const res = state.resources.find(r => r.id === unitId);
    if (!res) return;

    const emgId = res.assignedEmergency;
    if (emgId) {
      const emg = state.emergencies.find(e => e.id === emgId);
      if (emg) emg.status = 2; // Resolved
    }

    res.status = 0; // Available
    res.currentNode = res.baseNode; // Returned to base
    res.assignedEmergency = '';

    audio.chime();
    logEvent(`MISSION COMPLETE: ${res.id} returned to base station [${res.baseNode}].`, 'resolve');
    persistState();
    updateUI();
  };

  // --- RANDOM DISASTER GENERATOR ------------------------------------------
  function triggerRandomDisaster() {
    audio.init();
    audio.alarm();

    const emergencyTypes = [
      { type: 0, str: "Fire", desc: "Chemical transformer burst, intense thermal radiation" },
      { type: 1, str: "Medical", desc: "Major transit derailment with critical passenger casualties" },
      { type: 2, str: "Flood", desc: "Canal levy failure flooding lower subway concourses" },
      { type: 3, str: "Accident", desc: "Overhead crane collapse over multi-lane roadway" },
      { type: 4, str: "Earthquake", desc: "Seismic tremor causing structural façade collapse" },
      { type: 5, str: "HazMat", desc: "Industrial valve rupture, hazardous vapor emission" }
    ];

    const randomNode = state.nodes[Math.floor(Math.random() * state.nodes.length)];
    const randomPick = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
    const randomSev = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
    const affected = Math.floor(Math.random() * 140) + 10;
    const newId = `INC-R${Math.floor(Math.random() * 899 + 100)}`;

    const newIncident = {
      id: newId,
      reporter: "Automated Grid Sensors",
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
    persistState();
    updateUI();

    selectNode(randomNode.id);
    voice.speak(`Alert. ${newIncident.severityStr} ${newIncident.typeStr} reported in Sector ${randomNode.id}, ${randomNode.label}.`);
    logEvent(`⚠️ CRISIS ALARM TRIGGERED: ${newIncident.id} (${newIncident.typeStr}) at [${randomNode.id}] ${randomNode.label}! Priority: ${newIncident.priority.toFixed(1)}/100.`, 'alarm');
  }

  // --- MODAL DIALOGS CONTROLLER -------------------------------------------
  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.style.display = 'none');
  }

  function setupModals() {
    const modalReport = document.getElementById('modal-report');
    const modalResource = document.getElementById('modal-resource');
    const modalEditEmg = document.getElementById('modal-edit-emergency');
    const modalEditRes = document.getElementById('modal-edit-resource');

    // Report Emergency Modal
    document.getElementById('btn-open-report-modal').addEventListener('click', () => {
      audio.init();
      modalReport.style.display = 'flex';
      updateScorePreview();
    });
    const btnIncNew = document.getElementById('btn-inc-new-alarm');
    if (btnIncNew) {
      btnIncNew.addEventListener('click', () => {
        audio.init();
        modalReport.style.display = 'flex';
        updateScorePreview();
      });
    }

    document.getElementById('btn-close-report-modal').addEventListener('click', () => modalReport.style.display = 'none');
    document.getElementById('btn-cancel-report').addEventListener('click', () => modalReport.style.display = 'none');

    // Commission Resource Modal
    const openResModal = () => {
      audio.init();
      modalResource.style.display = 'flex';
    };
    document.getElementById('btn-open-resource-modal').addEventListener('click', openResModal);
    const btnFleetCommission = document.getElementById('btn-fleet-commission-modal');
    if (btnFleetCommission) btnFleetCommission.addEventListener('click', openResModal);

    document.getElementById('btn-close-resource-modal').addEventListener('click', () => modalResource.style.display = 'none');
    document.getElementById('btn-cancel-resource').addEventListener('click', () => modalResource.style.display = 'none');

    // Edit Emergency Modal
    document.getElementById('btn-close-edit-emg-modal').addEventListener('click', () => modalEditEmg.style.display = 'none');
    document.getElementById('btn-close-edit-res-modal').addEventListener('click', () => modalEditRes.style.display = 'none');

    // Dynamic Score Preview
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

      const newEmg = {
        id: newId,
        reporter: reporter,
        description: desc,
        nodeId: nodeId,
        location: node.label,
        type: type,
        typeStr: TYPE_NAMES[type],
        severity: sev,
        severityStr: SEVERITY_NAMES[sev],
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
      persistState();
      updateUI();
      modalReport.style.display = 'none';

      audio.alarm();
      voice.speak(`New alarm registered. ${newEmg.typeStr} incident in Sector ${nodeId}.`);
      logEvent(`NEW INCIDENT LOGGED: ${newEmg.id} (${newEmg.typeStr}) at [${nodeId}] ${node.label}. Priority: ${newEmg.priority.toFixed(1)}/100.`, 'alarm');
    });

    // Submit Resource Form
    document.getElementById('form-add-resource').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('res-id').value.toUpperCase().trim();
      const name = document.getElementById('res-name').value.trim();
      const type = parseInt(document.getElementById('res-type').value, 10);
      const nodeId = parseInt(document.getElementById('res-node').value, 10);
      const cap = parseInt(document.getElementById('res-capacity').value, 10);

      const newRes = {
        id: id,
        name: name,
        type: type,
        typeStr: UNIT_NAMES[type] || 'Other',
        status: 0,
        statusStr: 'Available',
        baseNode: nodeId,
        currentNode: nodeId,
        capacity: cap,
        currentLoad: 0,
        assignedEmergency: ''
      };

      state.resources.push(newRes);
      persistState();
      updateUI();
      modalResource.style.display = 'none';

      audio.chime();
      voice.speak(`Unit ${newRes.id} commissioned into active fleet.`);
      logEvent(`FLEET COMMISSIONED: Unit ${newRes.id} (${newRes.name}) stationed at Sector [${nodeId}].`, 'normal');
    });

    // Edit Emergency Form
    window.ARES_OPEN_EDIT_EMG = function (id) {
      const emg = state.emergencies.find(e => e.id === id);
      if (!emg) return;

      document.getElementById('edit-emg-id').value = emg.id;
      document.getElementById('edit-emg-id-title').textContent = emg.id;
      document.getElementById('edit-emg-status').value = emg.status;
      document.getElementById('edit-emg-severity').value = emg.severity;
      document.getElementById('edit-emg-affected').value = emg.affected;
      document.getElementById('edit-emg-desc').value = emg.description;

      modalEditEmg.style.display = 'flex';
    };

    document.getElementById('form-edit-emergency').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-emg-id').value;
      const emg = state.emergencies.find(e => e.id === id);
      if (!emg) return;

      emg.status = parseInt(document.getElementById('edit-emg-status').value, 10);
      emg.severity = parseInt(document.getElementById('edit-emg-severity').value, 10);
      emg.severityStr = SEVERITY_NAMES[emg.severity];
      emg.affected = parseInt(document.getElementById('edit-emg-affected').value, 10);
      emg.description = document.getElementById('edit-emg-desc').value;

      recalculateAllPriorities();
      persistState();
      updateUI();
      modalEditEmg.style.display = 'none';
      audio.chime();
      logEvent(`INCIDENT UPDATED: Record ${id} modified.`, 'normal');
    });

    document.getElementById('btn-delete-emergency').addEventListener('click', () => {
      const id = document.getElementById('edit-emg-id').value;
      if (confirm(`Are you sure you want to delete emergency ${id}?`)) {
        state.emergencies = state.emergencies.filter(e => e.id !== id);
        recalculateAllPriorities();
        persistState();
        updateUI();
        modalEditEmg.style.display = 'none';
        logEvent(`INCIDENT DELETED: Emergency ${id} removed.`, 'normal');
      }
    });

    // Edit Resource Form
    window.ARES_OPEN_EDIT_RES = function (id) {
      const res = state.resources.find(r => r.id === id);
      if (!res) return;

      document.getElementById('edit-res-id').value = res.id;
      document.getElementById('edit-res-id-title').textContent = res.id;
      document.getElementById('edit-res-status').value = res.status;
      document.getElementById('edit-res-current-node').value = res.currentNode;
      document.getElementById('edit-res-base-node').value = res.baseNode;
      document.getElementById('edit-res-capacity').value = res.capacity;

      modalEditRes.style.display = 'flex';
    };

    document.getElementById('form-edit-resource').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-res-id').value;
      const res = state.resources.find(r => r.id === id);
      if (!res) return;

      res.status = parseInt(document.getElementById('edit-res-status').value, 10);
      res.currentNode = parseInt(document.getElementById('edit-res-current-node').value, 10);
      res.baseNode = parseInt(document.getElementById('edit-res-base-node').value, 10);
      res.capacity = parseInt(document.getElementById('edit-res-capacity').value, 10);

      persistState();
      updateUI();
      modalEditRes.style.display = 'none';
      audio.chime();
      logEvent(`FLEET UNIT UPDATED: Unit ${id} modified.`, 'normal');
    });

    document.getElementById('btn-delete-resource').addEventListener('click', () => {
      const id = document.getElementById('edit-res-id').value;
      if (confirm(`Decommission unit ${id} from fleet?`)) {
        state.resources = state.resources.filter(r => r.id !== id);
        persistState();
        updateUI();
        modalEditRes.style.display = 'none';
        logEvent(`FLEET DECOMMISSIONED: Unit ${id} retired.`, 'normal');
      }
    });
  }

  function populateSelectDropdowns() {
    const startSelect = document.getElementById('route-start-select');
    const destSelect = document.getElementById('route-dest-select');
    const repNodeSelect = document.getElementById('rep-node');
    const resNodeSelect = document.getElementById('res-node');
    const dijkstraStart = document.getElementById('dijkstra-lab-start');
    const dijkstraDest = document.getElementById('dijkstra-lab-dest');
    const editResCurNode = document.getElementById('edit-res-current-node');
    const editResBaseNode = document.getElementById('edit-res-base-node');

    state.nodes.forEach(node => {
      const label = `[${node.id}] ${node.label}`;
      startSelect.add(new Option(label, node.id));
      destSelect.add(new Option(label, node.id));
      repNodeSelect.add(new Option(label, node.id));
      resNodeSelect.add(new Option(label, node.id));
      if (dijkstraStart) dijkstraStart.add(new Option(label, node.id));
      if (dijkstraDest) dijkstraDest.add(new Option(label, node.id));
      if (editResCurNode) editResCurNode.add(new Option(label, node.id));
      if (editResBaseNode) editResBaseNode.add(new Option(label, node.id));
    });
  }

  // Run on startup
  window.addEventListener('DOMContentLoaded', init);

})();
