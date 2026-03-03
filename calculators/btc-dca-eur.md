---
layout: page
title: "BTC DCA Calculator (EUR)"
permalink: /calculators/btc-dca-eur/
---

## Doel
Deze calculator gebruikt de **BTC power law in EUR** om je DCA-plan te schatten met drie conservativiteitsniveaus:

- Percentiel 40
- Percentiel 50
- Percentiel 60

## Calculator
<div class="calc-card">
  <h3>Optie 1 · Hoeveel BTC kan ik behalen?</h3>
  <div class="calc-grid">
    <label>
      Eenmalig bedrag vandaag (EUR)
      <input id="dca-lump-eur" type="number" value="5000" min="0" step="100" />
    </label>
    <label>
      Maandelijks bedrag (EUR)
      <input id="dca-monthly-eur" type="number" value="300" min="0" step="10" />
    </label>
    <label>
      Horizon (jaren)
      <input id="dca-horizon-years" type="number" value="10" min="1" max="60" />
    </label>
    <label>
      Conservativiteit
      <select id="dca-band-opt1">
        <option value="p40">Percentiel 40</option>
        <option value="p50" selected>Percentiel 50</option>
        <option value="p60">Percentiel 60</option>
      </select>
    </label>
  </div>
  <p id="dca-opt1-result" class="calc-summary"></p>

  <hr class="calc-divider" />

  <h3>Optie 2 · Welke EUR-inspanning voor mijn BTC-doel?</h3>
  <div class="calc-grid">
    <label>
      Doel BTC
      <input id="dca-target-btc" type="number" value="1" min="0" step="0.01" />
    </label>
    <label>
      Horizon (jaren)
      <input id="dca-target-horizon-years" type="number" value="10" min="1" max="60" />
    </label>
    <label>
      Conservativiteit
      <select id="dca-band-opt2">
        <option value="p40">Percentiel 40</option>
        <option value="p50" selected>Percentiel 50</option>
        <option value="p60">Percentiel 60</option>
      </select>
    </label>
  </div>
  <p id="dca-opt2-result" class="calc-summary"></p>
  <p id="dca-live-status" class="calc-live-note"></p>
  <p class="calc-live-note">De resultaten zijn modelprojecties op basis van de power law (geen financieel advies).</p>
</div>

<style>
.calc-card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.5rem; background: #ffffff; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
.calc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
.calc-grid label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; color: #0f172a; }
.calc-grid input,.calc-grid select { padding: 0.45rem 0.6rem; border-radius: 8px; border: 1px solid #cbd5f5; }
.calc-summary { margin: 1rem 0 .25rem; font-weight: 600; }
.calc-result-list { margin: .5rem 0 0 1.1rem; padding: 0; }
.calc-result-list li { margin: .35rem 0; }
.calc-note { color: #475569; font-weight: 400; }
.calc-divider { margin: 1.25rem 0; border: 0; border-top: 1px solid #e2e8f0; }
.calc-live-note { margin: .5rem 0 0; color: #475569; font-size: .9rem; }
</style>

<script src="{{ '/assets/js/btc-powerlaw-data.js' | relative_url }}"></script>
<script src="{{ '/assets/js/calculators-common.js' | relative_url }}"></script>
<script src="{{ '/assets/js/btc-dca-eur.js' | relative_url }}"></script>
