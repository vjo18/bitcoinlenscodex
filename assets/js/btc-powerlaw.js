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

function buildQuantileMultipliers(data, aAvg, bExp) {
  const ratios = data
    .filter((row) => row.price > 0)
    .map((row) => {
      const trend = pricePLDays(aAvg, bExp, row.date);
      return row.price / (trend || EPS);
    })
    .filter((x) => isFinite(x) && x > 0)
    .sort((a, b) => a - b);

  const multipliers = {};
  for (const level of QUANTILE_LEVELS) {
    multipliers[level] = quantile(ratios, level / 100);
  }
  return multipliers;
}

// prijs + quantile power law banden, mét projectie tot gekozen jaar
function buildPriceSeries(aAvg, bExp, aLower, quantileMultipliers, endYear = 2054) {
  const cutoff = "2010-05-01";

  const sorted = [...btcMonthlyCloses].sort((a, b) =>
    a.date < b.date ? -1 : 1
  );

  const rows = [];

  // historische data
  for (const row of sorted) {
    if (row.date < cutoff) continue;
    const plMedian = pricePLDays(aAvg, bExp, row.date);
    const quantileBands = {};

    for (const level of QUANTILE_LEVELS) {
      quantileBands[level] = plMedian * (quantileMultipliers[level] || 1);
    }

    const bandLow = quantileBands[0];
    const bandHigh = quantileBands[100];
    const oscillator =
      row.price > 0 && bandHigh > bandLow
        ? ((row.price - bandLow) / (bandHigh - bandLow)) * 100
        : null;

    rows.push({
      date: row.date,
      price: row.price,
      plMedian,
      plAvg: plMedian,
      plLower: pricePLDays(aLower, bExp, row.date),
      quantileBands,
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

      rows.push({
        date: dateStr,
        price: null,
        plMedian: pricePLDays(aAvg, bExp, dateStr),
        plAvg: pricePLDays(aAvg, bExp, dateStr),
        plLower: pricePLDays(aLower, bExp, dateStr),
        quantileBands: QUANTILE_LEVELS.reduce((acc, level) => {
          acc[level] = pricePLDays(aAvg, bExp, dateStr) * (quantileMultipliers[level] || 1);
          return acc;
        }, {}),
        oscillator: null,
      });

      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
  }

  return rows;
}

// =============== CHART CONSTRUCTORS ===============

let priceChart = null;
let slopeChart = null;
let r2Chart = null;
let oscillatorChart = null;

// hoofdchart met X/Y log-toggle + jaartallen op de x-as
function createPriceChart(ctx, yLog, xLog, priceData) {
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
        y: row.quantileBands[level],
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

  const quantileDatasets = QUANTILE_LEVELS.map((level, idx) => ({
    label: `Power law quantile ${level}%`,
    data: quantilePoints[level],
    borderWidth: level === 50 ? 1.8 : 1.2,
    borderColor: quantileBorderColors[level],
    backgroundColor: quantileBandColors[level],
    pointRadius: 0,
    spanGaps: true,
    parsing: false,
    fill: idx === 0 ? false : "-1",
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
        },
        {
          label: "BTC maandelijkse close (EUR)",
          data: pointsMarket,
          borderWidth: 2,
          borderColor: "#f97316",
          pointRadius: 0,
          spanGaps: false,
          parsing: false,
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
      scales: {
        x: {
          type: xLog ? "logarithmic" : "linear",
          // ✅ start x-as bij eerste datapunt, ook in log-modus
          min: minDays,
          ticks: {
            maxTicksLimit: 12,
            callback: (value) => formatXTickDays(value), // toont alleen jaartal
          },
          grid: {
            color: "rgba(148, 163, 184, 0.3)",
          },
          title: {
            display: true,
            text: "Days since genesis",
          },
        },
        y: {
          type: yLog ? "logarithmic" : "linear",
          min: 0.1,
          ticks: {
            callback: (value) => formatYTick(value),
          },
          grid: {
            color: "rgba(148, 163, 184, 0.3)",
          },
          title: {
            display: true,
            text: "BTC prijs (EUR)",
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const raw = items[0].raw;
              return raw && raw.date ? raw.date : "";
            },
            label: (context) =>
              `${context.dataset.label}: ${formatMoneyEUR(
                context.parsed.y
              )}`,
          },
        },
      },
    },
  });
}

function createQuantileOscillatorChart(ctx, priceData) {
  const pointsOscillator = priceData.map((row) => ({
    x: daysSinceGenesisFromDateStr(row.date),
    y: row.oscillator,
    date: row.date,
  }));

  const firstWithPrice = pointsOscillator.find((p) => p.y != null);
  const minDays = firstWithPrice ? firstWithPrice.x : 1;

  if (oscillatorChart) oscillatorChart.destroy();

  oscillatorChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Quantile oscillator",
          data: pointsOscillator,
          borderColor: "#7c3aed",
          backgroundColor: "rgba(124, 58, 237, 0.15)",
          borderWidth: 1.8,
          pointRadius: 0,
          spanGaps: false,
          fill: true,
          parsing: false,
        },
        {
          label: "80% zone",
          data: pointsOscillator.map((p) => ({ ...p, y: 80 })),
          borderColor: "rgba(239, 68, 68, 0.65)",
          borderDash: [6, 4],
          borderWidth: 1,
          pointRadius: 0,
          parsing: false,
        },
        {
          label: "20% zone",
          data: pointsOscillator.map((p) => ({ ...p, y: 20 })),
          borderColor: "rgba(37, 99, 235, 0.65)",
          borderDash: [6, 4],
          borderWidth: 1,
          pointRadius: 0,
          parsing: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: {
          type: "linear",
          min: minDays,
          ticks: {
            maxTicksLimit: 12,
            callback: (value) => formatXTickDays(value),
          },
          grid: { color: "rgba(148, 163, 184, 0.3)" },
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`,
          },
          grid: { color: "rgba(148, 163, 184, 0.3)" },
          title: {
            display: true,
            text: "Positie binnen quantile-banden",
          },
        },
      },
      plugins: {
        legend: { display: true, position: "bottom" },
        tooltip: {
          callbacks: {
            title: (items) => items[0]?.raw?.date ?? "",
            label: (context) =>
              context.dataset.label === "Quantile oscillator"
                ? `${context.dataset.label}: ${context.parsed.y?.toFixed(1)}%`
                : context.dataset.label,
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

function updateTodayKpis(A_AVG, B_EXP, quantileMultipliers) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const dToday = daysSinceGenesisFromDateStr(todayIso);
  const todayMedian = pricePLDays(A_AVG, B_EXP, todayIso);
  const todaySupport = todayMedian * (quantileMultipliers[10] || 1);

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
  const quantileMultipliers = buildQuantileMultipliers(btcMonthlyCloses, A_AVG, B_EXP);

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
  const priceData = buildPriceSeries(A_AVG, B_EXP, A_LOWER, quantileMultipliers, maxProjectionYear);

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
      filterPriceDataByYear(year)
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

  updateTodayKpis(A_AVG, B_EXP, quantileMultipliers);

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

  if (projectionSlider) {
    projectionSlider.addEventListener("input", (e) => {
      setProjectionYear(e.target.value);
    });
  }
});
