---
layout: page
title: "Inflation Effect"
permalink: /calculators/inflation-effect/
---

## Doel
Deze calculator laat zien hoe **inflatie** bedragen vertaalt tussen verleden, heden en toekomst.

## Calculator
<div class="calc-card">
  <div class="calc-grid">
    <label>
      Basisbedrag (EUR/maand)
      <input id="inf-base" type="number" value="6000" step="100" />
    </label>
    <label>
      Jaren (afstand)
      <input id="inf-years" type="number" value="10" min="1" />
    </label>
    <label>
      Inflatie (%/jaar)
      <input id="inf-rate" type="number" value="2" step="0.1" />
    </label>
  </div>

  <div class="calc-results">
    <div class="result-box">
      <div class="calc-label">Nominale waarde in de toekomst van € vandaag</div>
      <div id="inf-future-nominal" class="calc-value">–</div>
    </div>
    <div class="result-box">
      <div class="calc-label">Reële waarde in de toekomst van € vandaag (koopkracht)</div>
      <div id="inf-future-real" class="calc-value">–</div>
    </div>
    <div class="result-box">
      <div class="calc-label">Equivalent bedrag in het verleden (x jaar geleden)</div>
      <div id="inf-past-equiv" class="calc-value">–</div>
    </div>
  </div>
</div>

<style>
.calc-card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.5rem; background: #ffffff; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
.calc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.calc-grid label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; color: #0f172a; }
.calc-grid input { padding: 0.45rem 0.6rem; border-radius: 8px; border: 1px solid #cbd5f5; }
.calc-results { margin-top: 1.2rem; display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; }
.result-box { border:1px solid #cbd5e1; border-radius:12px; padding:.75rem; background:#f8fafc; }
.calc-label { font-size: 0.85rem; color: #64748b; }
.calc-value { font-size: 1.2rem; font-weight: 600; }
</style>

<script src="{{ '/assets/js/inflation-effect.js' | relative_url }}"></script>
