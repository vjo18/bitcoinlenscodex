---
layout: page
title: "Max Affordable r_out"
permalink: /calculators/max-affordable-rout/
---

## Doel
Deze calculator bepaalt hoeveel **maandelijkse opname (r_out)** je maximaal kan doen op basis van je huidige BTC, zonder dat je portefeuille te snel uitgeput raakt.

## Calculator
<div class="calc-card">
  <div class="calc-grid">
    <label>
      Huidige BTC
      <input id="mar-btc" type="number" value="1.62" step="0.0001" />
    </label>
    <label>
      Retire year
      <input id="mar-retire-year" type="number" value="2030" />
    </label>
    <label>
      Retire month
      <input id="mar-retire-month" type="number" value="1" min="1" max="12" />
    </label>
    <label>
      Inflatie (%/jaar)
      <input id="mar-infl" type="number" value="2" step="0.1" />
    </label>
    <label>
      Horizon (years)
      <input id="mar-horizon" type="number" value="25" min="1" max="120" />
    </label>
    <label>
      Finite horizon
      <input id="mar-finite" type="checkbox" />
    </label>
    <label>
      Band
      <select id="mar-band">
        <option value="lower">Lower (conservatief)</option>
        <option value="avg" selected>Average</option>
      </select>
    </label>
    <label>
      b exponent
      <input id="mar-b-exp" type="number" step="0.0001" value="5.5697" />
    </label>
    <label>
      a (Average)
      <input id="mar-a-avg" type="number" value="8.85116e-17" />
    </label>
    <label>
      a (Lower)
      <input id="mar-a-lower" type="number" value="3.54046e-17" />
    </label>
  </div>

  <div class="calc-results">
    <div>
      <div class="calc-label">Max sustainable r_out</div>
      <div id="mar-result" class="calc-value">–</div>
      <div id="mar-exhausted" class="calc-note">–</div>
    </div>
  </div>
</div>

## Werking
Er wordt een simulatie uitgevoerd die maand per maand verkochte BTC, restsaldo en USD-waarde bijhoudt. De calculator zoekt via binaire search het **hoogst haalbare r_out** dat niet tot uitputting leidt binnen de gekozen horizon (of 200 jaar bij “forever”).

## Interpretatie
- **Hogere inflatie** ⇒ lagere maximale r_out.
- **Korte horizon** ⇒ hogere r_out mogelijk.
- **Forever-mode** ⇒ conservatiever maximum.

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

.calc-results {
  margin-top: 1.5rem;
}

.calc-label {
  font-size: 0.85rem;
  color: #64748b;
}

.calc-value {
  font-size: 1.4rem;
  font-weight: 600;
}

.calc-note {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #334155;
}
</style>

<script src="{{ '/assets/js/calculators-common.js' | relative_url }}"></script>
<script src="{{ '/assets/js/max-affordable-rout.js' | relative_url }}"></script>
