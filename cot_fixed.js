// worker.js
var worker_default = {
  async fetch(request) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>COT Ranker v2</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #080808; --bg2: #0f0f0f; --bg3: #161616; --bg4: #1e1e1e;
  --border: #222; --border2: #2a2a2a;
  --gold: #c9a84c; --gold2: #e0b86a;
  --green: #22c55e; --green-dim: rgba(34,197,94,0.12); --green-border: rgba(34,197,94,0.25);
  --red: #ef4444; --red-dim: rgba(239,68,68,0.12); --red-border: rgba(239,68,68,0.25);
  --amber: #f59e0b; --amber-dim: rgba(245,158,11,0.12);
  --blue: #3b82f6; --blue-dim: rgba(59,130,246,0.12); --blue-border: rgba(59,130,246,0.25);
  --gray: #404040; --text: #e8e8e8; --text2: #888; --text3: #555;
  --radius: 10px; --radius-sm: 6px;
}
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; font-size:13px; }

/* HEADER */
.header { background:var(--bg2); border-bottom:1px solid var(--border); padding:0 32px; display:flex; align-items:center; justify-content:space-between; height:64px; position:sticky; top:0; z-index:100; }
.logo { display:flex; align-items:baseline; gap:10px; }
.logo-text { font-family:'Bebas Neue',sans-serif; font-size:26px; letter-spacing:2px; color:var(--gold); }
.logo-sub { font-size:11px; color:var(--text3); letter-spacing:1.5px; text-transform:uppercase; }
.logo-version { font-size:10px; color:var(--gold); background:rgba(201,168,76,0.15); border:1px solid rgba(201,168,76,0.3); border-radius:4px; padding:2px 6px; font-family:'DM Mono',monospace; margin-left:4px; }
.header-right { display:flex; align-items:center; gap:12px; }
.report-badge { background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:6px 12px; font-family:'DM Mono',monospace; font-size:11px; color:var(--text2); }
.report-badge span { color:var(--gold); }
.btn-fetch { background:var(--gold); color:#000; border:none; padding:10px 20px; border-radius:var(--radius-sm); font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:7px; }
.btn-fetch:hover { background:var(--gold2); transform:translateY(-1px); }
.btn-fetch:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
.btn-secondary { background:transparent; color:var(--text2); border:1px solid var(--border2); padding:10px 16px; border-radius:var(--radius-sm); font-family:'DM Sans',sans-serif; font-size:12px; font-weight:500; cursor:pointer; transition:all 0.2s; }
.btn-secondary:hover { border-color:var(--gold); color:var(--gold); }
.cached-note { font-size:10px; color:var(--text3); font-family:'DM Mono',monospace; }

/* STATUS */
.status-bar { padding:10px 32px; font-size:12px; display:none; align-items:center; gap:8px; }
.status-bar.show { display:flex; }
.status-bar.loading { background:rgba(201,168,76,0.08); border-bottom:1px solid rgba(201,168,76,0.15); color:var(--gold); }
.status-bar.success { background:rgba(34,197,94,0.08); border-bottom:1px solid rgba(34,197,94,0.15); color:var(--green); }
.status-bar.error { background:rgba(239,68,68,0.08); border-bottom:1px solid rgba(239,68,68,0.15); color:var(--red); }
.spinner { width:14px; height:14px; border:2px solid rgba(201,168,76,0.3); border-top-color:var(--gold); border-radius:50%; animation:spin 0.7s linear infinite; flex-shrink:0; }
@keyframes spin { to { transform:rotate(360deg); } }

/* CURRENCY STRIP */
.scores-strip { background:var(--bg2); border-bottom:1px solid var(--border); padding:12px 32px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.scores-label { font-size:10px; color:var(--text3); letter-spacing:1.5px; text-transform:uppercase; margin-right:4px; }
.currency-chip { display:flex; align-items:center; gap:6px; background:var(--bg3); border:1px solid var(--border2); border-radius:20px; padding:5px 12px; font-size:12px; }
.currency-chip.bull { border-color:var(--green-border); background:var(--green-dim); }
.currency-chip.bear { border-color:var(--red-border); background:var(--red-dim); }
.chip-name { font-weight:600; font-size:11px; letter-spacing:0.5px; }
.chip-score { font-family:'DM Mono',monospace; font-size:12px; font-weight:600; }
.chip-score.pos { color:var(--green); } .chip-score.neg { color:var(--red); } .chip-score.zero { color:var(--text3); }

/* CONVICTION LEGEND */
.legend-strip { background:var(--bg2); border-bottom:1px solid var(--border); padding:8px 32px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.legend-label { font-size:10px; color:var(--text3); letter-spacing:1.5px; text-transform:uppercase; margin-right:4px; }
.legend-item { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--text2); }

/* FILTERS */
.filters { padding:16px 32px; display:flex; align-items:center; gap:12px; border-bottom:1px solid var(--border); flex-wrap:wrap; }
.filter-tabs { display:flex; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:3px; gap:2px; }
.filter-tab { padding:6px 14px; border:none; background:transparent; color:var(--text2); font-family:'DM Sans',sans-serif; font-size:11px; font-weight:500; letter-spacing:0.5px; cursor:pointer; border-radius:4px; transition:all 0.15s; text-transform:uppercase; }
.filter-tab.active { background:var(--gold); color:#000; }
.filter-tab:hover:not(.active) { color:var(--text); }
.results-count { margin-left:auto; font-size:11px; color:var(--text3); }

/* MAIN */
.main { padding:24px 32px; }
.section-header { display:flex; align-items:center; gap:12px; margin-bottom:16px; margin-top:8px; }
.section-title { font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:2px; color:var(--text2); }
.section-count { background:var(--bg3); border:1px solid var(--border2); border-radius:12px; padding:2px 10px; font-size:11px; color:var(--text3); font-family:'DM Mono',monospace; }
.section-divider { flex:1; height:1px; background:var(--border); }
.cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:12px; margin-bottom:32px; }
.assets-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:10px; margin-bottom:32px; }

/* CARDS */
.card { background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius); padding:18px; transition:all 0.2s; position:relative; overflow:hidden; animation:fadeIn 0.3s ease both; }
@keyframes fadeIn { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
.card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.3); }
.card.bull { border-color:var(--green-border); background:linear-gradient(135deg,var(--bg3) 0%,rgba(34,197,94,0.04) 100%); }
.card.bear { border-color:var(--red-border); background:linear-gradient(135deg,var(--bg3) 0%,rgba(239,68,68,0.04) 100%); }
.card.neutral { opacity:0.6; }
.card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; border-radius:var(--radius) var(--radius) 0 0; }
.card.bull::before { background:linear-gradient(90deg,var(--green),transparent); }
.card.bear::before { background:linear-gradient(90deg,var(--red),transparent); }
.card.neutral::before { background:linear-gradient(90deg,var(--gray),transparent); }

/* Edge glow */
.card.edge-glow.bull { border-color:rgba(34,197,94,0.7); box-shadow:0 0 0 1px rgba(34,197,94,0.4),0 0 20px rgba(34,197,94,0.25),0 0 40px rgba(34,197,94,0.1); }
.card.edge-glow.bull::before { height:4px; background:linear-gradient(90deg,var(--green),rgba(34,197,94,0.3)); }
.card.edge-glow.bear { border-color:rgba(239,68,68,0.7); box-shadow:0 0 0 1px rgba(239,68,68,0.4),0 0 20px rgba(239,68,68,0.25),0 0 40px rgba(239,68,68,0.1); }
.card.edge-glow.bear::before { height:4px; background:linear-gradient(90deg,var(--red),rgba(239,68,68,0.3)); }

/* A-grade extra glow */
.card.a-grade.bull { box-shadow:0 0 0 1px rgba(34,197,94,0.6),0 0 30px rgba(34,197,94,0.35),0 0 60px rgba(34,197,94,0.15); }
.card.a-grade.bear { box-shadow:0 0 0 1px rgba(239,68,68,0.6),0 0 30px rgba(239,68,68,0.35),0 0 60px rgba(239,68,68,0.15); }

