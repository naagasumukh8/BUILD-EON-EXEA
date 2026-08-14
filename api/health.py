from http.server import BaseHTTPRequestHandler
import json
import os
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "status": "online",
            "service": "Polyinnovae Hackathon API",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "environment": "vercel-production"
        }
        self.wfile.write(json.dumps(response).encode('utf-8'))
        return
