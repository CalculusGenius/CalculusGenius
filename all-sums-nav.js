// =========================================
// CALCULUS — ALL SUMS NAVIGATION
// =========================================

(function () {

    function addAllSumsLink() {

        // Prevent duplicates
        if (
            document.querySelector(
                'a[href="all-sums.html"]'
            )
        ) {
            return;
        }

        /*
         * Try to find the existing navigation.
         * We intentionally don't modify the existing
         * navigation HTML directly.
         */

        const navs = document.querySelectorAll(
            "nav"
        );

        if (!navs.length) {
            return;
        }

        navs.forEach(nav => {

            // Don't add it twice to the same nav
            if (
                nav.querySelector(
                    'a[href="all-sums.html"]'
                )
            ) {
                return;
            }

            const link =
                document.createElement("a");

            link.href = "all-sums.html";
            link.textContent = "All Sums";

            nav.appendChild(link);

        });
    }


    // Run when the page is ready
    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            addAllSumsLink
        );

    } else {

        addAllSumsLink();

    }

})();
