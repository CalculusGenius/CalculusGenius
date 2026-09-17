// =========================================
// CALCULUS — ALL SUMS ARCHIVE
// =========================================

import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    app
} from "./firebase-config.js";


const db = getFirestore(app);

const container =
    document.getElementById(
        "allSumsContainer"
    );

const filterButtons =
    document.querySelectorAll(
        ".sum-filter"
    );


let allChallenges = [];


// =========================================
// LOAD ARCHIVE
// =========================================

async function loadChallenges() {

    try {

        const archiveRef =
            collection(
                db,
                "challengeArchive"
            );

        const archiveQuery =
            query(
                archiveRef,
                orderBy(
                    "createdAt",
                    "desc"
                )
            );

        const snapshot =
            await getDocs(
                archiveQuery
            );


        allChallenges =
            snapshot.docs.map(
                (doc) => ({
                    id: doc.id,
                    ...doc.data()
                })
            );


        displayChallenges(
            "all"
        );

    } catch (error) {

        console.error(
            "Failed to load challenge archive:",
            error
        );

        container.innerHTML = `
            <p class="loading-message">
                Unable to load the challenge archive.
            </p>
        `;

    }

}


// =========================================
// DISPLAY CHALLENGES
// =========================================

function displayChallenges(filter) {

    let challenges =
        allChallenges;


    if (filter !== "all") {

        challenges =
            allChallenges.filter(
                (challenge) =>
                    challenge.type === filter ||
                    challenge.level === filter
            );

    }


    if (challenges.length === 0) {

        container.innerHTML = `
            <p class="loading-message">
                No sums found.
            </p>
        `;

        return;

    }


    container.innerHTML =
        challenges.map(
            (challenge) => {

                const date =
                    challenge.date ||
                    "";


                return `
                    <article
                        class="archive-sum-card"
                    >

                        <div
                            class="archive-sum-meta"
                        >
                            <span>
                                ${
                                    challenge.level ||
                                    ""
                                }
                            </span>

                            <span>
                                ${
                                    challenge.type ||
                                    ""
                                }
                            </span>

                            <span>
                                ${date}
                            </span>
                        </div>


                        <div
                            class="archive-sum-problem"
                        >
                            ${challenge.problem}
                        </div>

                    </article>
                `;

            }
        ).join("");


    if (window.MathJax) {

        MathJax.typesetPromise(
            [container]
        );

    }

}


// =========================================
// FILTER BUTTONS
// =========================================

filterButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    (btn) =>
                        btn.classList.remove(
                            "active"
                        )
                );

                button.classList.add(
                    "active"
                );


                displayChallenges(
                    button.dataset.filter
                );

            }
        );

    }
);


// =========================================
// START
// =========================================

loadChallenges();
