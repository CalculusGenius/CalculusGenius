// =========================================
// CALCULUS — ALL SUMS
// =========================================

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    app
} from "./firebase-config.js";


const db = getFirestore(app);

const container =
    document.getElementById("allSumsContainer");

const filterButtons =
    document.querySelectorAll(".sum-filter");


let challenges = [];


/* =========================================
   CURRENT CHALLENGE SOURCES
========================================= */

const sourcePages = [

    {
        page: "s-daily.html",
        type: "daily",
        level: "school",
        problemId: "schoolDailyProblem"
    },

    {
        page: "u-daily.html",
        type: "daily",
        level: "university",
        problemId: "universityDailyProblem"
    },

    {
        page: "s-weekly.html",
        type: "weekly",
        level: "school",
        problemId: "schoolWeeklyProblem"
    },

    {
        page: "u-weekly.html",
        type: "weekly",
        level: "university",
        problemId: "universityWeeklyProblem"
    }

];


/* =========================================
   LOAD LIVE SUMS FROM THE FOUR PAGES
========================================= */

async function loadCurrentSums() {

    const results = await Promise.all(

        sourcePages.map(async source => {

            try {

                const response =
                    await fetch(source.page, {
                        cache: "no-store"
                    });


                if (!response.ok) {
                    throw new Error(
                        `${source.page}: HTTP ${response.status}`
                    );
                }


                const html =
                    await response.text();


                const parser =
                    new DOMParser();


                const documentCopy =
                    parser.parseFromString(
                        html,
                        "text/html"
                    );


                const problemElement =
                    documentCopy.getElementById(
                        source.problemId
                    );


                const dateElement =
                    documentCopy.querySelector(
                        ".challenge-date"
                    );


                if (!problemElement) {
                    return null;
                }


                const problem =
                    problemElement.innerHTML.trim();


                if (!problem) {
                    return null;
                }


                return {
                    id:
                        `current-${source.level}-${source.type}`,
                    type: source.type,
                    level: source.level,
                    date: dateElement
                        ? dateElement.textContent.trim()
                        : "",
                    problem,
                    sourcePage: source.page,
                    current: true
                };

            } catch (error) {

                console.warn(
                    `Could not load ${source.page}:`,
                    error
                );

                return null;

            }

        })

    );


    return results.filter(Boolean);

}


/* =========================================
   LOAD FIRESTORE ARCHIVE WHEN AVAILABLE

   This is optional. The four live challenge
   pages remain the source of truth for the
   currently published sums, so an archive
   permission/index problem cannot make the
   All Sums page appear empty.
========================================= */

async function loadFirestoreArchive() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "challengeArchive"
                )
            );


        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            current: false
        }));

    } catch (error) {

        console.warn(
            "Firestore archive unavailable; using live challenge pages:",
            error
        );

        return [];

    }

}


/* =========================================
   MERGE + DEDUPLICATE
========================================= */

function mergeChallenges(
    currentSums,
    archivedSums
) {

    const merged = [];
    const seen = new Set();


    /*
       Current pages are deliberately inserted
       first. This guarantees that the currently
       published problems are always represented.
    */

    currentSums.forEach(challenge => {

        const key =
            `${challenge.level}|${challenge.type}|${challenge.date}|${challenge.problem}`;


        if (!seen.has(key)) {
            seen.add(key);
            merged.push(challenge);
        }

    });


    archivedSums.forEach(challenge => {

        const key =
            `${challenge.level}|${challenge.type}|${challenge.date}|${challenge.problem}`;


        if (!seen.has(key)) {
            seen.add(key);
            merged.push(challenge);
        }

    });


    return merged;

}


/* =========================================
   SORT
========================================= */

function sortChallenges(items) {

    return items.sort((a, b) => {

        if (a.current && !b.current) {
            return -1;
        }

        if (!a.current && b.current) {
            return 1;
        }

        const aTime =
            a.createdAt?.toMillis
                ? a.createdAt.toMillis()
                : 0;

        const bTime =
            b.createdAt?.toMillis
                ? b.createdAt.toMillis()
                : 0;

        return bTime - aTime;

    });

}


/* =========================================
   DISPLAY
========================================= */

function displayChallenges(filter) {

    let filtered = challenges;


    if (filter !== "all") {

        filtered = challenges.filter(
            challenge =>
                challenge.type === filter ||
                challenge.level === filter
        );

    }


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="archive-status">
                No sums found.
            </div>
        `;

        return;

    }


    container.innerHTML =
        filtered.map(challenge => `

            <article class="archive-sum-card">

                <div class="archive-sum-meta">

                    <span>${escapeHtml(challenge.level || "")}</span>
                    <span>${escapeHtml(challenge.type || "")}</span>
                    <span>${escapeHtml(challenge.date || "")}</span>

                </div>

                <div class="archive-sum-problem">
                    ${challenge.problem}
                </div>

            </article>

        `).join("");


    if (window.MathJax) {

        MathJax.typesetPromise([container])
            .catch(error => {
                console.warn(
                    "MathJax rendering failed:",
                    error
                );
            });

    }

}


/* =========================================
   SMALL HTML ESCAPER FOR META TEXT
========================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================
   FILTERS
========================================= */

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(other =>
            other.classList.remove("active")
        );

        button.classList.add("active");

        displayChallenges(
            button.dataset.filter
        );

    });

});


/* =========================================
   START
========================================= */

async function start() {

    try {

        const [currentSums, archivedSums] =
            await Promise.all([
                loadCurrentSums(),
                loadFirestoreArchive()
            ]);


        challenges = sortChallenges(
            mergeChallenges(
                currentSums,
                archivedSums
            )
        );


        displayChallenges("all");

    } catch (error) {

        console.error(
            "All Sums loading failed:",
            error
        );

        container.innerHTML = `
            <div class="archive-status">
                Unable to load the sums right now.
            </div>
        `;

    }

}


start();
