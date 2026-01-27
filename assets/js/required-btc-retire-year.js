// assets/js/required-btc-retire-year.js

function initRequiredBtcCalculator() {
  const targetInput = document.getElementById("rby-target-rout");
  const yearInput = document.getElementById("rby-retire-year");
  const monthInput = document.getElementById("rby-retire-month");
  const aAvgInput = document.getElementById("rby-a-avg");
  const aLowerInput = document.getElementById("rby-a-lower");
  const bExpInput = document.getElementById("rby-b-exp");
  const bandSelect = document.getElementById("rby-band");
  const rangeInput = document.getElementById("rby-year-range");
  const summaryEl = document.getElementById("rby-summary");
  const tableBody = document.getElementById("rby-table-body");

  if (!targetInput) return;

  const update = () => {
    const targetROut = parseFloat(targetInput.value || "0");
    const retireYear = parseInt(yearInput.value || "0", 10);
    const retireMonth = clampMonth(parseInt(monthInput.value || "1", 10));
    const aAvg = parseFloat(aAvgInput.value || "0");
    const aLower = parseFloat(aLowerInput.value || "0");
    const bExp = parseFloat(bExpInput.value || "0");
    const yearRange = parseInt(rangeInput.value || "40", 10);
    const useLower = bandSelect.value === "lower";

    tableBody.innerHTML = "";

    if (!Number.isFinite(retireYear) || retireYear <= 0) {
      summaryEl.textContent = "Vul een geldig pensioenjaar in.";
      return;
    }

    for (let y = retireYear; y <= retireYear + yearRange; y += 1) {
      const result = requiredBTCAtRetirement({
        aLower,
        aAvg,
        useLowerPostRetire: useLower,
        bExp,
        retire: { y, m: retireMonth },
        rOut: targetROut,
      });

      const row = document.createElement("tr");
      if (y === retireYear) {
        row.classList.add("highlight");
      }

      row.innerHTML = `
        <td>${y}</td>
        <td>${formatMoney(result.priceAtRetire, 0)}</td>
        <td>${result.btcRequired.toFixed(4)}</td>
      `;

      tableBody.appendChild(row);
    }

    const current = requiredBTCAtRetirement({
      aLower,
      aAvg,
      useLowerPostRetire: useLower,
      bExp,
      retire: { y: retireYear, m: retireMonth },
      rOut: targetROut,
    });

    summaryEl.innerHTML = `In ${retireYear} heb je ongeveer <strong>${current.btcRequired.toFixed(
      4
    )} BTC</strong> nodig om $${formatMoney(targetROut, 0)}/maand te starten.`;
  };

  [
    targetInput,
    yearInput,
    monthInput,
    aAvgInput,
    aLowerInput,
    bExpInput,
    bandSelect,
    rangeInput,
  ].forEach((el) => el.addEventListener("input", update));

  update();
}

document.addEventListener("DOMContentLoaded", initRequiredBtcCalculator);
