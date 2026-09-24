/* CALCULUS LABORATORY — interactive mathematical workbench */
const root = document.getElementById("laboratory");

if (root) {
    const $ = id => document.getElementById(id);
    const canvas = $("plot");
    const ctx = canvas && canvas.getContext("2d");

    if (!canvas || !ctx) {
        console.error("Laboratory: plot canvas is missing.");
    } else {
        const stored = (() => {
            try { return JSON.parse(localStorage.getItem("calculusLaboratory") || "null"); }
            catch { return null; }
        })();

        const state = stored && typeof stored === "object"
            ? {
                experiments: Number.isFinite(stored.experiments) ? stored.experiments : 0,
                session: Number.isFinite(stored.session) ? stored.session : 1,
                log: Array.isArray(stored.log) ? stored.log : []
            }
            : { experiments: 0, session: 1, log: [] };

        let mode = "function";
        let currentDraw = () => null;

        const FUNCTIONS = new Set([
            "sin","cos","tan","asin","acos","atan","sqrt","exp",
            "log","abs","floor","ceil","pow","min","max"
        ]);
        const CONSTANTS = new Set(["PI","E"]);

        function safeExpr(source) {
            let expression = String(source ?? "").trim();

            if (!expression) throw new Error("Enter a function of x.");
            if (expression.length > 180) throw new Error("Expression is too long.");
            if (/[;{}\[\]=<>:&|!?'"`]/.test(expression)) {
                throw new Error("Unsupported character in expression.");
            }

            expression = expression.replace(/\^/g, "**");

            const identifiers = expression.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
            for (const name of identifiers) {
                if (name !== "x" && !FUNCTIONS.has(name) && !CONSTANTS.has(name)) {
                    throw new Error("Unknown symbol: " + name);
                }
            }

            expression = expression.replace(
                /\b(sin|cos|tan|asin|acos|atan|sqrt|exp|log|abs|floor|ceil|pow|min|max)\b/g,
                "Math.$1"
            );
            expression = expression.replace(/\bPI\b/g, "Math.PI");
            expression = expression.replace(/\bE\b/g, "Math.E");

            try {
                return Function("x", '"use strict"; return (' + expression + ');');
            } catch {
                throw new Error("Invalid expression. Use forms such as sin(x), x^2, exp(-x^2).");
            }
        }

        function value(fn, x) {
            try {
                const y = Number(fn(x));
                return Number.isFinite(y) ? y : NaN;
            } catch {
                return NaN;
            }
        }

        function derivative(fn, x) {
            const h = Math.max(1e-5, Math.abs(x) * 1e-5);
            const yp = value(fn, x + h);
            const ym = value(fn, x - h);
            return Number.isFinite(yp) && Number.isFinite(ym) ? (yp - ym) / (2 * h) : NaN;
        }

        function finiteNumber(id, label) {
            const n = Number($(id).value);
            if (!Number.isFinite(n)) throw new Error("Enter a valid " + label + ".");
            return n;
        }

        function orderedRange(min, max, label) {
            if (!(max > min)) throw new Error(label + " maximum must be greater than its minimum.");
            return [min, max];
        }

        function resize() {
            const rect = canvas.getBoundingClientRect();
            const width = Math.max(1, rect.width);
            const height = Math.max(1, rect.height);
            const dpr = Math.max(1, window.devicePixelRatio || 1);
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            currentDraw();
        }

        function axes(xmin, xmax, ymin, ymax) {
            const w = canvas.clientWidth || 1;
            const h = canvas.clientHeight || 1;
            const dx = xmax - xmin || 1;
            const dy = ymax - ymin || 1;
            const X = x => ((x - xmin) / dx) * w;
            const Y = y => h - ((y - ymin) / dy) * h;

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = "#08080a";
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = "rgba(255,255,255,.055)";
            ctx.lineWidth = 1;
            for (let i = 0; i <= 10; i++) {
                const x = i * w / 10;
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
            }
            for (let i = 0; i <= 8; i++) {
                const y = i * h / 8;
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
            }

            if (xmin < 0 && xmax > 0) {
                ctx.strokeStyle = "rgba(255,255,255,.24)";
                ctx.beginPath(); ctx.moveTo(X(0), 0); ctx.lineTo(X(0), h); ctx.stroke();
            }
            if (ymin < 0 && ymax > 0) {
                ctx.strokeStyle = "rgba(255,255,255,.24)";
                ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(w, Y(0)); ctx.stroke();
            }

            return { X, Y, w, h };
        }

        function sampleRange(fn, xmin, xmax, count, limit = 1e6) {
            const points = [];
            for (let i = 0; i < count; i++) {
                const x = xmin + (xmax - xmin) * i / (count - 1);
                const y = value(fn, x);
                points.push({ x, y: Number.isFinite(y) && Math.abs(y) <= limit ? y : NaN });
            }
            return points;
        }

        function drawFunction() {
            const fn = safeExpr($("expr").value);
            const xmin = finiteNumber("xmin", "x minimum");
            const xmax = finiteNumber("xmax", "x maximum");
            orderedRange(xmin, xmax, "x");

            const points = sampleRange(fn, xmin, xmax, 1000);
            const finite = points.filter(p => Number.isFinite(p.y)).map(p => p.y);
            if (!finite.length) throw new Error("The function has no finite values in this interval.");

            let ymin = Math.min(...finite), ymax = Math.max(...finite);
            if (ymin === ymax) { ymin -= 1; ymax += 1; }
            const pad = (ymax - ymin) * .12;
            const g = axes(xmin, xmax, ymin - pad, ymax + pad);

            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            let pen = false;
            for (const p of points) {
                if (!Number.isFinite(p.y)) { pen = false; continue; }
                const px = g.X(p.x), py = g.Y(p.y);
                if (!pen) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                pen = true;
            }
            ctx.stroke();

            const cx = (xmin + xmax) / 2;
            const cy = value(fn, cx);
            const d = derivative(fn, cx);
            $("readoutLabel").textContent = "Local observation";
            $("readout").textContent =
                "f(" + cx.toFixed(2) + ") = " +
                (Number.isFinite(cy) ? cy.toFixed(5) : "undefined") +
                " · f′ ≈ " +
                (Number.isFinite(d) ? d.toFixed(5) : "undefined");

            return "Function sampled on [" + xmin + ", " + xmax + "]. At x=" +
                cx.toFixed(2) + ", f(x)≈" +
                (Number.isFinite(cy) ? cy.toFixed(5) : "undefined") +
                " and f′(x)≈" +
                (Number.isFinite(d) ? d.toFixed(5) : "undefined") + ".";
        }

        function drawRiemann() {
            const fn = safeExpr($("rExpr").value);
            const a = finiteNumber("a", "lower bound");
            const b = finiteNumber("b", "upper bound");
            orderedRange(a, b, "Integral");
            const n = Math.max(2, Math.min(1000, Math.floor(finiteNumber("n", "subinterval count"))));
            const dx = (b - a) / n;
            let sum = 0;

            for (let i = 0; i < n; i++) {
                const y = value(fn, a + (i + .5) * dx);
                if (!Number.isFinite(y)) throw new Error("The integrand is undefined inside the interval.");
                sum += y * dx;
            }

            const points = sampleRange(fn, a, b, 600);
            const finite = points.filter(p => Number.isFinite(p.y)).map(p => p.y);
            if (!finite.length) throw new Error("The integrand has no finite values in this interval.");

            let ymin = Math.min(0, ...finite), ymax = Math.max(0, ...finite);
            if (ymin === ymax) ymax = ymin + 1;
            const pad = (ymax - ymin) * .1;
            const g = axes(a, b, ymin - pad, ymax + pad);

            ctx.fillStyle = "rgba(255,255,255,.10)";
            for (let i = 0; i < n; i++) {
                const x0 = a + i * dx, x1 = x0 + dx;
                const y = value(fn, (x0 + x1) / 2);
                const top = g.Y(Math.max(0, y)), bottom = g.Y(Math.min(0, y));
                ctx.fillRect(g.X(x0), top, Math.max(1, g.X(x1) - g.X(x0)), bottom - top);
            }

            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.7;
            ctx.beginPath();
            let pen = false;
            for (const p of points) {
                if (!Number.isFinite(p.y)) { pen = false; continue; }
                if (!pen) ctx.moveTo(g.X(p.x), g.Y(p.y)); else ctx.lineTo(g.X(p.x), g.Y(p.y));
                pen = true;
            }
            ctx.stroke();

            $("readoutLabel").textContent = "Midpoint sum";
            $("readout").textContent = "∫ ≈ " + sum.toFixed(8) + " · n = " + n;
            return "Midpoint Riemann approximation: " + sum.toFixed(8) +
                " using " + n + " subintervals of width " + dx.toFixed(6) + ".";
        }

        function drawNewton() {
            const fn = safeExpr($("nExpr").value);
            let x = finiteNumber("guess", "initial guess");
            const iterations = Math.max(1, Math.min(30, Math.floor(finiteNumber("iterations", "iteration count"))));
            const sequence = [x];

            for (let i = 0; i < iterations; i++) {
                const fx = value(fn, x);
                const d = derivative(fn, x);
                if (!Number.isFinite(fx) || !Number.isFinite(d)) break;
                if (Math.abs(d) < 1e-10) throw new Error("Newton's method reached a point with an almost-zero derivative.");
                const next = x - fx / d;
                if (!Number.isFinite(next) || Math.abs(next) > 1e8) break;
                x = next;
                sequence.push(x);
            }

            const lo = Math.min(...sequence) - 2;
            const hi = Math.max(...sequence) + 2;
            const points = sampleRange(fn, lo, hi, 600);
            const finite = points.filter(p => Number.isFinite(p.y)).map(p => p.y);
            if (!finite.length) throw new Error("The function could not be plotted around the iterates.");

            let ymin = Math.min(0, ...finite), ymax = Math.max(0, ...finite);
            if (ymin === ymax) ymax = ymin + 1;
            const pad = (ymax - ymin) * .1;
            const g = axes(lo, hi, ymin - pad, ymax + pad);

            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            let pen = false;
            for (const p of points) {
                if (!Number.isFinite(p.y)) { pen = false; continue; }
                if (!pen) ctx.moveTo(g.X(p.x), g.Y(p.y)); else ctx.lineTo(g.X(p.x), g.Y(p.y));
                pen = true;
            }
            ctx.stroke();

            ctx.fillStyle = "#fff";
            for (const q of sequence) {
                const y = value(fn, q);
                if (!Number.isFinite(y)) continue;
                ctx.beginPath();
                ctx.arc(g.X(q), g.Y(y), 3.5, 0, Math.PI * 2);
                ctx.fill();
            }

            const last = sequence[sequence.length - 1];
            $("readoutLabel").textContent = "Newton sequence";
            $("readout").textContent = "x₀ → x" + (sequence.length - 1) + " = " + last.toFixed(10);
            return "Newton iteration produced " + sequence.length +
                " points; final iterate x≈" + last.toFixed(10) +
                " with f(x)≈" + value(fn, last).toExponential(3) + ".";
        }

        function drawTaylor() {
            const fn = safeExpr($("tExpr").value);
            const a = finiteNumber("center", "expansion point");
            const order = Math.max(1, Math.min(12, Math.floor(finiteNumber("order", "Taylor order"))));

            function factorial(n) {
                let result = 1;
                for (let i = 2; i <= n; i++) result *= i;
                return result;
            }

            function nthDerivative(x, n) {
                if (n === 0) return value(fn, x);
                if (n === 1) return derivative(fn, x);
                const h = Math.max(1e-3, Math.min(.05, Math.max(1, Math.abs(x - a)) * .01));
                return (nthDerivative(x + h, n - 1) - nthDerivative(x - h, n - 1)) / (2 * h);
            }

            const coefficients = [];
            for (let n = 0; n <= order; n++) {
                const d = nthDerivative(a, n);
                if (!Number.isFinite(d)) throw new Error("Could not estimate the required Taylor derivatives.");
                coefficients.push(d / factorial(n));
            }

            const xmin = a - 5, xmax = a + 5;
            const original = sampleRange(fn, xmin, xmax, 700).map(p => p.y);
            const taylor = original.map((_, i) => {
                const x = xmin + (xmax - xmin) * i / 699;
                let sum = 0, power = 1;
                for (let j = 0; j < coefficients.length; j++) {
                    if (j > 0) power *= x - a;
                    sum += coefficients[j] * power;
                }
                return Number.isFinite(sum) && Math.abs(sum) <= 1e12 ? sum : NaN;
            });

            const all = original.concat(taylor).filter(Number.isFinite);
            if (!all.length) throw new Error("The Taylor approximation produced no finite values.");
            let ymin = Math.min(...all), ymax = Math.max(...all);
            if (ymin === ymax) { ymin -= 1; ymax += 1; }
            const pad = (ymax - ymin) * .12;
            const g = axes(xmin, xmax, ymin - pad, ymax + pad);

            function strokeSeries(series, style, width) {
                ctx.strokeStyle = style;
                ctx.lineWidth = width;
                ctx.beginPath();
                let pen = false;
                series.forEach((y, i) => {
                    if (!Number.isFinite(y)) { pen = false; return; }
                    const x = xmin + (xmax - xmin) * i / 699;
                    if (!pen) ctx.moveTo(g.X(x), g.Y(y)); else ctx.lineTo(g.X(x), g.Y(y));
                    pen = true;
                });
                ctx.stroke();
            }

            strokeSeries(original, "rgba(255,255,255,.9)", 1.8);
            strokeSeries(taylor, "rgba(255,255,255,.35)", 1.2);

            $("readoutLabel").textContent = "Taylor approximation";
            $("readout").textContent = "Order " + order + " about a = " + a;
            return "Taylor polynomial of order " + order + " about x=" + a +
                " was sampled against the original function.";
        }

        const drawByMode = { function: drawFunction, riemann: drawRiemann, newton: drawNewton, taylor: drawTaylor };

        function draw() {
            try {
                const result = drawByMode[mode]();
                $("result").textContent = result;
                return result;
            } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error.";
                $("result").textContent = "Experiment could not be evaluated: " + message;
                ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
                ctx.fillStyle = "rgba(255,255,255,.35)";
                ctx.font = "12px Inter, sans-serif";
                ctx.fillText("Experiment unavailable", 18, 28);
                return null;
            }
        }

        currentDraw = draw;

        function save() {
            try {
                localStorage.setItem("calculusLaboratory", JSON.stringify({
                    experiments: state.experiments,
                    session: state.session,
                    log: state.log.slice(0, 12)
                }));
            } catch (error) {
                console.warn("Laboratory notebook could not be saved.", error);
            }
        }

        function addLog(result) {
            if (!result) return;
            state.experiments++;
            state.log.unshift({ mode, text: result, time: new Date().toLocaleTimeString() });
            state.log = state.log.slice(0, 12);
            save();
            renderLog();
        }

        function renderLog() {
            $("expCount").textContent = state.experiments;
            $("sessionCount").textContent = String(state.session).padStart(3, "0");
            $("sessionNo").textContent = String(state.session).padStart(3, "0");
            $("modeCount").textContent = mode.charAt(0).toUpperCase() + mode.slice(1);

            $("log").textContent = "";
            if (!state.log.length) {
                const entry = document.createElement("div");
                entry.className = "lab-log-entry";
                entry.innerHTML = "<b>Laboratory initialized</b><span>No observations recorded yet.</span>";
                $("log").appendChild(entry);
                return;
            }

            for (const item of state.log) {
                const entry = document.createElement("div");
                entry.className = "lab-log-entry";
                const title = document.createElement("b");
                title.textContent = item.mode.toUpperCase() + " · " + item.time;
                const body = document.createElement("span");
                body.textContent = item.text;
                entry.append(title, body);
                $("log").appendChild(entry);
            }
        }

        document.querySelectorAll(".lab-tab").forEach(button => {
            button.addEventListener("click", () => {
                document.querySelectorAll(".lab-tab").forEach(b => b.classList.remove("active"));
                document.querySelectorAll(".lab-section").forEach(s => s.classList.remove("active"));
                button.classList.add("active");
                mode = button.dataset.mode;
                const controlId = {
                    function: "functionControls",
                    riemann: "riemannControls",
                    newton: "newtonControls",
                    taylor: "taylorControls"
                }[mode];
                if (controlId) $(controlId).classList.add("active");
                $("instrumentName").textContent = {
                    function: "Function Observatory",
                    riemann: "Integral Approximation Bench",
                    newton: "Root-Finding Bench",
                    taylor: "Approximation Studio"
                }[mode];
                renderLog();
                draw();
            });
        });

        $("run").addEventListener("click", () => addLog(draw()));

        $("reset").addEventListener("click", () => {
            state.session++;
            state.experiments = 0;
            state.log = [];
            save();
            renderLog();
            $("result").textContent = "Session reset. The instruments are ready.";
            draw();
        });

        ["expr","xmin","xmax","rExpr","a","b","n","nExpr","guess","iterations","tExpr","center","order"]
            .forEach(id => $(id)?.addEventListener("change", draw));

        window.addEventListener("resize", resize);
        renderLog();
        resize();
        draw();
    }
}
