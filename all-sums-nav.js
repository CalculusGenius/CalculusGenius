// =========================================
// CALCULUS — ALL SUMS NAVIGATION
// =========================================

/*
    Adds "All Sums" to the existing CALCULUS
    navigation without changing its structure
    or styling.

    The page itself contains the normal desktop
    and mobile navigation markup. This file only
    inserts the additional link using the same
    navigation classes/structure.
*/

function addAllSumsNavigation() {

    const href = "all-sums.html";


    /* =========================================
       DESKTOP NAVIGATION
    ========================================= */

    const desktopNav =
        document.querySelector(".desktop-nav");


    if (desktopNav) {

        const existingDesktopLink =
            desktopNav.querySelector(
                `a[href="${href}"]`
            );


        if (!existingDesktopLink) {

            const link =
                document.createElement("a");

            link.href = href;
            link.className = "nav-link";
            link.textContent = "All Sums";

            desktopNav.appendChild(link);

        }

    }


    /* =========================================
       MOBILE NAVIGATION
    ========================================= */

    const mobileMenu =
        document.getElementById("mobileMenu");


    if (mobileMenu) {

        const existingMobileLink =
            mobileMenu.querySelector(
                `a[href="${href}"]`
            );


        if (!existingMobileLink) {

            const link =
                document.createElement("a");

            link.href = href;
            link.textContent = "All Sums";

            mobileMenu.appendChild(link);

        }

    }

}


/* =========================================
   RUN AFTER DOM IS READY
========================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        addAllSumsNavigation
    );

} else {

    addAllSumsNavigation();

}
