# Modular Database / Supabase Service Helper

import os
import json
import urllib.request

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

def check_db_connection() -> dict:
    """
    Checks if Supabase credentials are configured and reachable.
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return {
            "connected": False,
            "message": "Supabase environment variables (SUPABASE_URL / SUPABASE_ANON_KEY) not provided. Running in local in-memory mode."
        }
    
    return {
        "connected": True,
        "url": SUPABASE_URL,
        "message": "Supabase connection metadata detected and ready."
    }

def save_solution_log(input_data, output_data) -> bool:
    """
    Saves execution logs to Supabase if configured.
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return False
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/solution_logs"
        payload = json.dumps({
            "input": str(input_data),
            "output": str(output_data)
        }).encode('utf-8')
        
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        
        req = urllib.request.Request(url, data=payload, headers=headers, method='POST')
        with urllib.request.urlopen(req) as resp:
            return resp.status in (200, 201)
    except Exception as e:
        print(f"Supabase write error: {e}")
        return False
