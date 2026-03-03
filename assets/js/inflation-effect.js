// assets/js/inflation-effect.js

function infMoneyEUR(value) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("nl-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function infFmtShort(v) {
  if (!Number.isFinite(v)) return "-";
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toFixed(0);
}

function drawInfLineChart({ svgEl, tooltipEl, labels, values, yFormat, color }) {
  if (!svgEl) return;

  const width = 560;
  const height = 260;
  const m = { t: 12, r: 10, b: 30, l: 52 };
  const w = width - m.l - m.r;
  const h = height - m.t - m.b;

  const pointsRaw = values.map((v, i) => ({ i, v })).filter((p) => Number.isFinite(p.v));
  if (!pointsRaw.length) {
    svgEl.innerHTML = "";
    return;
  }

  const minY = Math.min(...pointsRaw.map((p) => p.v));
  const maxY = Math.max(...pointsRaw.map((p) => p.v));
  const denY = Math.max(1e-9, maxY - minY);

  const xOf = (i) => m.l + (i / Math.max(1, values.length - 1)) * w;
  const yOf = (v) => m.t + (1 - (v - minY) / denY) * h;

  const poly = pointsRaw.map((p) => `${xOf(p.i)},${yOf(p.v)}`).join(" ");
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => minY + t * (maxY - minY));
  const xTickIdx = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(t * (labels.length - 1)));

  let grid = "";
  for (const yv of yTicks) {
    const y = yOf(yv);
    grid += `<line x1="${m.l}" y1="${y}" x2="${width - m.r}" y2="${y}" stroke="#e2e8f0"/>`;
    grid += `<text x="${m.l - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#475569">${infFmtShort(yv)}</text>`;
  }

  for (const idx of xTickIdx) {
    const x = xOf(idx);
    grid += `<line x1="${x}" y1="${m.t}" x2="${x}" y2="${height - m.b}" stroke="#e2e8f0"/>`;
    grid += `<text x="${x}" y="${height - 10}" text-anchor="middle" font-size="10" fill="#475569">${labels[idx] ?? ""}</text>`;
  }

  svgEl.innerHTML = `
    <rect x="0" y="0" width="${width}" height="${height}" fill="white"></rect>
    ${grid}
    <line x1="${m.l}" y1="${height - m.b}" x2="${width - m.r}" y2="${height - m.b}" stroke="#64748b"/>
    <line x1="${m.l}" y1="${m.t}" x2="${m.l}" y2="${height - m.b}" stroke="#64748b"/>
    <polyline fill="none" stroke="${color}" stroke-width="2" points="${poly}"></polyline>
    <circle id="inf-hover-dot" r="4" fill="${color}" cx="-50" cy="-50"></circle>
  `;

  if (!tooltipEl) return;
  const dot = svgEl.querySelector("#inf-hover-dot");

  svgEl.onmousemove = (ev) => {
    const rect = svgEl.getBoundingClientRect();
    const rx = ((ev.clientX - rect.left) / rect.width) * width;
    const idx = Math.min(values.length - 1, Math.max(0, Math.round(((rx - m.l) / w) * (values.length - 1))));
    const val = values[idx];
    if (!Number.isFinite(val)) return;

    const cx = xOf(idx);
    const cy = yOf(val);

    if (dot) {
      dot.setAttribute("cx", cx);
      dot.setAttribute("cy", cy);
    }

    tooltipEl.style.display = "block";
    tooltipEl.style.left = `${(cx / width) * rect.width + 8}px`;
    tooltipEl.style.top = `${(cy / height) * rect.height - 10}px`;
    tooltipEl.textContent = `${labels[idx]}: ${yFormat(val)}`;
  };

  svgEl.onmouseleave = () => {
    tooltipEl.style.display = "none";
    if (dot) {
      dot.setAttribute("cx", -50);
      dot.setAttribute("cy", -50);
    }
  };
}

function initInflationEffectCalculator() {
  const baseInput = document.getElementById("inf-base");
  const yearsInput = document.getElementById("inf-years");
  const inflInput = document.getElementById("inf-rate");

  const futureNominalEl = document.getElementById("inf-future-nominal");
  const futureRealEl = document.getElementById("inf-future-real");

  const nominalChartEl = document.getElementById("inf-chart-nominal");
  const realChartEl = document.getElementById("inf-chart-real");
  const nominalTooltipEl = document.getElementById("inf-tooltip-nominal");
  const realTooltipEl = document.getElementById("inf-tooltip-real");

  if (!baseInput) return;

  const update = () => {
    const baseAmount = parseFloat(baseInput.value || "0");
    const years = Math.max(1, parseInt(yearsInput.value || "1", 10));
    const inflRate = parseFloat(inflInput.value || "0") / 100;

    const inflationFactor = Math.pow(1 + inflRate, years);
    const futureNominal = baseAmount * inflationFactor;
    const futureRealTodayEuros = baseAmount / inflationFactor;

    futureNominalEl.textContent = `${infMoneyEUR(futureNominal)}/maand`;
    futureRealEl.textContent = `${infMoneyEUR(futureRealTodayEuros)} in euro's van vandaag`;

    const labels = [];
    const nominalValues = [];
    const realValues = [];

    for (let y = 0; y <= years; y += 1) {
      const factor = Math.pow(1 + inflRate, y);
      labels.push(`jaar ${y}`);
      nominalValues.push(baseAmount * factor);
      realValues.push(baseAmount / factor);
    }

    drawInfLineChart({
      svgEl: nominalChartEl,
      tooltipEl: nominalTooltipEl,
      labels,
      values: nominalValues,
      yFormat: (v) => `${infMoneyEUR(v)}/maand`,
      color: "#1d4ed8",
    });

    drawInfLineChart({
      svgEl: realChartEl,
      tooltipEl: realTooltipEl,
      labels,
      values: realValues,
      yFormat: (v) => `${infMoneyEUR(v)}/maand`,
      color: "#0f766e",
    });
  };

  [baseInput, yearsInput, inflInput].forEach((el) => el.addEventListener("input", update));
  update();
}

document.addEventListener("DOMContentLoaded", initInflationEffectCalculator);
