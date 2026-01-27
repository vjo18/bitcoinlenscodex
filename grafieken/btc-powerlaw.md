---
layout: page
title: "BTC Power Law (EUR)"
permalink: /grafieken/btc-powerlaw/
---

<p>
  Deze pagina toont de BTC-prijsgrafiek (maandelijkse data) met power-law banden en de stabiliteit
  van de exponent (b) en R² doorheen de tijd.
</p>

<div class="btc-kpi-row">
  <div class="btc-kpi-card">
    <div class="btc-kpi-label">Live BTC</div>
    <div id="kpi-last-close" class="btc-kpi-value">–</div>
  </div>
  <div class="btc-kpi-card">
    <div class="btc-kpi-label">PL avg vandaag</div>
    <div id="kpi-pl-avg" class="btc-kpi-value">–</div>
  </div>
  <div class="btc-kpi-card">
    <div class="btc-kpi-label">PL support vandaag</div>
    <div id="kpi-pl-support" class="btc-kpi-value">–</div>
  </div>
  <div class="btc-kpi-card">
    <div class="btc-kpi-label">Days since genesis</div>
    <div id="kpi-days-genesis" class="btc-kpi-value">–</div>
  </div>
  <div class="btc-kpi-card">
    <div class="btc-kpi-label">a (scale)</div>
    <div id="kpi-a-scale" class="btc-kpi-value">–</div>
  </div>
  <div class="btc-kpi-card">
    <div class="btc-kpi-label">b (exponent)</div>
    <div id="kpi-b-exp" class="btc-kpi-value">–</div>
  </div>
  <div class="btc-kpi-card">
    <div class="btc-kpi-label">R² (full fit)</div>
    <div id="kpi-r2" class="btc-kpi-value">–</div>
  </div>
  <div class="btc-kpi-card">
    <div class="btc-kpi-label">Years since genesis</div>
    <div id="kpi-years-genesis" class="btc-kpi-value">–</div>
  </div>
</div>

<div class="btc-pl-controls">
  {% assign current_year = "now" | date: "%Y" %}
  {% assign max_projection_year = current_year | plus: 20 %}
  <div class="btc-kpi-card btc-pl-slider-card">
    <div class="btc-kpi-label">Projectie tot jaar</div>
    <div class="btc-pl-slider-row">
      <div id="projection-year-value" class="btc-kpi-value">{{ current_year }}</div>
      <input
        id="projection-year-slider"
        class="btc-pl-slider-input"
        type="range"
        min="2024"
        max="2064"
        step="1"
      />
    </div>
    <div id="projection-year-range" class="btc-pl-slider-range">{{ current_year }} → {{ max_projection_year }}</div>
  </div>

  <div class="btc-pl-toggles">
    <label class="btc-toggle">
      <span class="btc-toggle-label">Y log</span>
      <input id="toggle-ylog" type="checkbox" checked />
      <span class="btc-toggle-switch"></span>
    </label>

    <label class="btc-toggle">
      <span class="btc-toggle-label">X log</span>
      <input id="toggle-xlog" type="checkbox" />
      <span class="btc-toggle-switch"></span>
    </label>
  </div>
</div>

<div class="btc-powerlaw-charts">
  <div class="chart-block">
  <h3>BTC prijs + power law (support & middenlijn)</h3>
  <p class="chart-subtitle">Maandelijkse closes in EUR • sinds 2010</p>
  <div class="chart-canvas">
    <canvas id="btc-price-chart"></canvas>
  </div>
</div>

<div class="chart-block">
  <h3>b exponent (slope) doorheen de tijd</h3>
  <div class="chart-canvas">
    <canvas id="btc-slope-chart"></canvas>
  </div>
</div>

<div class="chart-block">
  <h3>R² (fit quality) doorheen de tijd</h3>
  <div class="chart-canvas">
    <canvas id="btc-r2-chart"></canvas>
  </div>
</div>

</div>

<style>
/* =======================================================================
   BTC Power Law – layout & styling
   ======================================================================= */

/* Maak de content wat breder op grotere schermen */
@media (min-width: 1200px) {
  .page .page__inner,
  .post .post__inner {
    max-width: clamp(820px, 85vw, 1400px);
  }
}

@media (min-width: 1600px) {
  .page .page__inner,
  .post .post__inner {
    max-width: clamp(900px, 90vw, 1600px);
  }
}

/* ----- Containers van de BTC Power Law sectie ----- */

.btc-pl-header,
.btc-kpi-row,
.btc-pl-controls,
.btc-powerlaw-charts {
  max-width: 1100px;
  margin-inline: auto;
}

