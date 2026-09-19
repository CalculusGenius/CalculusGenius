// =========================================
// CALCULUS — CALCGEN AI
// Isolated AI page + Premium gate.
// =========================================

import {
    watchAuthState
} from "./auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { app } from "./firebase-config.js";

import {
    ADMIN_EMAIL,
    SITE_URL,
    UPI_ID,
    UPI_NAME,
    PREMIUM_AMOUNT,
    EMAILJS_PUBLIC_KEY,
    EMAILJS_SERVICE_ID,
    EMAILJS_PREMIUM_TEMPLATE_ID
} from "./premium-config.js";

const db = getFirestore(app);

function removePreload() {
    document.documentElement.classList.remove("calcgen-preload");
}

function escapeHTML(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderMath(element) {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([element]).catch(console.error);
    }
}

function addMessage(text, role) {
    const wrapper = document.createElement("div");
    wrapper.className = "calcgen-message " + role;
    wrapper.innerHTML = escapeHTML(text).replace(/\n/g, "<br>");
    document.querySelector("#calcgenMessages").appendChild(wrapper);
    wrapper.scrollIntoView({ behavior: "smooth", block: "end" });
    renderMath(wrapper);
    return wrapper;
}

function isAdmin(user) {
    return Boolean(
        user &&
        user.email &&
        user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    );
}

async function isPremium(user) {
    if (!user) return false;
    if (isAdmin(user)) return true;

    const snapshot = await getDoc(
        doc(db, "premiumAccess", user.uid)
    );

    return snapshot.exists() &&
        snapshot.data().approved === true;
}

async function loadEmailJS() {
    if (window.emailjs) return;

    const script = document.createElement("script");
    script.src =
        "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";

    await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });

    window.emailjs.init({
        publicKey: EMAILJS_PUBLIC_KEY
    });
}

async function createPremiumRequest(user) {
    await setDoc(
        doc(db, "premiumRequests", user.uid),
        {
            uid: user.uid,
            name: user.displayName || "Google User",
            email: user.email || "",
            photoURL: user.photoURL || "",
            status: "pending",
            createdAt: serverTimestamp()
        }
    );
}

async function sendPremiumEmail(user) {
    await loadEmailJS();

    const approvalURL =
        SITE_URL +
        "/admin-premium.html?uid=" +
        encodeURIComponent(user.uid);

    await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_PREMIUM_TEMPLATE_ID,
        {
            user_name: user.displayName || "Google User",
            user_email: user.email || "",
            approval_url: approvalURL
        }
    );
}

function startUPIPayment() {
    if (!UPI_ID || UPI_ID === "YOUR_UPI_ID_HERE") {
        alert("UPI payment is not configured yet.");
        return;
    }

    const params = new URLSearchParams({
        pa: UPI_ID,
        pn: UPI_NAME,
        am: PREMIUM_AMOUNT,
        cu: "INR",
        tn: "CALCULUS Premium Membership"
    });

    window.location.href = "upi://pay?" + params.toString();
}

async function joinPremium(user, button) {
    button.disabled = true;
    button.textContent = "PROCESSING...";

    try {
        await createPremiumRequest(user);
        await sendPremiumEmail(user);
        startUPIPayment();
    } catch (error) {
        console.error("Premium request error:", error);
        alert(
            "Premium error: " +
            (error.code || error.message || "Unknown error")
        );
    } finally {
        button.disabled = false;
        button.textContent = "JOIN NOW";
    }
}

function showPremiumBox(user) {
    const overlay = document.createElement("div");
    overlay.className = "calcgen-premium-overlay";

    overlay.innerHTML = `
        <div class="calcgen-premium-box">
            <h1>JOIN PREMIUM MEMBERSHIP NOW</h1>

            <div class="calcgen-premium-list">
                <div>✅ Full Access to Ebooks</div>
                <div>✅ Full Access to all study material</div>
                <div>✅ More topics from University Calculus</div>
                <div>✅ Access to the Mathematical Forum</div>
                <div>✅ Access to the CalcGen AI</div>
            </div>

            ${
                user
                ? `
                    <button class="calcgen-join-button" id="calcgenJoinButton">
                        JOIN NOW
                    </button>
                `
                : `
                    <div class="calcgen-login-message">
                        Please sign in with Google to join Premium Membership.
                    </div>
                `
            }
        </div>
    `;

    document.body.appendChild(overlay);
    removePreload();

    const button = overlay.querySelector("#calcgenJoinButton");

    if (button) {
        button.addEventListener(
            "click",
            () => joinPremium(user, button)
        );
    }
}

