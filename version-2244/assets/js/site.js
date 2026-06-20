const root = document.body.dataset.root || './';

function initMobileMenu() {
  const button = document.querySelector('[data-menu-toggle]');
  if (!button) {
    return;
  }

  button.addEventListener('click', () => {
    document.body.classList.toggle('menu-open');
  });
}

function initHeaderSearch() {
  const forms = document.querySelectorAll('[data-search-form]');

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      const target = form.getAttribute('action') || `${root}search.html`;
      const glue = target.includes('?') ? '&' : '?';
      window.location.href = query ? `${target}${glue}q=${encodeURIComponent(query)}` : target;
    });
  });
}

function initHeroSlider() {
  const slider = document.querySelector('[data-hero-slider]');
  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
  let activeIndex = 0;
  let timer = null;

  function showSlide(nextIndex) {
    if (slides.length === 0) {
      return;
    }

    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === activeIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex);
    });
  }

  function startAutoPlay() {
    stopAutoPlay();
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
  }

  function stopAutoPlay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      startAutoPlay();
    });
  });

  slider.addEventListener('mouseenter', stopAutoPlay);
  slider.addEventListener('mouseleave', startAutoPlay);

  showSlide(0);
  startAutoPlay();
}

function normalizeText(value) {
  return (value || '').toString().toLowerCase().trim();
}

function getCardHaystack(card) {
  return [
    card.dataset.title,
    card.dataset.region,
    card.dataset.type,
    card.dataset.year,
    card.dataset.genres,
    card.dataset.tags,
    card.dataset.id
  ].map(normalizeText).join(' ');
}

function initFilterSections() {
  const sections = document.querySelectorAll('[data-filter-section]');

  sections.forEach((section) => {
    const input = section.querySelector('[data-grid-search]');
    const sort = section.querySelector('[data-grid-sort]');
    const grid = section.querySelector('[data-grid]');
    const count = section.querySelector('[data-visible-count]');

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll('[data-card]'));
    const originalOrder = new Map(cards.map((card, index) => [card, index]));

    function apply() {
      const keyword = normalizeText(input ? input.value : '');
      const sortValue = sort ? sort.value : 'default';
      let visibleCards = cards.filter((card) => !keyword || getCardHaystack(card).includes(keyword));

      visibleCards.sort((a, b) => {
        if (sortValue === 'year-desc') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (sortValue === 'year-asc') {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        }
        if (sortValue === 'title-asc') {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        }
        return originalOrder.get(a) - originalOrder.get(b);
      });

      cards.forEach((card) => card.classList.add('is-hidden'));
      visibleCards.forEach((card) => {
        card.classList.remove('is-hidden');
        grid.appendChild(card);
      });

      if (count) {
        count.textContent = visibleCards.length.toString();
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (sort) {
      sort.addEventListener('change', apply);
    }

    apply();
  });
}

function initImageFallbacks() {
  const images = document.querySelectorAll('img');

  images.forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('is-missing');
      const parent = image.closest('.image-fallback');
      if (parent) {
        parent.classList.add('poster-missing');
      }
    }, { once: true });
  });
}

initMobileMenu();
initHeaderSearch();
initHeroSlider();
initFilterSections();
initImageFallbacks();
