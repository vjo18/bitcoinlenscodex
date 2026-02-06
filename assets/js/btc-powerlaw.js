// assets/js/btc-powerlaw.js

// =============== DATA ===============

const btcMonthlyCloses = window.btcMonthlyCloses ?? [];

// Zorg dat alle charts exact dezelfde fonts gebruiken
if (typeof Chart !== "undefined") {
  Chart.defaults.font.family =
    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.color = "#0f172a";
}


// =============== CONSTANTS & HELPERS ===============

const GENESIS_MS = Date.UTC(2009, 0, 3); // 2009-01-03
const EPS = 1e-9;
const QUANTILE_LEVELS = [0, 10, 20, 50, 80, 90, 100];
const DEFAULT_QUANTILE_MULTIPLIERS = {
  0: 0.35,
  10: 0.5,
  20: 0.6,
  50: 0.9,
  80: 1.7,
  90: 2.5,
  100: 4.0,
};

// dagen sinds genesis op basis van datumstring (YYYY-MM-DD)
function daysSinceGenesisFromDateStr(dateStr) {
  const ms = new Date(dateStr + "T00:00:00Z").getTime();
  const d = (ms - GENESIS_MS) / (1000 * 60 * 60 * 24);
  return Math.max(EPS, d);
}

// price = a * days^b
function pricePLDays(a, b, dateStr) {
  const d = daysSinceGenesisFromDateStr(dateStr);
  return a * Math.pow(d, b);
}

// eenvoudige lineaire regressie in log10-space
// x = log10(days), y = log10(price)
function linearRegressionStats(xs, ys) {
  const n = xs.length;
  const xMean = xs.reduce((p, c) => p + c, 0) / n;
  const yMean = ys.reduce((p, c) => p + c, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += (xs[i] - xMean) * (xs[i] - xMean);
  }
  const B = num / (den || 1e-12); // slope
  const A = yMean - B * xMean; // intercept
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const yPred = A + B * xs[i];
    ssRes += (ys[i] - yPred) ** 2;
    ssTot += (ys[i] - yMean) ** 2;
  }
  const r2 = 1 - ssRes / (ssTot || 1e-12);
  return { A, B, r2 };
}

// rollende fits: cumulatieve regressie tot en met elke maand
function buildRollingFits(data) {
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const results = [];
  const xsAll = [];
  const ysAll = [];

  for (let i = 0; i < sorted.length; i++) {
    const row = sorted[i];
    const d = daysSinceGenesisFromDateStr(row.date);
    if (d <= 0 || row.price <= 0) continue;

    xsAll.push(Math.log10(d));
    ysAll.push(Math.log10(row.price));

    if (xsAll.length < 12) continue; // nog te weinig punten

    const { A, B, r2 } = linearRegressionStats(xsAll, ysAll);

    results.push({
      date: row.date,
      year: new Date(row.date + "T00:00:00Z").getUTCFullYear(),
      bExp: B,
      aCoef: Math.pow(10, A),
      r2,
      n: xsAll.length,
    });
  }

  return results;
}

