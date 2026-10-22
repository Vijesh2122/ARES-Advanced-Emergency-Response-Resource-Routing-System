"""ARES local web server and document-grounded RAG API."""
import http.server
import socketserver
import os
import sys
import json
import secrets
import urllib.parse
import urllib.request
import time
import traceback
from email import policy
from email.parser import BytesParser
from http.cookies import SimpleCookie

def load_local_env() -> None:
    """Load simple KEY=VALUE entries from a local .env without a dependency."""
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as source:
        for line in source:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

load_local_env()

try:
    from rag import RagError, RagStore, NO_INFORMATION_RESPONSE, chat_messages, citations, resolve_follow_up, validate_answer_citations
    from embeddings import configured_embedder
    from llm import LlmConfig, LlmError, generate_ollama_answer, ollama_health
except ImportError as error:
    raise RuntimeError("ARES RAG module is missing or invalid.") from error

PORT = int(os.getenv("ARES_PORT", "8080"))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
RAG_DB = os.path.join(DIRECTORY, "data", "ares_rag.sqlite")
MAX_UPLOAD_MB = max(1, min(250, int(os.getenv("ARES_RAG_MAX_UPLOAD_MB", "100"))))
MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024
EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")
LLM_CONFIG = LlmConfig.from_environment()
RAG_STORE = RagStore(RAG_DB)
RAG_REQUESTS_PER_MINUTE = max(1, min(60, int(os.getenv("ARES_RAG_REQUESTS_PER_MINUTE", "12"))))
REQUEST_WINDOW_SECONDS = 60
_request_times = {}

def has_openai_key() -> bool:
    """A copied .env.example must not be mistaken for a configured provider."""
    key = os.getenv("OPENAI_API_KEY", "").strip()
    return bool(key) and not key.lower().startswith(("your_", "replace_", "placeholder"))

def passage_answer(evidence, notice: str | None = None) -> str:
    prefix = (notice + "\n\n") if notice else ""
    passages = "\n\n".join(
        f"- {item['text']} [Source: {item['filename']}, p. {item['page']}]"
        for item in evidence
    )
    return prefix + "Retrieved document passages:\n\n" + passages

def answer_generation_status() -> dict:
    """Return non-sensitive provider configuration for API/UI status."""
    if LLM_CONFIG.provider == "ollama":
        return ollama_health(LLM_CONFIG)
    return {"provider": LLM_CONFIG.provider, "enabled": LLM_CONFIG.enabled, "endpointReachable": None, "modelAvailable": None, "message": "OpenAI generation is configured separately."}

def generate_grounded_answer(question, evidence, history):
    """Use the selected provider after retrieval; failure keeps source-only mode."""
    if not LLM_CONFIG.enabled:
        raise LlmError("Answer generation is disabled (set ARES_LLM_ENABLED=true to enable it).")
    if LLM_CONFIG.provider == "ollama":
        answer = generate_ollama_answer(chat_messages(question, evidence, history, LLM_CONFIG.context_chars), LLM_CONFIG)
        return validate_answer_citations(answer, evidence), "ollama"
    if LLM_CONFIG.provider == "openai" and has_openai_key():
        answer = openai_request("chat/completions", {"model": CHAT_MODEL, "temperature": 0, "messages": chat_messages(question, evidence, history, LLM_CONFIG.context_chars)}).get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        if not answer:
            raise LlmError("The language model returned no answer.")
        return validate_answer_citations(answer, evidence), "openai"
    raise LlmError("No enabled answer-generation provider is configured. Set ARES_LLM_PROVIDER=ollama and start Ollama.")

