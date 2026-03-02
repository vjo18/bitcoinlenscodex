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
    return { bExp: 5.5697, aMedian: 8.85116e-17, aP10: 8.85116e-17 * 0.4 };
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

  return {
    bExp: B,
    aMedian: aLine * Math.pow(10, quantile(residuals, 0.5)),
    aP10: aLine * Math.pow(10, quantile(residuals, 0.1)),
  };
}

function findRequiredBTCForRoutIndexed(params) {
  let low = 0;
  let high = 1_000_000;
  for (let i = 0; i < 50; i += 1) {
    const mid = (low + high) / 2;
    const sim = runSimulation({ ...params, initialBTC: mid, rOutBase: params.targetROutBase });
    if (sim.exhaustedAt !== null) low = mid;
    else high = mid;
    if (high - low < 1e-6) break;
  }
  return high;
}

function fmtShort(v) {
  if (!Number.isFinite(v)) return "-";
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(1) + "k";
  return v.toFixed(2);
}

function drawInteractiveLineChart({ svgEl, tooltipEl, labels, values, yFormat }) {
  if (!svgEl) return;
  const width = 560;
  const height = 260;
  const m = { t: 12, r: 10, b: 30, l: 52 };
  const w = width - m.l - m.r;
  const h = height - m.t - m.b;

  const pointsRaw = values.map((v, i) => ({ i, v })).filter((p) => Number.isFinite(p.v));
  if (!pointsRaw.length) {
    svgEl.innerHTML = "";
    return;
  }

  const minY = Math.min(...pointsRaw.map((p) => p.v));
  const maxY = Math.max(...pointsRaw.map((p) => p.v));
  const denY = Math.max(EPS, maxY - minY);

  const xOf = (i) => m.l + (i / Math.max(1, values.length - 1)) * w;
  const yOf = (v) => m.t + (1 - (v - minY) / denY) * h;

  const poly = pointsRaw.map((p) => `${xOf(p.i)},${yOf(p.v)}`).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => minY + t * (maxY - minY));
  const xTickIdx = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(t * (labels.length - 1)));

  let grid = "";
  for (const yv of yTicks) {
    const y = yOf(yv);
    grid += `<line x1="${m.l}" y1="${y}" x2="${width - m.r}" y2="${y}" stroke="#e2e8f0"/>`;
    grid += `<text x="${m.l - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#475569">${fmtShort(yv)}</text>`;
  }
  for (const idx of xTickIdx) {
    const x = xOf(idx);
    grid += `<line x1="${x}" y1="${m.t}" x2="${x}" y2="${height - m.b}" stroke="#e2e8f0"/>`;
    grid += `<text x="${x}" y="${height - 10}" text-anchor="middle" font-size="10" fill="#475569">${labels[idx] ?? ""}</text>`;
  }

  svgEl.innerHTML = `
    <rect x="0" y="0" width="${width}" height="${height}" fill="white"></rect>
    ${grid}
    <line x1="${m.l}" y1="${height - m.b}" x2="${width - m.r}" y2="${height - m.b}" stroke="#64748b"/>
    <line x1="${m.l}" y1="${m.t}" x2="${m.l}" y2="${height - m.b}" stroke="#64748b"/>
    <polyline fill="none" stroke="#1d4ed8" stroke-width="2" points="${poly}"></polyline>
    <circle id="hover-dot" r="4" fill="#1d4ed8" cx="-50" cy="-50"></circle>
  `;

  if (!tooltipEl) return;
  const dot = svgEl.querySelector("#hover-dot");

  svgEl.onmousemove = (ev) => {
    const rect = svgEl.getBoundingClientRect();
    const rx = ((ev.clientX - rect.left) / rect.width) * width;
    const idx = Math.min(values.length - 1, Math.max(0, Math.round(((rx - m.l) / w) * (values.length - 1))));
    const val = values[idx];
    if (!Number.isFinite(val)) return;

    const cx = xOf(idx);
    const cy = yOf(val);
    if (dot) {
      dot.setAttribute("cx", cx);
      dot.setAttribute("cy", cy);
    }

    tooltipEl.style.display = "block";
    tooltipEl.style.left = `${(cx / width) * rect.width + 8}px`;
    tooltipEl.style.top = `${(cy / height) * rect.height - 10}px`;
    tooltipEl.textContent = `${labels[idx]}: ${yFormat(val)}`;
  };

  svgEl.onmouseleave = () => {
    tooltipEl.style.display = "none";
    if (dot) {
      dot.setAttribute("cx", -50);
      dot.setAttribute("cy", -50);
    }
  };
}

