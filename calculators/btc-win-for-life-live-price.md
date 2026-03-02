---
layout: page
title: "BTC Win-for-Life Live Price (EUR)"
permalink: /calculators/btc-win-for-life-live-price/
---

## Doel
Deze calculator is gebaseerd op **BTC Win-for-Life (EUR)** en toont hoeveel BTC je nodig hebt om later maandelijks een bedrag op te nemen.

Extra: de tabel toont ook de **kostprijs aan de huidige live BTC-prijs (EUR)**, alsof je die benodigde BTC vandaag ineens zou kopen.

> Het maandbedrag dat je invult is uitgedrukt in **koopkracht van vandaag**. Met inflatie wordt dat bedrag automatisch geïndexeerd tegen de start van je pensioen.

## Calculator
<div class="calc-card">
  <div class="calc-grid">
    <label>Maandbedrag nu (EUR / maand)<input id="wfl-live-rout" type="number" value="3000" step="100" /></label>
    <label>Inflatie (% / jaar)<input id="wfl-live-infl" type="number" value="2" step="0.1" /></label>
    <label>Startjaar pensioen<input id="wfl-live-year" type="number" value="2030" /></label>
    <label>Startmaand pensioen<input id="wfl-live-month" type="number" value="1" min="1" max="12" /></label>
    <label>Projectie (jaren)<input id="wfl-live-range" type="number" value="30" min="1" max="80" /></label>
    <label>
      Conservativiteit
      <select id="wfl-live-band">
        <option value="lower" selected>Percentiel 10 (conservatief)</option>
        <option value="avg">Percentiel 50 (gemiddeld)</option>
      </select>
    </label>
  </div>

  <div class="calc-kpis" id="wfl-live-kpis"></div>

  <div class="calc-table">
    <table>
      <thead>
        <tr>
          <th>Retire date</th>
          <th>Maandbedrag @ retire</th>
          <th>Prijs @ retire (EUR)</th>
          <th>BTC nodig</th>
          <th>Kost vandaag (live EUR)</th>
        </tr>
      </thead>
      <tbody id="wfl-live-table"></tbody>
    </table>
  </div>
</div>

<style>
.calc-card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.5rem; background: #fff; box-shadow: 0 10px 30px rgba(15,23,42,.08); margin-bottom: 1rem; }
.calc-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; }
.calc-grid label { display:flex; flex-direction:column; gap:.35rem; font-size:.9rem; color:#0f172a; }
.calc-grid input,.calc-grid select { padding:.45rem .6rem; border-radius:8px; border:1px solid #cbd5f5; }
.calc-kpis { margin:1rem 0; display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:.75rem; }
.calc-kpi { border:1px solid #e2e8f0; border-radius:12px; padding:.65rem .8rem; background:#f8fafc; }
.calc-kpi .label { font-size:.72rem; color:#475569; text-transform:uppercase; }
.calc-kpi .value { font-size:1rem; font-weight:600; color:#0f172a; }
.calc-table table { width:100%; border-collapse:collapse; font-size:.9rem; }
.calc-table th,.calc-table td { border-bottom:1px solid #e2e8f0; padding:.5rem .25rem; text-align:left; }
.calc-table tr.highlight { background: rgba(37, 99, 235, 0.08); font-weight:600; }
</style>

<script src="{{ '/assets/js/btc-powerlaw-data.js' | relative_url }}"></script>
<script src="{{ '/assets/js/calculators-common.js' | relative_url }}"></script>
<script src="{{ '/assets/js/btc-win-for-life-live-price.js' | relative_url }}"></script>
