// assets/js/calculators-common.js

const EPS = 1e-9;
const GENESIS_MS = Date.UTC(2009, 0, 3);

function daysSinceGenesisFromYearMonth(year, month) {
  const ms = Date.UTC(year, month - 1, 1);
  const d = (ms - GENESIS_MS) / (1000 * 60 * 60 * 24);
  return Math.max(EPS, d);
}

function pricePLDays(a, b, year, month) {
  const d = daysSinceGenesisFromYearMonth(year, month);
  return a * Math.pow(d, b);
}

function formatMoney(value, decimals = 0) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  });
}

function requiredBTCAtRetirement({
  aLower,
  aAvg,
  useLowerPostRetire,
  bExp,
  retire,
  rOut,
}) {
  const aUsed = useLowerPostRetire ? aLower : aAvg;
  const dR = daysSinceGenesisFromYearMonth(retire.y, retire.m);
  const priceAtRetire = aUsed * Math.pow(dR, bExp);
  const tYears = dR / 365.25;
  const denom = Math.max(EPS, bExp - 1);
  const btcRequired = (rOut * 12 * tYears) / (priceAtRetire * denom);
  return { btcRequired, priceAtRetire };
}

function addMonths(ym, k) {
  const total = ym.y * 12 + (ym.m - 1) + k;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  return { y, m };
}

function runSimulation({
  aLower,
  aAvg,
  useLowerPostRetire,
  bExp,
  retire,
  initialBTC,
  rOutBase,
  inflAnnual,
  horizonYears,
}) {
  const months = horizonYears * 12 + 1;
  const data = [];

  let btc = initialBTC;
  let exhaustedAt = null;
  let cumulativeOut = 0;

  const aUsed = useLowerPostRetire ? aLower : aAvg;
  const monthlyInflFactor = Math.pow(1 + inflAnnual, 1 / 12);

  for (let k = 0; k < months; k += 1) {
    const ym = addMonths(retire, k);
    const price = pricePLDays(aUsed, bExp, ym.y, ym.m);

    const rOutThisMonth =
      k === 0 ? 0 : rOutBase * Math.pow(monthlyInflFactor, k);

    let sellBtc = 0;
    if (rOutThisMonth > 0 && k > 0) {
      sellBtc = rOutThisMonth / price;
      btc -= sellBtc;
      cumulativeOut += rOutThisMonth;

      if (btc < 0 && !exhaustedAt) {
        exhaustedAt = { ...ym };
      }
      btc = Math.max(0, btc);
    }

    data.push({
      year: ym.y,
      month: ym.m,
      price,
      btc,
      usdValue: btc * price,
      sellBtc,
      rOutThisMonth,
      cumulativeOut,
    });
  }

  const last = data[data.length - 1];
  return {
    data,
    exhaustedAt,
    summary: {
      btcAtEnd: last.btc,
      usdAtEnd: last.usdValue,
      totalWithdrawnUsd: cumulativeOut,
    },
  };
}

function findMaxRout({
  aLower,
  aAvg,
  useLowerPostRetire,
  bExp,
  retire,
  initialBTC,
  inflAnnual,
  horizonYears,
  finiteHorizonMode,
}) {
  let low = 0;
  let high = 1_000_000;
  for (let i = 0; i < 50; i += 1) {
    const mid = (low + high) / 2;
    const testHorizonYears = finiteHorizonMode ? horizonYears : 200;
    const sim = runSimulation({
      aLower,
      aAvg,
      useLowerPostRetire,
      bExp,
      retire,
      initialBTC,
      rOutBase: mid,
      inflAnnual,
      horizonYears: testHorizonYears,
    });
    const exhaustedWithinTest = sim.exhaustedAt !== null;
    if (exhaustedWithinTest) {
      high = mid;
    } else {
      low = mid;
    }
    if (high - low < 1) break;
  }
  return low;
}

function clampMonth(month) {
  return Math.min(12, Math.max(1, month));
}
