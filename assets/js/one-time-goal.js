// assets/js/one-time-goal.js

function initOneTimeGoalCalculator() {
  const yearInput = document.getElementById("otg-year");
  const monthInput = document.getElementById("otg-month");
  const usdInput = document.getElementById("otg-usd");
  const aAvgInput = document.getElementById("otg-a-avg");
  const aLowerInput = document.getElementById("otg-a-lower");
  const bExpInput = document.getElementById("otg-b-exp");

  const lowerPriceEl = document.getElementById("otg-price-lower");
  const avgPriceEl = document.getElementById("otg-price-avg");
  const lowerBtcEl = document.getElementById("otg-btc-lower");
  const avgBtcEl = document.getElementById("otg-btc-avg");

  if (!yearInput) return;

  const update = () => {
    const year = parseInt(yearInput.value || "0", 10);
    const month = clampMonth(parseInt(monthInput.value || "1", 10));
    const usdNeeded = parseFloat(usdInput.value || "0");
    const aAvg = parseFloat(aAvgInput.value || "0");
    const aLower = parseFloat(aLowerInput.value || "0");
    const bExp = parseFloat(bExpInput.value || "0");

    const priceLower = pricePLDays(aLower, bExp, year, month);
    const priceAvg = pricePLDays(aAvg, bExp, year, month);

    lowerPriceEl.textContent = `$${formatMoney(priceLower, 0)}`;
    avgPriceEl.textContent = `$${formatMoney(priceAvg, 0)}`;
    lowerBtcEl.textContent = `${(usdNeeded / priceLower).toFixed(6)} BTC`;
    avgBtcEl.textContent = `${(usdNeeded / priceAvg).toFixed(6)} BTC`;
  };

  [yearInput, monthInput, usdInput, aAvgInput, aLowerInput, bExpInput].forEach(
    (el) => el.addEventListener("input", update)
  );

  update();
}

document.addEventListener("DOMContentLoaded", initOneTimeGoalCalculator);