function formatMoneyEUR(x) {
  if (!isFinite(x)) return "-";
  return x.toLocaleString("nl-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

// label op log/linear as
function formatYTick(v) {
  if (!isFinite(v) || v <= 0) return "";
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(2) + " mld";
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(2) + " mln";
  if (v >= 1_000) return (v / 1_000).toFixed(0) + "k";
  if (v >= 1) return v.toFixed(0);
  return v.toPrecision(2);
}

// helper voor x-tick → jaarlabel
function formatXTickDays(value) {
  const days = Number(value);
  if (!isFinite(days) || days <= 0) return "";
  const year = 2009 + Math.floor(days / 365);
  return year.toString();
}

function quantile(sortedArr, q) {
  if (!sortedArr.length) return NaN;
  if (q <= 0) return sortedArr[0];
  if (q >= 1) return sortedArr[sortedArr.length - 1];
  const pos = (sortedArr.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sortedArr[base + 1] ?? sortedArr[base];
  return sortedArr[base] + rest * (next - sortedArr[base]);
}

function sanitizeQuantileBands(rawBands, plMedian) {
  const sanitized = {};
  let previous = 0;
  const fallbackBase = isFinite(plMedian) && plMedian > 0 ? plMedian : 1;

  for (const level of QUANTILE_LEVELS) {
    const raw = Number(rawBands?.[level]);
    const fallbackMultiplier = DEFAULT_QUANTILE_MULTIPLIERS[level] || 1;
    const fallback = fallbackBase * fallbackMultiplier;
    const finite = isFinite(raw) && raw > 0 ? raw : fallback;
    const next = Math.max(finite, previous + EPS);
    sanitized[level] = next;
    previous = next;
  }

  return sanitized;
}

function getQuantileValue(row, level, mode) {
  if (!row || mode === "off") return row?.plAvg ?? null;
  const bands =
    mode === "rolling" ? row.quantileBandsRolling : row.quantileBandsRegression;
  const band = bands?.[level];
  if (isFinite(band) && band > 0) return band;
  return row?.plAvg ?? null;
}

// =============== DATA PREP ===============

// price = a * days^b
function pricePLDays(a, b, dateStr) {
  const d = daysSinceGenesisFromDateStr(dateStr);
  return a * Math.pow(d, b);
}

// rollende fits: cumulatieve regressie tot en met elke maand
function buildRollingFits(data) {
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const results = [];
  const xsAll = [];
  const ysAll = [];

  for (let i = 0; i < sorted.length; i++) {
    const row = sorted[i];
    const d = daysSinceGenesisFromDateStr(row.date);
    if (d <= 0 || row.price <= 0) continue;

    xsAll.push(Math.log10(d));
    ysAll.push(Math.log10(row.price));

    if (xsAll.length < 12) continue; // nog te weinig punten

    const { A, B, r2 } = linearRegressionStats(xsAll, ysAll);

    results.push({
      date: row.date,
      year: new Date(row.date + "T00:00:00Z").getUTCFullYear(),
      bExp: B,
      aCoef: Math.pow(10, A),
      r2,
      n: xsAll.length,
    });
  }

  return results;
}

function buildResidualRows(data, aAvg, bExp) {
  return (data ?? [])
    .filter((row) => row && row.date)
    .map((row) => {
      const price = Number(row.price);
      const d = daysSinceGenesisFromDateStr(row.date);
      if (!isFinite(price) || price <= 0 || !isFinite(d) || d <= 0) return null;
      const plMedian = pricePLDays(aAvg, bExp, row.date);
      if (!isFinite(plMedian) || plMedian <= 0) return null;
      return {
        date: row.date,
        logDays: Math.log10(d),
        residual: Math.log10(price) - Math.log10(plMedian),
      };
    })
    .filter(Boolean);
}

function buildResidualRegressionModels(residualRows) {
  if (!residualRows.length) return null;
  const residuals = residualRows.map((r) => r.residual).sort((a, b) => a - b);
  const models = {};

  for (const level of QUANTILE_LEVELS) {
    const threshold = quantile(residuals, level / 100);
    let subset = residualRows;
    if (level > 50) {
      subset = residualRows.filter((r) => r.residual >= threshold);
    } else if (level < 50) {
      subset = residualRows.filter((r) => r.residual <= threshold);
    }
    if (subset.length < 2) {
      subset = residualRows;
    }
    const xs = subset.map((r) => r.logDays);
    const ys = subset.map((r) => r.residual);
    const { A, B } = linearRegressionStats(xs, ys);
    models[level] = { intercept: A, slope: B, threshold };
  }

  return models;
}

function getRegressionBandsForDate(dateStr, aAvg, bExp, models) {
  const plMedian = pricePLDays(aAvg, bExp, dateStr);
  const d = daysSinceGenesisFromDateStr(dateStr);
  const logDays = Math.log10(d);
  const bands = {};

  for (const level of QUANTILE_LEVELS) {
    const model = models?.[level];
    let residual = Math.log10(DEFAULT_QUANTILE_MULTIPLIERS[level] || 1);
    if (model && isFinite(model.intercept) && isFinite(model.slope)) {
      residual = model.intercept + model.slope * logDays;
    }
    bands[level] = plMedian * Math.pow(10, residual);
  }

  return sanitizeQuantileBands(bands, plMedian);
}


// prijs + quantile power law banden, mét projectie tot gekozen jaar
function buildPriceSeries(aAvg, bExp, aLower, endYear = 2054) {
  const cutoff = "2010-05-01";
  const sorted = [...btcMonthlyCloses].sort((a, b) =>
    a.date < b.date ? -1 : 1
  );

  const residualRows = buildResidualRows(sorted, aAvg, bExp);
  const regressionModels = buildResidualRegressionModels(residualRows);
  const rollingResiduals = [];
  let latestRollingQuantileResiduals = Object.fromEntries(
    QUANTILE_LEVELS.map((level) => [
      level,
      Math.log10(DEFAULT_QUANTILE_MULTIPLIERS[level] || 1),
    ])
  );

  const rows = [];

  // historische data
  for (const row of sorted) {
    if (row.date < cutoff) continue;
    const plMedian = pricePLDays(aAvg, bExp, row.date);
    const plLower = pricePLDays(aLower, bExp, row.date);
    const price = Number(row.price);

    if (isFinite(price) && price > 0 && isFinite(plMedian) && plMedian > 0) {
      const residual = Math.log10(price) - Math.log10(plMedian);
      rollingResiduals.push(residual);
      const sortedResiduals = [...rollingResiduals].sort((a, b) => a - b);
      latestRollingQuantileResiduals = {};
      for (const level of QUANTILE_LEVELS) {
        latestRollingQuantileResiduals[level] = quantile(
          sortedResiduals,
          level / 100
        );
      }
    }

    const rollingBands = {};
    for (const level of QUANTILE_LEVELS) {
      const residualShift = latestRollingQuantileResiduals[level];
      rollingBands[level] = plMedian * Math.pow(10, residualShift);
    }
    const quantileBandsRolling = sanitizeQuantileBands(rollingBands, plMedian);
    const quantileBandsRegression = getRegressionBandsForDate(
      row.date,
      aAvg,
      bExp,
      regressionModels
    );

    const bandLow = quantileBandsRegression[0];
    const bandHigh = quantileBandsRegression[100];
    const oscillator =
      price > 0 && isFinite(bandLow) && isFinite(bandHigh) && bandHigh > bandLow
        ? ((price - bandLow) / (bandHigh - bandLow)) * 100
        : null;

    rows.push({
      date: row.date,
      price: isFinite(price) && price > 0 ? price : null,
      plMedian,
      plAvg: plMedian,
      plLower,
      quantileBandsRolling,
      quantileBandsRegression,
      oscillator: oscillator == null ? null : Math.max(0, Math.min(100, oscillator)),
    });
  }

  // projectie: alleen power-law lijnen (geen prijs) tot 2054
  if (sorted.length) {
    const last = sorted[sorted.length - 1];
    const lastDate = new Date(last.date + "T00:00:00Z");
    let y = lastDate.getUTCFullYear();
    let m = lastDate.getUTCMonth() + 1;

    m++;
    if (m > 12) {
      m = 1;
      y++;
    }

    while (y < endYear || (y === endYear && m <= 12)) {
      const jsDate = new Date(Date.UTC(y, m - 1, 1));
      const dateStr = jsDate.toISOString().slice(0, 10);
      const plMedian = pricePLDays(aAvg, bExp, dateStr);
      const plLower = pricePLDays(aLower, bExp, dateStr);

      const rollingBands = {};
      for (const level of QUANTILE_LEVELS) {
        const residualShift = latestRollingQuantileResiduals[level];
        rollingBands[level] = plMedian * Math.pow(10, residualShift);
      }

      rows.push({
        date: dateStr,
        price: null,
        plMedian,
        plAvg: plMedian,
        plLower,
        quantileBandsRolling: sanitizeQuantileBands(rollingBands, plMedian),
        quantileBandsRegression: getRegressionBandsForDate(
          dateStr,
          aAvg,
          bExp,
          regressionModels
        ),
        oscillator: null,
      });

      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
  }

  return {
    rows,
    rollingQuantileResiduals: latestRollingQuantileResiduals,
    regressionModels,
  };
}

// =============== CHART CONSTRUCTORS ===============

let priceChart = null;
let slopeChart = null;
let r2Chart = null;
let oscillatorChart = null;

// hoofdchart met X/Y log-toggle + jaartallen op de x-as
function createPriceChart(ctx, yLog, xLog, priceData, quantileMode) {
  const pointsMarket = [];
  const pointsAvg = [];
  const pointsLower = [];
  const quantilePoints = QUANTILE_LEVELS.reduce((acc, level) => {
    acc[level] = [];
    return acc;
  }, {});

  for (const row of priceData) {
    const d = daysSinceGenesisFromDateStr(row.date);
    pointsMarket.push({
      x: d,
      y: row.price ?? null,
      date: row.date,
    });
    for (const level of QUANTILE_LEVELS) {
      quantilePoints[level].push({
        x: d,
        y: getQuantileValue(row, level, quantileMode),
        date: row.date,
      });
    }
    pointsAvg.push({ x: d, y: row.plAvg, date: row.date });
    pointsLower.push({ x: d, y: row.plLower, date: row.date });
  }

  // ✅ bepaal eerste echte datapunt (met price) en gebruik dat als x-min
  const firstWithPrice = pointsMarket.find(p => p.y != null);
  const minDays = firstWithPrice ? firstWithPrice.x : 1;

  if (priceChart) {
    priceChart.destroy();
  }

  const quantileBandColors = {
    0: "rgba(30, 41, 59, 0.18)",
    10: "rgba(37, 99, 235, 0.16)",
    20: "rgba(59, 130, 246, 0.14)",
    50: "rgba(16, 185, 129, 0.15)",
    80: "rgba(249, 115, 22, 0.14)",
    90: "rgba(239, 68, 68, 0.14)",
    100: "rgba(127, 29, 29, 0.16)",
  };

  const quantileBorderColors = {
    0: "#334155",
    10: "#2563eb",
    20: "#3b82f6",
    50: "#10b981",
    80: "#f97316",
    90: "#ef4444",
    100: "#7f1d1d",
  };

  const quantileDatasets =
    quantileMode === "off"
      ? []
      : QUANTILE_LEVELS.map((level, idx) => ({
          label: `Power law quantile ${level}%`,
          data: quantilePoints[level],
          borderWidth: level === 50 ? 2.2 : 1.7,
          borderColor: quantileBorderColors[level],
          backgroundColor: quantileBandColors[level],
          pointRadius: 0,
          spanGaps: true,
          parsing: false,
          fill: idx === 0 ? false : idx - 1,
          order: 0,
        }));

  priceChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        ...quantileDatasets,
        {
          label: "Power law middenlijn",
          data: pointsAvg,
          borderWidth: 1.5,
          borderColor: "#0f172a",
          borderDash: [4, 2],
          pointRadius: 0,
          spanGaps: true,
          parsing: false,
          order: 3,
        },
        {
          label: "Power law support",
          data: pointsLower,
          borderWidth: 1.5,
          borderColor: "#2563eb",
          borderDash: [2, 2],
          pointRadius: 0,
          spanGaps: true,
          parsing: false,
          order: 3,
        },
        {
          label: "BTC maandelijkse close (EUR)",
          data: pointsMarket,
          borderWidth: 2,
          borderColor: "#f97316",
          pointRadius: 0,
          spanGaps: false,
          parsing: false,
          order: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        mode: "index",
        intersect: false,
      },

      plugins: {
        legend: { display: true, position: "bottom" },
        tooltip: {
          callbacks: {
            title: (items) => items?.[0]?.raw?.date ?? "",
            label: (context) =>
              `${context.dataset.label}: ${formatMoneyEUR(context.parsed.y)}`,
          },
        },

        zoom: {
          limits: {
            x: { min: "original", max: "original" },
            // y blijft vast: geen zoom, geen pan
          },

          pan: {
            enabled: true,
            mode: "x",
            // optioneel: modifierKey: "ctrl",
          },

          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            drag: {
              enabled: true,
              backgroundColor: "rgba(37, 99, 235, 0.15)",
              borderColor: "#2563eb",
              borderWidth: 1,
            },
            mode: "x", // ✅ alleen X (tijd)
          },
        },
      },


      scales: {
        x: {
          type: xLog ? "logarithmic" : "linear",
          min: minDays,
          ticks: {
            maxTicksLimit: 12,
            callback: (value) => formatXTickDays(value),
          },
          grid: { color: "rgba(148, 163, 184, 0.3)" },
          title: {
            display: true,
            text: "Days since genesis",
          },
        },

        y: {
          type: yLog ? "logarithmic" : "linear",
          min: yLog ? 0.1 : 0,
          ticks: {
            callback: (value) => formatYTick(value),
          },
          grid: { color: "rgba(148, 163, 184, 0.3)" },
          title: {
            display: true,
            text: "BTC prijs (EUR)",
          },
        },
      },
    },

  });

// Double-click reset zoom (alleen op de price chart canvas)
const canvas = priceChart?.canvas;

if (canvas) {
  // voorkom dubbele listeners bij re-render (je destroy/recreate chart)
  if (canvas._dblClickZoomResetHandler) {
    canvas.removeEventListener("dblclick", canvas._dblClickZoomResetHandler);
  }

  canvas._dblClickZoomResetHandler = () => {
    if (priceChart) priceChart.resetZoom();
  };

  canvas.addEventListener("dblclick", canvas._dblClickZoomResetHandler);
}


}

