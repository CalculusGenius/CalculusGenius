// =========================================
// CALCULUS — GOOGLE AUTHENTICATION
// + FIRESTORE USER PROFILES
// + PUBLIC CHAT DIRECTORY
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
// CREATE / UPDATE PRIVATE USER PROFILE
// =========================================

async function createOrUpdateUserProfile(user) {

    /*
       Firebase UID uniquely identifies
       the user's account.

       Private profile:

       users/{UID}
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
// CREATE / UPDATE PUBLIC CHAT PROFILE
// =========================================

async function createOrUpdatePublicProfile(user) {

    /*
       This document is deliberately separate
       from the private users/{UID} document.

       Public profile:

       publicUsers/{UID}

       Only information needed by the Chat
       user directory is stored here.
    */

    const publicUserRef =
        doc(
            db,
            "publicUsers",
            user.uid
        );


    await setDoc(
        publicUserRef,
        {

            displayName:
                user.displayName || "CALCULUS User",

            photoURL:
                user.photoURL || ""

        },

        {
            merge: true
        }
    );


    console.log(
        "Public Chat profile created/updated."
    );

}



// =========================================
// CREATE / UPDATE ALL USER DATA
// =========================================

async function createOrUpdateAllUserData(user) {

    /*
       First maintain the existing private
       CALCULUS profile.
    */

    await createOrUpdateUserProfile(
        user
    );


    /*
       Then maintain the public profile
       used by Chat.
    */

    await createOrUpdatePublicProfile(
        user
    );

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
        // CREATE / UPDATE FIRESTORE DATA
        // =================================

        await createOrUpdateAllUserData(
            user
        );


        console.log(
            "Firestore profile operations successful."
        );


        // =================================
        // REDIRECT
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