async function initPremiumGate() {
    watchAuthState(async (user) => {
        try {
            const approved = await isPremium(user);

            if (!approved) {
                showPremiumBox(user);
            } else {
                removePreload();
                initAI();
            }
        } catch (error) {
            console.error("CalcGen Premium check failed:", error);
            showPremiumBox(user);
        }
    });
}

function initAI() {
    removePreload();

    const input = document.querySelector("#calcgenInput");
    const send = document.querySelector("#calcgenSend");
    const status = document.querySelector("#calcgenStatus");

    let history = [
        {
            role: "system",
            content:
                "You are CalcGen AI, a rigorous mathematical tutor. " +
                "Give accurate step-by-step mathematical explanations. " +
                "Use LaTeX for mathematics: inline expressions with \\( ... \\) " +
                "and displayed equations with \\[ ... \\]. " +
                "Do not use HTML for mathematics. " +
                "When proving something, clearly state assumptions and justify each step. " +
                "Prefer mathematical precision over vague intuition."
        }
    ];

    /*
     * Puter authentication is deliberately kept completely separate from
     * Firebase/Google authentication.
     *
     * IMPORTANT:
     * - We do not send the Firebase credential to Puter.
     * - We do not require a permanent Puter account.
     * - When there is no Puter session, we explicitly request Puter's
     *   temporary-user flow.
     * - signIn() is called directly from the Send click path because Puter
     *   requires signIn() to originate from a user action.
     *
     * The previous implementation only checked isSignedIn() and then
     * immediately called signIn(). That can leave an expired/stale Puter
     * session looking usable until puter.ai.chat() itself triggers Puter's
     * normal login flow. We now validate the session first and only call
     * the AI after a confirmed Puter identity exists.
     */
    async function ensurePuterTemporaryUser() {
        try {
            if (puter.auth.isSignedIn()) {
                try {
                    const currentUser = await puter.auth.getUser();

                    if (currentUser) {
                        return currentUser;
                    }
                } catch (sessionError) {
                    console.warn(
                        "Existing Puter session could not be validated. " +
                        "Starting the temporary-user flow instead.",
                        sessionError
                    );
                }
            }

            /*
             * This call MUST remain directly in the user-triggered Send
             * event path. Do not move it to page-load initialization:
             * browsers can block the authentication popup otherwise.
             *
             * attempt_temp_user_creation tells Puter that this site wants
             * an automatically-created temporary account rather than asking
             * the visitor to register a permanent Puter account.
             *
             * request_auth is intentionally false so an existing Puter
             * session is not forced through an account-selection screen.
             */
            const signInResult = await puter.auth.signIn({
                attempt_temp_user_creation: true,
                request_auth: false
            });

            if (!signInResult || signInResult.success === false) {
                throw new Error(
                    signInResult?.msg ||
                    signInResult?.error ||
                    "Puter temporary authentication was not completed."
                );
            }

            if (!puter.auth.isSignedIn()) {
                throw new Error(
                    "Puter authentication completed without an active session."
                );
            }

            const authenticatedUser = await puter.auth.getUser();

            if (!authenticatedUser) {
                throw new Error(
                    "Puter authentication completed without a user identity."
                );
            }

            return authenticatedUser;
        } catch (error) {
            console.error("Puter temporary authentication failed:", error);
            throw error;
        }
    }

    async function ask() {
        const prompt = input.value.trim();

        if (!prompt || send.disabled) return;

        addMessage(prompt, "user");
        input.value = "";
        send.disabled = true;
        status.textContent = "CalcGen AI is thinking...";

        try {
            status.textContent = "Preparing CalcGen AI...";

            await ensurePuterTemporaryUser();

            history.push({
                role: "user",
                content: prompt
            });

            const response = await puter.ai.chat(
                history,
                {
                    model: "gpt-5.6-luna"
                }
            );

            const answer =
                response?.message?.content ||
                response?.content ||
                String(response);

            history.push({
                role: "assistant",
                content: answer
            });

            addMessage(answer, "ai");
            status.textContent = "CalcGen AI is ready.";
        } catch (error) {
            console.error("CalcGen AI error:", error);
            status.textContent = "AI request failed.";
            addMessage(
                "I could not generate a response right now. Please try again.",
                "ai"
            );
        } finally {
            send.disabled = false;
            input.focus();
        }
    }

    send.addEventListener("click", ask);

    input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            ask();
        }
    });
}

initPremiumGate();
