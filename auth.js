// =========================================
// CALCULUS — GOOGLE AUTHENTICATION
// + FIRESTORE USER PROFILES
// + PUBLIC CHAT DIRECTORY
// + CALCULUS CHAT NAME
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
        await getDoc(
            userRef
        );


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


    // =====================================
    // CHECK EXISTING PUBLIC PROFILE
    // =====================================

    const publicUserSnapshot =
        await getDoc(
            publicUserRef
        );


    // =====================================
    // EXISTING PUBLIC PROFILE
    // =====================================

    if (
        publicUserSnapshot.exists()
    ) {

        /*
           The user has already selected
           their CALCULUS Chat Name.

           IMPORTANT:

           Do NOT overwrite chatName with
           Google's displayName.
        */

        await setDoc(
            publicUserRef,
            {

                uid:
                    user.uid,

                photoURL:
                    user.photoURL || ""

            },

            {
                merge: true
            }
        );


        console.log(
            "Existing public Chat profile updated."
        );


        return;

    }



    // =====================================
    // NEW PUBLIC PROFILE
    // =====================================

    let chatName = null;


    while (!chatName) {

        chatName =
            window.prompt(
                "Choose your CALCULUS Chat Name:\n\n" +
                "This is the name other CALCULUS " +
                "users will see in Chat.\n\n" +
                "Example: gamer45"
            );


        // =================================
        // USER CANCELLED
        // =================================

        if (
            chatName === null
        ) {

            alert(
                "A CALCULUS Chat Name is required " +
                "to use CALCULUS Chat."
            );


            throw new Error(
                "CALCULUS Chat Name selection cancelled."
            );

        }


        // =================================
        // CLEAN INPUT
        // =================================

        chatName =
            chatName.trim();


        // =================================
        // EMPTY NAME
        // =================================

        if (!chatName) {

            alert(
                "Please enter a Chat Name."
            );


            chatName =
                null;


            continue;

        }


        // =================================
        // MAXIMUM LENGTH
        // =================================

        if (
            chatName.length > 30
        ) {

            alert(
                "Your Chat Name must be 30 " +
                "characters or fewer."
            );


            chatName =
                null;


            continue;

        }

    }



    // =====================================
    // CREATE PUBLIC PROFILE
    // =====================================

    await setDoc(
        publicUserRef,
        {

            uid:
                user.uid,

            chatName:
                chatName,

            photoURL:
                user.photoURL || ""

        }
    );


    console.log(
        "New public Chat profile created."
    );


    console.log(
        "CALCULUS Chat Name:",
        chatName
    );

}



// =========================================
// CREATE / UPDATE ALL USER DATA
// =========================================

async function createOrUpdateAllUserData(user) {

    /*
       Maintain the private profile.
    */

    await createOrUpdateUserProfile(
        user
    );


    /*
       Maintain the public Chat profile.
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

        console.log(
            "Starting Google sign-in..."
        );


        // =================================
        // GOOGLE SIGN-IN POPUP
        // =================================

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );


        const user =
            result.user;


        // =================================
        // AUTHENTICATION SUCCESSFUL
        // =================================

        console.log(
            "Google authentication successful."
        );


        console.log(
            "Google Name:",
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
        // FIRESTORE USER DATA
        // =================================

        await createOrUpdateAllUserData(
            user
        );


        console.log(
            "All Firestore operations successful."
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


        /*
           Pass the error back to
           login.html.
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
