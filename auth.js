// =========================================
// CALCULUS — GOOGLE AUTHENTICATION
// + FIRESTORE USER PROFILES
// =========================================


import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


import { app } from "./firebase-config.js";



// =========================================
// FIREBASE AUTHENTICATION
// =========================================

const auth = getAuth(app);

const googleProvider =
    new GoogleAuthProvider();



// =========================================
// FIRESTORE DATABASE
// =========================================

const db = getFirestore(app);



// =========================================
// CREATE / UPDATE USER PROFILE
// =========================================

async function createOrUpdateUserProfile(user) {

    /*
       The Firebase UID uniquely identifies
       this particular Google account.

       Therefore each user gets their own
       document inside:

       users/{UID}
    */

    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    // Check whether this user already
    // has a CALCULUS profile.

    const userSnapshot =
        await getDoc(userRef);



    // =====================================
    // NEW USER
    // =====================================

    if (!userSnapshot.exists()) {

        await setDoc(
            userRef,
            {

                uid:
                    user.uid,

                displayName:
                    user.displayName || "",

                email:
                    user.email || "",

                photoURL:
                    user.photoURL || "",

                createdAt:
                    serverTimestamp(),

                lastLogin:
                    serverTimestamp(),

                bio:
                    ""

            }
        );


        console.log(
            "New CALCULUS profile created."
        );

    }


    // =====================================
    // EXISTING USER
    // =====================================

    else {

        await setDoc(
            userRef,
            {

                displayName:
                    user.displayName || "",

                email:
                    user.email || "",

                photoURL:
                    user.photoURL || "",

                lastLogin:
                    serverTimestamp()

            },

            {
                merge: true
            }
        );


        console.log(
            "Existing CALCULUS profile updated."
        );

    }

}



// =========================================
// GOOGLE SIGN-IN
// =========================================

export async function signInWithGoogle() {

    try {

        /*
           Open Google's sign-in window.
        */

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );


        /*
           Firebase has successfully
           authenticated the user.
        */

        const user =
            result.user;


        console.log(
            "Google authentication successful."
        );


        console.log(
            "Name:",
            user.displayName
        );


        console.log(
            "Email:",
            user.email
        );


        console.log(
            "UID:",
            user.uid
        );


        // =================================
        // CREATE / UPDATE FIRESTORE PROFILE
        // =================================

        await createOrUpdateUserProfile(
            user
        );


        console.log(
            "Firestore profile operation successful."
        );


        // =================================
        // REDIRECT
        // =================================

        window.location.href =
            "account.html";

    }


    catch (error) {

        /*
           IMPORTANT:

           We are temporarily showing the
           Firebase error so we can identify
           exactly what is wrong.
        */

        console.error(
            "Google sign-in error:",
            error
        );


        alert(
            "ERROR:\n\n" +
            error.code +
            "\n\n" +
            error.message
        );

    }

}



// =========================================
// LOG OUT
// =========================================

export async function logOut() {

    try {

        await signOut(auth);


        console.log(
            "User signed out."
        );


        window.location.href =
            "index.html";

    }


    catch (error) {

        console.error(
            "Sign-out error:",
            error
        );


        alert(
            "Sign-out could not be completed. Please try again."
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
// EXPORT AUTH OBJECT
// =========================================

export {
    auth
};
