import urllib.request
import json
import os
from datetime import datetime

BASE = 'https://publicreporting.cftc.gov/resource/6dca-aqww.json'

CONTRACTS = {
    'AUD': '232741', 'GBP': '096742', 'CAD': '090741',
    'EUR': '099741', 'JPY': '097741', 'NZD': '112741',
    'CHF': '092741', 'USD': '098662',
    'NQ': '209742', 'YM': '124603', 'ES': '13874A',
    'GC': '088691', 'SI': '084691',
}

results = {}
report_date = ''

headers = {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json',
}

for key, code in CONTRACTS.items():
    url = f"{BASE}?$where=cftc_contract_market_code='{code}'&$order=report_date_as_yyyy_mm_dd DESC&$limit=2"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as res:
            data = json.loads(res.read().decode())
        if not data:
            continue
        r = data[0]
        nc_long_chg = float(r.get('change_in_noncomm_long_all', 0) or 0)
        nc_short_chg = float(r.get('change_in_noncomm_short_all', 0) or 0)
        nc_delta = nc_long_chg - nc_short_chg
        oi_delta = float(r.get('change_in_open_interest_all', 0) or 0)
        if not report_date and r.get('report_date_as_yyyy_mm_dd'):
            report_date = r['report_date_as_yyyy_mm_dd'].split('T')[0]
        results[key] = {'ncDelta': nc_delta, 'oiDelta': oi_delta}
        print(f"OK: {key}")
    except Exception as e:
        print(f"FAILED: {key} - {e}")

output = {
    'raw': results,
    'reportDate': report_date,
    'fetchTime': int(datetime.utcnow().timestamp() * 1000)
}

os.makedirs('data', exist_ok=True)
with open('data/cot-data.json', 'w') as f:
    json.dump(output, f)

print(f"\nDone. {len(results)} contracts fetched. Report date: {report_date}")
