// =========================================
// CALCULUS — PREMIUM ACCESS SYSTEM
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

import {
    app
} from "./firebase-config.js";

import {
    PREMIUM_PAGES,
    ADMIN_EMAIL,
    SITE_URL,
    UPI_ID,
    UPI_NAME,
    EMAILJS_PUBLIC_KEY,
    EMAILJS_SERVICE_ID,
    EMAILJS_PREMIUM_TEMPLATE_ID
} from "./premium-config.js";


const db =
    getFirestore(app);


// =========================================
// CURRENT PAGE
// =========================================

function getCurrentFileName() {

    let file =
        window.location.pathname
            .split("/")
            .pop();

    if (!file) {
        file = "index.html";
    }

    return file.toLowerCase();

}


function isPremiumPage() {

    const current =
        getCurrentFileName();

    return PREMIUM_PAGES
        .map(page => page.toLowerCase())
        .includes(current);

}


// =========================================
// ADMIN CHECK
// =========================================

function isAdmin(user) {

    return Boolean(
        user &&
        user.email &&
        user.email.toLowerCase() ===
            ADMIN_EMAIL.toLowerCase()
    );

}


// =========================================
// CHECK PREMIUM APPROVAL
// =========================================

async function checkPremiumAccess(user) {

    if (!user) {
        return false;
    }

    if (isAdmin(user)) {
        return true;
    }

    const accessRef =
        doc(
            db,
            "premiumAccess",
            user.uid
        );

    const snapshot =
        await getDoc(accessRef);

    return (
        snapshot.exists() &&
        snapshot.data().approved === true
    );

}


// =========================================
// LOAD EMAILJS
// =========================================

async function loadEmailJS() {

    if (window.emailjs) {
        return;
    }

    const script =
        document.createElement("script");

    script.src =
        "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";

    await new Promise(
        (resolve, reject) => {

            script.onload = resolve;
            script.onerror = reject;

            document.head.appendChild(
                script
            );

        }
    );

    window.emailjs.init({
        publicKey:
            EMAILJS_PUBLIC_KEY
    });

}


// =========================================
// CREATE PREMIUM REQUEST
// =========================================

async function createPremiumRequest(user) {

    const requestRef =
        doc(
            db,
            "premiumRequests",
            user.uid
        );

    const existing =
        await getDoc(requestRef);

    if (existing.exists()) {

        return;

    }

    await setDoc(
        requestRef,
        {

            uid:
                user.uid,

            name:
                user.displayName ||
                "Google User",

            email:
                user.email ||
                "",

            photoURL:
                user.photoURL ||
                "",

            status:
                "pending",

            createdAt:
                serverTimestamp()

        }
    );

}


// =========================================
// SEND ADMIN EMAIL
// =========================================

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

            user_name:
                user.displayName ||
                "Google User",

            user_email:
                user.email ||
                "",

            approval_url:
                approvalURL

        }

    );

}


// =========================================
// PAYMENT
// =========================================

async function startUPIPayment() {

    if (
        !UPI_ID ||
        UPI_ID === "YOUR_UPI_ID_HERE"
    ) {

        alert(
            "UPI payment is not configured yet."
        );

        return;

    }

    const params =
        new URLSearchParams({

            pa:
                UPI_ID,

            pn:
                UPI_NAME,

            cu:
                "INR",

            tn:
                "CALCULUS Premium Membership"

        });

    const upiURL =
        "upi://pay?" +
        params.toString();


    // Try to launch the UPI application
    window.location.href =
        upiURL;


    // Fallback message if the browser
    // does not hand the link to a UPI app.
    setTimeout(() => {

        alert(
            "No UPI App found"
        );

    }, 1800);

}


// =========================================
// PREMIUM BUTTON
// =========================================

async function handleJoinNow(user) {

    if (!user) {
        return;
    }


    const button =
        document.querySelector(
            "#premiumJoinButton"
        );

    if (button) {

        button.disabled = true;

        button.textContent =
            "PROCESSING...";

    }


    try {

        await createPremiumRequest(
            user
        );


        await sendPremiumEmail(
            user
        );


        await startUPIPayment();


    } catch (error) {

    console.error(
        "Premium request error:",
        error
    );

    alert(
        "Premium error: " +
        (error.code || error.message || "Unknown error")
    );
    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "JOIN NOW";

        }

    }

}


// =========================================
// CREATE PREMIUM SCREEN
// =========================================

function createPremiumScreen(user) {

    const overlay =
        document.createElement("div");

    overlay.id =
        "premiumOverlay";


    overlay.innerHTML = `

        <div class="premium-box">

            <h1>
                JOIN PREMIUM MEMBERSHIP NOW
            </h1>

            <div class="premium-list">

                <div>✅ Full Access to Ebooks</div>

                <div>✅ Full Access to all study material</div>

                <div>✅ More topics from University Calculus</div>

                <div>✅ Access to the Mathematical Forum</div>

                <div>✅ Access to the CalcGen AI</div>

            </div>

            ${
                user
                ?
                `
                <button
                    id="premiumJoinButton"
                    class="premium-join-button"
                >
                    JOIN NOW
                </button>
                `
                :
                `
                <div class="premium-login-message">
                    Please sign in with Google to join Premium Membership.
                </div>
                `
            }

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    if (user) {

        const button =
            document.querySelector(
                "#premiumJoinButton"
            );

        if (button) {

            button.addEventListener(
                "click",
                () => {

                    handleJoinNow(
                        user
                    );

                }
            );

        }

    }

}


// =========================================
// LOCK PAGE
// =========================================

function lockPage(user) {

    document.documentElement
        .classList.add(
            "premium-page-locked"
        );


    const content =
        document.body.children;


    Array.from(content).forEach(
        element => {

            if (
                element.id !==
                "premiumOverlay"
            ) {

                element.classList.add(
                    "premium-blurred"
                );

            }

        }
    );


    createPremiumScreen(
        user
    );

}


// =========================================
// START
// =========================================

if (isPremiumPage()) {

    watchAuthState(
        async (user) => {

            try {

                const approved =
                    await checkPremiumAccess(
                        user
                    );


                if (!approved) {

                    lockPage(
                        user
                    );

                }

            } catch (error) {

                console.error(
                    "Premium access check failed:",
                    error
                );

                lockPage(
                    user
                );

            }

        }
    );

          }
