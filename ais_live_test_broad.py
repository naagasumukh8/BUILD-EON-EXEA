"""
Broad AIS live test — run from project root: 
  python broad_ais_test.py
"""
import sys, os, asyncio, json, ssl

# Point at backend
BACKEND_DIR = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, BACKEND_DIR)
ORIG_DIR = os.getcwd()
os.chdir(BACKEND_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(ORIG_DIR, '.env'))

from config import get_settings

async def broad_test():
    settings = get_settings()
    api_key = settings.effective_ais_key
    if not api_key:
        print('NO AIS KEY CONFIGURED')
        return
    print('AIS key present: YES (length=' + str(len(api_key)) + ')')
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    # Arabian Sea + Persian Gulf broad bbox
    sub = {
        'APIKey': api_key,
        'BoundingBoxes': [[[10.0, 50.0], [30.0, 80.0]]],
        'FilterMessageTypes': ['PositionReport', 'ShipStaticData']
    }
    import websockets
    print('Connecting to wss://stream.aisstream.io/v0/stream ...')
    count = 0
    try:
        async with websockets.connect('wss://stream.aisstream.io/v0/stream', ssl=ssl_ctx, open_timeout=10) as ws:
            print('WebSocket connected OK')
            await ws.send(json.dumps(sub))
            deadline = asyncio.get_event_loop().time() + 25
            while asyncio.get_event_loop().time() < deadline:
                try:
                    raw = await asyncio.wait_for(ws.recv(), timeout=3.0)
                    msg = json.loads(raw)
                    if 'error' in msg:
                        print('AIS ERROR RESPONSE: ' + str(msg.get('error')))
                        break
                    mt = msg.get('MessageType', '')
                    meta = msg.get('MetaData', {})
                    mmsi = str(meta.get('MMSI', 'N/A'))
                    name = str(meta.get('ShipName', 'N/A')).strip()
                    lat = str(meta.get('latitude', 'N/A'))
                    lon = str(meta.get('longitude', 'N/A'))
                    ts = str(meta.get('time_utc', 'N/A'))
                    print('REAL AIS | MsgType=' + mt + ' | MMSI=' + mmsi + ' | Name=' + name + ' | Lat=' + lat + ' | Lon=' + lon + ' | time=' + ts[:25])
                    count += 1
                    if count >= 8:
                        break
                except asyncio.TimeoutError:
                    print('  (no msg in 3s, waiting...)')
                    continue
    except Exception as e:
        print('EXCEPTION: ' + type(e).__name__ + ' | ' + str(e)[:300])
    print('Total real AIS messages received: ' + str(count))

os.chdir(ORIG_DIR)
asyncio.run(broad_test())
