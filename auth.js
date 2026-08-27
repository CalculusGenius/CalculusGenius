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

import { app } from "./firebase-config.js";


// =========================================
// FIREBASE AUTH
// =========================================

const auth = getAuth(app);

const googleProvider =
    new GoogleAuthProvider();


// =========================================
// GOOGLE SIGN-IN
// =========================================

export async function signInWithGoogle() {

    try {

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );

        const user = result.user;

        console.log(
            "Signed in successfully:",
            user.displayName
        );

        console.log(
            "Email:",
            user.email
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


        /*
           Don't show Firebase's technical
           error message directly to users.
        */

        alert(
            "Google sign-in could not be completed. Please try again."
        );

    }

}


// =========================================
// LOG OUT
// =========================================

export async function logOut() {

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

export function watchAuthState(callback) {

    return onAuthStateChanged(
        auth,
        callback
    );

}


// =========================================
// GET CURRENT AUTH OBJECT
// =========================================

export { auth };
