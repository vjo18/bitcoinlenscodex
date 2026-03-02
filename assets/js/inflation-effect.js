// assets/js/inflation-effect.js

function infMoneyEUR(value) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("nl-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function initInflationEffectCalculator() {
  const baseInput = document.getElementById("inf-base");
  const yearsInput = document.getElementById("inf-years");
  const inflInput = document.getElementById("inf-rate");

  const futureNominalEl = document.getElementById("inf-future-nominal");
  const futureRealEl = document.getElementById("inf-future-real");
  const pastEquivEl = document.getElementById("inf-past-equiv");

  if (!baseInput) return;

  const update = () => {
    const baseAmount = parseFloat(baseInput.value || "0");
    const years = Math.max(0, parseInt(yearsInput.value || "0", 10));
    const inflRate = parseFloat(inflInput.value || "0") / 100;

    const inflationFactor = Math.pow(1 + inflRate, years);

    // 1) Hoeveel nominale euro heb je in de toekomst nodig voor dezelfde koopkracht als nu?
    const futureNominal = baseAmount * inflationFactor;

    // 2) Wat is 6000 euro in de toekomst in reële termen van vandaag (koopkracht-uitgedrukt)?
    const futureRealTodayEuros = baseAmount / inflationFactor;

    // 3) Wat is het equivalente bedrag in het verleden (x jaar geleden)?
    const pastEquivalent = baseAmount / inflationFactor;

    futureNominalEl.textContent = `${infMoneyEUR(futureNominal)}/maand`;
    futureRealEl.textContent = `${infMoneyEUR(futureRealTodayEuros)} in euro's van vandaag`;
    pastEquivEl.textContent = `${infMoneyEUR(pastEquivalent)}/maand`;
  };

  [baseInput, yearsInput, inflInput].forEach((el) => el.addEventListener("input", update));
  update();
}

document.addEventListener("DOMContentLoaded", initInflationEffectCalculator);
