/* =========================================
   CALCULUS — GLOBAL LABORATORY NAVIGATION
   Injects the Laboratory tab into every page
   that loads script.js.
========================================= */

(function addLaboratoryNavigation() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    const laboratoryHref = "time-machine.html";
    const isLaboratory = path === laboratoryHref || path === "laboratory.html";

    function createLink(className = "nav-link") {
        const link = document.createElement("a");
        link.href = laboratoryHref;
        link.className = className;
        link.textContent = "Laboratory";
        if (isLaboratory) link.classList.add("active");
        return link;
    }

    const desktopNav = document.querySelector(".desktop-nav");
    if (desktopNav && !desktopNav.querySelector('a[href="time-machine.html"], a[href="laboratory.html"]')) {
        const otherWebsites = desktopNav.querySelector('a[href="other-websites.html"]');
        if (otherWebsites) desktopNav.insertBefore(createLink(), otherWebsites);
        else desktopNav.appendChild(createLink());
    }

    const mobileMenu = document.querySelector(".mobile-menu");
    if (mobileMenu && !mobileMenu.querySelector('a[href="time-machine.html"], a[href="laboratory.html"]')) {
        const otherWebsites = mobileMenu.querySelector('a[href="other-websites.html"]');
        if (otherWebsites) mobileMenu.insertBefore(createLink(""), otherWebsites);
        else mobileMenu.appendChild(createLink(""));
    }
})();
