import http.server
import socketserver
import json
import os
import urllib.parse
from datetime import datetime

# Import modular backend libraries
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib.solution_logic import process_solution
from lib.db_service import check_db_connection

PORT = int(os.environ.get("PORT", 8000))

class PolyinnovaeHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            db_status = check_db_connection()
            response = {
                "status": "online",
                "service": "Polyinnovae Hackathon API",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "database": db_status,
                "environment": os.environ.get("ENV", "development")
            }
            self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))
            return
        
        # Serve static files for standard GET requests
        return super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == '/api/solve':
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)
            
            try:
                if body_bytes:
                    data = json.loads(body_bytes.decode('utf-8'))
                else:
                    data = {}
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "error": f"Invalid JSON payload: {str(e)}"}).encode('utf-8'))
                return

            # Execute modular solution logic
            result = process_solution(data)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result, indent=2).encode('utf-8'))
            return

        self.send_response(404)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

if __name__ == '__main__':
    handler = PolyinnovaeHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        httpd.serve_forever()
