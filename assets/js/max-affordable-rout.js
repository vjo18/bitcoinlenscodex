// assets/js/max-affordable-rout.js

function initMaxAffordableRoutCalculator() {
  const btcInput = document.getElementById("mar-btc");
  const yearInput = document.getElementById("mar-retire-year");
  const monthInput = document.getElementById("mar-retire-month");
  const inflInput = document.getElementById("mar-infl");
  const horizonInput = document.getElementById("mar-horizon");
  const finiteInput = document.getElementById("mar-finite");
  const bandSelect = document.getElementById("mar-band");
  const aAvgInput = document.getElementById("mar-a-avg");
  const aLowerInput = document.getElementById("mar-a-lower");
  const bExpInput = document.getElementById("mar-b-exp");

  const resultEl = document.getElementById("mar-result");
  const exhaustedEl = document.getElementById("mar-exhausted");

  if (!btcInput) return;

  const update = () => {
    const initialBTC = parseFloat(btcInput.value || "0");
    const retireYear = parseInt(yearInput.value || "0", 10);
    const retireMonth = clampMonth(parseInt(monthInput.value || "1", 10));
    const inflAnnual = parseFloat(inflInput.value || "0") / 100;
    const horizonYears = parseInt(horizonInput.value || "25", 10);
    const finiteHorizonMode = finiteInput.checked;
    const aAvg = parseFloat(aAvgInput.value || "0");
    const aLower = parseFloat(aLowerInput.value || "0");
    const bExp = parseFloat(bExpInput.value || "0");
    const useLower = bandSelect.value === "lower";

    const maxRout = findMaxRout({
      aLower,
      aAvg,
      useLowerPostRetire: useLower,
      bExp,
      retire: { y: retireYear, m: retireMonth },
      initialBTC,
      inflAnnual,
      horizonYears,
      finiteHorizonMode,
    });

    const sim = runSimulation({
      aLower,
      aAvg,
      useLowerPostRetire: useLower,
      bExp,
      retire: { y: retireYear, m: retireMonth },
      initialBTC,
      rOutBase: maxRout,
      inflAnnual,
      horizonYears: finiteHorizonMode ? horizonYears : 200,
    });

    resultEl.textContent = `$${formatMoney(maxRout, 0)} / maand`;

    if (sim.exhaustedAt) {
      exhaustedEl.textContent = `Uitgeput rond ${sim.exhaustedAt.y}-${String(
        sim.exhaustedAt.m
      ).padStart(2, "0")}.`;
    } else {
      exhaustedEl.textContent = "Niet uitgeput binnen de horizon.";
    }
  };

  [
    btcInput,
    yearInput,
    monthInput,
    inflInput,
    horizonInput,
    finiteInput,
    bandSelect,
    aAvgInput,
    aLowerInput,
    bExpInput,
  ].forEach((el) => el.addEventListener("input", update));

  update();
}

document.addEventListener("DOMContentLoaded", initMaxAffordableRoutCalculator);
