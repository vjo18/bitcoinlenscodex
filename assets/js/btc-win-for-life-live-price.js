// assets/js/btc-win-for-life-live-price.js

function wflLiveRegression(xs, ys) {
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

function wflLiveDays(dateStr) {
  const ms = new Date(dateStr + "T00:00:00Z").getTime();
  return Math.max(EPS, (ms - GENESIS_MS) / (1000 * 60 * 60 * 24));
}

function wflLiveQuantile(sortedArr, q) {
  if (!sortedArr.length) return NaN;
  const pos = Math.max(0, Math.min(1, q)) * (sortedArr.length - 1);
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sortedArr[base + 1] ?? sortedArr[base];
  return sortedArr[base] + rest * (next - sortedArr[base]);
}

function buildWflLivePowerLaw() {
  const rows = [...(window.btcMonthlyCloses ?? [])]
    .filter((r) => r?.date && Number.isFinite(r?.price) && r.price > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const xs = [];
  const ys = [];
  for (const row of rows) {
    xs.push(Math.log10(wflLiveDays(row.date)));
    ys.push(Math.log10(row.price));
  }

  const { A, B } = wflLiveRegression(xs, ys);
  const aLine = 10 ** A;
  const residuals = rows
    .map((r) => Math.log10(r.price) - Math.log10(aLine * Math.pow(wflLiveDays(r.date), B)))
    .sort((a, b) => a - b);

  return {
    bExp: B,
    aP50: aLine * Math.pow(10, wflLiveQuantile(residuals, 0.5)),
    aP10: aLine * Math.pow(10, wflLiveQuantile(residuals, 0.1)),
  };
}

function formatMoneyEUR(value) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

async function fetchLiveBtcEurPrice() {
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur";
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Live prijs ophalen mislukt (${response.status})`);
  const data = await response.json();
  const price = data?.bitcoin?.eur;
  if (!Number.isFinite(price) || price <= 0) throw new Error("Geen geldige live BTC-prijs ontvangen.");
  return price;
}

function initBtcWinForLifeLivePrice() {
  const routInput = document.getElementById("wfl-live-rout");
  const inflInput = document.getElementById("wfl-live-infl");
  const yearInput = document.getElementById("wfl-live-year");
  const monthInput = document.getElementById("wfl-live-month");
  const rangeInput = document.getElementById("wfl-live-range");
  const bandSelect = document.getElementById("wfl-live-band");
  const kpisEl = document.getElementById("wfl-live-kpis");
  const tableBody = document.getElementById("wfl-live-table");

  if (!routInput || !kpisEl || !tableBody) return;

  const powerLaw = buildWflLivePowerLaw();
  let livePrice = null;
  let livePriceError = "Live prijs laden...";

  const update = () => {
    const monthlyAmountNow = parseFloat(routInput.value || "0");
    const inflAnnual = (parseFloat(inflInput.value || "0") || 0) / 100;
    const startYear = parseInt(yearInput.value || "0", 10);
    const startMonth = clampMonth(parseInt(monthInput.value || "1", 10));
    const rangeYears = parseInt(rangeInput.value || "30", 10);
    const useLower = bandSelect.value === "lower";

    const aAvg = powerLaw.aP50;
    const aLower = powerLaw.aP10;
    const rowCount = Math.max(1, rangeYears + 1);

    tableBody.innerHTML = "";
    for (let i = 0; i < rowCount; i += 1) {
      const retireYear = startYear + i;
      const retire = { y: retireYear, m: startMonth };

      const monthsUntilRetire = Math.max(0, i * 12);
      const monthlyAtRetire = monthlyAmountNow * Math.pow(1 + inflAnnual / 12, monthsUntilRetire);

      const req = requiredBTCAtRetirement({
        aLower,
        aAvg,
        useLowerPostRetire: useLower,
        bExp: powerLaw.bExp,
        retire,
        rOut: monthlyAtRetire,
      });

      const costToday = Number.isFinite(livePrice) ? req.btcRequired * livePrice : NaN;
      const row = document.createElement("tr");
      if (i === 0) row.classList.add("highlight");
      row.innerHTML = `
        <td>${retireYear}-${String(startMonth).padStart(2, "0")}</td>
        <td>${formatMoneyEUR(monthlyAtRetire)}</td>
        <td>${formatMoneyEUR(req.priceAtRetire)}</td>
        <td>${req.btcRequired.toFixed(4)}</td>
        <td>${formatMoneyEUR(costToday)}</td>
      `;
      tableBody.appendChild(row);
    }

    const statusLabel = Number.isFinite(livePrice)
      ? `Live BTC prijs: ${formatMoneyEUR(livePrice)}`
      : `Live BTC prijs: ${livePriceError}`;

    kpisEl.innerHTML = `
      <div class="calc-kpi"><div class="label">Power-law exponent (b)</div><div class="value">${powerLaw.bExp.toFixed(4)}</div></div>
      <div class="calc-kpi"><div class="label">Input maandbedrag (nu)</div><div class="value">${formatMoneyEUR(monthlyAmountNow)}</div></div>
      <div class="calc-kpi"><div class="label">Inflatie</div><div class="value">${(inflAnnual * 100).toFixed(2)}% / jaar</div></div>
      <div class="calc-kpi"><div class="label">Live prijsstatus</div><div class="value">${statusLabel}</div></div>
    `;
  };

  [routInput, inflInput, yearInput, monthInput, rangeInput, bandSelect].forEach((el) => el.addEventListener("input", update));

  update();

  fetchLiveBtcEurPrice()
    .then((price) => {
      livePrice = price;
      livePriceError = "";
      update();
    })
    .catch((err) => {
      livePrice = null;
      livePriceError = err?.message || "onbekende fout";
      update();
    });
}

document.addEventListener("DOMContentLoaded", initBtcWinForLifeLivePrice);
