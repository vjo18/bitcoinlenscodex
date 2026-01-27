---
layout: page
title: "Financial Freedom Year"
permalink: /calculators/financial-freedom-year/
---

## Doel
Deze calculator bepaalt in welk jaar je **financiële vrijheid** kan bereiken op basis van je huidige BTC en een gewenst maandbedrag (r_out).

## Calculator
<div class="calc-card">
  <div class="calc-grid">
    <label>
      Huidige BTC
      <input id="ffy-btc" type="number" value="1.62" step="0.0001" />
    </label>
    <label>
      Desired r_out (USD/maand)
      <input id="ffy-rout" type="number" value="6000" step="100" />
    </label>
    <label>
      Start year
      <input id="ffy-start-year" type="number" value="2029" />
    </label>
    <label>
      Month
      <input id="ffy-month" type="number" value="1" min="1" max="12" />
    </label>
    <label>
      Band
      <select id="ffy-band">
        <option value="lower">Lower (conservatief)</option>
        <option value="avg" selected>Average</option>
      </select>
    </label>
    <label>
      b exponent
      <input id="ffy-b-exp" type="number" step="0.0001" value="5.5697" />
    </label>
    <label>
      a (Average)
      <input id="ffy-a-avg" type="number" value="8.85116e-17" />
    </label>
    <label>
      a (Lower)
      <input id="ffy-a-lower" type="number" value="3.54046e-17" />
    </label>
  </div>

  <p id="ffy-result" class="calc-summary"></p>
</div>

## Werking
Voor elk jaar wordt berekend hoeveel BTC nodig is om het gewenste r_out te starten. Het eerste jaar waarin je huidige BTC ≥ het benodigde BTC-bedrag wordt aangeduid als het vrijheid-jaar.

## Interpretatie
- Een hogere r_out duwt de vrijheid verder in de tijd.
- Een grotere huidige BTC-positie brengt de vrijheid dichterbij.

<style>
.calc-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.calc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.calc-grid label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: #0f172a;
}

.calc-grid input,
.calc-grid select {
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #cbd5f5;
}

.calc-summary {
  margin-top: 1rem;
  font-weight: 600;
}
</style>

<script src="{{ '/assets/js/calculators-common.js' | relative_url }}"></script>
<script src="{{ '/assets/js/financial-freedom-year.js' | relative_url }}"></script>
