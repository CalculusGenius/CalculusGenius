// =========================================
// CALCULUS — GOOGLE AUTHENTICATION
// =========================================
// Google Authentication
// + Private Firestore User Profiles
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


import {
    app
} from "./firebase-config.js";



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
// PRIVATE USER PROFILE
// =========================================

async function createOrUpdateUserProfile(user) {

    if (!user) {

        return;

    }


    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    try {

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

    catch (error) {

        console.error(
            "Private profile error:",
            error
        );

        throw error;

    }

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
            "Google account name:",
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


        /*
           Only the PRIVATE profile is handled
           here.

           Chat name/publicUsers is deliberately
           handled by chat.js when the user
           actually visits Chat.
        */

        await createOrUpdateUserProfile(
            user
        );


        console.log(
            "Private Firestore profile ready."
        );


        /*
           Keep the existing login flow.
        */

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

export function watchAuthState(
    callback
) {

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
