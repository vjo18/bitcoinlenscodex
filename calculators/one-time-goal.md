---
layout: page
title: "One-time Goal Calculator"
permalink: /calculators/one-time-goal/
---

## Doel
Deze calculator berekent hoeveel BTC je nodig hebt om een **eenmalig doelbedrag** (bijv. huis, auto, studie) te betalen op een toekomstige datum, met:

- **Lower** = percentiel 10 (conservatief)
- **Avg** = percentiel 50 (gemiddeld)

Daarnaast toont de calculator ook de **huidige live BTC-prijs (EUR)** en de kostprijs om de benodigde BTC **vandaag** aan te kopen voor beide scenario’s.

## Calculator
<div class="calc-card">
  <div class="calc-grid-3">
    <label>
      Year
      <input id="otg-year" type="number" value="2035" />
    </label>
    <label>
      Month
      <input id="otg-month" type="number" value="1" min="1" max="12" />
    </label>
    <label>
      EUR needed
      <input id="otg-eur" type="number" value="500000" step="1000" />
    </label>
  </div>

  <p id="otg-live-status" class="live-status">Live BTC prijs laden...</p>

  <div class="calc-results">
    <div class="result-box">
      <div class="calc-label">Price (lower)</div>
      <div id="otg-price-lower" class="calc-value">–</div>
      <div class="calc-label">BTC needed (lower)</div>
      <div id="otg-btc-lower" class="calc-value">–</div>
      <div class="calc-label">Cost today (lower)</div>
      <div id="otg-cost-lower" class="calc-value">–</div>
    </div>
    <div class="result-box">
      <div class="calc-label">Price (avg)</div>
      <div id="otg-price-avg" class="calc-value">–</div>
      <div class="calc-label">BTC needed (avg)</div>
      <div id="otg-btc-avg" class="calc-value">–</div>
      <div class="calc-label">Cost today (avg)</div>
      <div id="otg-cost-avg" class="calc-value">–</div>
    </div>
  </div>
</div>

<style>
.calc-card { border:1px solid #e2e8f0; border-radius:16px; padding:1.5rem; background:#fff; box-shadow:0 10px 30px rgba(15,23,42,.08); }
.calc-grid-3 { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; }
.calc-grid-3 label { display:flex; flex-direction:column; gap:.35rem; font-size:.9rem; color:#0f172a; }
.calc-grid-3 input { padding:.45rem .6rem; border-radius:8px; border:1px solid #cbd5f5; }
.live-status { margin-top: 1rem; color: #334155; font-size: .9rem; }
.calc-results { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; margin-top:1.2rem; }
.result-box { border:1px solid #cbd5e1; border-radius:12px; padding:.65rem .8rem; background:#f8fafc; }
.calc-label { font-size:.8rem; color:#64748b; }
.calc-value { font-size:1.1rem; font-weight:600; margin-bottom:.6rem; color:#0f172a; }
</style>

<script src="{{ '/assets/js/btc-powerlaw-data.js' | relative_url }}"></script>
<script src="{{ '/assets/js/calculators-common.js' | relative_url }}"></script>
<script src="{{ '/assets/js/one-time-goal.js' | relative_url }}"></script>
