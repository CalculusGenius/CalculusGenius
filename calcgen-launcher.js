// =========================================
// CALCULUS — CALCGEN AI GLOBAL LAUNCHER
// =========================================

(() => {
    if (document.getElementById("calcgenGlobalLauncher")) return;

    const style = document.createElement("style");

    style.textContent = `
        #calcgenGlobalLauncher {
            position: fixed;
            right: 24px;
            bottom: 24px;
            z-index: 2147483000;
            width: 62px;
            height: 62px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.24);
            background: rgba(15,15,15,0.92);
            box-shadow: 0 16px 45px rgba(0,0,0,0.45);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }

        #calcgenGlobalLauncher:hover {
            transform: translateY(-4px) scale(1.04);
            border-color: rgba(255,255,255,0.5);
            box-shadow: 0 22px 55px rgba(0,0,0,0.55);
        }

        #calcgenGlobalLauncher img {
            width: 40px;
            height: 40px;
            object-fit: contain;
            border-radius: 50%;
        }

        #calcgenGlobalLauncher span {
            position: absolute;
            right: 0;
            bottom: -19px;
            white-space: nowrap;
            color: rgba(255,255,255,0.58);
            font: 500 0.66rem/1 "Inter", sans-serif;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            pointer-events: none;
        }

        @media (max-width: 600px) {
            #calcgenGlobalLauncher {
                right: 16px;
                bottom: 16px;
                width: 56px;
                height: 56px;
            }

            #calcgenGlobalLauncher img {
                width: 36px;
                height: 36px;
            }

            #calcgenGlobalLauncher span {
                display: none;
            }
        }
    `;

    document.head.appendChild(style);

    const launcher = document.createElement("a");
    launcher.id = "calcgenGlobalLauncher";
    launcher.href = "calcgen-ai.html";
    launcher.setAttribute("aria-label", "Open CalcGen AI");
    launcher.title = "CalcGen AI";

    launcher.innerHTML = `
        <img src="cglogo.png" alt="CalcGen AI">
        <span>CalcGen AI</span>
    `;

    document.body.appendChild(launcher);
})();
