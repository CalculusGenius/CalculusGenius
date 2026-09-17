// =========================================
// CALCULUS — CHALLENGE ARCHIVE
// =========================================

import {
    getFirestore,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    app
} from "./firebase-config.js";

import {
    watchAuthState
} from "./auth.js";


const db = getFirestore(app);

const ADMIN_EMAIL =
    "calculusgenius67@gmail.com";


// =========================================
// IDENTIFY CURRENT CHALLENGE
// =========================================

function getChallengeInfo() {

    const path =
        window.location.pathname
            .toLowerCase();


    if (path.endsWith("s-daily.html")) {

        return {
            idPrefix: "school-daily",
            type: "daily",
            level: "school",
            elementId: "schoolDailyProblem"
        };

    }


    if (path.endsWith("u-daily.html")) {

        return {
            idPrefix: "university-daily",
            type: "daily",
            level: "university",
            elementId: "universityDailyProblem"
        };

    }


    if (path.endsWith("s-weekly.html")) {

        return {
            idPrefix: "school-weekly",
            type: "weekly",
            level: "school",
            elementId: "schoolWeeklyProblem"
        };

    }


    if (path.endsWith("u-weekly.html")) {

        return {
            idPrefix: "university-weekly",
            type: "weekly",
            level: "university",
            elementId: "universityWeeklyProblem"
        };

    }


    return null;

}


// =========================================
// CREATE PERMANENT ID
// =========================================

async function createChallengeId(
    prefix,
    date,
    problem
) {

    const data =
        prefix +
        "|" +
        date +
        "|" +
        problem;


    const encoded =
        new TextEncoder()
            .encode(data);


    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            encoded
        );


    const hashArray =
        Array.from(
            new Uint8Array(hashBuffer)
        );


    const hash =
        hashArray
            .map(
                byte =>
                    byte
                        .toString(16)
                        .padStart(2, "0")
            )
            .join("");


    return prefix +
        "-" +
        hash.substring(0, 20);

}


// =========================================
// ARCHIVE CURRENT CHALLENGE
// =========================================

async function archiveCurrentChallenge(
    user
) {

    if (!user) {
        return;
    }


    // Only the site owner archives
    // challenges.
    if (
        !user.email ||
        user.email.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
    ) {

        return;

    }


    const info =
        getChallengeInfo();


    if (!info) {
        return;
    }


    const problemElement =
        document.getElementById(
            info.elementId
        );


    if (!problemElement) {
        return;
    }


    const problem =
        problemElement.innerHTML
            .trim();


    if (!problem) {
        return;
    }


    const dateElement =
        document.querySelector(
            ".challenge-date"
        );


    const date =
        dateElement
            ? dateElement.textContent.trim()
            : "";


    if (!date) {
        return;
    }


    const challengeId =
        await createChallengeId(
            info.idPrefix,
            date,
            problem
        );


    const challengeRef =
        doc(
            db,
            "challengeArchive",
            challengeId
        );


    await setDoc(
        challengeRef,
        {

            type:
                info.type,

            level:
                info.level,

            date:
                date,

            problem:
                problem,

            sourcePage:
                window.location.pathname,

            createdAt:
                serverTimestamp()

        },
        {
            merge: false
        }
    );


    console.log(
        "Challenge permanently archived:",
        challengeId
    );

}


// =========================================
// WAIT FOR AUTH
// =========================================

watchAuthState(
    async (user) => {

        try {

            await archiveCurrentChallenge(
                user
            );

        } catch (error) {

            console.error(
                "Challenge archive failed:",
                error
            );

        }

    }
);
