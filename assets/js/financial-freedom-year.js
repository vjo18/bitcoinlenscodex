// assets/js/financial-freedom-year.js

function initFinancialFreedomCalculator() {
  const btcInput = document.getElementById("ffy-btc");
  const rOutInput = document.getElementById("ffy-rout");
  const startYearInput = document.getElementById("ffy-start-year");
  const monthInput = document.getElementById("ffy-month");
  const bandSelect = document.getElementById("ffy-band");
  const aAvgInput = document.getElementById("ffy-a-avg");
  const aLowerInput = document.getElementById("ffy-a-lower");
  const bExpInput = document.getElementById("ffy-b-exp");

  const resultEl = document.getElementById("ffy-result");

  if (!btcInput) return;

  const update = () => {
    const btc = parseFloat(btcInput.value || "0");
    const rOut = parseFloat(rOutInput.value || "0");
    const startYear = parseInt(startYearInput.value || "0", 10);
    const month = clampMonth(parseInt(monthInput.value || "1", 10));
    const useLower = bandSelect.value === "lower";
    const aAvg = parseFloat(aAvgInput.value || "0");
    const aLower = parseFloat(aLowerInput.value || "0");
    const bExp = parseFloat(bExpInput.value || "0");

    let achievedYear = null;
    for (let y = startYear; y <= 2100; y += 1) {
      const { btcRequired } = requiredBTCAtRetirement({
        aLower,
        aAvg,
        useLowerPostRetire: useLower,
        bExp,
        retire: { y, m: month },
        rOut,
      });
      if (btc + EPS >= btcRequired) {
        achievedYear = y;
        break;
      }
    }

    if (achievedYear) {
      resultEl.innerHTML = `Je kan ongeveer met pensioen rond <strong>${achievedYear}</strong> met $${formatMoney(
        rOut,
        0
      )}/maand.`;
    } else {
      resultEl.textContent = `Met ${btc.toFixed(4)} BTC bereik je $${formatMoney(
        rOut,
        0
      )}/maand niet voor 2100.`;
    }
  };

  [
    btcInput,
    rOutInput,
    startYearInput,
    monthInput,
    bandSelect,
    aAvgInput,
    aLowerInput,
    bExpInput,
  ].forEach((el) => el.addEventListener("input", update));

  update();
}

document.addEventListener("DOMContentLoaded", initFinancialFreedomCalculator);
