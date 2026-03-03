// assets/js/btc-dca-eur.js

function dcaRegression(xs, ys) {
  const n = xs.length;
  const xMean = xs.reduce((sum, value) => sum + value, 0) / n;
  const yMean = ys.reduce((sum, value) => sum + value, 0) / n;
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i += 1) {
    numerator += (xs[i] - xMean) * (ys[i] - yMean);
    denominator += (xs[i] - xMean) ** 2;
  }

  const B = numerator / (denominator || 1e-12);
  const A = yMean - B * xMean;
  return { A, B };
}

function dcaDays(dateStr) {
  const ms = new Date(`${dateStr}T00:00:00Z`).getTime();
  return Math.max(EPS, (ms - GENESIS_MS) / (1000 * 60 * 60 * 24));
}

function dcaQuantile(sortedArr, q) {
  if (!sortedArr.length) return NaN;
  const boundedQ = Math.max(0, Math.min(1, q));
  const pos = boundedQ * (sortedArr.length - 1);
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sortedArr[base + 1] ?? sortedArr[base];
  return sortedArr[base] + rest * (next - sortedArr[base]);
}

function buildDcaPowerLaw() {
  const rows = [...(window.btcMonthlyCloses ?? [])]
    .filter((row) => row?.date && Number.isFinite(row?.price) && row.price > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const xs = [];
  const ys = [];
  for (const row of rows) {
    xs.push(Math.log10(dcaDays(row.date)));
    ys.push(Math.log10(row.price));
  }

  const { A, B } = dcaRegression(xs, ys);
  const baseA = 10 ** A;

  const residuals = rows
    .map((row) => Math.log10(row.price) - Math.log10(baseA * Math.pow(dcaDays(row.date), B)))
    .sort((a, b) => a - b);

  return {
    bExp: B,
    aP40: baseA * Math.pow(10, dcaQuantile(residuals, 0.4)),
    aP50: baseA * Math.pow(10, dcaQuantile(residuals, 0.5)),
    aP60: baseA * Math.pow(10, dcaQuantile(residuals, 0.6)),
  };
}

function dcaMoneyEUR(value, decimals = 0) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: decimals });
}

async function dcaFetchLiveBtcEurPrice() {
  const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur", { cache: "no-store" });
  if (!response.ok) throw new Error(`live prijs fout (${response.status})`);
  const data = await response.json();
  const price = data?.bitcoin?.eur;
  if (!Number.isFinite(price) || price <= 0) throw new Error("ongeldige live prijs");
  return price;
}

function dcaSelectA(params, band) {
  if (band === "p40") return params.aP40;
  if (band === "p60") return params.aP60;
  return params.aP50;
}

function dcaMonthSequence(startYear, startMonth, months) {
  const sequence = [];
  for (let k = 0; k < months; k += 1) {
    const ym = addMonths({ y: startYear, m: startMonth }, k);
    sequence.push(ym);
  }
  return sequence;
}

function initBtcDcaEurCalculator() {
  const lumpInput = document.getElementById("dca-lump-eur");
  const monthlyInput = document.getElementById("dca-monthly-eur");
  const horizonInput = document.getElementById("dca-horizon-years");
  const band1Input = document.getElementById("dca-band-opt1");
  const opt1Result = document.getElementById("dca-opt1-result");

  const targetInput = document.getElementById("dca-target-btc");
  const targetHorizonInput = document.getElementById("dca-target-horizon-years");
  const band2Input = document.getElementById("dca-band-opt2");
  const opt2Result = document.getElementById("dca-opt2-result");
  const liveStatusEl = document.getElementById("dca-live-status");

  if (!lumpInput) return;

  const params = buildDcaPowerLaw();
  let livePrice = null;
  let liveError = "Live BTC prijs laden...";

  const update = () => {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth() + 1;

    const lumpEur = Math.max(0, parseFloat(lumpInput.value || "0") || 0);
    const monthlyEur = Math.max(0, parseFloat(monthlyInput.value || "0") || 0);
    const horizonYears = Math.max(1, parseInt(horizonInput.value || "1", 10));
    const band1 = band1Input.value;

    const horizonMonths = horizonYears * 12;
    const aUsedOpt1 = dcaSelectA(params, band1);
    const pathOpt1 = dcaMonthSequence(currentYear, currentMonth, horizonMonths);

    const firstPrice = pricePLDays(aUsedOpt1, params.bExp, currentYear, currentMonth);
    let totalBtc = lumpEur / firstPrice;

    for (const ym of pathOpt1) {
      const price = pricePLDays(aUsedOpt1, params.bExp, ym.y, ym.m);
      totalBtc += monthlyEur / price;
    }

    const endYm = addMonths({ y: currentYear, m: currentMonth }, horizonMonths - 1);
    opt1Result.innerHTML = `Met deze inspanning kan je naar schatting <strong>${totalBtc.toFixed(6)} BTC</strong> opbouwen tegen ${endYm.m}/${endYm.y}.`;

    const targetBtc = Math.max(0, parseFloat(targetInput.value || "0") || 0);
    const targetHorizonYears = Math.max(1, parseInt(targetHorizonInput.value || "1", 10));
    const targetHorizonMonths = targetHorizonYears * 12;
    const band2 = band2Input.value;
    const aUsedOpt2 = dcaSelectA(params, band2);
    const pathOpt2 = dcaMonthSequence(currentYear, currentMonth, targetHorizonMonths);

    const oneTimeOnly = Number.isFinite(livePrice) ? targetBtc * livePrice : NaN;

    let btcPerEuroViaMonthly = 0;
    for (const ym of pathOpt2) {
      const price = pricePLDays(aUsedOpt2, params.bExp, ym.y, ym.m);
      btcPerEuroViaMonthly += 1 / price;
    }
    const monthlyOnly = btcPerEuroViaMonthly > 0 ? targetBtc / btcPerEuroViaMonthly : NaN;

    const targetEndYm = addMonths({ y: currentYear, m: currentMonth }, targetHorizonMonths - 1);
    opt2Result.innerHTML = `Voor <strong>${targetBtc.toFixed(6)} BTC</strong> tegen ${targetEndYm.m}/${targetEndYm.y}: <strong>${dcaMoneyEUR(oneTimeOnly)}</strong> eenmalig vandaag (op basis van live BTC-prijs, zonder maandelijkse inleg), of <strong>${dcaMoneyEUR(monthlyOnly)}</strong> per maand vanaf vandaag (zonder eenmalige inleg).`;

    if (liveStatusEl) {
      liveStatusEl.textContent = Number.isFinite(livePrice)
        ? `Live BTC prijs: ${dcaMoneyEUR(livePrice)}`
        : `Live BTC prijs niet beschikbaar (${liveError}).`;
    }
  };

  [lumpInput, monthlyInput, horizonInput, band1Input, targetInput, targetHorizonInput, band2Input]
    .forEach((el) => el.addEventListener("input", update));

  update();

  dcaFetchLiveBtcEurPrice()
    .then((price) => {
      livePrice = price;
      liveError = "";
      update();
    })
    .catch((err) => {
      livePrice = null;
      liveError = err?.message || "onbekende fout";
      update();
    });
}

document.addEventListener("DOMContentLoaded", initBtcDcaEurCalculator);
