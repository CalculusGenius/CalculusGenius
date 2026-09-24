import { convertAsciiMathToLatex } from "https://esm.run/mathlive";

const help = [
  ["\frac{a}{b}", "fraction"],
  ["\sqrt{x}", "square root"],
  ["x^2", "power"],
  ["x_{1}", "subscript"],
  ["\sin(x)", "sine"],
  ["\cos(x)", "cosine"],
  ["\ln(x)", "log"],
  ["e^x", "exponential"],
  ["|x|", "absolute value"],
  ["\pi", "pi"],
  ["\infty", "infinity"],
  ["\lim_{x\to a}", "limit"]
];

function upgradeExpressionEditor(root) {
  const input = root.querySelector("#expr");
  if (!input || root.querySelector("#exprMath")) return;

  const field = document.createElement("math-field");
  field.id = "exprMath";
  field.className = "lab-mathfield";
  field.setAttribute("smart-fence", "");
  field.setAttribute("virtual-keyboard-mode", "auto");
  field.setAttribute("aria-label", "Mathematical function input");

  try { field.value = convertAsciiMathToLatex(input.value || "sin(x)"); }
  catch { field.value = input.value || "sin(x)"; }

  input.style.display = "none";
  input.setAttribute("aria-hidden", "true");
  input.parentNode.insertBefore(field, input);

  const helpBar = document.createElement("div");
  helpBar.className = "math-help";
  help.forEach(([latex, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.title = "Insert " + label;
    const formula = document.createElement("math-span");
    formula.textContent = latex;
    button.appendChild(formula);
    button.addEventListener("click", () => {
      field.insert(latex, { focus: true, selectionMode: "placeholder" });
      sync();
    });
    helpBar.appendChild(button);
  });
  field.parentNode.insertBefore(helpBar, field.nextSibling);

  function sync() {
    input.value = field.getValue("ascii-math");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  field.addEventListener("input", sync);

  root.querySelectorAll(".preset").forEach(button => {
    button.addEventListener("click", () => {
      try { field.value = convertAsciiMathToLatex(button.dataset.expr || ""); }
      catch { field.value = button.dataset.expr || ""; }
    });
  });
}

function initMathLayer() {
  const controls = document.getElementById("controls");
  if (!controls) return;
  const observer = new MutationObserver(() => {
    upgradeExpressionEditor(controls);
  });
  observer.observe(controls, { childList: true, subtree: true });
  upgradeExpressionEditor(controls);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMathLayer);
} else {
  initMathLayer();
}