function createQuantileOscillatorChart(ctx, priceData) {
  // Neem enkel punten waar oscillator bestaat
  const pts = priceData
    .map((row) => ({
      date: row.date,
      y: row.oscillator, // 0..100
    }))
    .filter((p) => isFinite(p.y) && p.y >= 0 && p.y <= 100);

  if (!pts.length) {
    console.warn("[btc-powerlaw] Oscillator heeft geen geldige punten om te plotten.");
    if (oscillatorChart) {
      oscillatorChart.destroy();
      oscillatorChart = null;
    }
    return;
  }

  // Labels = maandelijkse datums (category scale), ticks tonen enkel jaar
  const labels = pts.map((p) => p.date);
  const values = pts.map((p) => p.y);

  if (oscillatorChart) oscillatorChart.destroy();

  oscillatorChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        // "Glow" laag (dik + transparant) onder de echte lijn
        {
          label: "Quantile (glow)",
          data: values,
          borderColor: "rgba(37, 99, 235, 0.22)",
          borderWidth: 10,
          pointRadius: 0,
          tension: 0.15,
          fill: false,
          order: 0,
        },
        // Hoofdlijn
        {
          label: "Bitcoin Price In Quantiles",
          data: values,
          borderColor: "#2563eb",
          borderWidth: 2.2,
          pointRadius: 0,
          tension: 0.15,
          fill: false,
          order: 1,
        },
        // Referentielijn Q60 (optioneel maar matcht de post)
        {
          label: "Q60",
          data: values.map(() => 60),
          borderColor: "rgba(15, 23, 42, 0.35)",
          borderWidth: 1.2,
          borderDash: [6, 6],
          pointRadius: 0,
          fill: false,
          order: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: {
          type: "category",
          ticks: {
            maxTicksLimit: 14,
            callback: (value) => {
              // value = index op category scale
              const idx = typeof value === "number" ? value : Number(value);
              const d = labels[idx];
              // toon enkel jaar op de as
              return d ? d.slice(0, 4) : "";
            },
          },
          grid: { color: "rgba(148, 163, 184, 0.3)" },
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 10,
            callback: (v) => `Q${v}`,
          },
          grid: { color: "rgba(148, 163, 184, 0.3)" },
        },
      },
      plugins: {
        legend: { display: false }, // zoals je screenshot
        tooltip: {
          callbacks: {
            title: (items) => labels[items[0].dataIndex] ?? "",
            label: (ctx) => `Q${Number(ctx.parsed.y).toFixed(1)}`,
          },
        },
      },
    },
  });
}


