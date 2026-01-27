---
layout: page
title: "One-time Goal Calculator"
permalink: /calculators/one-time-goal/
---

## Doel
Deze calculator berekent hoeveel BTC je nodig hebt om een **eenmalig doelbedrag** (bijv. huis, auto, studie) te betalen op een toekomstige datum.

## Calculator
<div class="calc-card">
  <div class="calc-grid">
    <label>
      Year
      <input id="otg-year" type="number" value="2035" />
    </label>
    <label>
      Month
      <input id="otg-month" type="number" value="1" min="1" max="12" />
    </label>
    <label>
      USD needed
      <input id="otg-usd" type="number" value="500000" step="1000" />
    </label>
    <label>
      b exponent
      <input id="otg-b-exp" type="number" step="0.0001" value="5.5697" />
    </label>
    <label>
      a (Average)
      <input id="otg-a-avg" type="number" value="8.85116e-17" />
    </label>
    <label>
      a (Lower)
      <input id="otg-a-lower" type="number" value="3.54046e-17" />
    </label>
  </div>

  <div class="calc-results">
    <div>
      <div class="calc-label">Price (lower)</div>
      <div id="otg-price-lower" class="calc-value">–</div>
      <div class="calc-label">BTC needed (lower)</div>
      <div id="otg-btc-lower" class="calc-value">–</div>
    </div>
    <div>
      <div class="calc-label">Price (avg)</div>
      <div id="otg-price-avg" class="calc-value">–</div>
      <div class="calc-label">BTC needed (avg)</div>
      <div id="otg-btc-avg" class="calc-value">–</div>
    </div>
  </div>
</div>

## Werking
De calculator schat de BTC-prijs op de doelmaand via de power-law functie en rekent het benodigde BTC-bedrag uit:

```
BTC needed = target_usd / price
```

Zowel een **lower-band** als **gemiddelde** prijs wordt berekend, zodat je een bandbreedte hebt.

## Interpretatie
- Gebruik **lower** voor een conservatief plan.
- Gebruik **avg** voor een neutrale schatting.

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

.calc-grid input {
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #cbd5f5;
}

.calc-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.calc-label {
  font-size: 0.8rem;
  color: #64748b;
}

.calc-value {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.6rem;
}
</style>

<script src="{{ '/assets/js/calculators-common.js' | relative_url }}"></script>
<script src="{{ '/assets/js/one-time-goal.js' | relative_url }}"></script>
