// =========================================
// CALCULUS — AUTHENTICATION
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
// FIRESTORE
// =========================================

const db =
    getFirestore(app);



// =========================================
// CREATE / UPDATE PRIVATE PROFILE
// =========================================

async function createOrUpdateUserProfile(user) {

    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    const snapshot =
        await getDoc(userRef);


    // =====================================
    // NEW USER
    // =====================================

    if (!snapshot.exists()) {

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

    }


    // =====================================
    // EXISTING USER
    // =====================================

    else {

        await setDoc(
            userRef,
            {

                lastLogin:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );

    }

}



// =========================================
// CREATE / UPDATE PUBLIC PROFILE
// =========================================

async function createOrUpdatePublicProfile(user) {

    const publicUserRef =
        doc(
            db,
            "publicUsers",
            user.uid
        );


    const snapshot =
        await getDoc(publicUserRef);


    // =====================================
    // NEW PUBLIC PROFILE
    // =====================================

    if (!snapshot.exists()) {

        await setDoc(
            publicUserRef,
            {

                uid:
                    user.uid,

                displayName:
                    user.displayName ||
                    "CALCULUS User",

                photoURL:
                    user.photoURL || "",

                chatName:
                    ""

            }
        );

    }


    // =====================================
    // EXISTING PUBLIC PROFILE
    // =====================================

    else {

        /*
           IMPORTANT:

           Do NOT overwrite chatName.

           The user may have chosen something
           completely different from their
           Google account name.
        */

        await setDoc(
            publicUserRef,
            {

                photoURL:
                    user.photoURL || ""

            },
            {
                merge: true
            }
        );

    }

}



// =========================================
// CREATE / UPDATE USER DATA
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
            "UID:",
            user.uid
        );


        await createOrUpdateAllUserData(
            user
        );


        window.location.href =
            "account.html";

    }


    catch (error) {

        console.error(
            "Google sign-in error:",
            error
        );


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
// EXPORT AUTH
// =========================================

export {
    auth
};
