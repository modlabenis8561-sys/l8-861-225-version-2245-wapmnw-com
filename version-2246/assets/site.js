(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMobileNav() {
        var toggle = document.querySelector('.mobile-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) return;
        toggle.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        if (slides.length < 2) return;
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function setSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) clearInterval(timer);
            timer = setInterval(function () {
                setSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                setSlide(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                setSlide(i);
                restart();
            });
        });
        restart();
    }

    function setupFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
        grids.forEach(function (grid) {
            var root = grid.closest('[data-filter-scope]') || document;
            var input = root.querySelector('[data-filter-input]');
            var chips = Array.prototype.slice.call(root.querySelectorAll('[data-filter-chip]'));
            var empty = root.querySelector('[data-empty-state]');
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
            var active = '';

            function apply() {
                var query = normalize(input ? input.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchChip = !active || text.indexOf(active) !== -1;
                    var show = matchQuery && matchChip;
                    card.classList.toggle('is-hidden', !show);
                    if (show) visible += 1;
                });
                if (empty) empty.classList.toggle('is-visible', visible === 0);
            }

            if (input) input.addEventListener('input', apply);
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    chips.forEach(function (item) { item.classList.remove('is-active'); });
                    chip.classList.add('is-active');
                    active = normalize(chip.getAttribute('data-filter-chip'));
                    apply();
                });
            });
            apply();
        });
    }

    function cardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<a class="movie-card" href="' + movie.url + '" data-card data-search="' + escapeAttr(movie.search) + '">' +
            '<span class="movie-poster"><img src="' + movie.image + '" alt="' + escapeAttr(movie.title) + '" loading="lazy"><span class="poster-shade"></span><span class="year-badge">' + escapeHtml(movie.year) + '</span><span class="play-mark">▶</span></span>' +
            '<span class="movie-card-body"><strong>' + escapeHtml(movie.title) + '</strong><em>' + escapeHtml(movie.desc) + '</em><span class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</span><span class="tag-list">' + tags + '</span></span>' +
            '</a>';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>]/g, function (char) {
            return {'&': '&amp;', '<': '&lt;', '>': '&gt;'}[char];
        });
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/"/g, '&quot;');
    }

    function setupSearchPage() {
        var container = document.querySelector('[data-search-results]');
        if (!container || !window.MOVIE_INDEX) return;
        var params = new URLSearchParams(window.location.search);
        var q = normalize(params.get('q') || '');
        var title = document.querySelector('[data-search-title]');
        var input = document.querySelector('[data-search-page-input]');
        if (input) input.value = params.get('q') || '';
        var source = window.MOVIE_INDEX;
        var results = q ? source.filter(function (movie) {
            return normalize(movie.search).indexOf(q) !== -1;
        }) : source.slice(0, 96);
        if (title) title.textContent = q ? '相关影片' : '热门检索';
        container.innerHTML = results.slice(0, 240).map(cardHtml).join('') || '<div class="empty-state is-visible">未找到相关影片</div>';
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