.card-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:6px; }
.card-pair { font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:1.5px; line-height:1; }
.card-regime { font-size:10px; color:var(--text3); margin-top:2px; letter-spacing:0.5px; }
.card-right { display:flex; flex-direction:column; align-items:flex-end; gap:4px; }
.card-score { font-family:'DM Mono',monospace; font-size:22px; font-weight:600; line-height:1; }
.card.bull .card-score { color:var(--green); } .card.bear .card-score { color:var(--red); } .card.neutral .card-score { color:var(--text3); }

/* BADGES */
.badge { padding:3px 9px; border-radius:12px; font-size:10px; font-weight:600; letter-spacing:0.5px; text-transform:uppercase; white-space:nowrap; }
.badge-bull { background:var(--green-dim); color:var(--green); border:1px solid var(--green-border); }
.badge-bear { background:var(--red-dim); color:var(--red); border:1px solid var(--red-border); }
.badge-neu { background:var(--bg4); color:var(--text3); border:1px solid var(--border2); }
.badge-strong-bull { background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid rgba(34,197,94,0.3); }
.badge-strong-bear { background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3); }
.badge-moderate { background:var(--amber-dim); color:var(--amber); border:1px solid rgba(245,158,11,0.3); }
.badge-mixed { background:var(--bg4); color:var(--text3); border:1px solid var(--border2); }
.badge-edge { background:var(--gold); color:#000; border:1px solid var(--gold2); font-size:11px; letter-spacing:1px; }
.badge-watch { background:var(--amber-dim); color:var(--amber); border:1px solid rgba(245,158,11,0.3); }
.badge-noedge { background:var(--bg4); color:var(--text3); border:1px solid var(--border2); }

/* CONVICTION GRADE BADGES */
.badge-grade-a { background:rgba(34,197,94,0.2); color:#4ade80; border:1px solid rgba(34,197,94,0.5); font-size:11px; letter-spacing:1px; }
.badge-grade-b { background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.35); font-size:11px; }
.badge-grade-c { background:var(--amber-dim); color:var(--amber); border:1px solid rgba(245,158,11,0.3); font-size:11px; }
.badge-grade-n { background:var(--bg4); color:var(--text3); border:1px solid var(--border2); font-size:11px; }

/* STATS */
.card-stats { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
.stat-box { background:var(--bg4); border:1px solid var(--border); border-radius:var(--radius-sm); padding:8px 10px; }
.stat-label { font-size:9px; color:var(--text3); letter-spacing:1px; text-transform:uppercase; margin-bottom:3px; }
.stat-value { font-family:'DM Mono',monospace; font-size:13px; font-weight:500; }
.stat-value.pos { color:var(--green); } .stat-value.neg { color:var(--red); } .stat-value.neu { color:var(--text2); }
.stat-oi { display:flex; align-items:center; gap:4px; }
.oi-arrow { font-size:10px; } .oi-arrow.up { color:var(--green); } .oi-arrow.down { color:var(--red); }

/* DIVERGENCE BAR */
.div-bar-wrap { margin-bottom:10px; }
.div-bar-label { display:flex; justify-content:space-between; font-size:9px; color:var(--text3); letter-spacing:1px; text-transform:uppercase; margin-bottom:4px; }
.div-bar-track { height:4px; background:var(--border); border-radius:2px; overflow:hidden; }
.div-bar-fill { height:100%; border-radius:2px; transition:width 0.5s ease; }
.bull .div-bar-fill { background:linear-gradient(90deg,rgba(34,197,94,0.4),var(--green)); }
.bear .div-bar-fill { background:linear-gradient(90deg,rgba(239,68,68,0.4),var(--red)); }

.score-bar { height:3px; background:var(--border); border-radius:2px; margin-bottom:12px; overflow:hidden; }
.score-bar-fill { height:100%; border-radius:2px; transition:width 0.5s ease; }
.bull .score-bar-fill { background:var(--green); } .bear .score-bar-fill { background:var(--red); } .neutral .score-bar-fill { background:var(--gray); }

.card-footer { display:flex; align-items:center; justify-content:space-between; padding-top:10px; border-top:1px solid var(--border); }
.card-currencies { font-size:11px; color:var(--text3); font-family:'DM Mono',monospace; }
.card-currencies span { color:var(--text2); font-weight:500; }

.score-delta-pill { display:inline-flex; align-items:center; gap:3px; font-family:'DM Mono',monospace; font-size:10px; font-weight:600; padding:2px 7px; border-radius:10px; white-space:nowrap; }
.score-delta-pill.up   { background:rgba(34,197,94,0.12); color:var(--green); border:1px solid rgba(34,197,94,0.25); }
.score-delta-pill.down { background:rgba(239,68,68,0.12); color:var(--red);   border:1px solid rgba(239,68,68,0.25); }
.score-delta-pill.flat { background:var(--bg4);           color:var(--text3); border:1px solid var(--border2); }

/* ASSET CARD */
.asset-card { background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius); padding:16px 18px; display:flex; align-items:center; justify-content:space-between; transition:all 0.2s; animation:fadeIn 0.3s ease both; }
.asset-card:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(0,0,0,0.2); }
.asset-card.bull { border-color:var(--green-border); background:linear-gradient(135deg,var(--bg3),rgba(34,197,94,0.04)); }
.asset-card.bear { border-color:var(--red-border); background:linear-gradient(135deg,var(--bg3),rgba(239,68,68,0.04)); }
.asset-left { display:flex; flex-direction:column; gap:4px; }
.asset-name { font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:1px; }
.asset-regime { font-size:10px; color:var(--text3); }
.asset-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; }
.asset-score { font-family:'DM Mono',monospace; font-size:20px; font-weight:600; }
.asset-card.bull .asset-score { color:var(--green); } .asset-card.bear .asset-score { color:var(--red); }

/* EMPTY + MISC */
.empty-state { text-align:center; padding:80px 40px; color:var(--text3); }
.empty-icon { font-size:48px; margin-bottom:16px; opacity:0.3; }
.empty-title { font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:2px; color:var(--text2); margin-bottom:8px; }
.empty-text { font-size:13px; line-height:1.6; max-width:400px; margin:0 auto; }
.noedge-toggle { background:transparent; border:1px dashed var(--border2); color:var(--text3); padding:8px 16px; border-radius:var(--radius-sm); font-family:'DM Sans',sans-serif; font-size:11px; cursor:pointer; transition:all 0.2s; margin-bottom:16px; }
.noedge-toggle:hover { border-color:var(--text3); color:var(--text2); }

/* INPUT PANEL */
.inp { background:var(--bg4); border:1px solid var(--border2); border-radius:4px; color:var(--text); padding:6px 8px; font-size:12px; outline:none; width:100%; }
.inp:focus { border-color:var(--gold); }
/* MOMENTUM */
.mom-up   { color:var(--green); letter-spacing:-1px; }
.mom-down { color:var(--red);   letter-spacing:-1px; }
.mom-flat { color:var(--text3); letter-spacing:-1px; }
</style>
</head>
<body>

<div class="header">
  <div class="logo">
    <span class="logo-text">COT Ranker</span>
    <span class="logo-sub">Weekly Bias</span>
    <span class="logo-version">v2</span>
  </div>
  <div class="header-right">
    <div class="report-badge" id="report-badge"><span id="report-date">No data loaded</span></div>
    <div class="report-badge" id="fetch-badge" style="display:none">Last fetched: <span id="fetch-time">\u2014</span></div>
    <span class="cached-note" id="cached-note"></span>
    <button class="btn-secondary" onclick="clearCache()">Clear Cache</button>
    <button class="btn-secondary" onclick="toggleInputPanel()">\u270F Enter Data</button>
    <button class="btn-fetch" id="btn-fetch" onclick="fetchCOT()"><span>\u21BB</span> Fetch Latest</button>
  </div>
