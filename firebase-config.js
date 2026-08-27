// =========================================
// CALCULUS — FIREBASE CONFIGURATION
// =========================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


// Firebase project configuration

const firebaseConfig = {

    apiKey:
        "AIzaSyAQN9Xuh9WbE4ccsMmO8dGGWoiBMxwBwkE",

    authDomain:
        "calculus-732a5.firebaseapp.com",

    projectId:
        "calculus-732a5",

    storageBucket:
        "calculus-732a5.firebasestorage.app",

    messagingSenderId:
        "174983915941",

    appId:
        "1:174983915941:web:f96942414788a71729e04c",

    measurementId:
        "G-G81YBFXTZY"

};


// Initialize Firebase

const app =
    initializeApp(firebaseConfig);


// Export the Firebase app

export { app };