/* ----- Header: titel + toggles ----- */

.btc-pl-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin: 2rem auto 1.5rem;
}

@media (max-width: 768px) {
  .btc-pl-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

.btc-pl-title {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 700;
}

.btc-pl-subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.95rem;
  color: #64748b;
}

/* ----- Toggle switches (Y log / X log) ----- */

.btc-pl-toggles {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.btc-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  user-select: none;
}

.btc-toggle-label {
  color: #64748b;
}

.btc-toggle input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.btc-toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: #e5e7eb;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.5);
  transition: background 0.2s ease;
}

.btc-toggle-switch::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.35);
  transition: transform 0.2s ease;
}

.btc-toggle input[type="checkbox"]:checked + .btc-toggle-switch {
  background: #16a34a;
}

.btc-toggle input[type="checkbox"]:checked + .btc-toggle-switch::after {
  transform: translateX(20px);
}

body[data-theme="dark"] .btc-toggle-switch {
  background: #0f172a;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.6);
}

body[data-theme="dark"] .btc-toggle-switch::after {
  background: #e5e7eb;
}

/* =======================================================================
   KPI CARDS
   ======================================================================= */

.btc-kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.9rem;
  margin: 0 auto 2rem;
}

/* ----- Controls row (slider + toggles) ----- */

.btc-pl-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin: 0 auto 2rem;
}

.btc-pl-slider-card {
  padding: 1rem 1.1rem;
  flex: 1 1 540px;
  max-width: 640px;
}

.btc-pl-slider-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.35rem;
}

.btc-pl-slider-input {
  flex: 1;
  min-width: 180px;
  accent-color: #f97316;
}

.btc-pl-slider-range {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

body[data-theme="dark"] .btc-pl-slider-range {
  color: #9ca3af;
}

@media (max-width: 900px) {
  .btc-pl-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .btc-pl-slider-card {
    width: 100%;
    max-width: none;
  }
}

.btc-kpi-card {
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}

.btc-kpi-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
  border-color: #d1d5db;
}

.btc-kpi-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.btc-kpi-value {
  margin-top: 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

#kpi-last-close,
#kpi-pl-avg,
#kpi-pl-support {
  font-size: 1.25rem;
}

body[data-theme="dark"] .btc-kpi-card {
  background: radial-gradient(circle at top left, rgba(148, 163, 184, 0.15), transparent 55%),
              rgba(15, 23, 42, 0.95);
  border-color: rgba(148, 163, 184, 0.45);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.8);
}

body[data-theme="dark"] .btc-kpi-label {
  color: #9ca3af;
}

body[data-theme="dark"] .btc-kpi-value {
  color: #e5e7eb;
}

/* =======================================================================
   CHARTS layout als grid + cards
   ======================================================================= */

.btc-powerlaw-charts {
  display: grid;
  grid-template-columns: minmax(0, 1fr); /* altijd 1 kolom */
  gap: 1.5rem;
  margin: 0 auto 2.5rem;
}

/* geen @media meer: alle grafieken full-width onder elkaar */



.chart-block {
  padding: 1rem 1.1rem 1.2rem;
  border-radius: 1rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  position: relative;          /* aanbevolen door Chart.js */
}

.chart-block h3 {
  margin: 0 0 0.7rem;
  font-size: 1rem;
  font-weight: 600;
}

.chart-subtitle {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

/* Canvas krijgt z'n hoogte via een wrapper, niet via de card zelf */
.chart-canvas {
  position: relative;
  height: 260px;          /* hoogte voor de 2 onderste grafieken */
}

/* eerste (hoofd)grafiek mag wat hoger zijn */
@media (min-width: 1024px) {
  .chart-block:first-child .chart-canvas {
    height: 360px;
  }
}

/* Chart.js vult de wrapper volledig */
.chart-canvas canvas {
  width: 100%;
  height: 100% !important;
  display: block;
}


body[data-theme="dark"] .chart-block {
  background: rgba(15, 23, 42, 0.96);
  border-color: rgba(148, 163, 184, 0.45);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.9);
}

body[data-theme="dark"] .chart-block h3 {
  color: #e5e7eb;
}

body[data-theme="dark"] .chart-subtitle {
  color: #9ca3af;
}
</style>


<!-- Chart.js van CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Losse datafile met maandelijkse closes -->
<script src="{{ '/assets/js/btc-powerlaw-data.js' | relative_url }}"></script>

<!-- Jouw eigen script -->
<script src="{{ '/assets/js/btc-powerlaw.js' | relative_url }}"></script>
