(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const buttons = Array.from(carousel.querySelectorAll('[data-slide-go]'));
        let active = 0;

        const showSlide = function (index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            buttons.forEach(function (button, buttonIndex) {
                button.classList.toggle('is-active', buttonIndex === active);
            });
        };

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                showSlide(Number(button.getAttribute('data-slide-go')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }
    }

    const inputs = Array.from(document.querySelectorAll('[data-search-input]'));
    const scopes = Array.from(document.querySelectorAll('[data-filter-scope]'));

    const filterCards = function (value) {
        const term = value.trim().toLowerCase();
        scopes.forEach(function (scope) {
            const cards = Array.from(scope.querySelectorAll('[data-filter-card]'));
            cards.forEach(function (card) {
                const text = card.getAttribute('data-filter-text') || '';
                card.classList.toggle('is-hidden', Boolean(term) && text.indexOf(term) === -1);
            });
        });
    };

    inputs.forEach(function (input) {
        input.addEventListener('input', function () {
            inputs.forEach(function (other) {
                if (other !== input) {
                    other.value = input.value;
                }
            });
            filterCards(input.value);
        });
    });

    Array.from(document.querySelectorAll('[data-filter-button]')).forEach(function (button) {
        button.addEventListener('click', function () {
            const value = button.getAttribute('data-filter-button') || '';
            inputs.forEach(function (input) {
                input.value = value;
            });
            filterCards(value);
        });
    });
})();

function initPlayer(source) {
    const video = document.querySelector('[data-player-video]');
    const layer = document.querySelector('[data-play-layer]');
    let prepared = false;

    if (!video) {
        return;
    }

    const prepare = function () {
        if (prepared) {
            return;
        }
        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                maxBufferLength: 32,
                enableWorker: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    };

    const start = function () {
        prepare();
        video.controls = true;
        if (layer) {
            layer.classList.add('is-hidden');
        }
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (layer) {
                    layer.classList.remove('is-hidden');
                }
            });
        }
    };

    if (layer) {
        layer.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
}
