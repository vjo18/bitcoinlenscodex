// assets/js/one-time-goal.js

function otgLinearRegressionStats(xs, ys) {
  const n = xs.length;
  const xMean = xs.reduce((p, c) => p + c, 0) / n;
  const yMean = ys.reduce((p, c) => p + c, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += (xs[i] - xMean) * (xs[i] - xMean);
  }

  const B = num / (den || 1e-12);
  const A = yMean - B * xMean;
  return { A, B };
}

function otgDaysSinceGenesisFromDateStr(dateStr) {
  const ms = new Date(dateStr + "T00:00:00Z").getTime();
  const d = (ms - GENESIS_MS) / (1000 * 60 * 60 * 24);
  return Math.max(EPS, d);
}

function otgQuantile(sortedArr, q) {
  if (!sortedArr.length) return NaN;
  if (q <= 0) return sortedArr[0];
  if (q >= 1) return sortedArr[sortedArr.length - 1];
  const pos = (sortedArr.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sortedArr[base + 1] ?? sortedArr[base];
  return sortedArr[base] + rest * (next - sortedArr[base]);
}

function formatMoneyEUR(value, decimals = 0) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("nl-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: decimals,
  });
}

function buildOneTimeGoalPowerLawParams() {
  const rows = [...(window.btcMonthlyCloses ?? [])]
    .filter((row) => Number.isFinite(row?.price) && row.price > 0 && row?.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const xs = [];
  const ys = [];

  for (const row of rows) {
    const d = otgDaysSinceGenesisFromDateStr(row.date);
    if (!Number.isFinite(d) || d <= 0) continue;
    xs.push(Math.log10(d));
    ys.push(Math.log10(row.price));
  }

  if (xs.length < 12) {
    return {
      bExp: 5.5697,
      aP50: 8.85116e-17,
      aP10: 8.85116e-17 * 0.4,
    };
  }

  const { A, B } = otgLinearRegressionStats(xs, ys);
  const aLine = Math.pow(10, A);

  const residuals = rows
    .map((row) => {
      const d = otgDaysSinceGenesisFromDateStr(row.date);
      const pl = aLine * Math.pow(d, B);
      return Math.log10(row.price) - Math.log10(pl);
    })
    .filter((r) => Number.isFinite(r))
    .sort((a, b) => a - b);

  const q10 = otgQuantile(residuals, 0.1);
  const q50 = otgQuantile(residuals, 0.5);

  return {
    bExp: B,
    aP50: aLine * Math.pow(10, q50),
    aP10: aLine * Math.pow(10, q10),
  };
}

function initOneTimeGoalCalculator() {
  const yearInput = document.getElementById("otg-year");
  const monthInput = document.getElementById("otg-month");
  const eurInput = document.getElementById("otg-eur");

  const lowerPriceEl = document.getElementById("otg-price-lower");
  const avgPriceEl = document.getElementById("otg-price-avg");
  const lowerBtcEl = document.getElementById("otg-btc-lower");
  const avgBtcEl = document.getElementById("otg-btc-avg");

  if (!yearInput) return;

  const params = buildOneTimeGoalPowerLawParams();

  const update = () => {
    const year = parseInt(yearInput.value || "0", 10);
    const month = clampMonth(parseInt(monthInput.value || "1", 10));
    const eurNeeded = parseFloat(eurInput.value || "0");

    const priceLower = pricePLDays(params.aP10, params.bExp, year, month);
    const priceAvg = pricePLDays(params.aP50, params.bExp, year, month);

    lowerPriceEl.textContent = formatMoneyEUR(priceLower, 0);
    avgPriceEl.textContent = formatMoneyEUR(priceAvg, 0);
    lowerBtcEl.textContent = `${(eurNeeded / priceLower).toFixed(6)} BTC`;
    avgBtcEl.textContent = `${(eurNeeded / priceAvg).toFixed(6)} BTC`;
  };

  [yearInput, monthInput, eurInput].forEach((el) =>
    el.addEventListener("input", update)
  );

  update();
}

document.addEventListener("DOMContentLoaded", initOneTimeGoalCalculator);
