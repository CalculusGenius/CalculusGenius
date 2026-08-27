// =========================================
// CALCULUS — GOOGLE AUTHENTICATION
// =========================================

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { app }
    from "./firebase-config.js";


// =========================================
// FIREBASE AUTHENTICATION
// =========================================

const auth = getAuth(app);

const googleProvider =
    new GoogleAuthProvider();


// =========================================
// GOOGLE SIGN-IN
// =========================================

async function signInWithGoogle() {

    try {

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );

        const user = result.user;

        console.log(
            "Signed in:",
            user.displayName
        );

        // Go to account page
        window.location.href =
            "account.html";

    }

    catch (error) {

        console.error(
            "Google sign-in error:",
            error
        );

        alert(
            "Google sign-in could not be completed. Please try again."
        );

    }

}


// =========================================
// LOG OUT
// =========================================

async function logOut() {

    try {

        await signOut(auth);

        window.location.href =
            "index.html";

    }

    catch (error) {

        console.error(
            "Sign-out error:",
            error
        );

    }

}


// =========================================
// AUTHENTICATION STATE
// =========================================

onAuthStateChanged(
    auth,
    (user) => {

        if (user) {

            console.log(
                "Current user:",
                user.displayName
            );

            console.log(
                "Email:",
                user.email
            );

        }
        else {

            console.log(
                "No user is currently signed in."
            );

        }

    }
);


// =========================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =========================================

window.signInWithGoogle =
    signInWithGoogle;

window.logOut =
    logOut;
