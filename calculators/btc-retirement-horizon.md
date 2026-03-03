---
layout: page
title: "BTC retirement horizon"
permalink: /calculators/btc-retirement-horizon/
---

## Doel
Deze calculator vertrekt van een **beschikbare hoeveelheid BTC** en projecteert per pensioenjaar welke **maandelijkse uitkering (forever)** haalbaar is, met jaarlijkse indexatie op basis van inflatie.

## Calculator
<div class="calc-card">
  <div class="calc-grid">
    <label>
      Beschikbare BTC
      <input id="brh-btc" type="number" value="1.5" step="0.01" min="0" />
    </label>
    <label>
      Start retire year
      <input id="brh-retire-year" type="number" value="2030" />
    </label>
    <label>
      Retire month
      <input id="brh-retire-month" type="number" value="1" min="1" max="12" />
    </label>
    <label>
      Projectie in jaren
      <input id="brh-year-range" type="number" value="40" min="1" max="80" />
    </label>
    <label>
      Inflatie (%/jaar)
      <input id="brh-inflation" type="number" value="2" step="0.1" />
    </label>
    <label>
      Conservativiteit
      <select id="brh-band">
        <option value="lower" selected>Percentiel 10 (conservatief)</option>
        <option value="avg">Percentiel 50 (gemiddeld)</option>
      </select>
    </label>
  </div>

  <p id="brh-summary" class="calc-summary"></p>
  <p id="brh-live-status" class="calc-live"></p>

  <div class="calc-table">
    <table>
      <thead>
        <tr>
          <th>Retire year</th>
          <th>Prijs (EUR)</th>
          <th>Maandelijkse uitkering (forever)</th>
          <th>Kost vandaag (live EUR)</th>
        </tr>
      </thead>
      <tbody id="brh-table-body"></tbody>
    </table>
  </div>
</div>

<style>
.calc-card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.5rem; background: #ffffff; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
.calc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
.calc-grid label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; color: #0f172a; }
.calc-grid input,.calc-grid select { padding: 0.45rem 0.6rem; border-radius: 8px; border: 1px solid #cbd5f5; }
.calc-summary { margin: 1rem 0 .5rem; font-weight: 600; }
.calc-live { margin: 0 0 1rem; color:#334155; }
.calc-table table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.calc-table th,.calc-table td { border-bottom: 1px solid #e2e8f0; padding: 0.5rem 0.25rem; text-align: left; }
.calc-table tr.highlight { background: rgba(37, 99, 235, 0.08); font-weight: 600; }
</style>

<script src="{{ '/assets/js/btc-powerlaw-data.js' | relative_url }}"></script>
<script src="{{ '/assets/js/calculators-common.js' | relative_url }}"></script>
<script src="{{ '/assets/js/btc-retirement-horizon.js' | relative_url }}"></script>
