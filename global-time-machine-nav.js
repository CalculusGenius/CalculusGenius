/* =========================================
   CALCULUS — GLOBAL TIME MACHINE NAVIGATION
   Injects the Time Machine tab into every page
   that loads script.js.
========================================= */

(function addTimeMachineNavigation() {

    const path = window.location.pathname.split("/").pop() || "index.html";
    const isTimeMachine = path === "time-machine.html";

    function createLink(className = "nav-link") {
        const link = document.createElement("a");
        link.href = "time-machine.html";
        link.className = className;
        link.textContent = "Time Machine";

        if (isTimeMachine) {
            link.classList.add("active");
        }

        return link;
    }

    const desktopNav = document.querySelector(".desktop-nav");

    if (desktopNav && !desktopNav.querySelector('a[href="time-machine.html"]')) {
        const otherWebsites = desktopNav.querySelector('a[href="other-websites.html"]');

        if (otherWebsites) {
            desktopNav.insertBefore(createLink(), otherWebsites);
        } else {
            desktopNav.appendChild(createLink());
        }
    }

    const mobileMenu = document.querySelector(".mobile-menu");

    if (mobileMenu && !mobileMenu.querySelector('a[href="time-machine.html"]')) {
        const otherWebsites = mobileMenu.querySelector('a[href="other-websites.html"]');

        if (otherWebsites) {
            const link = createLink("");
            mobileMenu.insertBefore(link, otherWebsites);
        } else {
            mobileMenu.appendChild(createLink(""));
        }
    }

})();
