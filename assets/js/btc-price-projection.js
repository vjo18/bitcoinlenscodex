// assets/js/btc-price-projection.js

function initBtcPriceProjectionCalculator() {
  const yearInput = document.getElementById("bpp-year");
  const monthInput = document.getElementById("bpp-month");
  const aAvgInput = document.getElementById("bpp-a-avg");
  const aLowerInput = document.getElementById("bpp-a-lower");
  const bExpInput = document.getElementById("bpp-b-exp");

  const lowerOne = document.getElementById("bpp-lower-1");
  const lowerTen = document.getElementById("bpp-lower-10");
  const lowerHundred = document.getElementById("bpp-lower-100");
  const avgOne = document.getElementById("bpp-avg-1");
  const avgTen = document.getElementById("bpp-avg-10");
  const avgHundred = document.getElementById("bpp-avg-100");

  if (!yearInput) return;

  const update = () => {
    const year = parseInt(yearInput.value || "0", 10);
    const month = clampMonth(parseInt(monthInput.value || "1", 10));
    const aAvg = parseFloat(aAvgInput.value || "0");
    const aLower = parseFloat(aLowerInput.value || "0");
    const bExp = parseFloat(bExpInput.value || "0");

    const priceLower = pricePLDays(aLower, bExp, year, month);
    const priceAvg = pricePLDays(aAvg, bExp, year, month);

    lowerOne.textContent = `$${formatMoney(priceLower, 0)}`;
    lowerTen.textContent = `$${formatMoney(priceLower * 10, 0)}`;
    lowerHundred.textContent = `$${formatMoney(priceLower * 100, 0)}`;

    avgOne.textContent = `$${formatMoney(priceAvg, 0)}`;
    avgTen.textContent = `$${formatMoney(priceAvg * 10, 0)}`;
    avgHundred.textContent = `$${formatMoney(priceAvg * 100, 0)}`;
  };

  [yearInput, monthInput, aAvgInput, aLowerInput, bExpInput].forEach((el) =>
    el.addEventListener("input", update)
  );

  update();
}

document.addEventListener("DOMContentLoaded", initBtcPriceProjectionCalculator);
