import "./premium-access.js";
import "./all-sums-nav.js";
import "./access-control.js";
import "./auth-ui.js";
import "./calcgen-launcher.js";
import "./global-time-machine-nav.js";
/* =========================================
   CALCULUS — INTERACTIONS
========================================= */


/* =========================================
   SCROLL REVEAL
========================================= */

const revealElements =
    document.querySelectorAll(".reveal");


if ("IntersectionObserver" in window) {

    const revealObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.15
            }
        );


    revealElements.forEach(element => {

        revealObserver.observe(element);

    });

} else {

    revealElements.forEach(element => {

        element.classList.add("visible");

    });

}


/* =========================================
   HAMBURGER MENU
========================================= */

const hamburger =
    document.getElementById("hamburger");

const mobileMenu =
    document.getElementById("mobileMenu");


if (hamburger && mobileMenu) {

    function closeMobileMenu() {

        mobileMenu.classList.remove("open");

        hamburger.classList.remove("open");

        hamburger.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    function openMobileMenu() {

        mobileMenu.classList.add("open");

        hamburger.classList.add("open");

        hamburger.setAttribute(
            "aria-expanded",
            "true"
        );

    }


    hamburger.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            const menuIsOpen =
                mobileMenu.classList.contains(
                    "open"
                );

            if (menuIsOpen) {

                closeMobileMenu();

            } else {

                openMobileMenu();

            }

        }
    );


    mobileMenu.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            const clickedLink =
                event.target.closest("a");

            if (clickedLink) {

                closeMobileMenu();

            }

        }
    );


    document.addEventListener(
        "click",
        (event) => {

            const menuIsOpen =
                mobileMenu.classList.contains(
                    "open"
                );

            if (!menuIsOpen) {

                return;

            }

            const clickedInsideMenu =
                mobileMenu.contains(
                    event.target
                );

            const clickedHamburger =
                hamburger.contains(
                    event.target
                );

            if (
                !clickedInsideMenu &&
                !clickedHamburger
            ) {

                closeMobileMenu();

            }

        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                closeMobileMenu();

            }

        }
    );

}


/* =========================================
   TOPICS SUBMENU
========================================= */

const topicsMenu =
    document.getElementById("topicsMenuToggle");

const topicsSubmenu =
    document.getElementById("topicsSubmenu");

const topicsMenuContainer =
    document.querySelector(".topics-menu");


if (
    topicsMenu &&
    topicsSubmenu &&
    topicsMenuContainer
) {

    topicsMenu.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            const isOpen =
                topicsMenuContainer.classList
                    .toggle("open");

            topicsMenu.setAttribute(
                "aria-expanded",
                isOpen
            );

        }
    );


    topicsSubmenu
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    topicsMenuContainer
                        .classList
                        .remove("open");

                    topicsMenu.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        });

}


/* =========================================
   CALCULUS — AUTHENTICATION UI
========================================= */

import {
    watchAuthState,
    logOut
} from "./auth.js";


const userProfileButton =
    document.getElementById(
        "userProfileButton"
    );


const userProfilePicture =
    document.getElementById(
        "userProfilePicture"
    );


const authMenu =
    document.getElementById(
        "mobileMenu"
    );


if (
    userProfileButton &&
    userProfilePicture
) {

    watchAuthState(
        (user) => {

            if (user) {

                if (user.photoURL) {

                    userProfilePicture.src =
                        user.photoURL;

                }

                else {

                    userProfilePicture.src =
                        "logo.png";

                }


                userProfilePicture.alt =
                    user.displayName
                    ? user.displayName
                    : "Your profile";


                userProfileButton.style.display =
                    "flex";


                if (authMenu) {

                    const loginLink =
                        authMenu.querySelector(
                            'a[href="login.html"]'
                        );


                    if (loginLink) {

                        loginLink.textContent =
                            "Log Out";

                        loginLink.href =
                            "#";

                        loginLink.id =
                            "logoutLink";

                    }

                }

            }

            else {

                userProfileButton.style.display =
                    "none";


                if (authMenu) {

                    const logoutLink =
                        authMenu.querySelector(
                            "#logoutLink"
                        );


                    if (logoutLink) {

                        logoutLink.textContent =
                            "Log In";

                        logoutLink.href =
                            "login.html";

                        logoutLink.removeAttribute(
                            "id"
                        );

                    }

                }

            }

        }
    );

}


document.addEventListener(
    "click",
    async (event) => {

        const logoutLink =
            event.target.closest(
                "#logoutLink"
            );


        if (!logoutLink) {

            return;

        }


        event.preventDefault();


        try {

            await logOut();

        }

        catch (error) {

            console.error(
                "Logout failed:",
                error
            );

        }

    }
);