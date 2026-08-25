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

const hamburger =
    document.getElementById("hamburger");

const mobileMenu =
    document.getElementById("mobileMenu");


/* =========================================
   OPEN / CLOSE MENU
========================================= */

hamburger.addEventListener("click", (event) => {

    /*
       Prevent this click from reaching
       the document-level outside-click
       detector.
    */

    event.stopPropagation();

    const isOpen =
        mobileMenu.classList.toggle("open");

    hamburger.classList.toggle(
        "open",
        isOpen
    );

    hamburger.setAttribute(
        "aria-expanded",
        isOpen
    );
});


/* =========================================
   CLICK INSIDE THE MENU
========================================= */

mobileMenu.addEventListener("click", (event) => {

    /*
       Clicking inside the menu should NOT
       cause the menu to roll back in.

       However, clicking an actual link will
       still close it after the link is chosen.
    */

    if (event.target.closest("a")) {

        mobileMenu.classList.remove("open");

        hamburger.classList.remove("open");

        hamburger.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    /*
       Stop the click from reaching the
       document-level outside-click detector.
    */

    event.stopPropagation();
});


/* =========================================
   CLICK OUTSIDE → CLOSE MENU
========================================= */

document.addEventListener("click", () => {

    /*
       Because clicks on the hamburger and
       inside the menu were stopped above,
       reaching here means the user clicked
       somewhere outside both.

       Removing the class allows CSS to
       perform the closing animation.
    */

    if (
        mobileMenu.classList.contains("open")
    ) {

        mobileMenu.classList.remove("open");

        hamburger.classList.remove("open");

        hamburger.setAttribute(
            "aria-expanded",
            "false"
        );
    }
});
