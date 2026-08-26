/* =========================================
   CALCULUS — INTERACTIONS
========================================= */


/* -----------------------------------------
   SCROLL REVEAL
----------------------------------------- */

const revealElements =
    document.querySelectorAll(".reveal");


const revealObserver =
    new IntersectionObserver(
        (entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);
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


/* =========================================
   HAMBURGER MENU
========================================= */

const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");


/* =========================================
   OPEN / CLOSE FUNCTION
========================================= */

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


/* =========================================
   HAMBURGER BUTTON
========================================= */

hamburger.addEventListener("click", (event) => {

    /*
       Prevent this click from being treated
       as an outside click.
    */

    event.stopPropagation();

    const menuIsOpen =
        mobileMenu.classList.contains("open");

    if (menuIsOpen) {

        closeMobileMenu();

    } else {

        openMobileMenu();

    }

});


/* =========================================
   CLICK INSIDE MENU
========================================= */

mobileMenu.addEventListener("click", (event) => {

    /*
       Don't close the menu simply because
       the user clicked somewhere inside it.
    */

    event.stopPropagation();


    /*
       A navigation link should close the menu.
    */

    const clickedLink =
        event.target.closest("a");

    if (clickedLink) {

        closeMobileMenu();

    }

});


/* =========================================
   CLICK ANYWHERE OUTSIDE
========================================= */

document.addEventListener(
    "click",
    (event) => {

        const menuIsOpen =
            mobileMenu.classList.contains("open");


        if (!menuIsOpen) {
            return;
        }


        /*
           If the click is outside both the
           hamburger and the menu, close it.
        */

        const clickedInsideMenu =
            mobileMenu.contains(event.target);

        const clickedHamburger =
            hamburger.contains(event.target);


        if (
            !clickedInsideMenu &&
            !clickedHamburger
        ) {

            closeMobileMenu();

        }

    }
);


/* =========================================
   ESC KEY
========================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeMobileMenu();

        }

    }
);
