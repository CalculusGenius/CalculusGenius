// =========================================
// CALCULUS — GLOBAL AUTHENTICATION UI
// =========================================

import {
    watchAuthState,
    logOut
} from "./auth.js";


// =========================================
// INITIALIZE
// =========================================

function initializeAuthUI() {

    /*
       Find the hamburger/mobile menu that
       already exists on the current page.
    */

    const mobileMenu =
        document.getElementById("mobileMenu");


    /*
       Find the desktop navigation.
    */

    const desktopNav =
        document.querySelector(".desktop-nav");


    /*
       Find the hamburger button.
    */

    const hamburger =
        document.getElementById("hamburger");


    /*
       If the page has no navigation,
       there is nothing to do.
    */

    if (!mobileMenu && !desktopNav) {

        return;

    }


    // =====================================
    // CREATE PROFILE BUTTON
    // =====================================

    let profileButton =
        document.getElementById(
            "userProfileButton"
        );


    /*
       If it doesn't already exist,
       create it automatically.
    */

    if (!profileButton && hamburger) {

        profileButton =
            document.createElement("a");

        profileButton.id =
            "userProfileButton";

        profileButton.className =
            "user-profile-button";

        profileButton.href =
            "profile.html";

        profileButton.setAttribute(
            "aria-label",
            "Open your profile"
        );

        profileButton.style.display =
            "none";


        const profileImage =
            document.createElement("img");

        profileImage.id =
            "userProfilePicture";

        profileImage.alt =
            "Your profile";


        profileButton.appendChild(
            profileImage
        );


        /*
           Put profile button immediately
           after hamburger.
        */

        hamburger.insertAdjacentElement(
            "afterend",
            profileButton
        );

    }


    const profileImage =
        document.getElementById(
            "userProfilePicture"
        );


    // =====================================
    // MOBILE LOGIN / LOGOUT
    // =====================================

    let mobileAuthLink = null;


    if (mobileMenu) {

        /*
           Look for an existing login link.
        */

        mobileAuthLink =
            mobileMenu.querySelector(
                'a[href="login.html"]'
            );


        /*
           If there isn't one, create it.
        */

        if (!mobileAuthLink) {

            mobileAuthLink =
                document.createElement("a");

            mobileAuthLink.href =
                "login.html";

            mobileAuthLink.textContent =
                "Log In";

            mobileAuthLink.id =
                "authMenuLink";


            mobileMenu.appendChild(
                mobileAuthLink
            );

        }

    }


    // =====================================
    // DESKTOP LOGIN / LOGOUT
    // =====================================

    let desktopAuthLink = null;


    if (desktopNav) {

        /*
           Search for an existing login link.
        */

        desktopAuthLink =
            desktopNav.querySelector(
                'a[href="login.html"]'
            );


        /*
           If there isn't one, create it.
        */

        if (!desktopAuthLink) {

            desktopAuthLink =
                document.createElement("a");

            desktopAuthLink.href =
                "login.html";

            desktopAuthLink.textContent =
                "Log In";

            desktopAuthLink.className =
                "nav-link";

            desktopAuthLink.id =
                "desktopAuthLink";


            desktopNav.appendChild(
                desktopAuthLink
            );

        }

    }


    // =====================================
// NEWS MENU ITEM
// =====================================


// =====================================
// MOBILE NEWS
// =====================================

if (mobileMenu) {

    /*
       Check whether News already exists.
    */

    let mobileNewsLink =
        mobileMenu.querySelector(
            'a[href="news.html"]'
        );


    /*
       Create News if it does not exist.
    */

    if (!mobileNewsLink) {

        mobileNewsLink =
            document.createElement("a");

        mobileNewsLink.href =
            "news.html";

        mobileNewsLink.textContent =
            "News";

        mobileNewsLink.id =
            "globalMobileNewsLink";


        /*
           Keep authentication at the
           bottom of the mobile menu.
        */

        if (mobileAuthLink) {

            mobileMenu.insertBefore(
                mobileNewsLink,
                mobileAuthLink
            );

        } else {

            mobileMenu.appendChild(
                mobileNewsLink
            );

        }

    }

}



// =====================================
// DESKTOP NEWS + ACTIVE PAGE
// =====================================

if (desktopNav) {

    /*
       Check whether News already exists.
    */

    let desktopNewsLink =
        desktopNav.querySelector(
            'a[href="news.html"]'
        );


    /*
       Create News if it doesn't exist.
    */

    if (!desktopNewsLink) {

        desktopNewsLink =
            document.createElement("a");

        desktopNewsLink.href =
            "news.html";

        desktopNewsLink.textContent =
            "News";

        desktopNewsLink.className =
            "nav-link";

        desktopNewsLink.id =
            "globalDesktopNewsLink";


        /*
           Put News immediately before
           Log In / Log Out.
        */

        if (desktopAuthLink) {

            desktopNav.insertBefore(
                desktopNewsLink,
                desktopAuthLink
            );

        } else {

            desktopNav.appendChild(
                desktopNewsLink
            );

        }

    }


    // =====================================
    // CURRENT PAGE DETECTION
    // =====================================

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() || "index.html";


    /*
       Look at every desktop navigation link.
    */

    const allDesktopLinks =
        desktopNav.querySelectorAll(
            ".nav-link"
        );


    allDesktopLinks.forEach(
        (link) => {

            /*
               Remove any previous dynamic
               active state first.
            */

            link.classList.remove(
                "active"
            );

            link.removeAttribute(
                "aria-current"
            );


            /*
               Get this link's filename.
            */

            const linkPage =
                link.getAttribute("href");


            /*
               Compare it with the current page.
            */

            if (
                linkPage === currentPage
            ) {

                link.classList.add(
                    "active"
                );

                link.setAttribute(
                    "aria-current",
                    "page"
                );

            }

        }
    );

}
    
    
    // =====================================
    // AUTH STATE
    // =====================================

    watchAuthState(
        (user) => {


            // =================================
            // LOGGED IN
            // =================================

            if (user) {


                /*
                   -----------------------------
                   PROFILE PICTURE
                   -----------------------------
                */

                if (
                    profileButton &&
                    profileImage
                ) {

                    profileImage.src =
                        user.photoURL ||
                        "logo.png";


                    profileImage.alt =
                        user.displayName
                        ? user.displayName
                        : "Your profile";


                    profileButton.style.display =
                        "flex";

                }


                /*
                   -----------------------------
                   MOBILE MENU
                   -----------------------------
                */

                if (mobileAuthLink) {

                    mobileAuthLink.textContent =
                        "Log Out";

                    mobileAuthLink.href =
                        "#";

                    mobileAuthLink.dataset.authAction =
                        "logout";

                }


                /*
                   -----------------------------
                   DESKTOP NAV
                   -----------------------------
                */

                if (desktopAuthLink) {

                    desktopAuthLink.textContent =
                        "Log Out";

                    desktopAuthLink.href =
                        "#";

                    desktopAuthLink.dataset.authAction =
                        "logout";

                }

            }


            // =================================
            // LOGGED OUT
            // =================================

            else {


                /*
                   Hide profile picture.
                */

                if (profileButton) {

                    profileButton.style.display =
                        "none";

                }


                /*
                   -----------------------------
                   MOBILE MENU
                   -----------------------------
                */

                if (mobileAuthLink) {

                    mobileAuthLink.textContent =
                        "Log In";

                    mobileAuthLink.href =
                        "login.html";

                    delete mobileAuthLink.dataset
                        .authAction;

                }


                /*
                   -----------------------------
                   DESKTOP NAV
                   -----------------------------
                */

                if (desktopAuthLink) {

                    desktopAuthLink.textContent =
                        "Log In";

                    desktopAuthLink.href =
                        "login.html";

                    delete desktopAuthLink.dataset
                        .authAction;

                }

            }

        }
    );


    // =====================================
    // LOGOUT HANDLER
    // =====================================

    document.addEventListener(
        "click",
        async (event) => {


            const logoutElement =
                event.target.closest(
                    '[data-auth-action="logout"]'
                );


            if (!logoutElement) {

                return;

            }


            event.preventDefault();


            /*
               Prevent the mobile menu's
               normal link behavior.
            */

            event.stopPropagation();


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

}


// =========================================
// START
// =========================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAuthUI
    );

} else {

    initializeAuthUI();

}