function initBtcWinForLife() {
  const powerLaw = buildLatestEurPowerLawParams();

  const yearInput = document.getElementById("wfl-retire-year");
  const monthInput = document.getElementById("wfl-retire-month");
  const routInput = document.getElementById("wfl-rout");
  const inflInput = document.getElementById("wfl-infl");
  const horizonInput = document.getElementById("wfl-horizon");
  const percentileSelect = document.getElementById("wfl-percentile");
  const horizonModeSelect = document.getElementById("wfl-horizon-mode");
  const kpisEl = document.getElementById("wfl-kpis");
  const tableBody = document.getElementById("wfl-table-body");

  if (!yearInput) return;

  const update = () => {
    const yr = parseInt(yearInput.value || "0", 10);
    const mr = clampMonth(parseInt(monthInput.value || "1", 10));
    const rOut = parseFloat(routInput.value || "0");
    const inflAnnual = (parseFloat(inflInput.value || "0") || 0) / 100;
    const horizonYears = parseInt(horizonInput.value || "1", 10);
    const useLowerPostRetire = percentileSelect.value === "10";
    const finiteHorizonMode = horizonModeSelect.value === "horizon";

    const aAvg = powerLaw.aMedian;
    const aLower = powerLaw.aP10;

    const targetYears = finiteHorizonMode ? horizonYears : 200;

    const reqIndexedBtc = findRequiredBTCForRoutIndexed({
      aLower,
      aAvg,
      useLowerPostRetire: false,
      bExp: powerLaw.bExp,
      retire: { y: yr, m: mr },
      targetROutBase: rOut,
      inflAnnual,
      horizonYears: targetYears,
    });

    const sim = runSimulation({
      aLower,
      aAvg,
      useLowerPostRetire,
      bExp: powerLaw.bExp,
      retire: { y: yr, m: mr },
      initialBTC: reqIndexedBtc,
      rOutBase: rOut,
      inflAnnual,
      horizonYears: targetYears,
    });

    const priceAtRetire = pricePLDays(useLowerPostRetire ? aLower : aAvg, powerLaw.bExp, yr, mr);
    const exhaustedLabel = sim.exhaustedAt
      ? `${sim.exhaustedAt.y}-${String(sim.exhaustedAt.m).padStart(2, "0")}`
      : "No (within horizon)";

    kpisEl.innerHTML = `
      <div class="calc-kpi"><div class="label">b exponent (latest EUR fit)</div><div class="value">${powerLaw.bExp.toFixed(4)}</div></div>
      <div class="calc-kpi"><div class="label">Prijs @ retirement</div><div class="value">${formatMoneyEUR(priceAtRetire, 0)}</div></div>
      <div class="calc-kpi"><div class="label">Required BTC (indexed)</div><div class="value">${reqIndexedBtc.toFixed(6)}</div></div>
      <div class="calc-kpi"><div class="label">Total withdrawn</div><div class="value">${formatMoneyEUR(sim.summary.totalWithdrawnUsd, 0)}</div></div>
      <div class="calc-kpi"><div class="label">Exhausted?</div><div class="value">${exhaustedLabel}</div></div>
    `;

    const rows = sim.data.slice(0, 240);
    tableBody.innerHTML = rows
      .map((d) => `
        <tr><td>${d.year}</td><td>${d.month}</td><td>${formatMoneyEUR(d.price, 0)}</td><td>${d.sellBtc ? d.sellBtc.toFixed(6) : ""}</td><td>${d.rOutThisMonth ? formatMoneyEUR(d.rOutThisMonth, 0) : ""}</td><td>${d.btc.toFixed(6)}</td><td>${formatMoneyEUR(d.usdValue, 0)}</td></tr>`)
      .join("");

    const labels = rows.map((d) => `${d.year}-${String(d.month).padStart(2, "0")}`);
    drawInteractiveLineChart({
      svgEl: document.getElementById("wfl-chart-btc"),
      tooltipEl: document.getElementById("wfl-tooltip-btc"),
      labels,
      values: rows.map((d) => d.btc),
      yFormat: (v) => `${v.toFixed(6)} BTC`,
    });
    drawInteractiveLineChart({
      svgEl: document.getElementById("wfl-chart-eur"),
      tooltipEl: document.getElementById("wfl-tooltip-eur"),
      labels,
      values: rows.map((d) => d.usdValue),
      yFormat: (v) => formatMoneyEUR(v, 0),
    });
  };

  [yearInput, monthInput, routInput, inflInput, horizonInput, percentileSelect, horizonModeSelect]
    .forEach((el) => el?.addEventListener("input", update));

  update();
}

document.addEventListener("DOMContentLoaded", initBtcWinForLife);
