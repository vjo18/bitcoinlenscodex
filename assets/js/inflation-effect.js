// assets/js/inflation-effect.js

function initInflationEffectCalculator() {
  const baseInput = document.getElementById("inf-base");
  const yearsInput = document.getElementById("inf-years");
  const inflInput = document.getElementById("inf-rate");
  const resultEl = document.getElementById("inf-result");

  if (!baseInput) return;

  const update = () => {
    const baseAmount = parseFloat(baseInput.value || "0");
    const yearsAhead = parseInt(yearsInput.value || "0", 10);
    const inflRate = parseFloat(inflInput.value || "0") / 100;

    const futureNominal = baseAmount * Math.pow(1 + inflRate, yearsAhead);

    resultEl.textContent = `$${formatMoney(futureNominal, 0)}/maand`;
  };

  [baseInput, yearsInput, inflInput].forEach((el) =>
    el.addEventListener("input", update)
  );

  update();
}

document.addEventListener("DOMContentLoaded", initInflationEffectCalculator);
