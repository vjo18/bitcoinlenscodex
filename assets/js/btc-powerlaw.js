// assets/js/btc-powerlaw.js

// =============== DATA ===============

const btcMonthlyCloses = [
  { date: "2025-10-31", price: 94886.5 },
  { date: "2025-09-30", price: 97190.7 },
  { date: "2025-08-31", price: 92600.0 },
  { date: "2025-07-31", price: 101384.8 },
  { date: "2025-06-30", price: 90961.9 },
  { date: "2025-05-31", price: 92278.0 },
  { date: "2025-04-30", price: 83202.1 },
  { date: "2025-03-31", price: 76292.4 },
  { date: "2025-02-28", price: 81334.0 },
  { date: "2025-01-31", price: 98888.8 },
  { date: "2024-12-31", price: 90168.1 },
  { date: "2024-11-30", price: 91134.5 },
  { date: "2024-10-31", price: 64531.9 },
  { date: "2024-09-30", price: 56874.6 },
  { date: "2024-08-31", price: 53380.0 },
  { date: "2024-07-31", price: 59728.2 },
  { date: "2024-06-30", price: 58393.0 },
  { date: "2024-05-31", price: 62241.8 },
  { date: "2024-04-30", price: 56833.5 },
  { date: "2024-03-31", price: 66129.9 },
  { date: "2024-02-29", price: 56565.9 },
  { date: "2024-01-31", price: 39405.7 },
  { date: "2023-12-31", price: 38397.0 },
  { date: "2023-11-30", price: 34645.6 },
  { date: "2023-10-31", price: 32767.9 },
  { date: "2023-09-30", price: 25506.9 },
  { date: "2023-08-31", price: 23897.9 },
  { date: "2023-07-31", price: 26531.8 },
  { date: "2023-06-30", price: 27901.6 },
  { date: "2023-05-31", price: 25466.0 },
  { date: "2023-04-30", price: 26543.1 },
  { date: "2023-03-31", price: 26266.6 },
  { date: "2023-02-28", price: 21874.0 },
  { date: "2023-01-31", price: 21296.5 },
  { date: "2022-12-31", price: 15420.9 },
  { date: "2022-11-30", price: 16475.1 },
  { date: "2022-10-31", price: 20735.0 },
  { date: "2022-09-30", price: 19818.8 },
  { date: "2022-08-31", price: 19975.4 },
  { date: "2022-07-31", price: 22840.5 },
  { date: "2022-06-30", price: 19026.0 },
  { date: "2022-05-31", price: 29590.4 },
  { date: "2022-04-30", price: 35759.3 },
  { date: "2022-03-31", price: 41095.8 },
  { date: "2022-02-28", price: 38496.0 },
  { date: "2022-01-31", price: 34295.8 },
  { date: "2021-12-31", price: 40660.3 },
  { date: "2021-11-30", price: 50300.0 },
  { date: "2021-10-31", price: 53112.2 },
  { date: "2021-09-30", price: 37862.1 },
  { date: "2021-08-31", price: 39915.0 },
  { date: "2021-07-31", price: 34904.2 },
  { date: "2021-06-30", price: 29560.1 },
  { date: "2021-05-31", price: 30504.6 },
  { date: "2021-04-30", price: 47965.5 },
  { date: "2021-03-31", price: 50008.3 },
  { date: "2021-02-28", price: 37388.6 },
  { date: "2021-01-31", price: 27352.0 },
  { date: "2020-12-31", price: 23631.3 },
  { date: "2020-11-30", price: 16424.1 },
  { date: "2020-10-31", price: 11847.6 },
  { date: "2020-09-30", price: 9189.9 },
  { date: "2020-08-31", price: 9780.5 },
  { date: "2020-07-31", price: 9636.5 },
  { date: "2020-06-30", price: 8139.5 },
  { date: "2020-05-31", price: 8508.2 },
  { date: "2020-04-30", price: 7903.9 },
  { date: "2020-03-31", price: 5835.5 },
  { date: "2020-02-29", price: 7736.9 },
  { date: "2020-01-31", price: 8414.0 },
  { date: "2019-12-31", price: 6397.4 },
  { date: "2019-11-30", price: 6867.6 },
  { date: "2019-10-31", price: 8208.1 },
  { date: "2019-09-30", price: 7619.0 },
  { date: "2019-08-31", price: 8761.3 },
  { date: "2019-07-31", price: 9100.4 },
  { date: "2019-06-30", price: 9452.5 },
  { date: "2019-05-31", price: 7677.8 },
  { date: "2019-04-30", price: 4701.6 },
  { date: "2019-03-31", price: 3646.2 },
  { date: "2019-02-28", price: 3340.7 },
  { date: "2019-01-31", price: 2978.7 },
  { date: "2018-12-31", price: 3235.4 },
  { date: "2018-11-30", price: 3515.2 },
  { date: "2018-10-31", price: 5579.0 },
  { date: "2018-09-30", price: 5687.0 },
  { date: "2018-08-31", price: 6031.2 },
  { date: "2018-07-31", price: 6600.6 },
  { date: "2018-06-30", price: 5460.1 },
  { date: "2018-05-31", price: 6399.9 },
  { date: "2018-04-30", price: 7640.8 },
  { date: "2018-03-31", price: 5615.0 },
  { date: "2018-02-28", price: 8430.0 },
  { date: "2018-01-31", price: 11465.2 },
  { date: "2017-12-31", price: 11993.6 },
  { date: "2017-11-30", price: 8462.0 },
  { date: "2017-10-31", price: 5535.0 },
  { date: "2017-09-30", price: 3659.0 },
  { date: "2017-08-31", price: 3980.0 },
  { date: "2017-07-31", price: 2469.8 },
  { date: "2017-06-30", price: 2142.9 },
  { date: "2017-05-31", price: 2048.0 },
  { date: "2017-04-30", price: 1224.0 },
  { date: "2017-03-31", price: 1007.0 },
  { date: "2017-02-28", price: 1117.9 },
  { date: "2017-01-31", price: 900.6 },
  { date: "2016-12-31", price: 913.5 },
  { date: "2016-11-30", price: 700.3 },
  { date: "2016-10-31", price: 633.5 },
  { date: "2016-09-30", price: 545.7 },
  { date: "2016-08-31", price: 512.9 },
  { date: "2016-07-31", price: 554.9 },
  { date: "2016-06-30", price: 607.4 },
  { date: "2016-05-31", price: 477.5 },
  { date: "2016-04-30", price: 390.7 },
  { date: "2016-03-31", price: 367.4 },
  { date: "2016-02-29", price: 397.1 },
  { date: "2016-01-31", price: 343.7 },
  { date: "2015-12-31", price: 396.3 },
  { date: "2015-11-30", price: 356.8 },
  { date: "2015-10-31", price: 280.1 },
  { date: "2015-09-30", price: 211.0 },
  { date: "2015-08-31", price: 206.2 },
  { date: "2015-07-31", price: 259.1 },
  { date: "2015-06-30", price: 237.0 },
  { date: "2015-05-31", price: 208.3 },
  { date: "2015-04-30", price: 210.3 },
  { date: "2015-03-31", price: 228.4 },
  { date: "2015-02-28", price: 220.9 },
  { date: "2015-01-31", price: 193.5 },
  { date: "2014-12-31", price: 265.0 },
  { date: "2014-11-30", price: 300.7 },
  { date: "2014-10-31", price: 270.1 },
  { date: "2014-09-30", price: 306.9 },
  { date: "2014-08-31", price: 367.0 },
  { date: "2014-07-31", price: 436.4 },
  { date: "2014-06-30", price: 466.2 },
  { date: "2014-05-31", price: 457.0 },
  { date: "2014-04-30", price: 324.6 },
  { date: "2014-03-31", price: 335.1 },
  { date: "2014-02-28", price: 413.7 },
  { date: "2014-01-31", price: 592.3 },
  { date: "2013-12-31", price: 539.0 },
  { date: "2013-11-30", price: 845.3 },
  { date: "2013-10-31", price: 149.8 },
  { date: "2013-09-30", price: 104.89 },
  { date: "2013-08-31", price: 106.62 },
  { date: "2013-07-31", price: 79.82 },
  { date: "2013-06-30", price: 74.93 },
  { date: "2013-05-31", price: 99.06 },
  { date: "2013-04-30", price: 105.71 },
  { date: "2013-03-31", price: 72.52 },
  { date: "2013-02-28", price: 25.56 },
  { date: "2013-01-31", price: 15.02 },
  { date: "2012-12-31", price: 10.23 },
  { date: "2012-11-30", price: 9.69 },
  { date: "2012-10-31", price: 8.64 },
  { date: "2012-09-30", price: 9.64 },
  { date: "2012-08-31", price: 8.11 },
  { date: "2012-07-31", price: 7.64 },
  { date: "2012-06-30", price: 5.29 },
  { date: "2012-05-31", price: 4.21 },
  { date: "2012-04-30", price: 3.70 },
  { date: "2012-03-31", price: 3.67 },
  { date: "2012-02-29", price: 3.68 },
  { date: "2012-01-31", price: 4.21 },
  { date: "2011-12-31", price: 3.63 },
  { date: "2011-11-30", price: 2.23 },
  { date: "2011-10-31", price: 2.38 },
  { date: "2011-09-30", price: 3.81 },
  { date: "2011-08-31", price: 5.70 },
  { date: "2011-07-31", price: 9.31 },
  { date: "2011-06-30", price: 11.10 },
  { date: "2011-05-31", price: 6.04 },
  { date: "2011-04-30", price: 2.36 },
  { date: "2011-03-31", price: 0.56 },
  { date: "2011-02-28", price: 0.65 },
  { date: "2011-01-31", price: 0.37 },
  { date: "2010-12-31", price: 0.22 },
  { date: "2010-11-30", price: 0.15 },
  { date: "2010-10-31", price: 0.14 },
  { date: "2010-09-30", price: 0.07 },
  { date: "2010-08-31", price: 0.08 }
];

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

