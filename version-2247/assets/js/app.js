(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll(".site-search-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");
            if (!input) {
                return;
            }
            var value = input.value.trim();
            if (value.length === 0) {
                event.preventDefault();
                window.location.href = "./search.html";
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (slides.length === 0) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function resetHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        startHero();
    }

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(current - 1);
            resetHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(current + 1);
            resetHero();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            var index = Number(dot.getAttribute("data-hero-dot"));
            showSlide(index);
            resetHero();
        });
    });

    startHero();

    var localSearch = document.getElementById("localSearch");
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-container] .movie-card, [data-card-container] .compact-card"));
    var activeFilter = "all";

    function getQueryValue() {
        var params = new URLSearchParams(window.location.search);
        return params.get("q") || "";
    }

    function applyFilters() {
        var query = localSearch ? localSearch.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
            var text = (card.getAttribute("data-search") || "").toLowerCase();
            var genre = (card.getAttribute("data-genre") || "").toLowerCase();
            var type = (card.getAttribute("data-type") || "").toLowerCase();
            var filter = activeFilter.toLowerCase();
            var matchesQuery = query === "" || text.indexOf(query) !== -1;
            var matchesFilter = filter === "all" || text.indexOf(filter) !== -1 || genre.indexOf(filter) !== -1 || type.indexOf(filter) !== -1;
            card.classList.toggle("is-hidden", !(matchesQuery && matchesFilter));
        });
    }

    if (localSearch) {
        var q = getQueryValue();
        if (q) {
            localSearch.value = q;
        }
        localSearch.addEventListener("input", applyFilters);
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            chips.forEach(function (item) {
                item.classList.remove("is-active");
            });
            chip.classList.add("is-active");
            activeFilter = chip.getAttribute("data-filter") || "all";
            applyFilters();
        });
    });

    applyFilters();
})();