</div>

<div class="status-bar" id="status-bar">
  <div class="spinner" id="spinner" style="display:none"></div>
  <span id="status-text"></span>
</div>

<!-- INPUT PANEL -->
<div id="input-panel" style="background:var(--bg2);border-bottom:1px solid var(--border2);padding:16px 32px;display:none">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
    <span style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:2px;color:var(--gold)">Weekly COT Inputs</span>
    <span style="font-size:11px;color:var(--text3)">\u2014 Enter Net Change and OI Delta from your TradingView indicator</span>
  </div>
  <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:10px;margin-bottom:14px">
    <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:var(--gold);font-weight:600;letter-spacing:1px">GBP</span><input type="number" id="nc-GBP" placeholder="Net Change" class="inp"><input type="number" id="oi-GBP" placeholder="OI Delta" class="inp"></div>
    <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:var(--gold);font-weight:600;letter-spacing:1px">EUR</span><input type="number" id="nc-EUR" placeholder="Net Change" class="inp"><input type="number" id="oi-EUR" placeholder="OI Delta" class="inp"></div>
    <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:var(--gold);font-weight:600;letter-spacing:1px">AUD</span><input type="number" id="nc-AUD" placeholder="Net Change" class="inp"><input type="number" id="oi-AUD" placeholder="OI Delta" class="inp"></div>
    <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:var(--gold);font-weight:600;letter-spacing:1px">NZD</span><input type="number" id="nc-NZD" placeholder="Net Change" class="inp"><input type="number" id="oi-NZD" placeholder="OI Delta" class="inp"></div>
    <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:var(--gold);font-weight:600;letter-spacing:1px">CAD</span><input type="number" id="nc-CAD" placeholder="Net Change" class="inp"><input type="number" id="oi-CAD" placeholder="OI Delta" class="inp"></div>
    <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:var(--gold);font-weight:600;letter-spacing:1px">CHF</span><input type="number" id="nc-CHF" placeholder="Net Change" class="inp"><input type="number" id="oi-CHF" placeholder="OI Delta" class="inp"></div>
    <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:var(--gold);font-weight:600;letter-spacing:1px">JPY</span><input type="number" id="nc-JPY" placeholder="Net Change" class="inp"><input type="number" id="oi-JPY" placeholder="OI Delta" class="inp"></div>
    <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:var(--gold);font-weight:600;letter-spacing:1px">USD</span><input type="number" id="nc-USD" placeholder="Net Change" class="inp"><input type="number" id="oi-USD" placeholder="OI Delta" class="inp"></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:14px">
    <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:var(--gold);font-weight:600;letter-spacing:1px">NQ1!</span><input type="number" id="nc-NQ" placeholder="Net Change" class="inp"><input type="number" id="oi-NQ" placeholder="OI Delta" class="inp"></div>
    <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:var(--gold);font-weight:600;letter-spacing:1px">YM1!</span><input type="number" id="nc-YM" placeholder="Net Change" class="inp"><input type="number" id="oi-YM" placeholder="OI Delta" class="inp"></div>
    <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:var(--gold);font-weight:600;letter-spacing:1px">ES1!</span><input type="number" id="nc-ES" placeholder="Net Change" class="inp"><input type="number" id="oi-ES" placeholder="OI Delta" class="inp"></div>
    <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:var(--gold);font-weight:600;letter-spacing:1px">GC1!</span><input type="number" id="nc-GC" placeholder="Net Change" class="inp"><input type="number" id="oi-GC" placeholder="OI Delta" class="inp"></div>
    <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:var(--gold);font-weight:600;letter-spacing:1px">SI1!</span><input type="number" id="nc-SI" placeholder="Net Change" class="inp"><input type="number" id="oi-SI" placeholder="OI Delta" class="inp"></div>
  </div>
  <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    <div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:10px;color:var(--text3);letter-spacing:1px">REPORT DATE</span><input type="text" id="input-date" placeholder="e.g. 2026-03-31" class="inp" style="width:140px"></div>
    <button onclick="calcFromInputs()" style="background:var(--gold);color:#000;border:none;padding:8px 20px;border-radius:4px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;cursor:pointer;margin-top:16px">Calculate Rankings</button>
    <button onclick="saveInputsToCache()" class="btn-secondary" style="margin-top:16px">Save Inputs</button>
    <button onclick="loadInputsFromCache()" class="btn-secondary" style="margin-top:16px">Load Saved</button>
  </div>
</div>

<!-- CURRENCY SCORES STRIP -->
<div class="scores-strip" id="scores-strip" style="display:none">
  <span class="scores-label">Currency Scores</span>
  <div id="currency-chips" style="display:flex;gap:8px;flex-wrap:wrap"></div>
</div>

<!-- CONVICTION LEGEND -->
<div class="legend-strip" id="legend-strip" style="display:none">
  <span class="legend-label">Conviction</span>
  <div class="legend-item"><span class="badge badge-grade-a">A-GRADE</span><span>Both sides extreme (divergence 6-8)</span></div>
  <div class="legend-item"><span class="badge badge-grade-b">B-GRADE</span><span>One extreme, one moderate (4-5)</span></div>
  <div class="legend-item"><span class="badge badge-grade-c">C-GRADE</span><span>Both moderate (2-3)</span></div>
  <div class="legend-item"><span class="badge badge-grade-n">NOISE</span><span>Weak divergence (0-1)</span></div>
</div>

<!-- FILTERS -->
<div class="filters" id="filters-bar" style="display:none">
  <div class="filter-tabs">
    <button class="filter-tab active" onclick="setFilter('all',this)">All</button>
    <button class="filter-tab" onclick="setFilter('majors',this)">Majors</button>
    <button class="filter-tab" onclick="setFilter('fx',this)">FX Crosses</button>
    <button class="filter-tab" onclick="setFilter('indices',this)">Indices</button>
    <button class="filter-tab" onclick="setFilter('metals',this)">Metals</button>
  </div>
  <span class="results-count" id="results-count"></span>
</div>

<div class="main" id="main-content">
  <div class="empty-state">
    <div class="empty-icon">\u{1F4E1}</div>
    <div class="empty-title">Ready to Fetch</div>
    <div class="empty-text">Click "Fetch Latest" to pull the most recent CFTC Commitments of Traders report and calculate weekly bias rankings.</div>
  </div>
</div>

<script>
// \u2500\u2500\u2500 CONTRACTS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const CONTRACTS = {
  AUD:{code:'232741',name:'AUD'},GBP:{code:'096742',name:'GBP'},CAD:{code:'090741',name:'CAD'},
  EUR:{code:'099741',name:'EUR'},JPY:{code:'097741',name:'JPY'},NZD:{code:'112741',name:'NZD'},
  CHF:{code:'092741',name:'CHF'},USD:{code:'098662',name:'USD'},
  NQ:{code:'209742',name:'NQ1!'},YM:{code:'124603',name:'YM1!'},ES:{code:'13874A',name:'ES1!'},
  GC:{code:'088691',name:'GC1!'},SI:{code:'084691',name:'SI1!'},
};
const CURRENCY_KEYS = ['AUD','GBP','CAD','EUR','JPY','NZD','CHF','USD'];
const ASSET_KEYS    = ['NQ','YM','ES','GC','SI'];
const MAX_HISTORY   = 8;

// \u2500\u2500\u2500 PAIR DEFINITIONS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Majors: [pair, futuresKey, direction]
// direction: 'base' = futures already match pair direction (GBPUSD uses GBP futures)
//            'quote' = futures are inverted (USDCAD uses CAD futures, must flip NC)
const MAJOR_DEFS = [
  {pair:'GBPUSD', key:'GBP', dir:'base'},
  {pair:'AUDUSD', key:'AUD', dir:'base'},
  {pair:'EURUSD', key:'EUR', dir:'base'},
  {pair:'NZDUSD', key:'NZD', dir:'base'},
  {pair:'USDCAD', key:'CAD', dir:'quote'},
  {pair:'USDCHF', key:'CHF', dir:'quote'},
  {pair:'USDJPY', key:'JPY', dir:'quote'},
];

