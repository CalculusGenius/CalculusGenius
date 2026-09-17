// =========================================
// CALCULUS — ALL SUMS
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


const db =
    getFirestore(app);

const container =
    document.getElementById(
        "allSumsContainer"
    );

const filterButtons =
    document.querySelectorAll(
        ".sum-filter"
    );


let challenges = [];


// =========================================
// LOAD ARCHIVE
// =========================================

async function loadArchive() {

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


        challenges =
            snapshot.docs.map(
                doc => ({
                    id: doc.id,
                    ...doc.data()
                })
            );


        displayChallenges(
            "all"
        );

    } catch (error) {

        console.error(
            "Archive loading failed:",
            error
        );


        container.innerHTML = `
            <p>
                Unable to load the archive.
            </p>
        `;

    }

}


// =========================================
// DISPLAY
// =========================================

function displayChallenges(
    filter
) {

    let filtered =
        challenges;


    if (filter !== "all") {

        filtered =
            challenges.filter(
                challenge =>
                    challenge.type === filter ||
                    challenge.level === filter
            );

    }


    if (
        filtered.length === 0
    ) {

        container.innerHTML = `
            <p>
                No sums found.
            </p>
        `;

        return;

    }


    container.innerHTML =
        filtered
            .map(
                challenge => `

                    <article
                        class="archive-sum-card"
                    >

                        <div
                            class="archive-sum-meta"
                        >

                            <span>
                                ${
                                    challenge.level
                                }
                            </span>

                            <span>
                                ${
                                    challenge.type
                                }
                            </span>

                            <span>
                                ${
                                    challenge.date
                                }
                            </span>

                        </div>


                        <div
                            class="archive-sum-problem"
                        >
                            ${
                                challenge.problem
                            }
                        </div>

                    </article>

                `
            )
            .join("");


    if (window.MathJax) {

        MathJax.typesetPromise(
            [container]
        );

    }

}


// =========================================
// FILTERS
// =========================================

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    other =>
                        other.classList.remove(
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

loadArchive();