# Place centroids from OpenStreetMap/GeoNames. x/y retain the existing canvas projection.
CHENNAI_NODES = [
    {"id":0,"label":"Thiruvottiyur","latitude":13.15823,"longitude":80.30181,"x":92,"y":15}, {"id":1,"label":"Manali","latitude":13.18106,"longitude":80.26942,"x":61,"y":8},
    {"id":2,"label":"Madhavaram","latitude":13.14210,"longitude":80.23240,"x":27,"y":23}, {"id":3,"label":"Tondiarpet","latitude":13.12777,"longitude":80.28959,"x":83,"y":31},
    {"id":4,"label":"Royapuram","latitude":13.11462,"longitude":80.29403,"x":87,"y":39}, {"id":5,"label":"Perambur","latitude":13.11212,"longitude":80.24502,"x":39,"y":40},
    {"id":6,"label":"Anna Nagar","latitude":13.08825,"longitude":80.20734,"x":12,"y":53}, {"id":7,"label":"T. Nagar","latitude":13.04180,"longitude":80.23410,"x":29,"y":76},
    {"id":8,"label":"Kodambakkam","latitude":13.04921,"longitude":80.22428,"x":21,"y":71}, {"id":9,"label":"Guindy","latitude":13.00871,"longitude":80.22037,"x":18,"y":91},
    {"id":10,"label":"Adyar","latitude":13.00645,"longitude":80.25778,"x":50,"y":92}, {"id":11,"label":"Sholinganallur","latitude":12.89354,"longitude":80.23206,"x":27,"y":99},
]
# Illustrative graph weights, not road distances or actual travel times.
CHENNAI_ROADS = [
    {"from":0,"to":1,"minutes":4,"blocked":False},{"from":0,"to":3,"minutes":5,"blocked":False},{"from":1,"to":2,"minutes":6,"blocked":False},{"from":2,"to":5,"minutes":4,"blocked":False},
    {"from":2,"to":6,"minutes":5,"blocked":False},{"from":3,"to":4,"minutes":3,"blocked":False},{"from":3,"to":5,"minutes":5,"blocked":False},{"from":4,"to":5,"minutes":6,"blocked":False},
    {"from":5,"to":6,"minutes":4,"blocked":False},{"from":5,"to":8,"minutes":5,"blocked":False},{"from":6,"to":8,"minutes":3,"blocked":False},{"from":8,"to":7,"minutes":4,"blocked":False},
    {"from":7,"to":9,"minutes":6,"blocked":False},{"from":7,"to":10,"minutes":5,"blocked":False},{"from":9,"to":10,"minutes":3,"blocked":False},{"from":10,"to":11,"minutes":7,"blocked":False},
]
def incident(id_, node, kind, severity, affected):
    return {"id":id_,"reporter":"Simulation operator","description":"Illustrative simulation record","nodeId":node,"location":CHENNAI_NODES[node]["label"],"type":kind,"typeStr":["Fire","Medical","Flood","Accident","Earthquake","HazMat"][kind],"severity":severity,"severityStr":["","LOW","MEDIUM","HIGH","CRITICAL"][severity],"affected":affected,"priority":0,"status":0,"statusStr":"Pending","assignedResource":"","reportedAt":1792155858}
def resource(id_, name, kind, node, capacity):
    return {"id":id_,"name":name,"type":kind,"typeStr":["Ambulance","Fire Truck","Police","Rescue Team","Helicopter","HazMat"][kind],"status":0,"statusStr":"Available","baseNode":node,"currentNode":node,"capacity":capacity,"currentLoad":0,"assignedEmergency":""}
DEFAULT_METRO_SCENARIO = {"timestamp":1792155858,"simMinutes":0,"nodes":CHENNAI_NODES,"roads":CHENNAI_ROADS,"emergencies":[incident("INC-F01",8,0,3,85),incident("INC-M02",5,1,4,14),incident("INC-H03",1,5,3,32),incident("INC-A04",4,3,2,18),incident("INC-M05",0,1,4,2),incident("INC-L06",10,2,1,40)],"resources":[resource("AMB-01","Metro ALS Ambulance 1",0,5,4),resource("AMB-02","Rapid Paramedic Unit 2",0,0,2),resource("ENG-01","Heavy Pumper Engine 1",1,2,6),resource("ENG-02","Ladder Tower Truck 2",1,11,4),resource("POL-01","Tactical Patrol Cruiser 1",2,3,4),resource("COP-01","Air Medevac SkyRescue 1",4,6,4),resource("HAZ-01","HazMat Decon Mobile 1",5,1,3),resource("RES-01","Heavy Urban Rescue Squad 1",3,4,8)]}

def enforce_rag_rate_limit(owner):
    """Keep an accidental UI loop from exhausting an operator's provider quota."""
    now = time.monotonic()
    recent = [stamp for stamp in _request_times.get(owner, []) if now - stamp < REQUEST_WINDOW_SECONDS]
    if len(recent) >= RAG_REQUESTS_PER_MINUTE:
        raise ValueError("RAG request limit reached. Wait a minute before trying again.")
    recent.append(now)
    _request_times[owner] = recent
