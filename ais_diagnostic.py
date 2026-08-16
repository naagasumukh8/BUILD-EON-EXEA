"""
AIS connection diagnostic — tests different bbox formats and a world-wide subscription.
"""
import sys, os, asyncio, json, ssl

BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.insert(0, BACKEND_DIR)
os.chdir(BACKEND_DIR)
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))
from config import get_settings
os.chdir(os.path.dirname(os.path.abspath(__file__)))

async def test_world_bbox():
    settings = get_settings()
    api_key = settings.effective_ais_key
    if not api_key:
        print('NO AIS KEY')
        return
    print('Key length=' + str(len(api_key)) + ' (masked)')

    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

    # World-wide subscription to verify data is flowing at all
    sub = {
        'APIKey': api_key,
        'BoundingBoxes': [[[-90, -180], [90, 180]]],
        'FilterMessageTypes': ['PositionReport']
    }
    import websockets
    print('Testing WORLD bbox...')
    count = 0
    try:
        async with websockets.connect('wss://stream.aisstream.io/v0/stream', ssl=ssl_ctx, open_timeout=12) as ws:
            print('Connected')
            await ws.send(json.dumps(sub))
            deadline = asyncio.get_event_loop().time() + 20
            while asyncio.get_event_loop().time() < deadline:
                try:
                    raw = await asyncio.wait_for(ws.recv(), timeout=2.0)
                    msg = json.loads(raw)
                    if 'error' in msg:
                        print('AIS SERVER ERROR: ' + str(msg.get('error')))
                        return
                    mt = msg.get('MessageType', '')
                    meta = msg.get('MetaData', {})
                    mmsi = str(meta.get('MMSI', '?'))
                    name = str(meta.get('ShipName', '?')).strip()
                    lat = str(meta.get('latitude', '?'))
                    lon = str(meta.get('longitude', '?'))
                    ts = str(meta.get('time_utc', '?'))[:20]
                    print('MSG | ' + mt + ' | MMSI=' + mmsi + ' | Name=' + name + ' | Lat=' + lat + ' | Lon=' + lon + ' | t=' + ts)
                    count += 1
                    if count >= 5:
                        break
                except asyncio.TimeoutError:
                    print('  2s timeout, waiting...')
    except Exception as e:
        print('EXCEPTION: ' + type(e).__name__ + ' | ' + str(e)[:400])
    print('Received: ' + str(count) + ' messages')
    if count == 0:
        print('DIAGNOSIS: API key is accepted (no auth error) but stream returns 0 messages.')
        print('Possible reasons:')
        print('  1. aisstream.io BETA service is currently offline or throttling this key')
        print('  2. The API key may have been revoked or exceeded quota')
        print('  3. Network-level filtering is blocking the data stream')

asyncio.run(test_world_bbox())
