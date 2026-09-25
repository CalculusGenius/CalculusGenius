/* =========================================
   CALCULUS — GLOBAL LABORATORY NAVIGATION
   Injects the Laboratory tab into every page
   that loads script.js.
========================================= */

(function addLaboratoryNavigation() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    const laboratoryHref = "laboratory.html";
    const isLaboratory = path === laboratoryHref;

    function createLink(className = "nav-link") {
        const link = document.createElement("a");
        link.href = laboratoryHref;
        link.className = className;
        link.textContent = "Laboratory";
        if (isLaboratory) link.classList.add("active");
        return link;
    }

    const desktopNav = document.querySelector(".desktop-nav");
    if (desktopNav && !desktopNav.querySelector('a[href="laboratory.html"]')) {
        const otherWebsites = desktopNav.querySelector('a[href="other-websites.html"]');
        if (otherWebsites) desktopNav.insertBefore(createLink(), otherWebsites);
        else desktopNav.appendChild(createLink());
    }

    const mobileMenu = document.querySelector(".mobile-menu");
    if (mobileMenu && !mobileMenu.querySelector('a[href="laboratory.html"]')) {
        const otherWebsites = mobileMenu.querySelector('a[href="other-websites.html"]');
        if (otherWebsites) mobileMenu.insertBefore(createLink(""), otherWebsites);
        else mobileMenu.appendChild(createLink(""));
    }
})();