function createSlopeChart(ctx, rollingFits) {
  const labels = rollingFits.map((d) => d.date);
  const bValues = rollingFits.map((d) => d.bExp);

  if (slopeChart) slopeChart.destroy();

  slopeChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "b exponent",
          data: bValues,
          borderWidth: 1.5,
          borderColor: "#0f172a",
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,        // ✅ tooltip triggert op hele verticale strip
      },
      scales: {
        x: {
  type: "category",
  ticks: {
    maxTicksLimit: 8,
    callback: (value) => {
      const idx = typeof value === "number" ? value : Number(value);
      const label = labels[idx];
      return label ? label.slice(0, 4) : ""; // alleen jaar
    },
  },
          grid: {
            color: "rgba(148, 163, 184, 0.3)",
          },
        },
        y: {
          type: "linear",
          ticks: {},
          grid: {
            color: "rgba(148, 163, 184, 0.3)",
          },
        },
      },
      plugins: {
        legend: { display: true, position: "bottom" },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(4)}`,
          },
        },
      },
    },
  });
}



function createR2Chart(ctx, rollingFits) {
  const labels = rollingFits.map((d) => d.date);
  const r2Values = rollingFits.map((d) => d.r2);

  if (r2Chart) r2Chart.destroy();

  r2Chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "R²",
          data: r2Values,
          borderWidth: 1.5,
          borderColor: "#2563eb",
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,        // ✅ zelfde tooltip-gedrag als hoofdchart
      },
      scales: {
        x: {
          type: "category",
          ticks: {
            maxTicksLimit: 8,
            callback: (value) => {
              const idx = typeof value === "number" ? value : Number(value);
              const label = labels[idx];
              return label ? label.slice(0, 4) : ""; // alleen jaar
            },
          },
          grid: {
            color: "rgba(148, 163, 184, 0.3)",
          },
        },
        y: {
          type: "linear",
          min: 0,
          max: 1,
          ticks: {},
          grid: {
            color: "rgba(148, 163, 184, 0.3)",
          },
        },
      },
      plugins: {
        legend: { display: true, position: "bottom" },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(3)}`,
          },
        },
      },
    },
  });
}


