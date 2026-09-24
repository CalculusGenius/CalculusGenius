/* CALCULUS LABORATORY — robust interactive mathematical workbench */
(() => {
    "use strict";

    const root = document.getElementById("laboratory");
    if (!root) return;

    const $ = (id) => document.getElementById(id);
    const plot = $("plot");

    const modes = {
        function: "Function Observatory",
        derivative: "Derivative Microscope",
        integral: "Integral Observatory",
        limit: "Limit Telescope",
        newton: "Newton Basin",
        taylor: "Taylor Studio",
        phase: "Phase Space"
    };

    const presets = [
        ["sin(x)", "sin(x)"],
        ["cos(x)", "cos(x)"],
        ["x²", "x^2"],
        ["x³−4x", "x^3 - 4*x"],
        ["e^(−x²)", "exp(-x^2)"],
        ["sin(x)/x", "sin(x)/x"],
        ["log|x|", "log(abs(x))"],
        ["x sin(x)", "x*sin(x)"],
        ["cos(x²)", "cos(x^2)"],
        ["1/(1+x²)", "1/(1+x^2)"]
    ];

    const challenges = [
        ["Symmetry Hunt", "Find an even or odd function and determine which parameter changes preserve the symmetry."],
        ["Near the Singularity", "Explore sin(x)/x near 0. Compare left, right and two-sided behaviour as the window shrinks."],
        ["Derivative Detective", "Find a function with several critical points and use the derivative curve to locate them."],
        ["Integral Duel", "Compare midpoint, trapezoidal and Simpson approximations. Increase n and watch the errors change."],
        ["Newton Escape", "Change the initial guess for a function with several roots. Investigate different basins of attraction."],
        ["Taylor Stretch", "Move the expansion centre and increase the order. Find where the approximation is local and where it fails."],
        ["Phase Portrait", "Change damping and initial conditions. Compare underdamped, critically damped and overdamped-looking trajectories."],
        ["Conjecture Machine", "Run three different experiments and write down one property you suspect they have in common."]
    ];

    const defaults = {
        function: { expr: "sin(x) * exp(-x^2/8)", xmin: -8, xmax: 8 },
        derivative: { expr: "x^3 - 4*x", xmin: -4, xmax: 4 },
        integral: { expr: "sin(x) + x^2/8", a: -2, b: 5, n: 40 },
        limit: { expr: "sin(x)/x", point: 0, scale: 2, side: "two" },
        newton: { expr: "x^3 - 2*x - 5", guess: 2, iterations: 8 },
        taylor: { expr: "exp(x)", center: 0, order: 6, span: 5 },
        phase: { alpha: 0.25, beta: 1.2, x0: 1.5, v0: 0, steps: 700 }
    };

    const state = {
        mode: "function",
        experiments: 0,
        session: 1,
        streak: 0,
        log: []
    };

    const stored = readStorage();
    if (stored) {
        state.experiments = finiteOr(stored.experiments, 0);
        state.session = finiteOr(stored.session, 1);
        state.streak = finiteOr(stored.streak, 0);
        state.log = Array.isArray(stored.log) ? stored.log.slice(0, 18) : [];
    }

    function finiteOr(value, fallback) {
        return Number.isFinite(Number(value)) ? Number(value) : fallback;
    }

    function readStorage() {
        try {
            const raw = localStorage.getItem("calculusLaboratoryV3");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function saveStorage() {
        try {
            localStorage.setItem("calculusLaboratoryV3", JSON.stringify({
                experiments: state.experiments,
                session: state.session,
                streak: state.streak,
                log: state.log.slice(0, 18)
            }));
        } catch {
            // Local storage can be disabled; the laboratory remains usable.
        }
    }

    function setText(id, value) {
        const node = $(id);
        if (node) node.textContent = String(value);
    }

    function showError(message) {
        setText("result", "Experiment unavailable: " + message);
        setText("readoutLabel", "Laboratory status");
        setText("readout", message);
    }

    function requireLibraries() {
        if (!window.math || typeof window.math.compile !== "function") {
            throw new Error("The mathematics engine did not load. Check the network connection and reload.");
        }
        if (!window.Plotly || typeof window.Plotly.react !== "function") {
            throw new Error("The graphing engine did not load. Check the network connection and reload.");
        }
    }

    function validateExpression(source) {
        const expression = String(source ?? "").trim();

        if (!expression) throw new Error("Enter a function of x.");
        if (expression.length > 180) throw new Error("Expression is too long.");
        if (/[;=]/.test(expression)) {
            throw new Error("Assignments and multiple statements are not allowed.");
        }
        if (/\b(import|createUnit|evaluate|parse|reviver)\s*\(/i.test(expression)) {
            throw new Error("That operation is not allowed in the laboratory.");
        }

        return expression;
    }

    function compileExpression(source) {
        requireLibraries();
        const expression = validateExpression(source);
        try {
            const compiled = window.math.compile(expression);
            return (x) => {
                try {
                    const value = compiled.evaluate({ x });
                    const number = typeof value === "number" ? value : Number(value);
                    return Number.isFinite(number) ? number : NaN;
                } catch {
                    return NaN;
                }
            };
        } catch (error) {
            throw new Error("Invalid mathematical expression. Try sin(x), x^2, exp(-x^2), or log(abs(x)).");
        }
    }

    function derivativeFunction(source, fallbackFn) {
        requireLibraries();
        const expression = validateExpression(source);

        try {
            const node = window.math.derivative(expression, "x");
            const compiled = node.compile();
            return (x) => {
                try {
                    const value = compiled.evaluate({ x });
                    const number = typeof value === "number" ? value : Number(value);
                    return Number.isFinite(number) ? number : numericalDerivative(fallbackFn, x);
                } catch {
                    return numericalDerivative(fallbackFn, x);
                }
            };
        } catch {
            return (x) => numericalDerivative(fallbackFn, x);
        }
    }

    function numericalDerivative(fn, x) {
        const h = Math.max(1e-6, Math.abs(x) * 1e-5);
        const left = fn(x - h);
        const right = fn(x + h);
        return Number.isFinite(left) && Number.isFinite(right)
            ? (right - left) / (2 * h)
            : NaN;
    }

    function sample(fn, a, b, count = 1000) {
        const points = [];
        for (let i = 0; i < count; i++) {
            const x = a + (b - a) * i / Math.max(1, count - 1);
            const y = fn(x);
            points.push({
                x,
                y: Number.isFinite(y) && Math.abs(y) <= 1e7 ? y : null
            });
        }
        return points;
    }

    function numericValues(points) {
        return points.map(p => p.y).filter(Number.isFinite);
    }

    function paddedRange(series, includeZero = true) {
        const values = [];
        series.forEach(points => {
            points.forEach(p => {
                if (Number.isFinite(p.y) && Math.abs(p.y) <= 1e7) values.push(p.y);
            });
        });

        if (!values.length) throw new Error("No finite values exist in this window.");

        let low = Math.min(...values);
        let high = Math.max(...values);

        if (includeZero) {
            low = Math.min(0, low);
            high = Math.max(0, high);
        }

        if (low === high) {
            low -= 1;
            high += 1;
        }

        const pad = Math.max((high - low) * 0.1, 0.5);
        return [low - pad, high + pad];
    }

    function finiteInput(id, label) {
        const node = $(id);
        const value = Number(node?.value);
        if (!Number.isFinite(value)) throw new Error("Enter a valid " + label + ".");
        return value;
    }

    function positiveInput(id, label, minimum = 1e-9) {
        const value = finiteInput(id, label);
        if (!(value >= minimum)) throw new Error(label + " must be at least " + minimum + ".");
        return value;
    }

    function baseLayout(title, xTitle = "x", yTitle = "y") {
        return {
            paper_bgcolor: "#070709",
            plot_bgcolor: "#070709",
            margin: { l: 58, r: 22, t: 42, b: 52 },
            title: { text: title, font: { family: "Inter, sans-serif", size: 12, color: "rgba(255,255,255,.65)" }, x: 0.02 },
            font: { family: "Inter, sans-serif", color: "rgba(255,255,255,.65)" },
            xaxis: {
                title: { text: xTitle },
                gridcolor: "rgba(255,255,255,.07)",
                zerolinecolor: "rgba(255,255,255,.24)",
                color: "rgba(255,255,255,.5)",
                automargin: true
            },
            yaxis: {
                title: { text: yTitle },
                gridcolor: "rgba(255,255,255,.07)",
                zerolinecolor: "rgba(255,255,255,.24)",
                color: "rgba(255,255,255,.5)",
                automargin: true
            },
            hovermode: "closest",
            showlegend: true,
            legend: { orientation: "h", y: 1.08, x: 0 },
            uirevision: "laboratory"
        };
    }

    const config = {
        responsive: true,
        displaylogo: false,
        scrollZoom: true,
        modeBarButtonsToRemove: ["lasso2d", "select2d", "autoScale2d"],
        showSendToCloud: false
    };

    function renderPlot(traces, layout) {
        requireLibraries();
        const finalLayout = { ...layout, height: undefined };
        return window.Plotly.react(plot, traces, finalLayout, config);
    }

    function updateReadout(label, value) {
        setText("readoutLabel", label);
        setText("readout", value);
    }

    function drawFunction() {
        const expression = $("expr").value;
        const fn = compileExpression(expression);
        const a = finiteInput("xmin", "x minimum");
        const b = finiteInput("xmax", "x maximum");

        if (!(b > a)) throw new Error("x maximum must exceed x minimum.");

        const points = sample(fn, a, b);
        const [yMin, yMax] = paddedRange([points], false);

        const midpoint = (a + b) / 2;
        const midpointValue = fn(midpoint);

        updateReadout(
            "Local observation",
            "f(" + midpoint.toFixed(3) + ") = " +
            (Number.isFinite(midpointValue) ? midpointValue.toFixed(8) : "undefined")
        );

        renderPlot([{
            x: points.map(p => p.x),
            y: points.map(p => p.y),
            type: "scatter",
            mode: "lines",
            connectgaps: false,
            name: "f(x)",
            line: { width: 2 }
        }], {
            ...baseLayout("Function Observatory", "x", "f(x)"),
            xaxis: { ...baseLayout("").xaxis, range: [a, b] },
            yaxis: { ...baseLayout("").yaxis, range: [yMin, yMax] }
        });

        return "Sampled f(x) on [" + a + ", " + b + "]. Drag, zoom and hover to investigate the curve.";
    }

    function drawDerivative() {
        const expression = $("expr").value;
        const fn = compileExpression(expression);
        const derivative = derivativeFunction(expression, fn);
        const a = finiteInput("xmin", "x minimum");
        const b = finiteInput("xmax", "x maximum");

        if (!(b > a)) throw new Error("x maximum must exceed x minimum.");

        const f = sample(fn, a, b);
        const d = sample(derivative, a, b);
        const [yMin, yMax] = paddedRange([f, d], true);
        const mid = derivative((a + b) / 2);

        updateReadout(
            "Derivative microscope",
            "f′(mid) ≈ " + (Number.isFinite(mid) ? mid.toFixed(8) : "undefined")
        );

        renderPlot([
            {
                x: f.map(p => p.x),
                y: f.map(p => p.y),
                type: "scatter",
                mode: "lines",
                connectgaps: false,
                name: "f(x)",
                line: { width: 2 }
            },
            {
                x: d.map(p => p.x),
                y: d.map(p => p.y),
                type: "scatter",
                mode: "lines",
                connectgaps: false,
                name: "f′(x)",
                line: { width: 1.7, dash: "dot" }
            }
        ], {
            ...baseLayout("Function and derivative", "x", "value"),
            xaxis: { ...baseLayout("").xaxis, range: [a, b] },
            yaxis: { ...baseLayout("").yaxis, range: [yMin, yMax] }
        });

        return "The bright curve is f and the dotted curve is f′. Compare turning points of f with zeros of f′.";
    }

    function drawIntegral() {
        const expression = $("expr").value;
        const fn = compileExpression(expression);
        const a = finiteInput("a", "lower bound");
        const b = finiteInput("b", "upper bound");
        const n = Math.max(2, Math.min(2000, Math.floor(finiteInput("n", "subinterval count"))));

        if (!(b > a)) throw new Error("Upper bound must exceed lower bound.");

        const dx = (b - a) / n;
        const midpointX = [];
        const midpointY = [];
        let midpoint = 0;

        for (let i = 0; i < n; i++) {
            const x0 = a + i * dx;
            const x1 = x0 + dx;
            const xm = (x0 + x1) / 2;
            const y = fn(xm);
            if (!Number.isFinite(y)) throw new Error("The integrand is undefined inside the interval.");
            midpointX.push(xm);
            midpointY.push(y);
            midpoint += y * dx;
        }

        const dense = sample(fn, a, b);
        const ys = numericValues(dense);
        if (!ys.length) throw new Error("The integrand has no finite values in this interval.");
        const [yMin, yMax] = paddedRange([dense], true);

        const trapezoid = integrateComposite(fn, a, b, n, "trapezoid");
        const simpsonN = n % 2 === 0 ? n : n + 1;
        const simpson = integrateComposite(fn, a, b, simpsonN, "simpson");

        updateReadout("Numerical integral", "Midpoint ≈ " + midpoint.toFixed(10));

        renderPlot([
            {
                x: dense.map(p => p.x),
                y: dense.map(p => p.y),
                type: "scatter",
                mode: "lines",
                connectgaps: false,
                name: "f(x)",
                line: { width: 2 }
            },
            {
                x: midpointX.flatMap((x, i) => [x - dx / 2, x + dx / 2]),
                y: midpointY.flatMap(y => [y, y]),
                type: "scatter",
                mode: "lines",
                name: "Midpoint rectangles",
                line: { width: 1 },
                opacity: 0.45
            }
        ], {
            ...baseLayout("Integral Observatory", "x", "f(x)"),
            xaxis: { ...baseLayout("").xaxis, range: [a, b] },
            yaxis: { ...baseLayout("").yaxis, range: [yMin, yMax] }
        });

        setText("result",
            "Midpoint: " + midpoint.toFixed(10) +
            " · Trapezoidal: " + trapezoid.toFixed(10) +
            " · Simpson: " + simpson.toFixed(10) +
            " · n = " + n
        );

        return "Compared midpoint, trapezoidal and Simpson quadrature on [" + a + ", " + b + "].";
    }

    function integrateComposite(fn, a, b, n, method) {
        const h = (b - a) / n;

        if (method === "trapezoid") {
            let sum = 0;
            for (let i = 0; i <= n; i++) {
                const y = fn(a + i * h);
                if (!Number.isFinite(y)) throw new Error("The integrand is undefined at a quadrature node.");
                sum += (i === 0 || i === n) ? y / 2 : y;
            }
            return sum * h;
        }

        let sum = fn(a) + fn(b);
        if (!Number.isFinite(sum)) throw new Error("The integrand is undefined at a Simpson endpoint.");
        for (let i = 1; i < n; i++) {
            const y = fn(a + i * h);
            if (!Number.isFinite(y)) throw new Error("The integrand is undefined at a Simpson node.");
            sum += (i % 2 === 0 ? 2 : 4) * y;
        }
        return sum * h / 3;
    }

    function drawLimit() {
        const expression = $("expr").value;
        const fn = compileExpression(expression);
        const point = finiteInput("point", "approach point");
        const scale = positiveInput("scale", "window scale", 1e-8);
        const side = $("side").value;

        const factors = [1, 0.1, 0.01, 0.001, 0.0001, 0.00001];
        const rows = factors.map(factor => {
            const epsilon = scale * factor;
            const left = fn(point - epsilon);
            const right = fn(point + epsilon);
            return { epsilon, left, right };
        });

        const finiteRows = rows.filter(r => Number.isFinite(r.left) || Number.isFinite(r.right));
        if (!finiteRows.length) throw new Error("No finite observations were found near the approach point.");

        const xMin = point - scale;
        const xMax = point + scale;
        const points = sample(fn, xMin, xMax);
        const [yMin, yMax] = paddedRange([points], false);

        renderPlot([{
            x: points.map(p => p.x),
            y: points.map(p => p.y),
            type: "scatter",
            mode: "lines",
            connectgaps: false,
            name: "f(x)",
            line: { width: 2 }
        }], {
            ...baseLayout("Limit Telescope", "x", "f(x)"),
            xaxis: { ...baseLayout("").xaxis, range: [xMin, xMax] },
            yaxis: { ...baseLayout("").yaxis, range: [yMin, yMax] }
        });

        const last = rows[rows.length - 1];
        const selected = side === "left" ? last.left : side === "right" ? last.right : averageFinite(last.left, last.right);

        updateReadout(
            "Closest numerical observation",
            "ε = " + last.epsilon.toExponential(2) + " → " +
            (Number.isFinite(selected) ? selected.toFixed(10) : "undefined")
        );

        setText("result", formatLimitRows(rows));

        return "Six shrinking distances were sampled from the selected point. Use the table in the notebook to compare the two sides.";
    }

    function averageFinite(a, b) {
        if (Number.isFinite(a) && Number.isFinite(b)) return (a + b) / 2;
        return Number.isFinite(a) ? a : b;
    }

    function formatLimitRows(rows) {
        return rows.map(r =>
            "ε=" + r.epsilon.toExponential(2) +
            " · left=" + formatNumber(r.left) +
            " · right=" + formatNumber(r.right)
        ).join("\n");
    }

    function formatNumber(value) {
        return Number.isFinite(value) ? value.toFixed(10) : "undefined";
    }

    function drawNewton() {
        const expression = $("expr").value;
        const fn = compileExpression(expression);
        const derivative = derivativeFunction(expression, fn);
        let x = finiteInput("guess", "initial guess");
        const iterations = Math.max(1, Math.min(50, Math.floor(finiteInput("iterations", "iteration count"))));
        const sequence = [x];

        for (let i = 0; i < iterations; i++) {
            const fx = fn(x);
            const slope = derivative(x);

            if (!Number.isFinite(fx) || !Number.isFinite(slope)) break;
            if (Math.abs(slope) < 1e-12) throw new Error("Newton's method reached an almost-horizontal tangent.");
            
            const next = x - fx / slope;
            if (!Number.isFinite(next) || Math.abs(next) > 1e8) break;

            sequence.push(next);
            x = next;
        }

        const root = sequence[sequence.length - 1];
        const windowMin = Math.min(...sequence) - 2;
        const windowMax = Math.max(...sequence) + 2;
        const curve = sample(fn, windowMin, windowMax);
        const [yMin, yMax] = paddedRange([curve], true);

        renderPlot([
            {
                x: curve.map(p => p.x),
                y: curve.map(p => p.y),
                type: "scatter",
                mode: "lines",
                connectgaps: false,
                name: "f(x)",
                line: { width: 2 }
            },
            {
                x: sequence,
                y: sequence.map(fn),
                type: "scatter",
                mode: "markers+lines",
                name: "Newton iterates",
                marker: { size: 7 },
                line: { width: 1, dash: "dot" }
            }
        ], {
            ...baseLayout("Newton Basin", "x", "f(x)"),
            xaxis: { ...baseLayout("").xaxis, range: [windowMin, windowMax] },
            yaxis: { ...baseLayout("").yaxis, range: [yMin, yMax] }
        });

        updateReadout("Newton iteration", "x" + (sequence.length - 1) + " ≈ " + root.toFixed(10));

        return "Newton produced " + sequence.length + " iterates. Final residual f(x) ≈ " + formatNumber(fn(root)) + ".";
    }

    function drawTaylor() {
        const expression = $("expr").value;
        const fn = compileExpression(expression);
        const center = finiteInput("center", "expansion centre");
        const order = Math.max(1, Math.min(14, Math.floor(finiteInput("order", "Taylor order"))));
        const span = positiveInput("span", "visible half-width", 0.05);

        let derivative;
        try {
            const node = window.math.derivative(expression, "x");
            derivative = node;
        } catch {
            derivative = null;
        }

        const coefficients = [];
        let node = window.math.parse(expression);

        for (let k = 0; k <= order; k++) {
            let value;
            try {
                value = node.compile().evaluate({ x: center });
                value = typeof value === "number" ? value : Number(value);
            } catch {
                value = NaN;
            }

            if (!Number.isFinite(value)) {
                value = finiteDifferenceDerivative(fn, center, k);
            }

            if (!Number.isFinite(value)) {
                throw new Error("Taylor coefficients could not be estimated at this centre.");
            }

            coefficients.push(value / factorial(k));

            if (k < order) {
                try {
                    node = window.math.derivative(node, "x");
                } catch {
                    node = null;
                }
            }

            if (!node && k < order) {
                // Repeated numerical differentiation fallback.
                const previous = coefficients[k];
                const nextDerivative = (x) => numericalDerivative(
                    k === 0 ? fn : buildNthDerivative(fn, k),
                    x
                );
                node = {
                    compile: () => ({
                        evaluate: ({ x }) => nextDerivative(x)
                    })
                };
                void previous;
            }
        }

        const xmin = center - span;
        const xmax = center + span;
        const original = sample(fn, xmin, xmax);
        const approximation = original.map(point => {
            let sum = 0;
            let power = 1;
            for (let k = 0; k < coefficients.length; k++) {
                if (k > 0) power *= point.x - center;
                sum += coefficients[k] * power;
            }
            return {
                x: point.x,
                y: Number.isFinite(sum) && Math.abs(sum) <= 1e7 ? sum : null
            };
        });

        const [yMin, yMax] = paddedRange([original, approximation], true);

        renderPlot([
            {
                x: original.map(p => p.x),
                y: original.map(p => p.y),
                type: "scatter",
                mode: "lines",
                connectgaps: false,
                name: "f(x)",
                line: { width: 2 }
            },
            {
                x: approximation.map(p => p.x),
                y: approximation.map(p => p.y),
                type: "scatter",
                mode: "lines",
                connectgaps: false,
                name: "Taylor polynomial",
                line: { width: 1.7, dash: "dot" }
            }
        ], {
            ...baseLayout("Taylor Studio", "x", "value"),
            xaxis: { ...baseLayout("").xaxis, range: [xmin, xmax] },
            yaxis: { ...baseLayout("").yaxis, range: [yMin, yMax] }
        });

        updateReadout("Taylor approximation", "Order " + order + " about a = " + center);
        return "Compared f with its order-" + order + " Taylor polynomial about x = " + center + ".";
    }

    function factorial(n) {
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    }

    function finiteDifferenceDerivative(fn, x, order) {
        if (order === 0) return fn(x);
        const h = Math.max(1e-3, Math.min(0.02, Math.max(1, Math.abs(x)) * 0.001));
        const lower = finiteDifferenceDerivative(fn, x - h, order - 1);
        const upper = finiteDifferenceDerivative(fn, x + h, order - 1);
        return (upper - lower) / (2 * h);
    }

    function buildNthDerivative(fn, order) {
        let current = fn;
        for (let i = 0; i < order; i++) {
            const previous = current;
            current = x => numericalDerivative(previous, x);
        }
        return current;
    }

    function drawPhase() {
        const alpha = finiteInput("alpha", "damping");
        const beta = finiteInput("beta", "restoring strength");
        const x0 = finiteInput("x0", "initial position");
        const v0 = finiteInput("v0", "initial velocity");
        const steps = Math.max(50, Math.min(3000, Math.floor(finiteInput("steps", "simulation steps"))));

        if (beta < 0) throw new Error("Restoring strength β must be non-negative.");
        if (alpha < 0) throw new Error("Damping α must be non-negative.");

        const dt = 0.02;
        let x = x0;
        let v = v0;
        const path = [];

        for (let i = 0; i < steps; i++) {
            path.push({ x, v });

            // Semi-implicit Euler for x'' + αx' + βx = 0.
            const acceleration = -alpha * v - beta * x;
            v += acceleration * dt;
            x += v * dt;

            if (!Number.isFinite(x) || !Number.isFinite(v)) {
                throw new Error("The simulation became numerically unstable.");
            }
        }

        const xValues = path.map(p => p.x);
        const vValues = path.map(p => p.v);
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const vMin = Math.min(...vValues);
        const vMax = Math.max(...vValues);

        const paddedX = expandRange(xMin, xMax);
        const paddedV = expandRange(vMin, vMax);

        renderPlot([{
            x: xValues,
            y: vValues,
            type: "scatter",
            mode: "lines",
            name: "trajectory",
            line: { width: 2 }
        }], {
            ...baseLayout("Phase-space trajectory", "position x", "velocity v"),
            xaxis: { ...baseLayout("").xaxis, range: paddedX },
            yaxis: { ...baseLayout("").yaxis, range: paddedV }
        });

        updateReadout("Phase space", "α=" + alpha + " · β=" + beta);
        return "Generated a phase-space trajectory for x″ + αx′ + βx = 0 from (x₀, v₀) = (" + x0 + ", " + v0 + ").";
    }

    function expandRange(min, max) {
        if (min === max) return [min - 1, max + 1];
        const pad = (max - min) * 0.12;
        return [min - pad, max + pad];
    }

    const drawMap = {
        function: drawFunction,
        derivative: drawDerivative,
        integral: drawIntegral,
        limit: drawLimit,
        newton: drawNewton,
        taylor: drawTaylor,
        phase: drawPhase
    };

    function controls() {
        const d = defaults[state.mode];
        const presetButtons = presets.map(([label, value]) =>
            '<button type="button" class="preset" data-expr="' +
            value.replace(/"/g, "&quot;") +
            '">' + label + "</button>"
        ).join("");

        const common = (fields, hint) =>
            '<div class="lab-field"><label for="expr">Function f(x)</label>' +
            '<input class="lab-input" id="expr" value="' + escapeHtml(d.expr) + '" spellcheck="false" autocomplete="off">' +
            '</div>' + fields +
            '<div class="lab-presets">' + presetButtons + '</div>' +
            '<p class="lab-hint">' + hint + '</p>';

        let html = "";

        if (state.mode === "function") {
            html = common(
                '<div class="lab-row"><div class="lab-field"><label for="xmin">x minimum</label><input class="lab-input" id="xmin" type="number" value="' + d.xmin + '" step=".5"></div>' +
                '<div class="lab-field"><label for="xmax">x maximum</label><input class="lab-input" id="xmax" type="number" value="' + d.xmax + '" step=".5"></div></div>',
                "Move the window, zoom the graph, hover points and try discontinuities, oscillations, growth, decay and symmetry."
            );
        }

        if (state.mode === "derivative") {
            html = common(
                '<div class="lab-row"><div class="lab-field"><label for="xmin">x minimum</label><input class="lab-input" id="xmin" type="number" value="' + d.xmin + '"></div>' +
                '<div class="lab-field"><label for="xmax">x maximum</label><input class="lab-input" id="xmax" type="number" value="' + d.xmax + '"></div></div>',
                "Compare zeros of f′ with turning points of f. The derivative is symbolic when possible and numerical as a fallback."
            );
        }

        if (state.mode === "integral") {
            html = common(
                '<div class="lab-row"><div class="lab-field"><label for="a">Lower bound a</label><input class="lab-input" id="a" type="number" value="' + d.a + '"></div>' +
                '<div class="lab-field"><label for="b">Upper bound b</label><input class="lab-input" id="b" type="number" value="' + d.b + '"></div></div>' +
                '<div class="lab-field"><label for="n">Subintervals n</label><input class="lab-input" id="n" type="number" min="2" max="2000" value="' + d.n + '"></div>',
                "Compare three quadrature rules. Increase n and observe convergence rather than trusting a single numerical value."
            );
        }

        if (state.mode === "limit") {
            html = common(
                '<div class="lab-row"><div class="lab-field"><label for="point">Approach point</label><input class="lab-input" id="point" type="number" value="' + d.point + '"></div>' +
                '<div class="lab-field"><label for="scale">Window scale</label><input class="lab-input" id="scale" type="number" min="0.00000001" value="' + d.scale + '"></div></div>' +
                '<div class="lab-field"><label for="side">Approach</label><select class="lab-select" id="side">' +
                '<option value="two">Two-sided</option><option value="left">From left</option><option value="right">From right</option></select></div>',
                "The table samples both sides at shrinking ε. A picture can suggest a limit, but the ε–δ statement is the mathematical proof."
            );
        }

        if (state.mode === "newton") {
            html = common(
                '<div class="lab-row"><div class="lab-field"><label for="guess">Initial guess</label><input class="lab-input" id="guess" type="number" value="' + d.guess + '"></div>' +
                '<div class="lab-field"><label for="iterations">Iterations</label><input class="lab-input" id="iterations" type="number" min="1" max="50" value="' + d.iterations + '"></div></div>',
                "Every marker is an iterate. Change the starting point and observe convergence, slow convergence or failure."
            );
        }

        if (state.mode === "taylor") {
            html = common(
                '<div class="lab-row"><div class="lab-field"><label for="center">Centre a</label><input class="lab-input" id="center" type="number" value="' + d.center + '"></div>' +
                '<div class="lab-field"><label for="order">Order</label><input class="lab-input" id="order" type="number" min="1" max="14" value="' + d.order + '"></div></div>' +
                '<div class="lab-field"><label for="span">Visible half-width</label><input class="lab-input" id="span" type="number" min="0.05" value="' + d.span + '"></div>',
                "Compare a local polynomial with the original function. Increase order and move the centre to explore local versus global approximation."
            );
        }

        if (state.mode === "phase") {
            html =
                '<div class="lab-field"><label for="alpha">Damping α</label><input class="lab-input" id="alpha" type="number" step=".05" value="' + d.alpha + '"></div>' +
                '<div class="lab-field"><label for="beta">Restoring strength β</label><input class="lab-input" id="beta" type="number" step=".1" value="' + d.beta + '"></div>' +
                '<div class="lab-row"><div class="lab-field"><label for="x0">Initial position x₀</label><input class="lab-input" id="x0" type="number" value="' + d.x0 + '"></div>' +
                '<div class="lab-field"><label for="v0">Initial velocity v₀</label><input class="lab-input" id="v0" type="number" value="' + d.v0 + '"></div></div>' +
                '<div class="lab-field"><label for="steps">Simulation steps</label><input class="lab-input" id="steps" type="number" min="50" max="3000" value="' + d.steps + '"></div>' +
                '<p class="lab-hint">A damped oscillator x″ + αx′ + βx = 0 is integrated numerically. Plotly lets you zoom and inspect the trajectory.</p>';
        }

        $("controls").innerHTML = html;

        if ($("side")) $("side").value = d.side;

        $("controls").querySelectorAll(".preset").forEach(button => {
            button.addEventListener("click", () => {
                $("expr").value = button.dataset.expr;
                safeDraw(false);
            });
        });

        $("controls").querySelectorAll("input, select").forEach(input => {
            input.addEventListener("input", () => safeDraw(false));
        });
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderLog() {
        setText("expCount", state.experiments);
        setText("sessionCount", String(state.session).padStart(3, "0"));
        setText("sessionNo", String(state.session).padStart(3, "0"));
        setText("streak", state.streak);
        setText("modeCount", state.mode.charAt(0).toUpperCase() + state.mode.slice(1));

        const log = $("log");
        if (!log) return;
        log.textContent = "";

        if (!state.log.length) {
            log.innerHTML = '<div class="lab-log-entry"><b>LABORATORY INITIALIZED</b><span>No observations yet. The universe is waiting.</span></div>';
            return;
        }

        state.log.forEach(item => {
            const entry = document.createElement("div");
            const title = document.createElement("b");
            const body = document.createElement("span");

            entry.className = "lab-log-entry";
            title.textContent = item.mode.toUpperCase() + " · " + item.time;
            body.textContent = item.text;
            entry.append(title, body);
            log.append(entry);
        });
    }

    function safeDraw(record = false) {
        try {
            const result = drawMap[state.mode]();
            if (record && result) {
                state.experiments += 1;
                state.log.unshift({
                    mode: state.mode,
                    text: result,
                    time: new Date().toLocaleTimeString()
                });
                state.log = state.log.slice(0, 18);
                saveStorage();
                renderLog();
            }
            if (!record) {
                // Keep the live graph responsive without inflating the experiment counter.
                setText("result", result);
            }
            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown laboratory error.";
            showError(message);
            return null;
        }
    }

    function switchMode(mode) {
        if (!drawMap[mode]) return;
        state.mode = mode;

        document.querySelectorAll(".instrument").forEach(button => {
            button.classList.toggle("active", button.dataset.mode === mode);
        });

        setText("instrumentName", modes[mode]);
        controls();
        renderLog();
        safeDraw(false);
    }

    function randomize() {
        const sets = {
            function: ["sin(2*x)+x/5", "cos(x^2)", "exp(-x^2/4)*cos(3*x)", "x^3-3*x+1", "sin(x)/(1+x^2)"],
            derivative: ["x^4-4*x^2", "sin(x)+cos(2*x)", "exp(-x^2/3)", "x*sin(x)"],
            integral: ["x^3-2*x+1", "sin(x)*exp(-x/4)", "cos(x^2)", "1/(1+x^2)"],
            limit: ["sin(x)/x", "(1-cos(x))/x^2", "exp(x)", "log(1+x)"],
            newton: ["x^3-2*x-5", "x^3-x-1", "cos(x)-x", "x^5-3*x+1"],
            taylor: ["exp(x)", "sin(x)", "cos(x)", "log(1+x)"]
        };

        if (state.mode === "phase") {
            $("alpha").value = (Math.random() * 0.9).toFixed(2);
            $("beta").value = (0.4 + Math.random() * 2).toFixed(2);
            $("x0").value = (Math.random() * 4 - 2).toFixed(2);
            $("v0").value = (Math.random() * 3 - 1.5).toFixed(2);
        } else {
            const expressions = sets[state.mode] || sets.function;
            $("expr").value = expressions[Math.floor(Math.random() * expressions.length)];

            if ($("xmin")) $("xmin").value = -6;
            if ($("xmax")) $("xmax").value = 6;
            if ($("a")) $("a").value = -2;
            if ($("b")) $("b").value = 4;
            if ($("n")) $("n").value = 20 + Math.floor(Math.random() * 100);
            if ($("guess")) $("guess").value = (Math.random() * 4 - 2).toFixed(2);
            if ($("center")) $("center").value = (Math.random() * 2 - 1).toFixed(2);
            if ($("order")) $("order").value = 2 + Math.floor(Math.random() * 10);
        }

        safeDraw(false);
    }

    function generateChallenge() {
        const challenge = challenges[Math.floor(Math.random() * challenges.length)];
        setText("challengeTitle", challenge[0]);
        setText("challengeText", challenge[1]);
        state.streak += 1;
        saveStorage();
        renderLog();
    }

    function resetSession() {
        state.session += 1;
        state.experiments = 0;
        state.streak = 0;
        state.log = [];
        saveStorage();
        renderLog();
        controls();
        safeDraw(false);
    }

    function init() {
        if (!plot) return;

        document.querySelectorAll(".instrument").forEach(button => {
            button.addEventListener("click", () => switchMode(button.dataset.mode));
        });

        $("run")?.addEventListener("click", () => safeDraw(true));
        $("randomize")?.addEventListener("click", randomize);
        $("challenge")?.addEventListener("click", generateChallenge);
        $("reset")?.addEventListener("click", resetSession);

        controls();
        renderLog();
        safeDraw(false);
    }

    init();
})();