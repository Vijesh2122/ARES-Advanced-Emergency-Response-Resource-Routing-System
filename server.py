import http.server
import socketserver
import os
import sys
import json
import urllib.parse
import subprocess

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

DEFAULT_METRO_SCENARIO = {
    "timestamp": 1792155858,
    "simMinutes": 0,
    "nodes": [
        {"id": 0, "label": "Central HQ", "x": 48, "y": 48},
        {"id": 1, "label": "North Station", "x": 34, "y": 18},
        {"id": 2, "label": "City Hospital", "x": 20, "y": 42},
        {"id": 3, "label": "University", "x": 32, "y": 75},
        {"id": 4, "label": "Tech Park", "x": 58, "y": 22},
        {"id": 5, "label": "Airport", "x": 84, "y": 16},
        {"id": 6, "label": "River Bridge", "x": 38, "y": 58},
        {"id": 7, "label": "Old Town", "x": 18, "y": 86},
        {"id": 8, "label": "Industrial Zone", "x": 78, "y": 52},
        {"id": 9, "label": "East Shelter", "x": 92, "y": 42},
        {"id": 10, "label": "West Market", "x": 62, "y": 76},
        {"id": 11, "label": "South Station", "x": 46, "y": 94}
    ],
    "roads": [
        {"from": 0, "to": 1, "minutes": 4, "blocked": False},
        {"from": 0, "to": 2, "minutes": 3, "blocked": False},
        {"from": 0, "to": 3, "minutes": 5, "blocked": False},
        {"from": 1, "to": 4, "minutes": 6, "blocked": False},
        {"from": 2, "to": 4, "minutes": 4, "blocked": False},
        {"from": 2, "to": 6, "minutes": 5, "blocked": False},
        {"from": 3, "to": 7, "minutes": 4, "blocked": False},
        {"from": 4, "to": 5, "minutes": 7, "blocked": False},
        {"from": 4, "to": 8, "minutes": 5, "blocked": False},
        {"from": 5, "to": 9, "minutes": 6, "blocked": False},
        {"from": 6, "to": 7, "minutes": 3, "blocked": False},
        {"from": 6, "to": 10, "minutes": 4, "blocked": False},
        {"from": 7, "to": 11, "minutes": 6, "blocked": False},
        {"from": 8, "to": 9, "minutes": 3, "blocked": False},
        {"from": 8, "to": 10, "minutes": 5, "blocked": False},
        {"from": 10, "to": 11, "minutes": 4, "blocked": False}
    ],
    "emergencies": [
        {
            "id": "INC-F01",
            "reporter": "Dr. Alan Vance",
            "description": "Multi-story server lab electrical fire spreading rapidly",
            "nodeId": 4,
            "location": "Tech Park",
            "type": 0,
            "typeStr": "Fire",
            "severity": 3,
            "severityStr": "HIGH",
            "affected": 85,
            "priority": 82.5,
            "status": 0,
            "statusStr": "Pending",
            "assignedResource": "",
            "reportedAt": 1792155858 - 1200
        },
        {
            "id": "INC-M02",
            "reporter": "Officer Chen",
            "description": "Multi-car pileup with severe trauma injuries on highway",
            "nodeId": 6,
            "location": "River Bridge",
            "type": 1,
            "typeStr": "Medical",
            "severity": 4,
            "severityStr": "CRITICAL",
            "affected": 14,
            "priority": 94.2,
            "status": 0,
            "statusStr": "Pending",
            "assignedResource": "",
            "reportedAt": 1792155858 - 900
        },
        {
            "id": "INC-H03",
            "reporter": "Site Mgr. Kovacs",
            "description": "Corrosive chemical container breach, toxic vapor cloud",
            "nodeId": 8,
            "location": "Industrial Zone",
            "type": 5,
            "typeStr": "HazMat",
            "severity": 3,
            "severityStr": "HIGH",
            "affected": 32,
            "priority": 86.0,
            "status": 0,
            "statusStr": "Pending",
            "assignedResource": "",
            "reportedAt": 1792155858 - 600
        },
        {
            "id": "INC-A04",
            "reporter": "Patrol Unit 4",
            "description": "Old building masonry façade collapse over pedestrian lane",
            "nodeId": 7,
            "location": "Old Town",
            "type": 3,
            "typeStr": "Accident",
            "severity": 2,
            "severityStr": "MEDIUM",
            "affected": 18,
            "priority": 61.4,
            "status": 0,
            "statusStr": "Pending",
            "assignedResource": "",
            "reportedAt": 1792155858 - 450
        },
        {
            "id": "INC-M05",
            "reporter": "HQ Dispatcher",
            "description": "Sudden cardiac arrest at public concourse area",
            "nodeId": 0,
            "location": "Central HQ",
            "type": 1,
            "typeStr": "Medical",
            "severity": 4,
            "severityStr": "CRITICAL",
            "affected": 2,
            "priority": 88.0,
            "status": 0,
            "statusStr": "Pending",
            "assignedResource": "",
            "reportedAt": 1792155858 - 200
        },
        {
            "id": "INC-L06",
            "reporter": "Market Security",
            "description": "Drainage backup resulting in knee-deep flash flooding",
            "nodeId": 10,
            "location": "West Market",
            "type": 2,
            "typeStr": "Flood",
            "severity": 1,
            "severityStr": "LOW",
            "affected": 40,
            "priority": 45.8,
            "status": 0,
            "statusStr": "Pending",
            "assignedResource": "",
            "reportedAt": 1792155858 - 100
        }
    ],
    "resources": [
        {"id": "AMB-01", "name": "Metro ALS Ambulance 1", "type": 0, "typeStr": "Ambulance", "status": 0, "statusStr": "Available", "baseNode": 2, "currentNode": 2, "capacity": 4, "currentLoad": 0, "assignedEmergency": ""},
        {"id": "AMB-02", "name": "Rapid Paramedic Unit 2", "type": 0, "typeStr": "Ambulance", "status": 0, "statusStr": "Available", "baseNode": 0, "currentNode": 0, "capacity": 2, "currentLoad": 0, "assignedEmergency": ""},
        {"id": "ENG-01", "name": "Heavy Pumper Engine 1", "type": 1, "typeStr": "Fire Truck", "status": 0, "statusStr": "Available", "baseNode": 1, "currentNode": 1, "capacity": 6, "currentLoad": 0, "assignedEmergency": ""},
        {"id": "ENG-02", "name": "Ladder Tower Truck 2", "type": 1, "typeStr": "Fire Truck", "status": 0, "statusStr": "Available", "baseNode": 11, "currentNode": 11, "capacity": 4, "currentLoad": 0, "assignedEmergency": ""},
        {"id": "POL-01", "name": "Tactical Patrol Cruiser 1", "type": 2, "typeStr": "Police", "status": 0, "statusStr": "Available", "baseNode": 0, "currentNode": 0, "capacity": 4, "currentLoad": 0, "assignedEmergency": ""},
        {"id": "COP-01", "name": "Air Medevac SkyRescue 1", "type": 4, "typeStr": "Helicopter", "status": 0, "statusStr": "Available", "baseNode": 5, "currentNode": 5, "capacity": 4, "currentLoad": 0, "assignedEmergency": ""},
        {"id": "HAZ-01", "name": "HazMat Decon Mobile 1", "type": 5, "typeStr": "HazMat", "status": 0, "statusStr": "Available", "baseNode": 8, "currentNode": 8, "capacity": 3, "currentLoad": 0, "assignedEmergency": ""},
        {"id": "RES-01", "name": "Heavy Urban Rescue Squad 1", "type": 3, "typeStr": "Rescue Team", "status": 0, "statusStr": "Available", "baseNode": 3, "currentNode": 3, "capacity": 8, "currentLoad": 0, "assignedEmergency": ""}
    ]
}

class AresHttpHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        # Redirect root to /web/index.html
        if parsed.path in ('/', ''):
            self.send_response(302)
            self.send_header('Location', '/web/index.html')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()
            return
            
        # REST API for live telemetry
        if parsed.path == '/api/state':
            json_path = os.path.join(DIRECTORY, 'data', 'ares_live.json')
            data = None
            if os.path.exists(json_path):
                try:
                    with open(json_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                except Exception:
                    data = DEFAULT_METRO_SCENARIO
            else:
                data = DEFAULT_METRO_SCENARIO

            content = json.dumps(data).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        # System info API
        if parsed.path == '/api/system':
            info = {
                "system": "ARES Advanced Emergency Response Resource Routing System",
                "version": "3.5 PRO TACTICAL",
                "nodesCount": 12,
                "roadsCount": 16,
                "serverStatus": "ONLINE",
                "cBackendEngine": "C11 Native MinGW-w64",
                "buildExecutable": os.path.exists(os.path.join(DIRECTORY, 'build', 'ares.exe'))
            }
            content = json.dumps(info).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'

        if parsed.path == '/api/save_state':
            try:
                state_data = json.loads(post_body)
                json_path = os.path.join(DIRECTORY, 'data', 'ares_live.json')
                os.makedirs(os.path.dirname(json_path), exist_ok=True)
                with open(json_path, 'w', encoding='utf-8') as f:
                    json.dump(state_data, f, indent=2)

                js_path = os.path.join(DIRECTORY, 'web', 'live_data.js')
                with open(js_path, 'w', encoding='utf-8') as f:
                    f.write("/* Auto-generated by ARES Tactical Engine */\n")
                    f.write("window.ARES_LIVE_DATA = ")
                    json.dump(state_data, f, indent=2)
                    f.write(";\n")

                resp = json.dumps({"status": "ok", "message": "State persisted to data/ares_live.json and web/live_data.js"}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Length', str(len(resp)))
                self.end_headers()
                self.wfile.write(resp)
                return
            except Exception as e:
                self.send_error(500, f"Error saving state: {e}")
                return

        if parsed.path == '/api/reset_scenario':
            try:
                json_path = os.path.join(DIRECTORY, 'data', 'ares_live.json')
                with open(json_path, 'w', encoding='utf-8') as f:
                    json.dump(DEFAULT_METRO_SCENARIO, f, indent=2)

                js_path = os.path.join(DIRECTORY, 'web', 'live_data.js')
                with open(js_path, 'w', encoding='utf-8') as f:
                    f.write("/* Auto-generated by ARES Tactical Engine */\n")
                    f.write("window.ARES_LIVE_DATA = ")
                    json.dump(DEFAULT_METRO_SCENARIO, f, indent=2)
                    f.write(";\n")

                resp = json.dumps({"status": "ok", "data": DEFAULT_METRO_SCENARIO}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Length', str(len(resp)))
                self.end_headers()
                self.wfile.write(resp)
                return
            except Exception as e:
                self.send_error(500, f"Error resetting scenario: {e}")
                return

        self.send_error(404, "Endpoint not found")

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), AresHttpHandler) as httpd:
        print(f"[ARES SERVER] Tactical Command Web Server listening on http://localhost:{PORT}")
        sys.stdout.flush()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[ARES SERVER] Shutting down.")
