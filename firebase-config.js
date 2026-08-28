// =========================================
// CALCULUS — FIREBASE CONFIGURATION
// =========================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


// =========================================
// FIREBASE PROJECT CONFIGURATION
// =========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyAEjyOZUdSkY2k8XwlaUwGjt2q1eEr0TM8",

    authDomain:
        "calculus-afbeb.firebaseapp.com",

    projectId:
        "calculus-afbeb",

    storageBucket:
        "calculus-afbeb.firebasestorage.app",

    messagingSenderId:
        "749477240428",

    appId:
        "1:749477240428:web:bf0ab3831bd32538100249",

    measurementId:
        "G-5H5WZKL51Q"

};


// =========================================
// INITIALIZE FIREBASE
// =========================================

const app =
    initializeApp(firebaseConfig);


// =========================================
// EXPORT FIREBASE APP
// =========================================

export { app };