// kleine helper voor KPI's
function setKpiText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

async function fetchLiveBtceur() {
  try {
    const resp = await fetch("https://api.coinbase.com/v2/prices/BTC-EUR/spot");
    if (!resp.ok) {
      throw new Error("HTTP " + resp.status);
    }

    const json = await resp.json();
    const amount = parseFloat(json?.data?.amount);

    if (!isFinite(amount)) {
      throw new Error("Ongeldige amount uit API");
    }

    return amount;
  } catch (err) {
    console.warn("Kon live BTCEUR niet ophalen:", err);
    return null; // fallback naar laatste close
  }
}


// =============== INIT ===============

function getRollingBandsForDate(dateStr, aAvg, bExp, rollingQuantileResiduals) {
  const plMedian = pricePLDays(aAvg, bExp, dateStr);
  const bands = {};
  for (const level of QUANTILE_LEVELS) {
    const residualShift =
      rollingQuantileResiduals?.[level] ??
      Math.log10(DEFAULT_QUANTILE_MULTIPLIERS[level] || 1);
    bands[level] = plMedian * Math.pow(10, residualShift);
  }
  return sanitizeQuantileBands(bands, plMedian);
}

function updateTodayKpis(A_AVG, B_EXP, quantileMode, rollingQuantileResiduals, regressionModels) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const dToday = daysSinceGenesisFromDateStr(todayIso);
  const todayMedian = pricePLDays(A_AVG, B_EXP, todayIso);
  let todaySupport = todayMedian * (DEFAULT_QUANTILE_MULTIPLIERS[10] || 1);

  if (quantileMode === "rolling") {
    const bands = getRollingBandsForDate(
      todayIso,
      A_AVG,
      B_EXP,
      rollingQuantileResiduals
    );
    todaySupport = bands[10] ?? todaySupport;
  } else {
    const bands = getRegressionBandsForDate(todayIso, A_AVG, B_EXP, regressionModels);
    todaySupport = bands[10] ?? todaySupport;
  }

  setKpiText("kpi-pl-avg", formatMoneyEUR(todayMedian));
  setKpiText("kpi-pl-support", formatMoneyEUR(todaySupport));
  setKpiText(
    "kpi-days-genesis",
    Math.floor(dToday).toLocaleString("nl-BE")
  );
  setKpiText(
    "kpi-years-genesis",
    (dToday / 365.25).toFixed(2).replace(".", ",")
  );
}