// Crosses: [pair, baseKey, quoteKey]
const CROSS_DEFS = [
  ['EURGBP','EUR','GBP'],['EURAUD','EUR','AUD'],['EURNZD','EUR','NZD'],
  ['EURCAD','EUR','CAD'],['EURCHF','EUR','CHF'],['EURJPY','EUR','JPY'],
  ['GBPAUD','GBP','AUD'],['GBPNZD','GBP','NZD'],['GBPCAD','GBP','CAD'],
  ['GBPCHF','GBP','CHF'],['GBPJPY','GBP','JPY'],
  ['AUDNZD','AUD','NZD'],['AUDCAD','AUD','CAD'],['AUDCHF','AUD','CHF'],['AUDJPY','AUD','JPY'],
  ['NZDCAD','NZD','CAD'],['NZDCHF','NZD','CHF'],['NZDJPY','NZD','JPY'],
  ['CADCHF','CAD','CHF'],['CADJPY','CAD','JPY'],['CHFJPY','CHF','JPY'],
];

const EDGE_THRESHOLD=4, WATCH_THRESHOLD=2;
let currentData=null, currentFilter='all';

// \u2500\u2500\u2500 HISTORY \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function saveHistory(snapshot) {
  let h=[];
  try{h=JSON.parse(localStorage.getItem('cot_history_v2')||'[]');}catch(e){}
  if(h.length>0&&h[0].date===snapshot.date) return;
  h.unshift(snapshot);
  if(h.length>MAX_HISTORY) h=h.slice(0,MAX_HISTORY);
  localStorage.setItem('cot_history_v2',JSON.stringify(h));
}
function getHistory(){ try{return JSON.parse(localStorage.getItem('cot_history_v2')||'[]');}catch(e){return[];} }

// \u2500\u2500\u2500 MOMENTUM \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function getMomentum(currency) {
  const h=getHistory();
  if(h.length<2) return {streak:0,bonus:0,arrows:'',label:''};
  const w1=h[1]?.scores?.['ccy_'+currency];
  const w2=h[2]?.scores?.['ccy_'+currency];
  const w3=h[3]?.scores?.['ccy_'+currency];
  if(w1===undefined) return {streak:0,bonus:0,arrows:'',label:''};
  const bull1=w1>0, bear1=w1<0;
  if(w2!==undefined&&w3!==undefined){
    if(bull1&&w2>0&&w3>0) return {streak:3,bonus:1,arrows:'\u21911\u21911\u21911',label:'3W Bull'};
    if(bear1&&w2<0&&w3<0) return {streak:-3,bonus:-1,arrows:'\u21931\u21931\u21931',label:'3W Bear'};
  }
  if(w2!==undefined){
    if(bull1&&w2>0) return {streak:2,bonus:0.5,arrows:'\u21911\u21911',label:'2W Bull'};
    if(bear1&&w2<0) return {streak:-2,bonus:-0.5,arrows:'\u21931\u21931',label:'2W Bear'};
  }
  if(bull1) return {streak:1,bonus:0,arrows:'\u21911',label:'1W Bull'};
  if(bear1) return {streak:-1,bonus:0,arrows:'\u21931',label:'1W Bear'};
  return {streak:0,bonus:0,arrows:'\u2192',label:'Neutral'};
}

function momTag(currency, mom) {
  if(!mom||!mom.arrows) return '';
  var cls=mom.streak>0?'mom-up':mom.streak<0?'mom-down':'mom-flat';
  return '<span class="'+cls+'" style="font-size:11px;font-family:DM Mono,monospace" title="'+mom.label+'">'+currency+' '+mom.arrows+'</span>';
}

