import "./auth-ui.js";
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

    /*
       Fallback for older browsers.
    */

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



/* =========================================
   SAFETY CHECK
========================================= */

if (hamburger && mobileMenu) {


    /* =====================================
       CLOSE MENU
    ===================================== */

    function closeMobileMenu() {

        mobileMenu.classList.remove("open");

        hamburger.classList.remove("open");

        hamburger.setAttribute(
            "aria-expanded",
            "false"
        );

    }



    /* =====================================
       OPEN MENU
    ===================================== */

    function openMobileMenu() {

        mobileMenu.classList.add("open");

        hamburger.classList.add("open");

        hamburger.setAttribute(
            "aria-expanded",
            "true"
        );

    }



    /* =====================================
       HAMBURGER BUTTON
    ===================================== */

    hamburger.addEventListener(
        "click",
        (event) => {

            /*
               Prevent the document-level
               outside-click listener from
               immediately closing the menu.
            */

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



    /* =====================================
       MENU CLICK
    ===================================== */

    mobileMenu.addEventListener(
        "click",
        (event) => {

            /*
               Stop the click from reaching
               the document.
            */

            event.stopPropagation();


            /*
               If a navigation link was clicked,
               close the menu.
            */

            const clickedLink =
                event.target.closest("a");


            if (clickedLink) {

                closeMobileMenu();

            }

        }
    );



    /* =====================================
       OUTSIDE CLICK
    ===================================== */

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


            /*
               Anything outside both the
               menu and hamburger closes it.
            */

            if (
                !clickedInsideMenu &&
                !clickedHamburger
            ) {

                closeMobileMenu();

            }

        }
    );



    /* =====================================
       ESCAPE KEY
    ===================================== */

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

            /*
               Prevent the click from being
               treated as an outside click.
            */

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


    /*
       Close submenu when one of its
       links is selected.
    */

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


/* =========================================
   PROFILE BUTTON
========================================= */

const userProfileButton =
    document.getElementById(
        "userProfileButton"
    );


const userProfilePicture =
    document.getElementById(
        "userProfilePicture"
    );


/* =========================================
   MOBILE MENU
========================================= */

const authMenu =
    document.getElementById(
        "mobileMenu"
    );


/* =========================================
   AUTH STATE
========================================= */

if (
    userProfileButton &&
    userProfilePicture
) {

    watchAuthState(
        (user) => {


            /* =================================
               USER IS LOGGED IN
            ================================= */

            if (user) {

                /*
                   Show Google profile picture.
                */

                if (user.photoURL) {

                    userProfilePicture.src =
                        user.photoURL;

                }

                else {

                    /*
                       Fallback if Google does
                       not provide a photo.
                    */

                    userProfilePicture.src =
                        "logo.png";

                }


                userProfilePicture.alt =
                    user.displayName
                    ? user.displayName
                    : "Your profile";


                userProfileButton.style.display =
                    "flex";


                /*
                   Change Login → Logout
                */

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


            /* =================================
               USER IS LOGGED OUT
            ================================= */

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


/* =========================================
   LOGOUT CLICK HANDLER
========================================= */

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
