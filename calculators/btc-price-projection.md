---
layout: page
title: "BTC Price Projection"
permalink: /calculators/btc-price-projection/
---

## Doel
Deze calculator projecteert de BTC-prijs op een toekomstige maand en berekent ook wat **10 BTC** en **100 BTC** waard zouden zijn.

## Calculator
<div class="calc-card">
  <div class="calc-grid">
    <label>
      Year
      <input id="bpp-year" type="number" value="2035" />
    </label>
    <label>
      Month
      <input id="bpp-month" type="number" value="1" min="1" max="12" />
    </label>
    <label>
      b exponent
      <input id="bpp-b-exp" type="number" step="0.0001" value="5.5697" />
    </label>
    <label>
      a (Average)
      <input id="bpp-a-avg" type="number" value="8.85116e-17" />
    </label>
    <label>
      a (Lower)
      <input id="bpp-a-lower" type="number" value="3.54046e-17" />
    </label>
  </div>

  <div class="calc-results">
    <div>
      <div class="calc-label">1 BTC (lower)</div>
      <div id="bpp-lower-1" class="calc-value">–</div>
      <div class="calc-label">10 BTC (lower)</div>
      <div id="bpp-lower-10" class="calc-value">–</div>
      <div class="calc-label">100 BTC (lower)</div>
      <div id="bpp-lower-100" class="calc-value">–</div>
    </div>
    <div>
      <div class="calc-label">1 BTC (avg)</div>
      <div id="bpp-avg-1" class="calc-value">–</div>
      <div class="calc-label">10 BTC (avg)</div>
      <div id="bpp-avg-10" class="calc-value">–</div>
      <div class="calc-label">100 BTC (avg)</div>
      <div id="bpp-avg-100" class="calc-value">–</div>
    </div>
  </div>
</div>

## Werking
Voor zowel de **lower band** als de **average band** wordt een prijs berekend:

```
price = a · (days_since_genesis)^b
```

Daarna wordt de waarde voor 1, 10 en 100 BTC berekend.

## Interpretatie
- **Lower band** geeft een conservatieve raming.
- **Average band** is een neutralere verwachting.

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
<script src="{{ '/assets/js/btc-price-projection.js' | relative_url }}"></script>
