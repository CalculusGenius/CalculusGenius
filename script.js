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


/* -----------------------------------------
   HAMBURGER MENU
----------------------------------------- */

const hamburger =
    document.getElementById("hamburger");

const mobileMenu =
    document.getElementById("mobileMenu");


hamburger.addEventListener("click", () => {

    const isOpen =
        mobileMenu.classList.contains("open");


    if (isOpen) {

        mobileMenu.classList.remove("open");

        mobileMenu.style.display = "none";

        hamburger.setAttribute(
            "aria-expanded",
            "false"
        );

    } else {

        mobileMenu.classList.add("open");

        mobileMenu.style.display = "flex";

        hamburger.setAttribute(
            "aria-expanded",
            "true"
        );

    }

});


/* -----------------------------------------
   CLOSE MOBILE MENU AFTER LINK CLICK
----------------------------------------- */

const mobileLinks =
    mobileMenu.querySelectorAll("a");


mobileLinks.forEach(link => {

    link.addEventListener("click", () => {

        mobileMenu.classList.remove("open");

        mobileMenu.style.display = "none";

        hamburger.setAttribute(
            "aria-expanded",
            "false"
        );

    });

});
