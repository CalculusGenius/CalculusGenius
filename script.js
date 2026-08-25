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


hamburger.addEventListener("click", () => {

    const isOpen =
        mobileMenu.classList.toggle("open");

    hamburger.classList.toggle("open", isOpen);

    hamburger.setAttribute(
        "aria-expanded",
        isOpen
    );

});


/* -----------------------------------------
   CLOSE MENU WHEN A LINK IS CLICKED
----------------------------------------- */

const mobileLinks =
    mobileMenu.querySelectorAll("a");


mobileLinks.forEach(link => {

    link.addEventListener("click", () => {

        mobileMenu.classList.remove("open");

        hamburger.classList.remove("open");

        hamburger.setAttribute(
            "aria-expanded",
            "false"
        );

    });

});
