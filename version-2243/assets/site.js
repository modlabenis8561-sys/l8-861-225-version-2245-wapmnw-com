(function () {
    const qs = (selector, root = document) => root.querySelector(selector);
    const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function bindMenu() {
        const button = qs('.menu-toggle');
        const panel = qs('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function bindHero() {
        const slides = qsa('.hero-slide');
        const dots = qsa('.hero-dot');
        if (!slides.length) {
            return;
        }
        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-go-slide') || 0));
                start();
            });
        });

        start();
    }

    function bindSearchForms() {
        qsa('.site-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                const input = qs('input[name="q"]', form);
                const value = input ? input.value.trim() : '';
                if (!value && document.body.classList.contains('search-page')) {
                    event.preventDefault();
                }
            });
        });
    }

    function filterCards(input, cards) {
        const term = normalize(input.value);
        cards.forEach(function (card) {
            const haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre')
            ].join(' '));
            const match = !term || haystack.indexOf(term) !== -1;
            card.style.display = match ? '' : 'none';
        });
    }

    function bindLocalFilters() {
        qsa('.page-filter').forEach(function (input) {
            const section = input.closest('section') || document;
            const cards = qsa('.movie-card', section);
            input.addEventListener('input', function () {
                filterCards(input, cards);
            });
        });
    }

    function bindSearchPage() {
        const input = qs('#search-page-input');
        const results = qs('#search-results');
        if (!input || !results) {
            return;
        }
        const cards = qsa('.movie-card', results);
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';
        input.value = query;
        filterCards(input, cards);
        input.addEventListener('input', function () {
            filterCards(input, cards);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        bindMenu();
        bindHero();
        bindSearchForms();
        bindLocalFilters();
        bindSearchPage();
    });
})();
