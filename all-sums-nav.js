// =========================================
// CALCULUS — ALL SUMS NAVIGATION
// =========================================

/*
    Adds "All Sums" to:

    1. Desktop navigation
    2. Hamburger/mobile navigation

    This file is imported by script.js, so
    individual HTML pages do not need to
    contain the All Sums link manually.
*/


/* =========================================
   ADD ALL SUMS LINK
========================================= */

function addAllSumsNavigation() {


    /* =====================================
       MOBILE / HAMBURGER MENU
    ===================================== */

    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );


    if (mobileMenu) {

        /*
           Do not add the link if it already
           exists.
        */

        const existingMobileLink =
            mobileMenu.querySelector(
                'a[href="all-sums.html"]'
            );


        if (!existingMobileLink) {

            const allSumsLink =
                document.createElement("a");

            allSumsLink.href =
                "all-sums.html";

            allSumsLink.textContent =
                "All Sums";


            mobileMenu.appendChild(
                allSumsLink
            );

        }

    }



    /* =====================================
       DESKTOP NAVIGATION
    ===================================== */

    /*
       Find the desktop navigation.

       We look for a navigation containing
       the normal site links rather than
       blindly modifying every <nav>.
    */

    const desktopCandidates =
        document.querySelectorAll(
            "header nav, .desktop-nav, nav"
        );


    let desktopNav = null;


    desktopCandidates.forEach(nav => {

        if (desktopNav) {
            return;
        }


        /*
           Do not accidentally select the
           mobile menu.
        */

        if (
            nav.id === "mobileMenu"
        ) {
            return;
        }


        desktopNav = nav;

    });


    if (desktopNav) {

        const existingDesktopLink =
            desktopNav.querySelector(
                'a[href="all-sums.html"]'
            );


        if (!existingDesktopLink) {

            const allSumsLink =
                document.createElement("a");

            allSumsLink.href =
                "all-sums.html";

            allSumsLink.textContent =
                "All Sums";


            desktopNav.appendChild(
                allSumsLink
            );

        }

    }

}


/* =========================================
   RUN AFTER DOM IS READY
========================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        addAllSumsNavigation
    );

} else {

    addAllSumsNavigation();

}
