/* =========================================================
   CALCULUS — MATHEMATICAL TIME MACHINE ENGINE
========================================================= */

const page = document.getElementById("timeMachine");

if (page) {

const eras = [
    {
        year: -250,
        short: "Archimedes",
        era: "Ancient Greece",
        title: "It's around 250 BCE.",
        copy: "You are centuries before differential calculus. Approximation comes through geometry, exhaustion, ratios, and carefully controlled polygons.",
        fact: "Archimedes used the method of exhaustion to obtain increasingly accurate areas and volumes.",
        tools: ["Geometry", "Ratios", "Exhaustion", "Polygons"],
        locked: ["Derivatives", "Limits", "Integrals", "Epsilon proofs"],
        problemLabel: "Archimedes • exhaustion",
        problem: "A circle has radius 1. Its area is trapped between polygonal approximations. Which classical method lets you approach the area arbitrarily closely?",
        answers: ["exhaustion", "method of exhaustion"],
        modernity: 3
    },
    {
        year: 1635,
        short: "Cavalieri",
        era: "Indivisibles",
        title: "It's 1635.",
        copy: "You have entered Cavalieri's world. Geometric quantities can be compared through collections of indivisible lines or planes.",
        fact: "Cavalieri's principle became a powerful bridge between classical geometry and later integral ideas.",
        tools: ["Geometry", "Indivisibles", "Ratios", "Area comparison"],
        locked: ["Formal limits", "Derivatives", "Epsilon proofs", "Modern notation"],
        problemLabel: "Cavalieri • indivisibles",
        problem: "Two solids have equal height and equal cross-sectional areas at every corresponding level. What principle lets you conclude that their volumes are equal?",
        answers: ["cavalieri", "cavalieri's principle", "cavalieris principle"],
        modernity: 12
    },
    {
        year: 1665,
        short: "Newton",
        era: "Fluxions",
        title: "It's 1665.",
        copy: "You don't have modern calculus. Think in terms of fluent quantities and fluxions. The machine has deliberately hidden later notation.",
        fact: "Newton developed his fluxional methods in the 1660s; publication and later presentation came in different stages.",
        tools: ["Algebra", "Fluxions", "Infinite series", "Geometry"],
        locked: ["ε-δ language", "Lebesgue integration", "Abstract manifolds", "Modern measure theory"],
        problemLabel: "Newton • fluxions",
        problem: "For y = x², what is the instantaneous rate of change at x = 2? Give the numerical value.",
        answers: ["4", "4.0"],
        modernity: 24
    },
    {
        year: 1684,
        short: "Leibniz",
        era: "Differential calculus",
        title: "It's 1684.",
        copy: "A new symbolic language is emerging. Differentials and a compact notation make relationships between changing quantities easier to manipulate.",
        fact: "Leibniz published his differential calculus in 1684, introducing notation that became extraordinarily influential.",
        tools: ["Algebra", "Differentials", "Symbolic notation", "Product rules"],
        locked: ["Formal epsilon proofs", "Measure theory", "Functional analysis", "Distribution theory"],
        problemLabel: "Leibniz • differentials",
        problem: "Using the emerging differential viewpoint, find the derivative of x³ at x = 2.",
        answers: ["12", "12.0"],
        modernity: 35
    },
    {
        year: 1748,
        short: "Euler",
        era: "18th-century analysis",
        title: "It's 1748.",
        copy: "Calculus is now a powerful computational language. Infinite series, functions, differential equations and symbolic manipulation dominate the mathematical landscape.",
        fact: "Euler's Introductio in analysin infinitorum was published in 1748 and strongly shaped analysis.",
        tools: ["Calculus", "Infinite series", "Functions", "Differential equations"],
        locked: ["ε-δ rigor", "Measure theory", "Modern topology", "Abstract functional analysis"],
        problemLabel: "Euler • infinite series",
        problem: "Euler's famous evaluation of Σ(1/n²) from n = 1 to ∞ is what constant multiple of π²?",
        answers: ["1/6", "pi^2/6", "π²/6", "pi2/6"],
        modernity: 48
    },
    {
        year: 1821,
        short: "Cauchy",
        era: "Rigorous analysis",
        title: "It's 1821.",
        copy: "The demand for rigor is growing. Limits, continuity and convergence are becoming explicit mathematical objects rather than informal intuitions.",
        fact: "Cauchy's Cours d'analyse helped push calculus toward a more systematic theory of limits and continuity.",
        tools: ["Limits", "Continuity", "Sequences", "Series", "Inequalities"],
        locked: ["Modern measure theory", "Abstract Banach spaces", "Lebesgue integration"],
        problemLabel: "Cauchy • limit",
        problem: "Evaluate lim(x→1) (x² − 1)/(x − 1).",
        answers: ["2", "2.0"],
        modernity: 65
    },
    {
        year: 1872,
        short: "Weierstrass",
        era: "Arithmetization of analysis",
        title: "It's the 1870s.",
        copy: "Intuition is no longer enough. Precision is taking center stage: quantified definitions, carefully controlled inequalities and exact convergence arguments.",
        fact: "Weierstrass became central to the rigorous, epsilon-based style of analysis that emerged in the nineteenth century.",
        tools: ["ε-language", "Inequalities", "Sequences", "Proof"],
        locked: ["Lebesgue measure", "Modern distributions", "Abstract operator theory"],
        problemLabel: "Weierstrass • precision",
        problem: "Which small Greek letter became the standard symbol for an arbitrarily small positive tolerance in rigorous limit proofs?",
        answers: ["epsilon", "ε"],
        modernity: 82
    },
    {
        year: 2026,
        short: "Modern Analysis",
        era: "Present day",
        title: "It's 2026.",
        copy: "The full mathematical toolbox is restored. You may use limits, topology, measure, abstract spaces and modern notation.",
        fact: "Modern analysis contains many distinct frameworks: real analysis, measure theory, functional analysis, harmonic analysis, PDE and more.",
        tools: ["Limits", "Topology", "Measure", "Functional analysis", "Modern notation", "Computation"],
        locked: [],
        problemLabel: "Modern analysis • open toolkit",
        problem: "Choose a method, prove a statement, compute an integral, or simply return to another century. The machine no longer restricts your toolkit.",
        answers: ["anything", "modern", "return", "2026"],
        modernity: 100
    }
];

const universeNames = {
    calculus: "The development of calculus",
    algebra: "The development of algebra",
    geometry: "The development of geometry",
    number: "The development of number theory",
    probability: "The development of probability",
    physics: "The mathematical development of physics"
};

const symbols = {
    calculus: "∫",
    algebra: "∑",
    geometry: "△",
    number: "ℕ",
    probability: "P",
    physics: "∂"
};

const concept = document.getElementById("concept");
const yearInput = document.getElementById("yearInput");
const yearRange = document.getElementById("yearRange");
const travelButton = document.getElementById("travelButton");
const randomEra = document.getElementById("randomEra");
const readoutYear = document.getElementById("readoutYear");
const readoutEra = document.getElementById("readoutEra");
const readoutCopy = document.getElementById("readoutCopy");
const readoutFact = document.getElementById("readoutFact");
const modernityValue = document.getElementById("modernityValue");
const modernityFill = document.getElementById("modernityFill");
const paradoxValue = document.getElementById("paradoxValue");
const paradoxFill = document.getElementById("paradoxFill");
const missionTitle = document.getElementById("missionTitle");
const missionCopy = document.getElementById("missionCopy");
const problemLabel = document.getElementById("problemLabel");
const problemText = document.getElementById("problemText");
const toolList = document.getElementById("toolList");
const answerInput = document.getElementById("answerInput");
const checkAnswer = document.getElementById("checkAnswer");
const feedback = document.getElementById("feedback");
const timeline = document.getElementById("timeline");
const timelineTitle = document.getElementById("timelineTitle");
const quickEras = document.getElementById("quickEras");
const coreSymbol = document.getElementById("coreSymbol");
const coordinateStatus = document.getElementById("coordinateStatus");
const stars = document.getElementById("stars");

let currentEra = eras[2];
let currentConcept = "calculus";
let paradox = 8;

/* ---------- Ambient star field ---------- */

for (let i = 0; i < 70; i++) {
    const star = document.createElement("span");
    star.className = "tm-star";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.setProperty("--dx", (Math.random() * 140 - 70) + "px");
    star.style.setProperty("--dy", (Math.random() * 140 - 70) + "px");
    star.style.animationDuration = (5 + Math.random() * 12) + "s";
    star.style.animationDelay = (-Math.random() * 12) + "s";
    stars.appendChild(star);
}

/* ---------- Timeline ---------- */

function buildTimeline() {
    timeline.innerHTML = "";

    const line = document.createElement("div");
    line.className = "tm-timeline-line";
    timeline.appendChild(line);

    const progress = document.createElement("div");
    progress.className = "tm-timeline-progress";
    progress.id = "timelineProgress";
    timeline.appendChild(progress);

    eras.forEach((era, index) => {
        const position = (index / (eras.length - 1)) * 100;

        const node = document.createElement("button");
        node.className = "tm-era-node";
        node.style.left = position + "%";
        node.title = era.short;
        node.dataset.index = index;

        node.addEventListener("click", () => {
            travelToYear(era.year);
        });

        timeline.appendChild(node);

        const caption = document.createElement("div");
        caption.className = "tm-era-caption";
        caption.style.left = position + "%";
        caption.innerHTML =
            '<span class="tm-era-year">' +
            formatYear(era.year) +
            '</span>' +
            era.short;
        timeline.appendChild(caption);
    });
}

function buildQuickEras() {
    quickEras.innerHTML = "";

    eras.slice(0, 7).forEach(era => {
        const button = document.createElement("button");
        button.className = "tm-concept";
        button.textContent = era.short;
        button.addEventListener("click", () => travelToYear(era.year));
        quickEras.appendChild(button);
    });
}

function formatYear(year) {
    if (year < 0) return Math.abs(year) + " BCE";
    if (year === 0) return "1 BCE / 1 CE";
    return String(year) + " CE";
}

function nearestEra(year) {
    return eras.reduce((best, era) =>
        Math.abs(era.year - year) < Math.abs(best.year - year)
            ? era
            : best
    , eras[0]);
}

function getParadox(year) {
    const distance = Math.abs(year - 1665);
    return Math.min(96, Math.round(6 + distance / 38));
}

function renderEra(era) {
    currentEra = era;

    readoutYear.textContent = formatYear(era.year);
    readoutEra.textContent = era.era;
    readoutCopy.textContent = era.copy;
    readoutFact.textContent = era.fact;

    missionTitle.textContent = era.title;
    missionCopy.textContent = era.copy;
    problemLabel.textContent = era.problemLabel;
    problemText.textContent = era.problem;

    modernityValue.textContent = era.modernity + "%";
    modernityFill.style.width = era.modernity + "%";

    paradox = getParadox(era.year);
    paradoxValue.textContent = String(paradox).padStart(2, "0") + "%";
    paradoxFill.style.width = paradox + "%";

    yearInput.value = era.year;
    yearRange.value = era.year;

    coreSymbol.textContent = symbols[currentConcept];

    coordinateStatus.textContent =
        "TEMPORAL LOCK • " +
        (era.year < 0 ? "BCE" : "CE") +
        " • T+" +
        String(Math.abs(era.year)).padStart(4, "0");

    toolList.innerHTML = "";

    era.tools.forEach(tool => {
        const span = document.createElement("span");
        span.className = "tm-tool";
        span.textContent = "✓ " + tool;
        toolList.appendChild(span);
    });

    era.locked.forEach(tool => {
        const span = document.createElement("span");
        span.className = "tm-tool locked";
        span.textContent = "× " + tool;
        toolList.appendChild(span);
    });

    feedback.textContent = "";
    feedback.className = "tm-feedback";
    answerInput.value = "";
    answerInput.placeholder =
        era.year === 2026
            ? "Type anything to continue"
            : "Enter your answer";

    const index = eras.indexOf(era);
    const progress = document.getElementById("timelineProgress");

    if (progress) {
        progress.style.width =
            (index / (eras.length - 1)) * 100 + "%";
    }

    timeline.querySelectorAll(".tm-era-node").forEach((node, i) => {
        node.classList.toggle("active", i === index);
    });

    timelineTitle.textContent =
        universeNames[currentConcept];

    document.title =
        "Time Machine — " + era.short + " | CALCULUS";
}

function travelToYear(rawYear) {
    let year = Number(rawYear);

    if (!Number.isFinite(year)) {
        year = 1665;
    }

    year = Math.max(-250, Math.min(2026, Math.round(year)));

    const era = nearestEra(year);

    page.classList.remove("traveling");
    void page.offsetWidth;
    page.classList.add("traveling");

    travelButton.textContent = "Temporal jump in progress…";
    travelButton.disabled = true;

    setTimeout(() => {
        renderEra(era);
        travelButton.textContent = "Initiate temporal jump";
        travelButton.disabled = false;
        page.classList.remove("traveling");
    }, 850);
}

/* ---------- Controls ---------- */

yearRange.addEventListener("input", () => {
    yearInput.value = yearRange.value;
});

yearInput.addEventListener("input", () => {
    let value = Number(yearInput.value);
    if (!Number.isFinite(value)) return;
    value = Math.max(-250, Math.min(2026, value));
    yearRange.value = value;
});

travelButton.addEventListener("click", () => {
    travelToYear(yearInput.value);
});

randomEra.addEventListener("click", () => {
    const era = eras[Math.floor(Math.random() * eras.length)];
    yearInput.value = era.year;
    yearRange.value = era.year;
    travelToYear(era.year);
});

concept.addEventListener("change", () => {
    currentConcept = concept.value;
    coreSymbol.textContent = symbols[currentConcept];
    timelineTitle.textContent = universeNames[currentConcept];

    paradox = Math.min(96, paradox + 2);
    paradoxValue.textContent = String(paradox).padStart(2, "0") + "%";
    paradoxFill.style.width = paradox + "%";
});

/* ---------- Problem checker ---------- */

function normalize(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[−–—]/g, "-")
        .replace(/\s+/g, " ")
        .replace(/[.,!?]/g, "");
}

