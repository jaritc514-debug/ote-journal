import urllib.request
import urllib.parse
import json
import os
import subprocess
from datetime import datetime

print("=== COT Data Updater ===")
print(f"Fetching data at {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")

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
    'Accept': 'application/json',
    'Referer': 'https://publicreporting.cftc.gov/',
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
            data = json.loads(res.read().decode('utf-8'))
        if not data:
            print(f"  EMPTY: {key}")
            continue
        r = data[0]
        nc_long_chg = float(r.get('change_in_noncomm_long_all', 0) or 0)
        nc_short_chg = float(r.get('change_in_noncomm_short_all', 0) or 0)
        nc_delta = nc_long_chg - nc_short_chg
        oi_delta = float(r.get('change_in_open_interest_all', 0) or 0)
        if not report_date and r.get('report_date_as_yyyy_mm_dd'):
            report_date = r['report_date_as_yyyy_mm_dd'].split('T')[0]
        results[key] = {'ncDelta': nc_delta, 'oiDelta': oi_delta}
        print(f"  OK: {key}")
    except Exception as e:
        print(f"  FAILED: {key} - {e}")

print(f"\nFetched: {len(results)}/{len(CONTRACTS)} contracts")
print(f"Report date: {report_date}")

if not results:
    print("\nERROR: No data fetched. Check your internet connection.")
    input("Press Enter to exit...")
    exit(1)

# Save JSON to the ote-journal-site folder
script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(script_dir, 'data')
os.makedirs(data_dir, exist_ok=True)

output = {
    'raw': results,
    'reportDate': report_date,
    'fetchTime': int(datetime.now().timestamp() * 1000)
}

json_path = os.path.join(data_dir, 'cot-data.json')
with open(json_path, 'w') as f:
    json.dump(output, f)

print(f"\nSaved to {json_path}")

# Git push
print("\nPushing to GitHub...")
try:
    subprocess.run(['git', 'add', 'data/cot-data.json'], cwd=script_dir, check=True)
    subprocess.run(['git', 'commit', '-m', f'Update COT data {report_date}'], cwd=script_dir, check=True)
    subprocess.run(['git', 'push'], cwd=script_dir, check=True)
    print("\nDone! Data is live on your ranker.")
except subprocess.CalledProcessError as e:
    print(f"\nGit error: {e}")
    print("Data was saved locally but not pushed to GitHub.")

input("\nPress Enter to close...")
