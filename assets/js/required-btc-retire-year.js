// assets/js/required-btc-retire-year.js

function rbyRegression(xs, ys) {
  const n = xs.length;
  const xMean = xs.reduce((p, c) => p + c, 0) / n;
  const yMean = ys.reduce((p, c) => p + c, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const B = num / (den || 1e-12);
  const A = yMean - B * xMean;
  return { A, B };
}

function rbyDays(dateStr) {
  const ms = new Date(dateStr + "T00:00:00Z").getTime();
  return Math.max(EPS, (ms - GENESIS_MS) / (1000 * 60 * 60 * 24));
}

function rbyQuantile(sortedArr, q) {
  if (!sortedArr.length) return NaN;
  const pos = Math.max(0, Math.min(1, q)) * (sortedArr.length - 1);
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sortedArr[base + 1] ?? sortedArr[base];
  return sortedArr[base] + rest * (next - sortedArr[base]);
}

function buildRbyPowerLaw() {
  const rows = [...(window.btcMonthlyCloses ?? [])]
    .filter((r) => r?.date && Number.isFinite(r?.price) && r.price > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const xs = [];
  const ys = [];
  for (const row of rows) {
    xs.push(Math.log10(rbyDays(row.date)));
    ys.push(Math.log10(row.price));
  }
  const { A, B } = rbyRegression(xs, ys);
  const aLine = 10 ** A;
  const residuals = rows
    .map((r) => Math.log10(r.price) - Math.log10(aLine * Math.pow(rbyDays(r.date), B)))
    .sort((a, b) => a - b);
  return {
    bExp: B,
    aP50: aLine * Math.pow(10, rbyQuantile(residuals, 0.5)),
    aP10: aLine * Math.pow(10, rbyQuantile(residuals, 0.1)),
  };
}

function formatMoneyEUR(value) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

function initRequiredBtcCalculator() {
  const targetInput = document.getElementById("rby-target-rout");
  const yearInput = document.getElementById("rby-retire-year");
  const monthInput = document.getElementById("rby-retire-month");
  const bandSelect = document.getElementById("rby-band");
  const rangeInput = document.getElementById("rby-year-range");
  const summaryEl = document.getElementById("rby-summary");
  const tableBody = document.getElementById("rby-table-body");

  if (!targetInput) return;

  const powerLaw = buildRbyPowerLaw();

  const update = () => {
    const targetROut = parseFloat(targetInput.value || "0");
    const retireYear = parseInt(yearInput.value || "0", 10);
    const retireMonth = clampMonth(parseInt(monthInput.value || "1", 10));
    const yearRange = parseInt(rangeInput.value || "40", 10);
    const useLower = bandSelect.value === "lower";

    const aAvg = powerLaw.aP50;
    const aLower = powerLaw.aP10;

    tableBody.innerHTML = "";

    if (!Number.isFinite(retireYear) || retireYear <= 0) {
      summaryEl.textContent = "Vul een geldig pensioenjaar in.";
      return;
    }

    for (let y = retireYear; y <= retireYear + yearRange; y += 1) {
      const result = requiredBTCAtRetirement({
        aLower,
        aAvg,
        useLowerPostRetire: useLower,
        bExp: powerLaw.bExp,
        retire: { y, m: retireMonth },
        rOut: targetROut,
      });

      const row = document.createElement("tr");
      if (y === retireYear) row.classList.add("highlight");
      row.innerHTML = `<td>${y}</td><td>${formatMoneyEUR(result.priceAtRetire)}</td><td>${result.btcRequired.toFixed(4)}</td>`;
      tableBody.appendChild(row);
    }

    const current = requiredBTCAtRetirement({
      aLower,
      aAvg,
      useLowerPostRetire: useLower,
      bExp: powerLaw.bExp,
      retire: { y: retireYear, m: retireMonth },
      rOut: targetROut,
    });

    summaryEl.innerHTML = `In ${retireYear} heb je ongeveer <strong>${current.btcRequired.toFixed(4)} BTC</strong> nodig om ${formatMoneyEUR(targetROut)}/maand te starten.`;
  };

  [targetInput, yearInput, monthInput, bandSelect, rangeInput].forEach((el) => el.addEventListener("input", update));
  update();
}

document.addEventListener("DOMContentLoaded", initRequiredBtcCalculator);
