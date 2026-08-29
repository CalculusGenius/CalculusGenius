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

const auth =
    getAuth(app);


const googleProvider =
    new GoogleAuthProvider();


// =========================================
// FIRESTORE DATABASE
// =========================================

const db =
    getFirestore(app);


// =========================================
// CREATE / UPDATE PRIVATE USER PROFILE
// =========================================

async function createOrUpdateUserProfile(user) {

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
            "Private user profile created."
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
            "Private user profile updated."
        );

    }

}


// =========================================
// CREATE / UPDATE PUBLIC CHAT PROFILE
// =========================================

async function createOrUpdatePublicProfile(user) {

    const publicUserRef =
        doc(
            db,
            "publicUsers",
            user.uid
        );


    await setDoc(
        publicUserRef,
        {

            uid:
                user.uid,

            displayName:
                user.displayName ||
                "CALCULUS User",

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

    await createOrUpdateUserProfile(
        user
    );


    await createOrUpdatePublicProfile(
        user
    );

}


// =========================================
// GOOGLE SIGN-IN
// =========================================

export async function signInWithGoogle() {

    try {

        console.log(
            "Starting Google sign-in..."
        );


        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );


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


        await createOrUpdateAllUserData(
            user
        );


        console.log(
            "All Firestore operations successful."
        );


        window.location.href =
            "account.html";

    }

    catch (error) {

        console.error(
            "Google sign-in error:",
            error
        );


        /*
           IMPORTANT:
           Pass the error back to login.html.
        */

        throw error;

    }

}


// =========================================
// LOG OUT
// =========================================

export async function logOut() {

    try {

        await signOut(
            auth
        );


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


        throw error;

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