document.addEventListener("DOMContentLoaded", () => {

  if (!btcMonthlyCloses.length) {
    console.warn(
      "btcMonthlyCloses is leeg – vergeet je prijsdata niet te plakken!"
    );
    return;
  }

  // eerst alle fits berekenen
  const rollingFits = buildRollingFits(btcMonthlyCloses);
  const latestFit = rollingFits.length
    ? rollingFits[rollingFits.length - 1]
    : null;

  // power-law parameters uit de meest recente fit
  const B_EXP = latestFit ? latestFit.bExp : 5.5697;
  const A_AVG = latestFit ? latestFit.aCoef : 8.85116e-17;
  const A_LOWER = A_AVG * 0.4;
  const quantileModeSlider = document.getElementById("quantile-mode-slider");
  const quantileModeLabel = document.getElementById("quantile-mode-label");
  const quantileModeValues = ["off", "rolling", "regression"];
  const quantileModeText = {
    off: "Uit",
    rolling: "Rolling window",
    regression: "Power regression",
  };

  let quantileMode = "regression";
  if (quantileModeSlider) {
    const initialIndex = Number(quantileModeSlider.value);
    quantileMode = quantileModeValues[initialIndex] || "regression";
  }

  const currentYear = new Date().getUTCFullYear();
  const maxProjectionYear = currentYear + 20;
  const projectionSlider = document.getElementById("projection-year-slider");
  const projectionValue = document.getElementById("projection-year-value");
  const projectionRange = document.getElementById("projection-year-range");

  if (projectionSlider) {
    projectionSlider.min = String(currentYear);
    projectionSlider.max = String(maxProjectionYear);
    projectionSlider.value = String(currentYear);
  }

  if (projectionRange) {
    projectionRange.textContent = `${currentYear} → ${maxProjectionYear}`;
  }

  // series opbouwen met die a/b
  const priceSeries = buildPriceSeries(A_AVG, B_EXP, A_LOWER, maxProjectionYear);
  const priceData = priceSeries.rows;
  const rollingQuantileResiduals = priceSeries.rollingQuantileResiduals;
  const regressionModels = priceSeries.regressionModels;

  const priceCtx = document
    .getElementById("btc-price-chart")
    .getContext("2d");
  const slopeCtx = document
    .getElementById("btc-slope-chart")
    .getContext("2d");
  const r2Ctx = document
    .getElementById("btc-r2-chart")
    .getContext("2d");
  const oscillatorCtx = document
    .getElementById("btc-quantile-oscillator-chart")
    .getContext("2d");

  const yLogToggle =
    document.getElementById("y-log-toggle") ||
    document.getElementById("toggle-ylog");
  const xLogToggle =
    document.getElementById("x-log-toggle") ||
    document.getElementById("toggle-xlog");

  let useYLog = true;
  let useXLog = false;

  if (yLogToggle) useYLog = !!yLogToggle.checked;
  if (xLogToggle) useXLog = !!xLogToggle.checked;

  const filterPriceDataByYear = (yearLimit) =>
    priceData.filter((row) => {
      const year = new Date(row.date + "T00:00:00Z").getUTCFullYear();
      return year <= yearLimit;
    });

  const setProjectionYear = (yearValue) => {
    const year = Number(yearValue);
    if (!Number.isFinite(year)) return;
    if (projectionValue) projectionValue.textContent = year.toString();
    createPriceChart(
      priceCtx,
      useYLog,
      useXLog,
      filterPriceDataByYear(year),
      quantileMode
    );
    createQuantileOscillatorChart(oscillatorCtx, filterPriceDataByYear(year));
  };

  // eerste render
  setProjectionYear(projectionSlider ? projectionSlider.value : maxProjectionYear);
  createSlopeChart(slopeCtx, rollingFits);
  createR2Chart(r2Ctx, rollingFits);

  // KPI-balk invullen
  const sorted = [...btcMonthlyCloses].sort((a, b) =>
    a.date < b.date ? -1 : 1
  );
  const lastRow = sorted[sorted.length - 1];

  if (lastRow) {
    setKpiText("kpi-last-close", formatMoneyEUR(lastRow.price));
  }

    // Probeer live BTCEUR prijs op te halen (overschrijft laatste close als het lukt)
  fetchLiveBtceur().then((livePrice) => {
    if (livePrice !== null) {
      setKpiText("kpi-last-close", formatMoneyEUR(livePrice));
    }
  });



  setKpiText(
    "kpi-a-scale",
    latestFit ? latestFit.aCoef.toExponential(3).replace(".", ",") : "-"
  );
  setKpiText("kpi-b-exp", latestFit ? latestFit.bExp.toFixed(4).replace(".", ",") : "-");
  setKpiText("kpi-r2", latestFit ? latestFit.r2.toFixed(3).replace(".", ",") : "-");

  updateTodayKpis(
    A_AVG,
    B_EXP,
    quantileMode,
    rollingQuantileResiduals,
    regressionModels
  );

  // toggle log/linear Y
  if (yLogToggle) {
    yLogToggle.addEventListener("change", (e) => {
      useYLog = e.target.checked;
      setProjectionYear(
        projectionSlider ? projectionSlider.value : maxProjectionYear
      );
    });
  }

  // toggle log/linear X
  if (xLogToggle) {
    xLogToggle.addEventListener("change", (e) => {
      useXLog = e.target.checked;
      setProjectionYear(
        projectionSlider ? projectionSlider.value : maxProjectionYear
      );
    });
  }

  const setQuantileMode = (mode) => {
    quantileMode = mode;
    if (quantileModeLabel) {
      quantileModeLabel.textContent = quantileModeText[mode] || mode;
    }
    setProjectionYear(projectionSlider ? projectionSlider.value : maxProjectionYear);
    updateTodayKpis(
      A_AVG,
      B_EXP,
      quantileMode,
      rollingQuantileResiduals,
      regressionModels
    );
  };

  if (quantileModeSlider) {
    setQuantileMode(quantileMode);
    quantileModeSlider.addEventListener("input", (e) => {
      const idx = Number(e.target.value);
      const nextMode = quantileModeValues[idx] || "regression";
      setQuantileMode(nextMode);
    });
  }

  if (projectionSlider) {
    projectionSlider.addEventListener("input", (e) => {
      setProjectionYear(e.target.value);
    });
  }

  const fsBtn = document.getElementById("btc-price-fullscreen-btn");
const fsBlock = document.getElementById("btc-price-block");

if (fsBtn && fsBlock) {
  const updateBtn = () => {
    const isFs = document.fullscreenElement === fsBlock;
    fsBtn.textContent = isFs ? "⤫" : "⛶";
    fsBtn.title = isFs ? "Exit fullscreen" : "Fullscreen";
  };

  fsBtn.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await fsBlock.requestFullscreen();
      }
      updateBtn();
    } catch (e) {
      console.warn("Fullscreen fout:", e);
    }
  });

  document.addEventListener("fullscreenchange", () => {
    updateBtn();
    if (priceChart) {
      setTimeout(() => priceChart.resize(), 150);
    }
  });

  updateBtn();
}


});
