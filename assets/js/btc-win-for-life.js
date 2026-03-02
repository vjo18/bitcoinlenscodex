// assets/js/btc-win-for-life.js

function linearRegressionStats(xs, ys) {
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

function daysSinceGenesisFromDateStr(dateStr) {
  const ms = new Date(dateStr + "T00:00:00Z").getTime();
  const d = (ms - GENESIS_MS) / (1000 * 60 * 60 * 24);
  return Math.max(EPS, d);
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

function formatMoneyEUR(value, decimals = 0) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("nl-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: decimals,
  });
}

function buildLatestEurPowerLawParams() {
  const rows = [...(window.btcMonthlyCloses ?? [])]
    .filter((row) => Number.isFinite(row?.price) && row.price > 0 && row?.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const xs = [];
  const ys = [];

  for (const row of rows) {
    const d = daysSinceGenesisFromDateStr(row.date);
    if (!Number.isFinite(d) || d <= 0) continue;
    xs.push(Math.log10(d));
    ys.push(Math.log10(row.price));
  }

  if (xs.length < 12) {
    return {
      bExp: 5.5697,
      aMedian: 8.85116e-17,
      aP10: 8.85116e-17 * 0.4,
    };
  }

  const { A, B } = linearRegressionStats(xs, ys);
  const aLine = Math.pow(10, A);

  const residuals = rows
    .map((row) => {
      const d = daysSinceGenesisFromDateStr(row.date);
      const pl = aLine * Math.pow(d, B);
      return Math.log10(row.price) - Math.log10(pl);
    })
    .filter((r) => Number.isFinite(r))
    .sort((a, b) => a - b);

  const q10 = quantile(residuals, 0.1);
  const q50 = quantile(residuals, 0.5);

  return {
    bExp: B,
    aMedian: aLine * Math.pow(10, q50),
    aP10: aLine * Math.pow(10, q10),
  };
}

function findRequiredBTCForRoutIndexed({
  aLower,
  aAvg,
  useLowerPostRetire,
  bExp,
  retire,
  targetROutBase,
  inflAnnual,
  horizonYears,
}) {
  let low = 0;
  let high = 1_000_000;
  for (let i = 0; i < 50; i += 1) {
    const mid = (low + high) / 2;
    const sim = runSimulation({
      aLower,
      aAvg,
      useLowerPostRetire,
      bExp,
      retire,
      initialBTC: mid,
      rOutBase: targetROutBase,
      inflAnnual,
      horizonYears,
    });

    if (sim.exhaustedAt !== null) low = mid;
    else high = mid;

    if (high - low < 1e-6) break;
  }
  return high;
}

function drawSimpleLineChart(svgEl, values) {
  if (!svgEl) return;
  const width = 1040;
  const height = 260;
  const pad = 20;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const arr = values.filter((v) => Number.isFinite(v));
  if (!arr.length) {
    svgEl.innerHTML = "";
    return;
  }

  const minV = Math.min(...arr);
  const maxV = Math.max(...arr);
  const den = Math.max(EPS, maxV - minV);

  const points = arr
    .map((v, i) => {
      const x = pad + (i / Math.max(1, arr.length - 1)) * w;
      const y = pad + (1 - (v - minV) / den) * h;
      return `${x},${y}`;
    })
    .join(" ");

  svgEl.innerHTML = `
    <rect x="0" y="0" width="${width}" height="${height}" fill="white"></rect>
    <polyline fill="none" stroke="#1d4ed8" stroke-width="2" points="${points}"></polyline>
  `;
}

function initBtcWinForLife() {
  const powerLaw = buildLatestEurPowerLawParams();

  const yearInput = document.getElementById("wfl-retire-year");
  const monthInput = document.getElementById("wfl-retire-month");
  const initialInput = document.getElementById("wfl-initial-btc");
  const routInput = document.getElementById("wfl-rout");
  const inflInput = document.getElementById("wfl-infl");
  const horizonInput = document.getElementById("wfl-horizon");
  const percentileSelect = document.getElementById("wfl-percentile");
  const horizonModeSelect = document.getElementById("wfl-horizon-mode");
  const kpisEl = document.getElementById("wfl-kpis");
  const tableBody = document.getElementById("wfl-table-body");
  const btcChartEl = document.getElementById("wfl-chart-btc");
  const eurChartEl = document.getElementById("wfl-chart-eur");

  const targetROutInput = document.getElementById("wfl-rby-target-rout");
  const yearsAheadInput = document.getElementById("wfl-rby-years-ahead");
  const requiredChartEl = document.getElementById("wfl-chart-required");
  const requiredSummaryEl = document.getElementById("wfl-rby-summary");

  if (!yearInput) return;

  const update = () => {
    const yr = parseInt(yearInput.value || "0", 10);
    const mr = clampMonth(parseInt(monthInput.value || "1", 10));
    const initialBTC = parseFloat(initialInput.value || "0");
    const rOut = parseFloat(routInput.value || "0");
    const inflAnnual = (parseFloat(inflInput.value || "0") || 0) / 100;
    const horizonYears = parseInt(horizonInput.value || "1", 10);
    const selectedPercentile = percentileSelect.value === "10" ? "10" : "50";
    const finiteHorizonMode = horizonModeSelect.value === "horizon";

    const aAvg = powerLaw.aMedian;
    const aLower = powerLaw.aP10;
    const useLowerPostRetire = selectedPercentile === "10";

    const sim = runSimulation({
      aLower,
      aAvg,
      useLowerPostRetire,
      bExp: powerLaw.bExp,
      retire: { y: yr, m: mr },
      initialBTC,
      rOutBase: rOut,
      inflAnnual,
      horizonYears,
    });

    const reqIndexedBtc = findRequiredBTCForRoutIndexed({
      aLower,
      aAvg,
      useLowerPostRetire,
      bExp: powerLaw.bExp,
      retire: { y: yr, m: mr },
      targetROutBase: rOut,
      inflAnnual,
      horizonYears,
    });

    const maxRout = findMaxRout({
      aLower,
      aAvg,
      useLowerPostRetire,
      bExp: powerLaw.bExp,
      retire: { y: yr, m: mr },
      initialBTC,
      inflAnnual,
      horizonYears,
      finiteHorizonMode,
    });

    const priceAtRetire = pricePLDays(
      useLowerPostRetire ? aLower : aAvg,
      powerLaw.bExp,
      yr,
      mr
    );

    const exhaustedLabel = sim.exhaustedAt
      ? `${sim.exhaustedAt.y}-${String(sim.exhaustedAt.m).padStart(2, "0")}`
      : "No (within horizon)";

    kpisEl.innerHTML = `
      <div class="calc-kpi"><div class="label">b exponent (latest EUR fit)</div><div class="value">${powerLaw.bExp.toFixed(4)}</div></div>
      <div class="calc-kpi"><div class="label">Prijs @ retirement</div><div class="value">${formatMoneyEUR(priceAtRetire, 0)}</div></div>
      <div class="calc-kpi"><div class="label">Required BTC (indexed)</div><div class="value">${reqIndexedBtc.toFixed(6)}</div></div>
      <div class="calc-kpi"><div class="label">Gap (have - need)</div><div class="value">${(initialBTC - reqIndexedBtc).toFixed(6)} BTC</div></div>
      <div class="calc-kpi"><div class="label">Max sustainable r_out</div><div class="value">${formatMoneyEUR(maxRout, 0)} / mo</div></div>
      <div class="calc-kpi"><div class="label">Total withdrawn</div><div class="value">${formatMoneyEUR(sim.summary.totalWithdrawnUsd, 0)}</div></div>
      <div class="calc-kpi"><div class="label">Exhausted?</div><div class="value">${exhaustedLabel}</div></div>
    `;

    tableBody.innerHTML = sim.data
      .slice(0, 240)
      .map(
        (d) => `
        <tr>
          <td>${d.year}</td>
          <td>${d.month}</td>
          <td>${formatMoneyEUR(d.price, 0)}</td>
          <td>${d.sellBtc ? d.sellBtc.toFixed(6) : ""}</td>
          <td>${d.rOutThisMonth ? formatMoneyEUR(d.rOutThisMonth, 0) : ""}</td>
          <td>${d.btc.toFixed(6)}</td>
          <td>${formatMoneyEUR(d.usdValue, 0)}</td>
        </tr>
      `
      )
      .join("");

    drawSimpleLineChart(
      btcChartEl,
      sim.data.slice(0, 240).map((d) => d.btc)
    );
    drawSimpleLineChart(
      eurChartEl,
      sim.data.slice(0, 240).map((d) => d.usdValue)
    );

    const targetROut = parseFloat(targetROutInput?.value || "0");
    const yearsAhead = parseInt(yearsAheadInput?.value || "40", 10);
    const sweep = [];
    for (let y = yr; y <= yr + yearsAhead; y += 1) {
      const result = requiredBTCAtRetirement({
        aLower,
        aAvg,
        useLowerPostRetire,
        bExp: powerLaw.bExp,
        retire: { y, m: mr },
        rOut: targetROut,
      });
      sweep.push({ year: y, btcRequired: result.btcRequired });
    }

    drawSimpleLineChart(
      requiredChartEl,
      sweep.map((r) => r.btcRequired)
    );

    const current = sweep[0];
    if (requiredSummaryEl && current) {
      requiredSummaryEl.innerHTML = `In ${yr} heb je ongeveer <strong>${current.btcRequired.toFixed(
        4
      )} BTC</strong> nodig om ${formatMoneyEUR(targetROut, 0)}/maand te kunnen starten.`;
    }
  };

  [
    yearInput,
    monthInput,
    initialInput,
    routInput,
    inflInput,
    horizonInput,
    percentileSelect,
    horizonModeSelect,
    targetROutInput,
    yearsAheadInput,
  ].forEach((el) => el?.addEventListener("input", update));

  update();
}

document.addEventListener("DOMContentLoaded", initBtcWinForLife);
