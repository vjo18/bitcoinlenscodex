// assets/js/btc-retirement-horizon.js

function brhRegression(xs, ys) {
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

function brhDays(dateStr) {
  const ms = new Date(dateStr + "T00:00:00Z").getTime();
  return Math.max(EPS, (ms - GENESIS_MS) / (1000 * 60 * 60 * 24));
}

function brhQuantile(sortedArr, q) {
  if (!sortedArr.length) return NaN;
  const pos = Math.max(0, Math.min(1, q)) * (sortedArr.length - 1);
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sortedArr[base + 1] ?? sortedArr[base];
  return sortedArr[base] + rest * (next - sortedArr[base]);
}

function buildBrhPowerLaw() {
  const rows = [...(window.btcMonthlyCloses ?? [])]
    .filter((r) => r?.date && Number.isFinite(r?.price) && r.price > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const xs = [];
  const ys = [];
  for (const row of rows) {
    xs.push(Math.log10(brhDays(row.date)));
    ys.push(Math.log10(row.price));
  }

  const { A, B } = brhRegression(xs, ys);
  const aLine = 10 ** A;
  const residuals = rows
    .map((r) => Math.log10(r.price) - Math.log10(aLine * Math.pow(brhDays(r.date), B)))
    .sort((a, b) => a - b);

  return {
    bExp: B,
    aP50: aLine * Math.pow(10, brhQuantile(residuals, 0.5)),
    aP10: aLine * Math.pow(10, brhQuantile(residuals, 0.1)),
  };
}

function brhMoneyEUR(value) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

async function brhFetchLivePrice() {
  const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur", { cache: "no-store" });
  if (!response.ok) throw new Error(`live prijs fout (${response.status})`);
  const data = await response.json();
  const price = data?.bitcoin?.eur;
  if (!Number.isFinite(price) || price <= 0) throw new Error("ongeldige live prijs");
  return price;
}

function initBtcRetirementHorizon() {
  const btcInput = document.getElementById("brh-btc");
  const rangeInput = document.getElementById("brh-year-range");
  const inflInput = document.getElementById("brh-inflation");
  const bandSelect = document.getElementById("brh-band");
  const summaryEl = document.getElementById("brh-summary");
  const liveStatusEl = document.getElementById("brh-live-status");
  const tableBody = document.getElementById("brh-table-body");

  if (!btcInput) return;

  const powerLaw = buildBrhPowerLaw();
  let livePrice = null;
  let liveError = "Live BTC prijs laden...";

  const update = () => {
    const initialBtc = parseFloat(btcInput.value || "0");
    const retireYear = new Date().getFullYear();
    const retireMonth = 1;
    const yearRange = Math.max(1, parseInt(rangeInput.value || "40", 10));
    const inflAnnual = (parseFloat(inflInput.value || "0") || 0) / 100;
    const useLower = bandSelect.value === "lower";

    tableBody.innerHTML = "";

    if (!Number.isFinite(initialBtc) || initialBtc <= 0) {
      summaryEl.textContent = "Vul een geldige BTC-hoeveelheid in.";
      return;
    }

    const aAvg = powerLaw.aP50;
    const aLower = powerLaw.aP10;
    const projectionEndYear = retireYear + yearRange;

    for (let y = retireYear; y <= retireYear + yearRange; y += 1) {
      const priceAtRetire = pricePLDays(useLower ? aLower : aAvg, powerLaw.bExp, y, retireMonth);
      const maxRout = findMaxRout({
        aLower,
        aAvg,
        useLowerPostRetire: useLower,
        bExp: powerLaw.bExp,
        retire: { y, m: retireMonth },
        initialBTC: initialBtc,
        inflAnnual,
        horizonYears: 200,
        finiteHorizonMode: false,
      });

      const payoutYears = projectionEndYear - y + 1;
      const totalPayout = payoutYears <= 0
        ? 0
        : maxRout * 12 * (
          inflAnnual === 0
            ? payoutYears
            : (Math.pow(1 + inflAnnual, payoutYears) - 1) / inflAnnual
        );
      const row = document.createElement("tr");
      if (y === retireYear) row.classList.add("highlight");
      row.innerHTML = `<td>${y}</td><td>${brhMoneyEUR(priceAtRetire)}</td><td>${brhMoneyEUR(maxRout)}/maand</td><td>${brhMoneyEUR(totalPayout)}</td>`;
      tableBody.appendChild(row);
    }

    const currentRout = findMaxRout({
      aLower,
      aAvg,
      useLowerPostRetire: useLower,
      bExp: powerLaw.bExp,
      retire: { y: retireYear, m: retireMonth },
      initialBTC: initialBtc,
      inflAnnual,
      horizonYears: 200,
      finiteHorizonMode: false,
    });

    summaryEl.innerHTML = `Met <strong>${initialBtc.toFixed(4)} BTC</strong> kan je vanaf ${retireYear} ongeveer <strong>${brhMoneyEUR(currentRout)}/maand</strong> opnemen (geïndexeerd met inflatie).`;

    const costToday = Number.isFinite(livePrice) ? brhMoneyEUR(initialBtc * livePrice) : "-";
    liveStatusEl.textContent = Number.isFinite(livePrice)
      ? `Live BTC prijs: ${brhMoneyEUR(livePrice)} • Kost vandaag (live EUR): ${costToday}`
      : `Live BTC prijs niet beschikbaar (${liveError}).`;
  };

  [btcInput, rangeInput, inflInput, bandSelect].forEach((el) => el.addEventListener("input", update));
  update();

  brhFetchLivePrice()
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

document.addEventListener("DOMContentLoaded", initBtcRetirementHorizon);