function scoreDeltaPill(current, histKey) {
  const h=getHistory();
  if(h.length<2) return '';
  const prev=h[1]?.scores?.[histKey];
  if(prev===undefined) return '';
  const diff=current-prev;
  const sign=diff>0?'+':'', cls=diff>0?'up':diff<0?'down':'flat', arrow=diff>0?'\u2191':diff<0?'\u2193':'\u2192';
  return \`<span class="score-delta-pill \${cls}">\${arrow} \${sign}\${diff} vs last week</span>\`;
}

// \u2500\u2500\u2500 FETCH \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
async function fetchCOT() {
  const btn=document.getElementById('btn-fetch');
  btn.disabled=true;
  showStatus('loading','Fetching latest CFTC report...');
  try {
    const cached=localStorage.getItem('cot_data_v2');
    const cachedTime=localStorage.getItem('cot_fetch_time_v2');
    const sixHours=6*60*60*1000;
    if(cached&&cachedTime&&(Date.now()-parseInt(cachedTime))<sixHours){
      currentData=JSON.parse(cached);
      showStatus('success','Loaded from cache \u2014 data is fresh');
      document.getElementById('cached-note').textContent='cached '+timeAgo(parseInt(cachedTime));
      renderAll(); btn.disabled=false; return;
    }
    const BASE='https://publicreporting.cftc.gov/resource/6dca-aqww.json';
    const contractKeys=Object.keys(CONTRACTS);
    showStatus('loading','Fetching '+contractKeys.length+' contracts from CFTC API...');

    // Sequential fetch with delay to avoid rate limiting
    const results=[];
    for(let i=0;i<contractKeys.length;i++){
      const key=contractKeys[i];
      showStatus('loading','Fetching '+key+' ('+( i+1)+'/'+contractKeys.length+')...');
      try{
        const url=BASE+'?$where=cftc_contract_market_code=%27'+CONTRACTS[key].code+'%27&$order=report_date_as_yyyy_mm_dd%20DESC&$limit=2';
        const res=await fetch(url);
        if(!res.ok) throw new Error(res.status);
        const data=await res.json();
        results.push({key,data});
      }catch(e){
        console.error('Failed for '+key+':',e.message, e);
        results.push({key,data:[]});
      }
      // Small delay between requests to be a good API citizen
      if(i<contractKeys.length-1) await new Promise(r=>setTimeout(r,120));
    }
    const raw={}; let reportDate='';
    for(const {key,data} of results){
      if(!data||data.length===0) continue;
      const r=data[0];
      const ncLongChg=parseFloat(r.change_in_noncomm_long_all)||0;
      const ncShortChg=parseFloat(r.change_in_noncomm_short_all)||0;
      const ncDelta=ncLongChg-ncShortChg;
      const oiDelta=parseFloat(r.change_in_open_interest_all)||0;
      if(!reportDate&&r.report_date_as_yyyy_mm_dd) reportDate=r.report_date_as_yyyy_mm_dd.split('T')[0];
      raw[key]={ncDelta,oiDelta};
    }
    if(!Object.keys(raw).length) throw new Error('No data returned');
    processAndRender(raw, reportDate);
    localStorage.setItem('cot_fetch_time_v2',Date.now().toString());
  } catch(err) {
    console.error('Full fetch error:', err);
    const cached=localStorage.getItem('cot_data_v2');
    if(cached){
      currentData=JSON.parse(cached);
      showStatus('error','Live fetch failed \u2014 using cached data. Check console for details.');
      renderAll();
    } else {
      showStatus('error','Failed: '+err.message+' \u2014 Open console (F12) for full details.');
    }
    // Keep error visible \u2014 don't auto-hide on error
    document.getElementById('status-bar').classList.add('persistent');
  }
  btn.disabled=false;
}

function processAndRender(raw, reportDate) {
  // Currency scores (for crosses and chip display)
  const currencyRaw=Object.fromEntries(Object.entries(raw).filter(([k])=>CURRENCY_KEYS.includes(k)));
  const currencyScores=calcCurrencyScores(currencyRaw);

  // Major pair scores (direct from futures, own pool)
  const majorPairs=calcMajors(raw, currencyScores);

  // Cross pair scores (from currency scores, with divergence)
  const crossPairs=calcCrosses(currencyScores);

  // Asset scores
  const assetRaw=Object.fromEntries(Object.entries(raw).filter(([k])=>ASSET_KEYS.includes(k)));
  const assetScores=calcAssetScores(assetRaw);
  const assets=calcAssets(raw, assetScores);

  // Build score snapshot for history (majors + crosses + assets keyed by pair name)
  const scores={};
  majorPairs.forEach(p=>{ scores[p.pair]=p.score; });
  crossPairs.forEach(p=>{ scores[p.pair]=p.score; });
  assets.forEach(a=>{ scores[a.name]=a.score; });
  // Also store raw currency scores for chip history
  Object.entries(currencyScores).forEach(([c,d])=>{ scores['ccy_'+c]=d.score; });

  currentData={raw, currencyScores, majorPairs, crossPairs, assets, reportDate, fetchTime:Date.now()};
  localStorage.setItem('cot_data_v2',JSON.stringify(currentData));
  saveHistory({date:reportDate, scores});
  document.getElementById('cached-note').textContent='';
  showStatus('success','Report loaded \u2014 '+Object.keys(raw).length+' contracts');
  renderAll();
}

// \u2500\u2500\u2500 SCORING LAYER 1: CURRENCY SCORES (for crosses) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function calcCurrencyScores(raw) {
  const keys=Object.keys(raw);
  if(!keys.length) return {};
  const ncVals=keys.map(k=>raw[k].ncDelta);
  const oiVals=keys.map(k=>raw[k].oiDelta);
  const n=keys.length;
  function pct(val,vals){ return n>1?(vals.filter(v=>v<val).length)/(n-1):0.5; }
  const maxAbsNC=Math.max(...ncVals.map(Math.abs));

  const scores={};
  keys.forEach(k=>{
    const ncP=pct(raw[k].ncDelta,ncVals);
    const oiP=pct(raw[k].oiDelta,oiVals);
    const blended=(ncP*0.7)+(oiP*0.3);
    let base=Math.round((blended-0.5)*8);

    // Absolute threshold \u2014 weak entries capped
    if(Math.abs(raw[k].ncDelta)<maxAbsNC*0.15) base=Math.max(-2,Math.min(2,base));

    // Regime bonus \u2014 OI-magnitude-aware
    const regime=getRegime(raw[k].ncDelta,raw[k].oiDelta);
    const oiMagPct=pct(Math.abs(raw[k].oiDelta),oiVals.map(Math.abs));
    let regB=0;
    if(regime==='Bull Confirmed') regB=1;
    else if(regime==='Bear Confirmed') regB=-1;
    else if(regime==='Bull Relief') regB=oiMagPct>0.6?-1:0;

    // Momentum bonus \u2014 only applies if history exists, never pushes past \xB14
    const mom=getMomentum(k);
    const scorePreMom=Math.max(-4,Math.min(4,base+regB));
    const score=Math.max(-4,Math.min(4,Math.round((scorePreMom+mom.bonus)*2)/2)); // round to 0.5
    scores[k]={score,regime,ncDelta:raw[k].ncDelta,oiDelta:raw[k].oiDelta,momentum:mom};
  });
  return scores;
}

// \u2500\u2500\u2500 SCORING LAYER 2: MAJORS (direct from futures, own ranking pool) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function calcMajors(raw, currencyScores) {
  // Build pair-level data first
  const pairData=MAJOR_DEFS.map(({pair,key,dir})=>{
    if(!raw[key]) return null;
    const {ncDelta,oiDelta}=raw[key];
    // For 'quote' pairs (USDCAD etc): flip NC, keep OI as-is (volume is unsigned)
    const pairNC  = dir==='base' ?  ncDelta : -ncDelta;
    const pairOI  = oiDelta;  // NEVER flip OI \u2014 it's always unsigned magnitude
    const regime  = getRegime(pairNC,pairOI);
    // Also store the two currency scores for the footer display
    const baseKey = dir==='base' ? key : 'USD';
    const quoteKey= dir==='base' ? 'USD' : key;
    return {pair,key,dir,pairNC,pairOI,regime,
      baseScore:currencyScores[baseKey]?.score??0,
      quoteScore:currencyScores[quoteKey]?.score??0};
  }).filter(Boolean);

  // Rank majors as their own pool using pairNC and pairOI
  const n=pairData.length;
  const ncVals=pairData.map(p=>p.pairNC);
  const oiVals=pairData.map(p=>p.pairOI);
  function pct(val,vals){ return n>1?(vals.filter(v=>v<val).length)/(n-1):0.5; }
  const maxAbsNC=Math.max(...ncVals.map(Math.abs));

  return pairData.map(p=>{
    const ncP=pct(p.pairNC,ncVals);
    const oiP=pct(p.pairOI,oiVals);
    const blended=(ncP*0.7)+(oiP*0.3);
    let base=Math.round((blended-0.5)*8);

    // Absolute threshold
    if(Math.abs(p.pairNC)<maxAbsNC*0.15) base=Math.max(-2,Math.min(2,base));

    // Regime bonus \u2014 OI-magnitude-aware
    const oiMagPct=pct(Math.abs(p.pairOI),oiVals.map(Math.abs));
    let regB=0;
    if(p.regime==='Bull Confirmed') regB=1;
    else if(p.regime==='Bear Confirmed') regB=-1;
    else if(p.regime==='Bull Relief') regB=oiMagPct>0.6?-1:0;

    const score=Math.max(-4,Math.min(4,base+regB));
    const absScore=Math.abs(score);
    const edge=getEdge(absScore);
    const direction=score>0?'BUY':score<0?'SELL':'NEUTRAL';
    const signal=getSignal(score);

    return {...p, score, absScore, edge, direction, signal,
      displayNC:p.pairNC, displayOI:p.pairOI};
  }).sort((a,b)=>b.score-a.score);
}

// \u2500\u2500\u2500 SCORING LAYER 3: CROSSES (currency scores + divergence grade) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function calcCrosses(currencyScores) {
  return CROSS_DEFS.map(([pair,base,quote])=>{
    const bd=currencyScores[base], qd=currencyScores[quote];
    if(!bd||!qd) return null;

    const score=bd.score-qd.score;  // raw divergence, not clamped yet for grade calc
    const absScore=Math.abs(score);

    // DIVERGENCE GRADE: uses absolute individual scores, not the combined score
    // This rewards maximum divergence on both sides independently
    const divergence=Math.abs(bd.score)+Math.abs(qd.score);
    const grade=divergence>=6?'A':divergence>=4?'B':divergence>=2?'C':'N';

    // Only clamp for display/edge purposes
    const clampedScore=Math.max(-8,Math.min(8,score));
    const edge=getEdge(Math.abs(clampedScore));
    const direction=clampedScore>0?'BUY':clampedScore<0?'SELL':'NEUTRAL';
    const signal=getSignal(clampedScore);

    return {
      pair,base,quote,
      baseScore:bd.score,quoteScore:qd.score,
      score:clampedScore,absScore:Math.abs(clampedScore),
      divergence,grade,edge,direction,signal,
      displayNC:bd.ncDelta-qd.ncDelta,
      displayOI:bd.oiDelta-qd.oiDelta,
      baseRegime:bd.regime,quoteRegime:qd.regime,
    };
  }).filter(Boolean);
}

// \u2500\u2500\u2500 ASSETS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function calcAssetScores(raw) {
  const keys=Object.keys(raw);
  if(!keys.length) return {};
  const ncVals=keys.map(k=>raw[k].ncDelta);
  const oiVals=keys.map(k=>raw[k].oiDelta);
  const n=keys.length;
  function pct(val,vals){ return n>1?(vals.filter(v=>v<val).length)/(n-1):0.5; }
  const scores={};
  keys.forEach(k=>{
    const ncP=pct(raw[k].ncDelta,ncVals);
    const oiP=pct(raw[k].oiDelta,oiVals);
    const blended=(ncP*0.7)+(oiP*0.3);
    const base=Math.round((blended-0.5)*8);
    const regime=getRegime(raw[k].ncDelta,raw[k].oiDelta);
    let regB=0;
    if(regime==='Bull Confirmed') regB=1;
    else if(regime==='Bear Confirmed') regB=-1;
    const score=Math.max(-4,Math.min(4,base+regB));
    scores[k]={score,regime,ncDelta:raw[k].ncDelta,oiDelta:raw[k].oiDelta};
  });
  return scores;
}

function calcAssets(raw, scores) {
  return ASSET_KEYS.map(key=>{
    if(!raw[key]||!scores[key]) return null;
    const {score,regime,ncDelta,oiDelta}=scores[key];
    return {name:CONTRACTS[key].name,key,score,regime,
      direction:score>0?'BUY':score<0?'SELL':'NEUTRAL',
      edge:getEdge(Math.abs(score)),ncDelta,oiDelta};
  }).filter(Boolean);
}

// \u2500\u2500\u2500 HELPERS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function getRegime(nc,oi){
  if(nc>0&&oi>0) return 'Bull Confirmed';
  if(nc>0&&oi<=0) return 'Bull Relief';
  if(nc<=0&&oi<=0) return 'Bear Confirmed';
  return 'Bear Relief';
}
function getSignal(s){
  if(s>=3) return 'Strong Bull'; if(s<=-3) return 'Strong Bear';
  if(Math.abs(s)===2) return 'Moderate'; return 'Mixed';
}
function getEdge(abs){ return abs>=EDGE_THRESHOLD?'EDGE':abs>=WATCH_THRESHOLD?'WATCH':'NO EDGE'; }
function fmt(n){
  if(n===undefined||n===null||isNaN(n)) return '\u2014';
  const abs=Math.abs(n);
  if(abs>=1000000) return (n/1000000).toFixed(1)+'M';
  if(abs>=1000)    return (n/1000).toFixed(1)+'K';
  return n.toString();
}
function timeAgo(ts){const d=Date.now()-ts,m=Math.floor(d/60000),h=Math.floor(d/3600000);return h>0?h+'h ago':m>0?m+'m ago':'just now';}

// \u2500\u2500\u2500 RENDER \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function renderAll() {
  if(!currentData) return;
  const {currencyScores,majorPairs,crossPairs,assets,reportDate,fetchTime}=currentData;
  document.getElementById('report-date').innerHTML=\`Report: <span>\${reportDate||'Latest'}</span>\`;
  if(fetchTime){
    const d=new Date(fetchTime);
    document.getElementById('fetch-time').textContent=d.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' '+d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
    document.getElementById('fetch-badge').style.display='flex';
  }
  renderCurrencyChips(currencyScores);
  document.getElementById('legend-strip').style.display='flex';
  document.getElementById('filters-bar').style.display='flex';
  renderContent(majorPairs, crossPairs, assets);
}

function renderCurrencyChips(scores) {
  document.getElementById('scores-strip').style.display='flex';
  const keys=['GBP','EUR','CHF','USD','AUD','NZD','CAD','JPY'];
  const sorted=[...keys.filter(c=>scores[c]?.score>0).sort((a,b)=>scores[b].score-scores[a].score),
                ...keys.filter(c=>scores[c]?.score===0),
                ...keys.filter(c=>scores[c]?.score<0).sort((a,b)=>scores[b].score-scores[a].score)];
  document.getElementById('currency-chips').innerHTML=sorted.filter(c=>scores[c]).map(c=>{
    const s=scores[c].score, cls=s>0?'bull':s<0?'bear':'neu', sc=s>0?'pos':s<0?'neg':'zero';
    const mom=scores[c].momentum||getMomentum(c);
    var momHtml=mom&&mom.arrows?momTag('',mom).replace(c+' ',''):'';
    return '<div class="currency-chip '+cls+'"><span class="chip-name">'+c+'</span><span class="chip-score '+sc+'">'+(s>0?'+':'')+s+'</span>'+momHtml+'</div>';
  }).join('');
}

function renderContent(majorPairs, crossPairs, assets) {
  const main=document.getElementById('main-content'), f=currentFilter;
  let html='', total=0;

  if(f==='all'||f==='majors'){
    const majBullEdge=[...majorPairs].filter(p=>p.score>0&&p.edge!=='NO EDGE').sort((a,b)=>b.score-a.score);
    const majBearEdge=[...majorPairs].filter(p=>p.score<0&&p.edge!=='NO EDGE').sort((a,b)=>a.score-b.score);
    const majNoEdge=[...majorPairs].filter(p=>p.edge==='NO EDGE').sort((a,b)=>b.score-a.score);
    total+=majBullEdge.length+majBearEdge.length;
    if(majBullEdge.length){ html+=sectionHeader('FX Majors \u2014 Bullish',majBullEdge.length)+'<div class="cards-grid">'; majBullEdge.forEach((p,i)=>html+=majorCard(p,i+1)); html+='</div>'; }
    if(majBearEdge.length){ html+=sectionHeader('FX Majors \u2014 Bearish',majBearEdge.length)+'<div class="cards-grid">'; majBearEdge.forEach((p,i)=>html+=majorCard(p,i+1)); html+='</div>'; }
    if(majNoEdge.length){ html+=\`<button class="noedge-toggle" onclick="toggleNoEdge('maj-ne')">\u25B8 Show \${majNoEdge.length} NO EDGE majors</button><div id="maj-ne" style="display:none"><div class="cards-grid">\`; majNoEdge.forEach((p,i)=>html+=majorCard(p,majBullEdge.length+majBearEdge.length+i+1,true)); html+='</div></div>'; }
  }

  if(f==='all'||f==='fx'){
    const gradeOrder={'A':0,'B':1,'C':2,'N':3};
    const bullEdge=[...crossPairs].filter(p=>p.score>0&&p.edge!=='NO EDGE').sort((a,b)=>b.score-a.score||gradeOrder[a.grade]-gradeOrder[b.grade]);
    const bearEdge=[...crossPairs].filter(p=>p.score<0&&p.edge!=='NO EDGE').sort((a,b)=>a.score-b.score||gradeOrder[a.grade]-gradeOrder[b.grade]);
    const noEdgeCross=[...crossPairs].filter(p=>p.edge==='NO EDGE').sort((a,b)=>b.score-a.score);
    total+=bullEdge.length+bearEdge.length;
    if(bullEdge.length){ html+=sectionHeader('FX Crosses \u2014 Bullish',bullEdge.length)+'<div class="cards-grid">'; bullEdge.forEach((p,i)=>html+=crossCard(p,i+1)); html+='</div>'; }
    if(bearEdge.length){ html+=sectionHeader('FX Crosses \u2014 Bearish',bearEdge.length)+'<div class="cards-grid">'; bearEdge.forEach((p,i)=>html+=crossCard(p,i+1)); html+='</div>'; }
    if(noEdgeCross.length){ html+=\`<button class="noedge-toggle" onclick="toggleNoEdge('fx-ne')">\u25B8 Show \${noEdgeCross.length} NO EDGE crosses</button><div id="fx-ne" style="display:none"><div class="cards-grid">\`; noEdgeCross.forEach((p,i)=>html+=crossCard(p,bullEdge.length+bearEdge.length+i+1,true)); html+='</div></div>'; }
  }

  if(f==='all'||f==='indices'){
    const idx=assets.filter(a=>['NQ1!','YM1!','ES1!'].includes(a.name)).sort((a,b)=>b.score-a.score);
    total+=idx.length;
    if(idx.length){ html+=sectionHeader('Indices',idx.length)+'<div class="assets-grid">'; idx.forEach(a=>html+=assetCard(a)); html+='</div>'; }
  }

  if(f==='all'||f==='metals'){
    const met=assets.filter(a=>['GC1!','SI1!'].includes(a.name)).sort((a,b)=>b.score-a.score);
    total+=met.length;
    if(met.length){ html+=sectionHeader('Metals',met.length)+'<div class="assets-grid">'; met.forEach(a=>html+=assetCard(a)); html+='</div>'; }
  }

  if(!html) html=\`<div class="empty-state"><div class="empty-icon">\u{1F50D}</div><div class="empty-title">No Results</div><div class="empty-text">No pairs match the current filter.</div></div>\`;
  main.innerHTML=html;
  document.getElementById('results-count').textContent=\`\${total} pairs with edge\`;
}

function sectionHeader(title,count){
  return \`<div class="section-header"><span class="section-title">\${title}</span><span class="section-count">\${count}</span><div class="section-divider"></div></div>\`;
}

// Major pair card \u2014 scored directly from futures
function majorCard(p, rank, dimmed=false) {
  const isBull=p.direction==='BUY', isBear=p.direction==='SELL';
  const cls=isBull?'bull':isBear?'bear':'neutral';
  const edgeGlow=p.edge==='EDGE'&&!dimmed?' edge-glow':'';
  const scoreSign=p.score>0?'+':'';
  const barW=Math.min((Math.abs(p.score)/6)*100,100);
  const ncVal=p.displayNC, oiVal=p.displayOI;
  const ncCls=ncVal>0?'pos':ncVal<0?'neg':'neu';
  const oiCls=oiVal>0?'pos':oiVal<0?'neg':'neu';
  const oiArrow=oiVal>0?'\u25B2':'\u25BC', oiArrCls=oiVal>0?'up':'down';
  const deltaPill=scoreDeltaPill(p.score, p.pair);

  const dirBadge=isBull?\`<span class="badge badge-bull">\u25B2 BULLISH</span>\`:isBear?\`<span class="badge badge-bear">\u25BC BEARISH</span>\`:\`<span class="badge badge-neu">NEUTRAL</span>\`;
  const sigBadge=p.signal==='Strong Bull'?\`<span class="badge badge-strong-bull">Strong Bull</span>\`:p.signal==='Strong Bear'?\`<span class="badge badge-strong-bear">Strong Bear</span>\`:p.signal==='Moderate'?\`<span class="badge badge-moderate">Moderate</span>\`:\`<span class="badge badge-mixed">Mixed</span>\`;
  const edgeBadge=p.edge==='EDGE'?\`<span class="badge badge-edge">EDGE</span>\`:p.edge==='WATCH'?\`<span class="badge badge-watch">WATCH</span>\`:\`<span class="badge badge-noedge">NO EDGE</span>\`;

  // For majors, grade based on |NC magnitude| vs group \u2014 using OI confirmation as second factor
  const confirmed=p.regime==='Bull Confirmed'||p.regime==='Bear Confirmed';
  const majorGrade=p.absScore>=4&&confirmed?'A':p.absScore>=4||confirmed?'B':p.absScore>=2?'C':'N';
  const gradeBadge=majorGrade==='A'?\`<span class="badge badge-grade-a">A-GRADE</span>\`:majorGrade==='B'?\`<span class="badge badge-grade-b">B-GRADE</span>\`:majorGrade==='C'?\`<span class="badge badge-grade-c">C-GRADE</span>\`:\`<span class="badge badge-grade-n">NOISE</span>\`;

  // Momentum for the underlying futures currency
  var momKeyM=p.key;
  var momM=currentData&&currentData.currencyScores&&currentData.currencyScores[momKeyM]&&currentData.currencyScores[momKeyM].momentum?currentData.currencyScores[momKeyM].momentum:getMomentum(momKeyM);
  var momTagM=momTag(momKeyM,momM);
  return \`<div class="card \${cls}\${edgeGlow}\${dimmed?' neutral':''}">
    <div class="card-header">
      <div><div class="card-pair">\${p.pair}</div><div class="card-regime">\${p.regime}</div></div>
      <div class="card-right"><span class="card-score">\${scoreSign}\${p.score}</span>\${edgeBadge}</div>
    </div>
    <div class="score-bar"><div class="score-bar-fill" style="width:\${barW}%"></div></div>
    <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">\${dirBadge}\${sigBadge}\${gradeBadge}</div>
    <div class="card-stats">
      <div class="stat-box"><div class="stat-label">Net Change</div><div class="stat-value \${ncCls}">\${ncVal>0?'+':''}\${fmt(ncVal)}</div></div>
      <div class="stat-box"><div class="stat-label">OI Delta</div><div class="stat-oi"><span class="oi-arrow \${oiArrCls}">\${oiArrow}</span><span class="stat-value \${oiCls}">\${oiVal>0?'+':''}\${fmt(Math.abs(oiVal))}</span></div></div>
    </div>
    <div class="card-footer">
      <span class="card-currencies"><span>\${p.dir==='base'?p.key:'USD'}</span> \${p.baseScore>0?'+':''}\${p.baseScore} vs <span>\${p.dir==='base'?'USD':p.key}</span> \${p.quoteScore>0?'+':''}\${p.quoteScore}</span>
      <div style="display:flex;align-items:center;gap:6px">\${momTagM}\${deltaPill}<span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--text3)">#\${rank}</span></div>
    </div>
  </div>\`;
}

// Cross pair card \u2014 currency-score derived + divergence grade
function crossCard(p, rank, dimmed=false) {
  const isBull=p.direction==='BUY', isBear=p.direction==='SELL';
  const cls=isBull?'bull':isBear?'bear':'neutral';
  const isAGrade=p.grade==='A'&&!dimmed;
  const edgeGlow=(p.edge==='EDGE'||isAGrade)&&!dimmed?' edge-glow':'';
  const aGradeCls=isAGrade?' a-grade':'';
  const scoreSign=p.score>0?'+':'';
  const divPct=Math.min((p.divergence/8)*100,100);
  const ncVal=p.displayNC, oiVal=p.displayOI;
  const ncCls=ncVal>0?'pos':ncVal<0?'neg':'neu';
  const oiCls=oiVal>0?'pos':oiVal<0?'neg':'neu';
  const oiArrow=oiVal>0?'\u25B2':'\u25BC', oiArrCls=oiVal>0?'up':'down';
  const deltaPill=scoreDeltaPill(p.score, p.pair);

  const dirBadge=isBull?\`<span class="badge badge-bull">\u25B2 BULLISH</span>\`:isBear?\`<span class="badge badge-bear">\u25BC BEARISH</span>\`:\`<span class="badge badge-neu">NEUTRAL</span>\`;
  const sigBadge=p.signal==='Strong Bull'?\`<span class="badge badge-strong-bull">Strong Bull</span>\`:p.signal==='Strong Bear'?\`<span class="badge badge-strong-bear">Strong Bear</span>\`:p.signal==='Moderate'?\`<span class="badge badge-moderate">Moderate</span>\`:\`<span class="badge badge-mixed">Mixed</span>\`;
  const edgeBadge=p.edge==='EDGE'?\`<span class="badge badge-edge">EDGE</span>\`:p.edge==='WATCH'?\`<span class="badge badge-watch">WATCH</span>\`:\`<span class="badge badge-noedge">NO EDGE</span>\`;
  const gradeBadge=p.grade==='A'?\`<span class="badge badge-grade-a">A-GRADE</span>\`:p.grade==='B'?\`<span class="badge badge-grade-b">B-GRADE</span>\`:p.grade==='C'?\`<span class="badge badge-grade-c">C-GRADE</span>\`:\`<span class="badge badge-grade-n">NOISE</span>\`;

  // Momentum for both currencies in the cross
  var baseMom=currentData&&currentData.currencyScores&&currentData.currencyScores[p.base]&&currentData.currencyScores[p.base].momentum?currentData.currencyScores[p.base].momentum:getMomentum(p.base);
  var quoteMom=currentData&&currentData.currencyScores&&currentData.currencyScores[p.quote]&&currentData.currencyScores[p.quote].momentum?currentData.currencyScores[p.quote].momentum:getMomentum(p.quote);
  var momTagBase=momTag(p.base,baseMom);
  var momTagQuote=momTag(p.quote,quoteMom);
  return \`<div class="card \${cls}\${edgeGlow}\${aGradeCls}\${dimmed?' neutral':''}">
    <div class="card-header">
      <div><div class="card-pair">\${p.pair}</div><div class="card-regime">\${p.baseRegime} / \${p.quoteRegime}</div></div>
      <div class="card-right"><span class="card-score">\${scoreSign}\${p.score}</span>\${edgeBadge}</div>
    </div>
    <div class="score-bar"><div class="score-bar-fill" style="width:\${Math.min((Math.abs(p.score)/8)*100,100)}%"></div></div>
    <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">\${dirBadge}\${sigBadge}\${gradeBadge}</div>
    <div class="div-bar-wrap">
      <div class="div-bar-label"><span>Divergence</span><span>\${p.divergence}/8</span></div>
      <div class="div-bar-track"><div class="div-bar-fill" style="width:\${divPct}%"></div></div>
    </div>
    <div class="card-stats">
      <div class="stat-box"><div class="stat-label">Net Change</div><div class="stat-value \${ncCls}">\${ncVal>0?'+':''}\${fmt(ncVal)}</div></div>
      <div class="stat-box"><div class="stat-label">OI Delta</div><div class="stat-oi"><span class="oi-arrow \${oiArrCls}">\${oiArrow}</span><span class="stat-value \${oiCls}">\${oiVal>0?'+':''}\${fmt(Math.abs(oiVal))}</span></div></div>
    </div>
    <div class="card-footer">
      <span class="card-currencies"><span>\${p.base}</span> \${p.baseScore>0?'+':''}\${p.baseScore} vs <span>\${p.quote}</span> \${p.quoteScore>0?'+':''}\${p.quoteScore}</span>
      <div style="display:flex;align-items:center;gap:6px">\${momTagBase}\${momTagQuote}\${deltaPill}<span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--text3)">#\${rank}</span></div>
    </div>
  </div>\`;
}

function assetCard(a) {
  const isBull=a.direction==='BUY', isBear=a.direction==='SELL';
  const cls=isBull?'bull':isBear?'bear':'neutral';
  const edgeBadge=a.edge==='EDGE'?\`<span class="badge badge-edge">EDGE</span>\`:a.edge==='WATCH'?\`<span class="badge badge-watch">WATCH</span>\`:\`<span class="badge badge-noedge">NO EDGE</span>\`;
  const dirBadge=isBull?\`<span class="badge badge-bull">\u25B2 BUY</span>\`:isBear?\`<span class="badge badge-bear">\u25BC SELL</span>\`:\`<span class="badge badge-neu">NEUTRAL</span>\`;
  const ncCls=a.ncDelta>0?'pos':'neg', oiCls=a.oiDelta>0?'pos':'neg';
  const oiArrow=a.oiDelta>0?'\u25B2':'\u25BC', oiArrCls=a.oiDelta>0?'up':'down';
  const deltaPill=scoreDeltaPill(a.score, a.name);
  return \`<div class="asset-card \${cls}">
    <div class="asset-left">
      <span class="asset-name">\${a.name}</span><span class="asset-regime">\${a.regime}</span>
      <div style="display:flex;gap:5px;margin-top:6px;flex-wrap:wrap">\${dirBadge}\${edgeBadge}</div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <div class="stat-box" style="padding:6px 8px"><div class="stat-label">Net Change</div><div class="stat-value \${ncCls}" style="font-size:11px">\${a.ncDelta>0?'+':''}\${fmt(a.ncDelta)}</div></div>
        <div class="stat-box" style="padding:6px 8px"><div class="stat-label">OI Delta</div><div class="stat-oi"><span class="oi-arrow \${oiArrCls}" style="font-size:9px">\${oiArrow}</span><span class="stat-value \${oiCls}" style="font-size:11px">\${fmt(Math.abs(a.oiDelta))}</span></div></div>
      </div>
    </div>
    <div class="asset-right"><span class="asset-score">\${a.score>0?'+':''}\${a.score}</span>\${deltaPill}</div>
  </div>\`;
}

// \u2500\u2500\u2500 UI HELPERS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function showStatus(type,text){
  const bar=document.getElementById('status-bar');
  bar.className=\`status-bar show \${type}\`;
  document.getElementById('spinner').style.display=type==='loading'?'block':'none';
  document.getElementById('status-text').textContent=text;
  if(type==='loading') return;
  if(!bar.classList.contains('persistent')) setTimeout(()=>bar.classList.remove('show'),5000);
}
function setFilter(f,btn){
  currentFilter=f;
  document.querySelectorAll('.filter-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  if(currentData) renderAll();
}
function toggleNoEdge(id){
  const el=document.getElementById(id); if(!el) return;
  const btn=el.previousElementSibling;
  if(el.style.display==='none'){el.style.display='block';btn.textContent=btn.textContent.replace('\u25B8','\u25BE').replace('Show','Hide');}
  else{el.style.display='none';btn.textContent=btn.textContent.replace('\u25BE','\u25B8').replace('Hide','Show');}
}
function clearCache(){
  ['cot_data_v2','cot_fetch_time_v2'].forEach(k=>localStorage.removeItem(k));
  document.getElementById('cached-note').textContent='';
  showStatus('success','Cache cleared');
}
function toggleInputPanel(){
  const p=document.getElementById('input-panel');
  p.style.display=p.style.display==='none'?'block':'none';
  if(p.style.display==='block') loadInputsFromCache();
}

function calcFromInputs(){
  const keys=[...CURRENCY_KEYS,...ASSET_KEYS.map(k=>k)], raw={};
  const assetInputKeys=['NQ','YM','ES','GC','SI'];
  for(const c of [...CURRENCY_KEYS,...assetInputKeys]){
    const nc=parseFloat(document.getElementById('nc-'+c)?.value)||0;
    const oi=parseFloat(document.getElementById('oi-'+c)?.value)||0;
    if(nc!==0||oi!==0) raw[c]={ncDelta:nc,oiDelta:oi};
  }
  if(!Object.keys(raw).length){showStatus('error','No data entered');return;}
  const reportDate=document.getElementById('input-date')?.value||'Manual Entry';
  processAndRender(raw, reportDate);
  document.getElementById('input-panel').style.display='none';
}

function saveInputsToCache(){
  const inputs={};
  [...CURRENCY_KEYS,...['NQ','YM','ES','GC','SI']].forEach(c=>{
    inputs['nc-'+c]=document.getElementById('nc-'+c)?.value||'';
    inputs['oi-'+c]=document.getElementById('oi-'+c)?.value||'';
  });
  inputs.date=document.getElementById('input-date')?.value||'';
  localStorage.setItem('cot_manual_inputs',JSON.stringify(inputs));
  showStatus('success','Inputs saved');
}

function loadInputsFromCache(){
  const saved=localStorage.getItem('cot_manual_inputs');
  if(!saved) return;
  try{
    const inputs=JSON.parse(saved);
    for(const [k,v] of Object.entries(inputs)){
      const el=document.getElementById(k==='date'?'input-date':k);
      if(el) el.value=v;
    }
  }catch(e){}
}

window.addEventListener('load',()=>{
  const cached=localStorage.getItem('cot_data_v2');
  if(cached){
    try{
      currentData=JSON.parse(cached);
      const t=parseInt(localStorage.getItem('cot_fetch_time_v2')||'0');
      document.getElementById('cached-note').textContent='cached '+timeAgo(t);
      showStatus('success','Loaded from cache \u2014 click Fetch Latest to update');
      renderAll();
    }catch(e){localStorage.removeItem('cot_data_v2');}
  }
});
<\/script>
</body>
</html>
`;
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
