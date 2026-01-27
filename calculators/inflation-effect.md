---
layout: page
title: "Inflation Effect"
permalink: /calculators/inflation-effect/
---

## Doel
Deze calculator laat zien hoe **inflatie** jouw huidige maandelijkse kosten beïnvloedt over een aantal jaren.

## Calculator
<div class="calc-card">
  <div class="calc-grid">
    <label>
      Base ($/mo today)
      <input id="inf-base" type="number" value="6000" step="100" />
    </label>
    <label>
      Years ahead
      <input id="inf-years" type="number" value="10" />
    </label>
    <label>
      Inflatie (%/jaar)
      <input id="inf-rate" type="number" value="2" step="0.1" />
    </label>
  </div>

  <div class="calc-results">
    <div>
      <div class="calc-label">Future nominal</div>
      <div id="inf-result" class="calc-value">–</div>
    </div>
  </div>
</div>

## Werking
Er wordt een eenvoudig samengestelde inflatieberekening gemaakt:

```
future_nominal = base_amount · (1 + inflatie) ^ jaren
```

## Interpretatie
- Hogere inflatie of langere tijd ⇒ fors hogere toekomstige kosten.

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
</style>

<script src="{{ '/assets/js/calculators-common.js' | relative_url }}"></script>
<script src="{{ '/assets/js/inflation-effect.js' | relative_url }}"></script>
