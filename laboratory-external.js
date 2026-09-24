/* CALCULUS LABORATORY — interactive graphing embeds */
(() => {
  "use strict";

  const graphingState = { expression: "sin(x)", xMin: -10, xMax: 10 };

  function el(id) { return document.getElementById(id); }

  function pointsFor(fn, xmin, xmax, count = 700) {
    const x = [], y = [];
    const step = (xmax - xmin) / (count - 1);
    for (let i = 0; i < count; i++) {
      const xv = xmin + i * step;
      let yv;
      try { yv = Number(fn(xv)); } catch { yv = NaN; }
      x.push(xv);
      y.push(Number.isFinite(yv) && Math.abs(yv) < 1e6 ? yv : null);
    }
    return { x, y };
  }

  function safeMathExpression(expr) {
    const source = String(expr || "sin(x)")
      .replace(/^f\(x\)\s*=\s*/i, "")
      .replace(/²/g, "^2")
      .replace(/³/g, "^3")
      .replace(/π/g, "pi")
      .replace(/\s+/g, " ");
    try {
      const compiled = window.math.compile(source);
      return x => compiled.evaluate({ x });
    } catch {
      return x => Math.sin(x);
    }
  }

  function plotLayout(title = "") {
    return {
      title: { text: title, font: { family: "Inter", size: 12, color: "rgba(255,255,255,.65)" } },
      paper_bgcolor: "#070709",
      plot_bgcolor: "#070709",
      font: { family: "Inter", color: "rgba(255,255,255,.65)" },
      margin: { l: 55, r: 25, t: 40, b: 45 },
      xaxis: { gridcolor: "rgba(255,255,255,.08)", zerolinecolor: "rgba(255,255,255,.18)" },
      yaxis: { gridcolor: "rgba(255,255,255,.08)", zerolinecolor: "rgba(255,255,255,.18)" },
      showlegend: false
    };
  }

  function baseConfig() {
    return { responsive: true, displaylogo: false, scrollZoom: true, modeBarButtonsToRemove: ["lasso2d", "select2d"] };
  }

  function graph2D(command = graphingState.expression) {
    const target = el("graph-graphing");
    if (!target || !window.Plotly || !window.math) return;
    const fn = safeMathExpression(command);
    const data = pointsFor(fn, graphingState.xMin, graphingState.xMax);
    Plotly.react(
      target,
      [{ x: data.x, y: data.y, type: "scatter", mode: "lines", line: { width: 2 } }],
      plotLayout("Interactive Graphing Embed"),
      baseConfig()
    );
    graphingState.expression = command;
  }

  function geometryEmbed() {
    const target = el("graph-geometry");
    if (!target || !window.Plotly) return;
    const t = Array.from({ length: 500 }, (_, i) => 2 * Math.PI * i / 499);
    const layout = plotLayout("Dynamic Geometry Embed");
    layout.xaxis = { ...layout.xaxis, scaleanchor: "y", scaleratio: 1 };
    Plotly.newPlot(target, [
      { x: t.map(a => Math.cos(a)), y: t.map(a => Math.sin(a)), type: "scatter", mode: "lines", line: { width: 2 } },
      { x: [0], y: [0], type: "scatter", mode: "markers", marker: { size: 9 } }
    ], layout, baseConfig());
  }

  function threeDEmbed() {
    const target = el("graph-3d");
    if (!target || !window.Plotly) return;
    const n = 45;
    const x = Array.from({ length: n }, (_, i) => -3 + 6 * i / (n - 1));
    const y = Array.from({ length: n }, (_, i) => -3 + 6 * i / (n - 1));
    const z = y.map(yv => x.map(xv => Math.sin(Math.sqrt(xv * xv + yv * yv))));
    Plotly.newPlot(target, [{ x, y, z, type: "surface", showscale: false }], {
      ...plotLayout("3D Graphing Embed"),
      scene: {
        bgcolor: "#070709",
        xaxis: { gridcolor: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.55)" },
        yaxis: { gridcolor: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.55)" },
        zaxis: { gridcolor: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.55)" }
      }
    }, baseConfig());
  }

  function casEmbed() {
    const target = el("graph-cas");
    if (!target || !window.Plotly) return;
    const x = Array.from({ length: 500 }, (_, i) => -5 + 10 * i / 499);
    const layout = plotLayout("Calculus / CAS-style Embed");
    layout.showlegend = true;
    layout.legend = { font: { color: "rgba(255,255,255,.55)" } };
    Plotly.newPlot(target, [
      { x, y: x.map(v => v * v), type: "scatter", mode: "lines", name: "f(x)=x²", line: { width: 2 } },
      { x, y: x.map(v => 2 * v), type: "scatter", mode: "lines", name: "f′(x)=2x", line: { width: 2, dash: "dot" } }
    ], layout, baseConfig());
  }

  function loadIntoGraph(command) {
    if (!command) return;
    graph2D(command);
  }

  window.loadIntoGraph = loadIntoGraph;

  function init() {
    graph2D("sin(x)");
    geometryEmbed();
    threeDEmbed();
    casEmbed();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();