checkAnswer.addEventListener("click", () => {
    const answer = normalize(answerInput.value);

    if (!answer) {
        feedback.textContent = "The temporal console is waiting for an answer.";
        feedback.className = "tm-feedback bad";
        return;
    }

    if (
        currentEra.year === 2026 ||
        currentEra.answers.some(valid => normalize(valid) === answer)
    ) {
        feedback.textContent =
            "Temporal lock stable. Correct enough to continue the journey.";
        feedback.className = "tm-feedback good";

        paradox = Math.max(0, paradox - 8);
        paradoxValue.textContent =
            String(paradox).padStart(2, "0") + "%";
        paradoxFill.style.width = paradox + "%";
    } else {
        feedback.textContent =
            "The machine rejects that answer. Re-examine the tools of this era.";
        feedback.className = "tm-feedback bad";

        paradox = Math.min(100, paradox + 7);
        paradoxValue.textContent =
            String(paradox).padStart(2, "0") + "%";
        paradoxFill.style.width = paradox + "%";
    }
});

answerInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        checkAnswer.click();
    }
});

/* ---------- Keyboard navigation ---------- */

document.addEventListener("keydown", event => {
    if (event.target.matches("input, select, textarea")) return;

    if (event.key === "ArrowLeft") {
        const i = Math.max(0, eras.indexOf(currentEra) - 1);
        travelToYear(eras[i].year);
    }

    if (event.key === "ArrowRight") {
        const i = Math.min(eras.length - 1, eras.indexOf(currentEra) + 1);
        travelToYear(eras[i].year);
    }

    if (event.key.toLowerCase() === "r") {
        randomEra.click();
    }
});

buildTimeline();
buildQuickEras();
renderEra(currentEra);

}
