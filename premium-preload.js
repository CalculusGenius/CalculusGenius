// =========================================
// CALCULUS — PREMIUM FIRST-PAINT GUARD
// Isolated from the existing Premium system.
// =========================================

const style = document.createElement("style");

style.textContent = `
html.premium-first-paint-guard,
html.premium-first-paint-guard body {
    background: #080808 !important;
}

html.premium-first-paint-guard body > * {
    visibility: hidden !important;
}

html.premium-first-paint-guard::before {
    content: "JOIN PREMIUM MEMBERSHIP NOW\\A\\AChecking Premium access...";
    white-space: pre-wrap;
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 32px;
    text-align: center;
    color: #ffffff;
    background: #080808;
    font-family: "Cormorant Garamond", serif;
    font-size: clamp(1.25rem, 4vw, 2rem);
    line-height: 1.6;
    letter-spacing: 0.02em;
}
`;

document.head.appendChild(style);
document.documentElement.classList.add("premium-first-paint-guard");

function reveal() {
    document.documentElement.classList.remove("premium-first-paint-guard");
    style.remove();
}

function revealWhenPremiumOverlayExists() {
    if (document.getElementById("premiumOverlay")) {
        reveal();
        return;
    }

    const observer = new MutationObserver(() => {
        if (document.getElementById("premiumOverlay")) {
            observer.disconnect();
            reveal();
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
}

async function checkAccess() {
    try {
        const [{ watchAuthState }, { getFirestore, doc, getDoc }] =
            await Promise.all([
                import("./auth.js"),
                import("https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js")
            ]);

        const { app } = await import("./firebase-config.js");
        const { PREMIUM_PAGES, ADMIN_EMAIL } =
            await import("./premium-config.js");

        const file =
            (window.location.pathname.split("/").pop() || "index.html")
                .toLowerCase();

        if (!PREMIUM_PAGES.map(page => page.toLowerCase()).includes(file)) {
            reveal();
            return;
        }

        watchAuthState(async (user) => {
            try {
                if (
                    user &&
                    user.email &&
                    user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
                ) {
                    reveal();
                    return;
                }

                if (!user) {
                    revealWhenPremiumOverlayExists();
                    return;
                }

                const db = getFirestore(app);
                const snapshot =
                    await getDoc(doc(db, "premiumAccess", user.uid));

                if (snapshot.exists() && snapshot.data().approved === true) {
                    reveal();
                } else {
                    revealWhenPremiumOverlayExists();
                }
            } catch (error) {
                console.error("Premium first-paint check failed:", error);
                revealWhenPremiumOverlayExists();
            }
        });
    } catch (error) {
        console.error("Premium first-paint guard failed:", error);
        revealWhenPremiumOverlayExists();
    }
}

checkAccess();
