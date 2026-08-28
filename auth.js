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
// FIREBASE AUTH
// =========================================

const auth = getAuth(app);

const googleProvider =
    new GoogleAuthProvider();



// =========================================
// FIRESTORE
// =========================================

const db = getFirestore(app);



// =========================================
// CREATE / UPDATE USER PROFILE
// =========================================

async function createOrUpdateUserProfile(user) {

    /*
       Every Firebase user has a unique UID.

       We use that UID as the Firestore
       document ID.
    */

    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    const userSnapshot =
        await getDoc(userRef);



    // =====================================
    // FIRST LOGIN
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
    // RETURNING USER
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
            "CALCULUS profile updated."
        );

    }

}



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


        const user =
            result.user;


        console.log(
            "Signed in successfully:",
            user.displayName
        );


        console.log(
            "Email:",
            user.email
        );


        // =================================
        // CREATE / UPDATE PROFILE
        // =================================

        await createOrUpdateUserProfile(
            user
        );


        // =================================
        // GO TO ACCOUNT PAGE
        // =================================

        window.location.href =
            "account.html";

    }


    catch (error) {

    console.error(
        "Google sign-in error:",
        error
    );

    alert(
        "ERROR: " +
        error.code +
        "\n\n" +
        error.message
    );

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

export {
    auth
};
