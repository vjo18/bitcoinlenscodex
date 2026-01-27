---
layout: page
title: "Required BTC vs Retire Year"
permalink: /calculators/required-btc-retire-year/
---

## Doel
Deze calculator toont hoeveel BTC je nodig hebt om met een **maandelijkse uitkering (r_out)** te starten op een bepaald pensioenjaar. Ze helpt je inschatten hoe het benodigde BTC-bedrag evolueert als je later (of vroeger) met pensioen gaat.

## Calculator
<div class="calc-card">
  <div class="calc-grid">
    <label>
      Desired r_out (USD/maand)
      <input id="rby-target-rout" type="number" value="6000" step="100" />
    </label>
    <label>
      Retire year
      <input id="rby-retire-year" type="number" value="2030" />
    </label>
    <label>
      Retire month
      <input id="rby-retire-month" type="number" value="1" min="1" max="12" />
    </label>
    <label>
      Jaarbereik (aantal jaren)
      <input id="rby-year-range" type="number" value="40" min="1" max="80" />
    </label>
    <label>
      Band
      <select id="rby-band">
        <option value="lower">Lower (conservatief)</option>
        <option value="avg" selected>Average</option>
      </select>
    </label>
    <label>
      b exponent
      <input id="rby-b-exp" type="number" step="0.0001" value="5.5697" />
    </label>
    <label>
      a (Average)
      <input id="rby-a-avg" type="number" value="8.85116e-17" />
    </label>
    <label>
      a (Lower)
      <input id="rby-a-lower" type="number" value="3.54046e-17" />
    </label>
  </div>

  <p id="rby-summary" class="calc-summary"></p>

  <div class="calc-table">
    <table>
      <thead>
        <tr>
          <th>Retire year</th>
          <th>Prijs (USD)</th>
          <th>BTC nodig</th>
        </tr>
      </thead>
      <tbody id="rby-table-body"></tbody>
    </table>
  </div>
</div>

## Werking
De calculator bepaalt de verwachte BTC-prijs op het gekozen pensioenjaar via de power-law functie:

```
price = a · (days_since_genesis)^b
```

Vervolgens wordt het benodigde BTC-bedrag berekend als benadering voor een stabiele uitkering op basis van het gekozen r_out en de horizon in jaren.

## Interpretatie
- **Later pensioen** ⇒ hogere verwachte prijs ⇒ minder BTC nodig voor hetzelfde r_out.
- **Vroeger pensioen** ⇒ lagere verwachte prijs ⇒ meer BTC nodig.

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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
  margin: 1rem 0;
  font-weight: 600;
}

.calc-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.calc-table th,
.calc-table td {
  border-bottom: 1px solid #e2e8f0;
  padding: 0.5rem 0.25rem;
  text-align: left;
}

.calc-table tr.highlight {
  background: rgba(37, 99, 235, 0.08);
  font-weight: 600;
}
</style>

<script src="{{ '/assets/js/calculators-common.js' | relative_url }}"></script>
<script src="{{ '/assets/js/required-btc-retire-year.js' | relative_url }}"></script>
