```javascript
// =========================================
// CALCULUS — CHAT ACCESS CONTROL
// =========================================
// • Hides Chat until administrator approves
// • Creates an access request
// • Sends administrator an email
// • Protects chat.html by redirecting unapproved users
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

// Put YOUR administrator email here.

const ADMIN_EMAIL =
    "YOUR_ADMIN_EMAIL_HERE";


// Your website

const SITE_URL =
    "https://calculusgenius.github.io/CalculusGenius";


// EmailJS values
// Replace these three placeholders after
// creating your EmailJS service/template.

const EMAILJS_PUBLIC_KEY =
    "YOUR_EMAILJS_PUBLIC_KEY";

const EMAILJS_SERVICE_ID =
    "YOUR_EMAILJS_SERVICE_ID";

const EMAILJS_TEMPLATE_ID =
    "YOUR_EMAILJS_TEMPLATE_ID";


// =========================================
// FIRESTORE
// =========================================

const db =
    getFirestore(app);


// =========================================
// STATE
// =========================================

let currentUser =
    null;


// =========================================
// LOAD EMAILJS
// =========================================

function loadEmailJS() {

    return new Promise(
        (resolve, reject) => {

            if (
                window.emailjs
            ) {

                resolve(
                    window.emailjs
                );

                return;

            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";


            script.onload =
                () => {

                    if (
                        !window.emailjs
                    ) {

                        reject(
                            new Error(
                                "EmailJS failed to load."
                            )
                        );

                        return;

                    }


                    window.emailjs.init({

                        publicKey:
                            EMAILJS_PUBLIC_KEY

                    });


                    resolve(
                        window.emailjs
                    );

                };


            script.onerror =
                () => {

                    reject(
                        new Error(
                            "Could not load EmailJS."
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


// =========================================
// IS ADMIN?
// =========================================

function isAdmin(
    user
) {

    if (!user) {

        return false;

    }


    return (
        user.email &&
        user.email.toLowerCase() ===
        ADMIN_EMAIL.toLowerCase()
    );

}


// =========================================
// INSERT CHAT LINK
// =========================================

function ensureChatLinks() {

    const desktopNav =
        document.querySelector(
            ".desktop-nav"
        );


    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );


    // =====================================
    // DESKTOP
    // =====================================

    if (
        desktopNav &&
        !desktopNav.querySelector(
            'a[href="chat.html"]'
        )
    ) {

        const link =
            document.createElement(
                "a"
            );


        link.href =
            "chat.html";


        link.className =
            "nav-link";


        link.dataset.chatLink =
            "true";


        link.textContent =
            "Chat";


        const loginLink =
            document.getElementById(
                "accountNav"
            );


        if (loginLink) {

            desktopNav.insertBefore(
                link,
                loginLink
            );

        }

        else {

            desktopNav.appendChild(
                link
            );

        }

    }


    // =====================================
    // MOBILE
    // =====================================

    if (
        mobileMenu &&
        !mobileMenu.querySelector(
            'a[href="chat.html"]'
        )
    ) {

        const link =
            document.createElement(
                "a"
            );


        link.href =
            "chat.html";


        link.dataset.chatLink =
            "true";


        link.textContent =
            "Chat";


        const loginLink =
            document.getElementById(
                "accountMobileNav"
            );


        if (loginLink) {

            mobileMenu.insertBefore(
                link,
                loginLink
            );

        }

        else {

            mobileMenu.appendChild(
                link
            );

        }

    }

}


// =========================================
// SHOW / HIDE CHAT LINK
// =========================================

function setChatNavigationVisible(
    visible
) {

    document
        .querySelectorAll(
            '[data-chat-link]'
        )
        .forEach(
            (link) => {

                link.style.display =
                    visible
                        ? ""
                        : "none";

            }
        );

}


// =========================================
// GET ACCESS DOCUMENT
// =========================================

async function getAccessStatus(
    user
) {

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


    if (
        !snapshot.exists()
    ) {

        return null;

    }


    return snapshot.data();

}


// =========================================
// CREATE ACCESS REQUEST
// =========================================

async function createAccessRequest(
    user
) {

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


    // Request already exists.

    if (
        snapshot.exists()
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

            createdAt:
                serverTimestamp(),

            status:
                "pending"

        }
    );


    console.log(
        "Chat access request created."
    );

}


// =========================================
// SEND EMAIL
// =========================================

async function sendAccessEmail(
    user
) {

    if (
        !user ||
        isAdmin(user)
    ) {

        return;

    }


    const sessionKey =
        `calculus-chat-request-${user.uid}`;


    /*
       Prevent repeated emails during the
       same browser session.
    */

    if (
        sessionStorage.getItem(
            sessionKey
        ) === "sent"
    ) {

        return;

    }


    if (
        EMAILJS_PUBLIC_KEY.startsWith(
            "YOUR_"
        ) ||
        EMAILJS_SERVICE_ID.startsWith(
            "YOUR_"
        ) ||
        EMAILJS_TEMPLATE_ID.startsWith(
            "YOUR_"
        )
    ) {

        console.warn(
            "EmailJS is not configured yet."
        );

        return;

    }


    try {

        const emailjs =
            await loadEmailJS();


        const approvalURL =
            `${SITE_URL}/admin-access.html?uid=${encodeURIComponent(user.uid)}`;


        await emailjs.send(

            EMAILJS_SERVICE_ID,

            EMAILJS_TEMPLATE_ID,

            {

                user_name:
                    user.displayName ||
                    "Google User",

                user_email:
                    user.email ||
                    "",

                user_uid:
                    user.uid,

                approval_url:
                    approvalURL

            }

        );


        sessionStorage.setItem(
            sessionKey,
            "sent"
        );


        console.log(
            "Chat access notification sent."
        );

    }

    catch (error) {

        console.error(
            "Access notification failed:",
            error
        );

    }

}


// =========================================
// APPLY ACCESS
// =========================================

async function applyAccess(
    user
) {

    ensureChatLinks();


    // Not signed in

    if (!user) {

        setChatNavigationVisible(
            false
        );

        return;

    }


    // Administrator

    if (
        isAdmin(user)
    ) {

        setChatNavigationVisible(
            true
        );


        /*
           Give administrator Chat access.

           Firestore Rules will also recognize
           the administrator.
        */

        const accessRef =
            doc(
                db,
                "chatAccess",
                user.uid
            );


        await setDoc(
            accessRef,
            {

                uid:
                    user.uid,

                approved:
                    true,

                approvedAt:
                    serverTimestamp(),

                approvedBy:
                    ADMIN_EMAIL

            },

            {
                merge:
                    true
            }
        );


        return;

    }


    // =====================================
    // NORMAL USER
    // =====================================

    try {

        const access =
            await getAccessStatus(
                user
            );


        if (
            access &&
            access.approved ===
            true
        ) {

            setChatNavigationVisible(
                true
            );

            return;

        }


        // Not approved

        setChatNavigationVisible(
            false
        );


        await createAccessRequest(
            user
        );


        await sendAccessEmail(
            user
        );


        /*
           If this script is running on chat.html,
           don't allow an unapproved user to use it.
        */

        const page =
            window.location.pathname;


        if (
            page.endsWith(
                "/chat.html"
            )
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


        setChatNavigationVisible(
            false
        );

    }

}


// =========================================
// AUTH STATE
// =========================================

watchAuthState(
    async (user) => {

        currentUser =
            user;


        await applyAccess(
            user
        );

    }
);


// =========================================
// INITIAL NAVIGATION
// =========================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            ensureChatLinks();

            setChatNavigationVisible(
                false
            );

        }
    );

}

else {

    ensureChatLinks();

    setChatNavigationVisible(
        false
    );

}


console.log(
    "CALCULUS Chat access control loaded."
);
```
