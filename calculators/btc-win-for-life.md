---
layout: page
title: "BTC Win-for-Life (EUR)"
permalink: /calculators/btc-win-for-life/
---

## Doel
Deze calculator gebruikt de **meest recente BTC power-law fit in EUR** op basis van de grafiekdata en laat je pensioen-simulaties maken met keuze in conservativiteit via **percentielen**.

- **Percentiel 10** = conservatief (lower bound)
- **Percentiel 50** = gemiddeld (mediaan)

## Calculator — BTC Balance & Portfolio Value
<div class="calc-card">
  <div class="calc-grid">
    <label>Retire year<input id="wfl-retire-year" type="number" value="2030" /></label>
    <label>Retire month<input id="wfl-retire-month" type="number" value="1" min="1" max="12" /></label>
    <label>Withdrawal (€ / maand)<input id="wfl-rout" type="number" value="3000" step="100" /></label>
    <label>Horizon (years)<input id="wfl-horizon" type="number" value="25" min="1" max="120" /></label>
    <label>Inflatie (% / jaar)<input id="wfl-infl" type="number" value="2" step="0.1" /></label>
    <label>
      Conservativiteit
      <select id="wfl-percentile">
        <option value="10" selected>Percentiel 10 (conservatief)</option>
        <option value="50">Percentiel 50 (gemiddeld)</option>
      </select>
    </label>
    <label>
      Doelmodus r_out
      <select id="wfl-horizon-mode">
        <option value="forever" selected>Forever</option>
        <option value="horizon">Tot horizon</option>
      </select>
    </label>
  </div>

  <div class="calc-kpis" id="wfl-kpis"></div>

  <h3>BTC Balance & Portfolio Value</h3>
  <div class="calc-grid-2">
    <div>
      <div class="mini-title">BTC balance</div>
      <div class="chart-wrap">
        <svg id="wfl-chart-btc" class="mini-chart" viewBox="0 0 560 260"></svg>
        <div id="wfl-tooltip-btc" class="chart-tooltip"></div>
      </div>
    </div>
    <div>
      <div class="mini-title">EUR value</div>
      <div class="chart-wrap">
        <svg id="wfl-chart-eur" class="mini-chart" viewBox="0 0 560 260"></svg>
        <div id="wfl-tooltip-eur" class="chart-tooltip"></div>
      </div>
    </div>
  </div>

  <h3>Monthly table (first 240 rows shown)</h3>
  <div class="calc-table">
    <table>
      <thead>
        <tr>
          <th>Year</th><th>Month</th><th>Prijs (EUR)</th><th>Sell BTC</th><th>Withdr (EUR)</th><th>BTC bal</th><th>EUR value</th>
        </tr>
      </thead>
      <tbody id="wfl-table-body"></tbody>
    </table>
  </div>
</div>

<style>
.calc-card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.5rem; background: #fff; box-shadow: 0 10px 30px rgba(15,23,42,.08); margin-bottom: 1rem; }
.calc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
.calc-grid label { display:flex; flex-direction:column; gap:.35rem; font-size:.9rem; color:#0f172a; }
.calc-grid input,.calc-grid select { padding:.45rem .6rem; border-radius:8px; border:1px solid #cbd5f5; }
.calc-kpis { margin: 1rem 0; display:grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap:.75rem; }
.calc-kpi { border:1px solid #e2e8f0; border-radius:12px; padding:.65rem .8rem; background:#f8fafc; }
.calc-kpi .label { font-size:.72rem; color:#475569; text-transform: uppercase; }
.calc-kpi .value { font-size:1rem; font-weight:600; color:#0f172a; }
.calc-grid-2 { display:grid; grid-template-columns: repeat(auto-fit,minmax(300px,1fr)); gap:1rem; }
.mini-title { font-size:.85rem; color:#334155; margin-bottom:.25rem; }
.chart-wrap { position: relative; }
.mini-chart { width:100%; height:240px; border:1px solid #e2e8f0; border-radius:10px; background:#fff; }
.chart-tooltip { position:absolute; pointer-events:none; background:#0f172a; color:white; font-size:.75rem; padding:.3rem .45rem; border-radius:6px; display:none; z-index:4; white-space:nowrap; }
.calc-table table { width:100%; border-collapse:collapse; font-size:.9rem; }
.calc-table th,.calc-table td { border-bottom:1px solid #e2e8f0; padding:.4rem .25rem; text-align:left; }
</style>

<script src="{{ '/assets/js/btc-powerlaw-data.js' | relative_url }}"></script>
<script src="{{ '/assets/js/calculators-common.js' | relative_url }}"></script>
<script src="{{ '/assets/js/btc-win-for-life.js' | relative_url }}"></script>