// prijs + power law lijnen, mét projectie tot 2054
function buildPriceSeries(aAvg, bExp, aLower) {
  const cutoff = "2010-05-01";

  const sorted = [...btcMonthlyCloses].sort((a, b) =>
    a.date < b.date ? -1 : 1
  );

  const rows = [];

  // historische data
  for (const row of sorted) {
    if (row.date < cutoff) continue;
    rows.push({
      date: row.date,
      price: row.price,
      plAvg: pricePLDays(aAvg, bExp, row.date),
      plLower: pricePLDays(aLower, bExp, row.date),
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

    const endYear = 2054;

    while (y < endYear || (y === endYear && m <= 12)) {
      const jsDate = new Date(Date.UTC(y, m - 1, 1));
      const dateStr = jsDate.toISOString().slice(0, 10);

      rows.push({
        date: dateStr,
        price: null,
        plAvg: pricePLDays(aAvg, bExp, dateStr),
        plLower: pricePLDays(aLower, bExp, dateStr),
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

// hoofdchart met X/Y log-toggle + jaartallen op de x-as
function createPriceChart(ctx, yLog, xLog, priceData) {
  const pointsMarket = [];
  const pointsAvg = [];
  const pointsLower = [];

  for (const row of priceData) {
    const d = daysSinceGenesisFromDateStr(row.date);
    pointsMarket.push({
      x: d,
      y: row.price ?? null,
      date: row.date,
    });
    pointsAvg.push({
      x: d,
      y: row.plAvg,
      date: row.date,
    });
    pointsLower.push({
      x: d,
      y: row.plLower,
      date: row.date,
    });
  }

  // ✅ bepaal eerste echte datapunt (met price) en gebruik dat als x-min
  const firstWithPrice = pointsMarket.find(p => p.y != null);
  const minDays = firstWithPrice ? firstWithPrice.x : 1;

  if (priceChart) {
    priceChart.destroy();
  }

  priceChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "BTC maandelijkse close (EUR)",
          data: pointsMarket,
          borderWidth: 1.8,
          borderColor: "#f97316",
          pointRadius: 0,
          spanGaps: false,
          parsing: false,
        },
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

  // series opbouwen met die a/b
  const priceData = buildPriceSeries(A_AVG, B_EXP, A_LOWER);

  const priceCtx = document
    .getElementById("btc-price-chart")
    .getContext("2d");
  const slopeCtx = document
    .getElementById("btc-slope-chart")
    .getContext("2d");
  const r2Ctx = document
    .getElementById("btc-r2-chart")
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

  // eerste render
  createPriceChart(priceCtx, useYLog, useXLog, priceData);
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


  const todayIso = new Date().toISOString().slice(0, 10);
  const dToday = daysSinceGenesisFromDateStr(todayIso);
  const plAvgToday = pricePLDays(A_AVG, B_EXP, todayIso);
  const plLowerToday = pricePLDays(A_LOWER, B_EXP, todayIso);
  const daysSinceGenesisToday = Math.floor(dToday);

  setKpiText("kpi-pl-avg", formatMoneyEUR(plAvgToday));
  setKpiText("kpi-pl-support", formatMoneyEUR(plLowerToday));
  setKpiText(
    "kpi-days-genesis",
    daysSinceGenesisToday.toLocaleString("nl-BE")
  );

  setKpiText(
    "kpi-a-scale",
    latestFit ? latestFit.aCoef.toExponential(3) : "-"
  );
  setKpiText("kpi-b-exp", latestFit ? latestFit.bExp.toFixed(4) : "-");
  setKpiText("kpi-r2", latestFit ? latestFit.r2.toFixed(3) : "-");

  // toggle log/linear Y
  if (yLogToggle) {
    yLogToggle.addEventListener("change", (e) => {
      useYLog = e.target.checked;
      createPriceChart(priceCtx, useYLog, useXLog, priceData);
    });
  }

  // toggle log/linear X
  if (xLogToggle) {
    xLogToggle.addEventListener("change", (e) => {
      useXLog = e.target.checked;
      createPriceChart(priceCtx, useYLog, useXLog, priceData);
    });
  }
});
