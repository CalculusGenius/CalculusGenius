```javascript
// =========================================
// CALCULUS — CHAT ACCESS CONTROL
// =========================================
// Rules:
// • Logged out      → Chat hidden
// • Logged in       → Chat hidden by default
// • Approved user   → Chat visible
// • Admin           → Chat visible
// • Unapproved user → cannot use chat.html
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
// CONFIG
// =========================================

const ADMIN_EMAIL =
    "YOUR_ADMIN_EMAIL_HERE";

const SITE_URL =
    "https://calculusgenius.github.io/CalculusGenius";


// =========================================
// FIRESTORE
// =========================================

const db =
    getFirestore(app);


// =========================================
// HIDE CHAT EVERYWHERE
// =========================================

function hideChatLinks() {

    document
        .querySelectorAll(
            'a[href$="chat.html"]'
        )
        .forEach(
            (link) => {

                link.style.display =
                    "none";

            }
        );

}


// =========================================
// SHOW CHAT EVERYWHERE
// =========================================

function showChatLinks() {

    document
        .querySelectorAll(
            'a[href$="chat.html"]'
        )
        .forEach(
            (link) => {

                link.style.display =
                    "";

            }
        );

}


// =========================================
// CHECK APPROVAL
// =========================================

async function isApproved(
    user
) {

    if (!user) {

        return false;

    }


    // Administrator always has access.

    if (
        user.email &&
        user.email.toLowerCase() ===
        ADMIN_EMAIL.toLowerCase()
    ) {

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

async function createAccessRequest(
    user
) {

    if (!user) {

        return;

    }


    const requestRef =
        doc(
            db,
            "accessRequests",
            user.uid
        );


    const existing =
        await getDoc(
            requestRef
        );


    if (
        existing.exists()
    ) {

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


    console.log(
        "Chat access request created."
    );

}


// =========================================
// CHECK CURRENT PAGE
// =========================================

function isChatPage() {

    return window.location.pathname
        .toLowerCase()
        .endsWith(
            "/chat.html"
        );

}


// =========================================
// AUTH STATE
// =========================================

watchAuthState(
    async (user) => {

        // ALWAYS HIDE FIRST.
        //
        // This prevents Chat from briefly
        // appearing before the access check.

        hideChatLinks();


        // =====================================
        // LOGGED OUT
        // =====================================

        if (!user) {

            console.log(
                "Chat hidden: user is signed out."
            );

            return;

        }


        // =====================================
        // CHECK APPROVAL
        // =====================================

        try {

            const approved =
                await isApproved(
                    user
                );


            // =================================
            // APPROVED
            // =================================

            if (approved) {

                console.log(
                    "Chat access approved for:",
                    user.email
                );


                showChatLinks();

                return;

            }


            // =================================
            // NOT APPROVED
            // =================================

            console.log(
                "Chat hidden: user is not approved."
            );


            await createAccessRequest(
                user
            );


            // If they manually open chat.html,
            // send them away.

            if (
                isChatPage()
            ) {

                window.location.replace(
                    `${SITE_URL}/account.html?chatAccess=pending`
                );

            }

        }

        catch (error) {

            console.error(
                "Chat access check failed:",
                error
            );


            hideChatLinks();


            if (
                isChatPage()
            ) {

                window.location.replace(
                    `${SITE_URL}/account.html?chatAccess=error`
                );

            }

        }

    }
);


// =========================================
// INITIAL DEFAULT STATE
// =========================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        hideChatLinks
    );

}

else {

    hideChatLinks();

}


console.log(
    "CALCULUS Chat Access Control loaded."
);
```