def openai_request(path, payload):
    key=os.getenv("OPENAI_API_KEY")
    if not has_openai_key(): raise ValueError("OpenAI answer generation is not configured.")
    req=urllib.request.Request("https://api.openai.com/v1/"+path,data=json.dumps(payload).encode(),headers={"Authorization":"Bearer "+key,"Content-Type":"application/json"},method="POST")
    try:
        with urllib.request.urlopen(req,timeout=75) as response: return json.loads(response.read().decode())
    except urllib.error.HTTPError as error:
        print(f"[ARES RAG PROVIDER] OpenAI HTTP {error.code}", file=sys.stderr)
        raise ValueError(f"OpenAI request failed (HTTP {error.code}).") from error
    except Exception as error:
        print(f"[ARES RAG PROVIDER] {type(error).__name__}: {error}", file=sys.stderr)
        raise ValueError("OpenAI request failed. Check the server log.") from error
def embed_texts(texts):
    data=openai_request("embeddings",{"model":EMBEDDING_MODEL,"input":texts}).get("data",[])
    if len(data)!=len(texts): raise ValueError("Embedding provider returned an incomplete response.")
    return [row["embedding"] for row in data]
EMBEDDER = configured_embedder(embed_texts)
def parse_multipart(content_type, body):
    msg=BytesParser(policy=policy.default).parsebytes(("Content-Type: "+content_type+"\r\nMIME-Version: 1.0\r\n\r\n").encode()+body)
    if not msg.is_multipart(): raise ValueError("Expected multipart/form-data.")
    for part in msg.iter_parts():
        if part.get_param("name",header="content-disposition")=="file": return part.get_filename(),part.get_content_type(),part.get_payload(decode=True) or b""
    raise ValueError("No file field was provided.")

class AresHttpHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=DIRECTORY,**kwargs)
    def owner(self):
        token=SimpleCookie(self.headers.get("Cookie")).get("ares_session")
        return (token.value,False) if token and len(token.value)>=20 else (secrets.token_urlsafe(24),True)
    def json_response(self,status,value,new_session=None):
        data=json.dumps(value).encode(); self.send_response(status); self.send_header("Content-Type","application/json"); self.send_header("Content-Length",str(len(data)))
        if new_session: self.send_header("Set-Cookie",f"ares_session={new_session}; Path=/; SameSite=Lax; HttpOnly")
        self.end_headers(); self.wfile.write(data)
    def read_body(self,limit=MAX_UPLOAD_BYTES+65536):
        length=int(self.headers.get("Content-Length","0"))
        if length<1: raise ValueError("Request body is empty.")
        if length>limit: raise ValueError(f"Upload exceeds the {MAX_UPLOAD_MB} MB limit.")
        return self.rfile.read(length)
    def do_GET(self):
        path=urllib.parse.urlparse(self.path).path
        if path in ('/',''):
            self.send_response(302); self.send_header('Location','/web/index.html'); self.end_headers(); return
        if path=='/api/state':
            try:
                with open(os.path.join(DIRECTORY,'data','ares_live.json'),encoding='utf-8') as f: data=json.load(f)
            except Exception: data=DEFAULT_METRO_SCENARIO
            if any("latitude" not in node for node in data.get("nodes",[])): data["nodes"]=CHENNAI_NODES; data["roads"]=CHENNAI_ROADS
            node_labels={node["id"]:node["label"] for node in data.get("nodes",[])}
            for emergency in data.get("emergencies",[]):
                if emergency.get("nodeId") in node_labels: emergency["location"]=node_labels[emergency["nodeId"]]
            self.json_response(200,data); return
        if path=='/api/system': self.json_response(200,{"system":"ARES","version":"3.6 CHENNAI RAG","nodesCount":12,"roadsCount":16,"serverStatus":"ONLINE","embeddingBackend":getattr(EMBEDDER,'backend','custom'),"answerGenerationConfigured":LLM_CONFIG.enabled,"llmProvider":LLM_CONFIG.provider}); return
        if path=='/api/llm/health': self.json_response(200,answer_generation_status()); return
        if path=='/api/documents':
            owner,new=self.owner()
            self.json_response(200,{"documents":RAG_STORE.list_documents(owner)},owner if new else None); return
        return super().do_GET()
    def do_POST(self):
        path=urllib.parse.urlparse(self.path).path; owner,new=self.owner()
        try:
            if path=='/api/save_state':
                state=json.loads(self.read_body(5*1024*1024)); os.makedirs(os.path.join(DIRECTORY,'data'),exist_ok=True)
                with open(os.path.join(DIRECTORY,'data','ares_live.json'),'w',encoding='utf-8') as f: json.dump(state,f,indent=2)
                with open(os.path.join(DIRECTORY,'web','live_data.js'),'w',encoding='utf-8') as f: f.write('/* Auto-generated by ARES Tactical Engine */\nwindow.ARES_LIVE_DATA = '+json.dumps(state,indent=2)+';\n')
                self.json_response(200,{"status":"ok"},owner if new else None); return
            if path=='/api/reset_scenario': self.json_response(200,{"status":"ok","data":DEFAULT_METRO_SCENARIO},owner if new else None); return
            if path=='/api/documents/upload':
                filename,mime,content=parse_multipart(self.headers.get("Content-Type",""),self.read_body())
                if not filename or os.path.splitext(filename)[1].lower()!='.pdf': raise ValueError("Only PDF files are supported.")
                if mime not in ('application/pdf','application/octet-stream') or not content.startswith(b'%PDF-'): raise ValueError("The upload is not a valid PDF (MIME/signature check failed).")
                document=RAG_STORE.ingest(filename,content,owner,EMBEDDER)
                self.json_response(201,{"document":document,"status":document["status"]},owner if new else None); return
            if path=='/api/rag/chat':
                body=json.loads(self.read_body(128*1024)); question=str(body.get('question','')).strip(); ids=body.get('documentIds',[]); history=body.get('history',[])
                if not question or len(question)>6000: raise ValueError("Question must be between 1 and 6000 characters.")
                if not isinstance(ids,list) or not ids: raise ValueError("Select at least one uploaded document.")
                if not isinstance(history,list) or len(history)>12: raise ValueError("Invalid conversation history.")
                enforce_rag_rate_limit(owner)
                retrieval_query=resolve_follow_up(question,history)
                evidence=RAG_STORE.retrieve(retrieval_query,ids,owner,EMBEDDER)
                print(f"[ARES RAG] query document_ids={len(ids)} retrieved={len(evidence)} pages={[item['page'] for item in evidence]}", file=sys.stderr)
                if not evidence:
                    self.json_response(200,{"answer":NO_INFORMATION_RESPONSE,"citations":[],"grounded":False},owner if new else None); return
                generation_warning = None
                generated = False
                provider = LLM_CONFIG.provider
                try:
                    answer, provider = generate_grounded_answer(question, evidence, history)
                    generated = True
                except (LlmError, ValueError) as error:
                    generation_warning = f"AI answer generation is unavailable ({error}). Showing cited source passages instead."
                    answer = passage_answer(evidence, generation_warning)
                self.json_response(200,{"answer":answer,"citations":citations(evidence),"grounded":True,"generated":generated,"provider":provider,"generationWarning":generation_warning},owner if new else None); return
            self.send_error(404,"Endpoint not found")
        except (ValueError,RagError,json.JSONDecodeError) as error: self.json_response(400,{"error":str(error)},owner if new else None)
        except Exception as error:
            print("[ARES RAG ERROR]", repr(error), file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            self.json_response(500,{"error":"The server could not process this request. Check the server log."},owner if new else None)
    def do_DELETE(self):
        path=urllib.parse.urlparse(self.path).path; owner,new=self.owner()
        if path.startswith('/api/documents/'):
            deleted=RAG_STORE.delete(path.rsplit('/',1)[-1],owner)
            self.json_response(200 if deleted else 404,{"status":"deleted"} if deleted else {"error":"Document not found or is a managed source."},owner if new else None); return
        self.send_error(404,"Endpoint not found")
    def end_headers(self):
        self.send_header('Cache-Control','no-cache, no-store, must-revalidate'); self.send_header('Pragma','no-cache'); self.send_header('X-Content-Type-Options','nosniff'); self.send_header('X-Frame-Options','SAMEORIGIN'); self.send_header('Referrer-Policy','same-origin'); super().end_headers()
if __name__=='__main__':
    socketserver.TCPServer.allow_reuse_address=True
    with socketserver.TCPServer(("",PORT),AresHttpHandler) as httpd: print(f"[ARES SERVER] http://localhost:{PORT}"); httpd.serve_forever()
