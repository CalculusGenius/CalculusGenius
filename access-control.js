
// =========================================
// CALCULUS — CHAT ACCESS CONTROL
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


// =========================================
// CONFIGURATION
// =========================================

const ADMIN_EMAIL =
    "calculusgenius67@gmail.com";

const SITE_URL =
    "https://calculusgenius.github.io/CalculusGenius";

const EMAILJS_PUBLIC_KEY =
    "dUKoxPJp7LWznGi8y";

const EMAILJS_SERVICE_ID =
    "service_9m0ln9d";

const EMAILJS_TEMPLATE_ID =
    "template_1g9pfcg";

// =========================================
// FIRESTORE
// =========================================

const db =
    getFirestore(app);


// =========================================
// HIDE ALL CHAT LINKS
// =========================================

function hideChatLinks() {

    document
        .querySelectorAll('a[href$="chat.html"]')
        .forEach(
            (link) => {

                link.style.display = "none";

            }
        );

}


// =========================================
// SHOW ALL CHAT LINKS
// =========================================

function showChatLinks() {

    document
        .querySelectorAll('a[href$="chat.html"]')
        .forEach(
            (link) => {

                link.style.display = "";

            }
        );

}


// =========================================
// CHECK ADMIN
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
// CHECK APPROVAL
// =========================================

async function checkApproval(user) {

    if (!user) {

        return false;

    }


    if (isAdmin(user)) {

        return true;

    }


    const accessRef =
        doc(
            db,
            "chatAccess",
            user.uid
        );


    const snapshot =
        await getDoc(
            accessRef
        );


    return (
        snapshot.exists() &&
        snapshot.data().approved === true
    );

}


// =========================================
// CREATE ACCESS REQUEST
// =========================================

async function createAccessRequest(user) {

    if (!user) {

        return;

    }


    const requestRef =
        doc(
            db,
            "accessRequests",
            user.uid
        );


    const snapshot =
        await getDoc(
            requestRef
        );


    if (snapshot.exists()) {

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
await sendAccessRequestEmail(user);

    console.log(
        "Chat access request created."
    );

}


// =========================================
// PROTECT CHAT PAGE
// =========================================

function redirectFromChatPage() {

    const path =
        window.location.pathname
            .toLowerCase();


    if (
        path.endsWith(
            "/chat.html"
        )
    ) {

        window.location.replace(
            SITE_URL +
            "/account.html?chatAccess=pending"
        );

    }

}


// =========================================
// AUTH STATE
// =========================================

watchAuthState(
    async (user) => {

        /*
           Always hide Chat first.

           This prevents a flash of the Chat
           link before the database check finishes.
        */

        hideChatLinks();


        // =====================================
        // SIGNED OUT
        // =====================================

        if (!user) {

            console.log(
                "Chat hidden: signed out."
            );

            return;

        }


        // =====================================
        // CHECK APPROVAL
        // =====================================

        try {

            const approved =
                await checkApproval(
                    user
                );


            // =================================
            // APPROVED
            // =================================

            if (approved) {

                showChatLinks();


                console.log(
                    "Chat access approved:",
                    user.email
                );


                return;

            }


            // =================================
            // NOT APPROVED
            // =================================

            console.log(
                "Chat access pending:",
                user.email
            );


            await createAccessRequest(
                user
            );


            redirectFromChatPage();

        }

        catch (error) {

            console.error(
                "Chat access check failed:",
                error
            );


            hideChatLinks();

            redirectFromChatPage();

        }

    }
);


// =========================================
// INITIAL STATE
// =========================================

hideChatLinks();


console.log(
    "CALCULUS Chat Access Control loaded."
);


async function sendAccessRequestEmail(user) {

    if (!user) {
        return;
    }

    if (!window.emailjs) {

        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";

        await new Promise((resolve, reject) => {

            script.onload = resolve;

            script.onerror = reject;

            document.head.appendChild(script);

        });

        window.emailjs.init({
            publicKey:
                EMAILJS_PUBLIC_KEY
        });

    }

    const approvalURL =
        SITE_URL +
        "/admin-access.html?uid=" +
        encodeURIComponent(user.uid);

    await window.emailjs.send(

        EMAILJS_SERVICE_ID,

        EMAILJS_TEMPLATE_ID,

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

    console.log(
        "Chat access request email sent."
    );

}
