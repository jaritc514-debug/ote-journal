import urllib.request
import urllib.parse
import json
import os
import time
from datetime import datetime

BASE = 'https://publicreporting.cftc.gov/resource/6dca-aqww.json'

CONTRACTS = {
    'AUD': '232741', 'GBP': '096742', 'CAD': '090741',
    'EUR': '099741', 'JPY': '097741', 'NZD': '112741',
    'CHF': '092741', 'USD': '098662',
    'NQ': '209742', 'YM': '124603', 'ES': '13874A',
    'GC': '088691', 'SI': '084691',
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Origin': 'https://publicreporting.cftc.gov',
    'Referer': 'https://publicreporting.cftc.gov/',
    'X-App-Token': 'MkxBdjJMQjJtWlhkb3Q4dDlFZW1GZFE6MQ==',
}

results = {}
report_date = ''

for key, code in CONTRACTS.items():
    params = urllib.parse.urlencode({
        '$where': f"cftc_contract_market_code='{code}'",
        '$order': 'report_date_as_yyyy_mm_dd DESC',
        '$limit': '2'
    })
    url = f"{BASE}?{params}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as res:
            raw_data = res.read()
            data = json.loads(raw_data.decode('utf-8'))
        if not data:
            print(f"EMPTY: {key}")
            continue
        r = data[0]
        nc_long_chg = float(r.get('change_in_noncomm_long_all', 0) or 0)
        nc_short_chg = float(r.get('change_in_noncomm_short_all', 0) or 0)
        nc_delta = nc_long_chg - nc_short_chg
        oi_delta = float(r.get('change_in_open_interest_all', 0) or 0)
        if not report_date and r.get('report_date_as_yyyy_mm_dd'):
            report_date = r['report_date_as_yyyy_mm_dd'].split('T')[0]
        results[key] = {'ncDelta': nc_delta, 'oiDelta': oi_delta}
        print(f"OK: {key} | ncDelta={nc_delta} | oiDelta={oi_delta}")
    except Exception as e:
        print(f"FAILED: {key} - {e}")
    time.sleep(0.2)

print(f"\nTotal fetched: {len(results)}/{len(CONTRACTS)}")

output = {
    'raw': results,
    'reportDate': report_date,
    'fetchTime': int(datetime.utcnow().timestamp() * 1000)
}

os.makedirs('data', exist_ok=True)
with open('data/cot-data.json', 'w') as f:
    json.dump(output, f)

print(f"Saved to data/cot-data.json")
if not results:
    raise SystemExit("ERROR: No data fetched - failing the action")
