# Maritime Decision Network — Python Server
# Routes: /api/health, /api/solve, /api/vessels, /api/optimize, /api/explain, /api/report

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add lib to path
sys.path.insert(0, os.path.dirname(__file__))
from lib.optimizer import run_full_optimization, generate_candidates, optimize_strategies
from lib.ai_service import explain_strategy, generate_report
from lib.data_providers import get_vessels, load_disruption_scenarios

PORT = int(os.environ.get("PORT", 3000))


def json_response(handler, data: dict, status: int = 200):
    body = json.dumps(data, default=str).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.end_headers()
    handler.wfile.write(body)


class MaritimeHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[{self.address_string()}] {format % args}")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            json_response(self, {
                "status": "ok",
                "service": "Maritime Decision Network API",
                "providers": {
                    "ai": "gemini" if os.environ.get("GEMINI_API_KEY") else ("openai" if os.environ.get("OPENAI_API_KEY") else "none"),
                    "ais": "aisstream" if os.environ.get("AISSTREAM_API_KEY") else "dev_fallback",
                    "weather": "open-meteo (free)",
                    "optimizer": "OR-Tools" if _check_ortools() else "greedy_heuristic"
                }
            })

        elif path == "/api/vessels":
            qs = parse_qs(parsed.query)
            product = qs.get("product", [None])[0]
            data = get_vessels(product_filter=product)
            json_response(self, data)

        elif path == "/api/disruptions":
            json_response(self, {"scenarios": load_disruption_scenarios()})

        elif path in ("/", "/index.html"):
            self._serve_file("index.html", "text/html")

        elif path.endswith(".css"):
            self._serve_file(path.lstrip("/"), "text/css")

        elif path.endswith(".js"):
            self._serve_file(path.lstrip("/"), "application/javascript")

        else:
            json_response(self, {"error": "Not found", "path": path}, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        content_length = int(self.headers.get("Content-Length", 0))
        body_raw = self.rfile.read(content_length) if content_length else b"{}"
        
        try:
            body = json.loads(body_raw.decode("utf-8"))
        except Exception:
            json_response(self, {"error": "Invalid JSON body"}, 400)
            return

        if path == "/api/solve":
            self._handle_solve(body)
        elif path == "/api/optimize":
            self._handle_optimize(body)
        elif path == "/api/explain":
            self._handle_explain(body)
        elif path == "/api/report":
            self._handle_report(body)
        else:
            json_response(self, {"error": "Not found", "path": path}, 404)

    def _handle_solve(self, body: dict):
        """Full pipeline: generate candidates + optimize + explain."""
        try:
            scenario = body.get("scenario", body)
            weights = body.get("weights")
            
            result = run_full_optimization(scenario, weights)
            
            # Add AI explanation if strategies found
            if result.get("strategies"):
                explanation = explain_strategy(result, scenario)
                result["ai_explanation"] = explanation
            
            json_response(self, result)
        except Exception as e:
            json_response(self, {"error": str(e)}, 500)

    def _handle_optimize(self, body: dict):
        """Just optimization — no AI explanation."""
        try:
            scenario = body.get("scenario", body)
            weights = body.get("weights")
            result = run_full_optimization(scenario, weights)
            json_response(self, result)
        except Exception as e:
            json_response(self, {"error": str(e)}, 500)

    def _handle_explain(self, body: dict):
        """AI explanation of an existing optimization result."""
        try:
            opt_result = body.get("optimization_result", {})
            scenario = body.get("scenario", {})
            explanation = explain_strategy(opt_result, scenario)
            json_response(self, explanation)
        except Exception as e:
            json_response(self, {"error": str(e)}, 500)

    def _handle_report(self, body: dict):
        """Generate executive decision report."""
        try:
            opt_result = body.get("optimization_result", {})
            scenario = body.get("scenario", {})
            explanation = body.get("explanation", {})
            report = generate_report(opt_result, scenario, explanation)
            json_response(self, {"report": report})
        except Exception as e:
            json_response(self, {"error": str(e)}, 500)

    def _serve_file(self, filepath: str, content_type: str):
        try:
            with open(filepath, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            json_response(self, {"error": f"File not found: {filepath}"}, 404)


def _check_ortools() -> bool:
    try:
        from ortools.linear_solver import pywraplp
        return True
    except ImportError:
        return False


if __name__ == "__main__":
    # Load .env if present
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())
    
    print(f"\n[Maritime Decision Network API]")
    print(f"   Running at http://localhost:{PORT}")
    print(f"   AI Provider: {'Gemini' if os.environ.get('GEMINI_API_KEY') else 'OpenAI' if os.environ.get('OPENAI_API_KEY') else 'None (add GEMINI_API_KEY to .env)'}")
    print(f"   AIS Provider: {'aisstream.io' if os.environ.get('AISSTREAM_API_KEY') else 'Dev fallback (add AISSTREAM_API_KEY to .env)'}")
    print(f"   OR-Tools: {'Available' if _check_ortools() else 'Not installed -- using greedy solver'}\n")
    
    server = HTTPServer(("0.0.0.0", PORT), MaritimeHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
