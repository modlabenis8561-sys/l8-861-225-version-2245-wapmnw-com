(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === heroIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === heroIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  const searchInput = document.getElementById('site-search');
  const searchResults = document.getElementById('search-results');

  function closeSearch() {
    if (searchResults) {
      searchResults.classList.remove('is-open');
      searchResults.innerHTML = '';
    }
  }

  if (searchInput && searchResults && typeof SITE_INDEX !== 'undefined') {
    searchInput.addEventListener('input', function () {
      const keyword = searchInput.value.trim().toLowerCase();

      if (keyword.length < 1) {
        closeSearch();
        return;
      }

      const matched = SITE_INDEX.filter(function (item) {
        const text = [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(' '), item.oneLine]
          .join(' ')
          .toLowerCase();
        return text.indexOf(keyword) !== -1;
      }).slice(0, 12);

      searchResults.innerHTML = matched.length
        ? matched.map(function (item) {
            return '<a class="search-item" href="' + item.url + '">' +
              '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
              '<span><strong>' + escapeHtml(item.title) + '</strong><em>' +
              escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) +
              '</em></span></a>';
          }).join('')
        : '<div class="search-item"><span><strong>暂无匹配内容</strong><em>换个关键词试试</em></span></div>';

      searchResults.classList.add('is-open');
    });

    document.addEventListener('click', function (event) {
      if (!searchResults.contains(event.target) && event.target !== searchInput) {
        closeSearch();
      }
    });
  }

  const catalogInput = document.querySelector('[data-catalog-search]');
  const catalogYear = document.querySelector('[data-catalog-year]');
  const cards = Array.from(document.querySelectorAll('[data-title]'));
  const empty = document.querySelector('[data-catalog-empty]');

  function filterCatalog() {
    const keyword = catalogInput ? catalogInput.value.trim().toLowerCase() : '';
    const year = catalogYear ? catalogYear.value : '';
    let visible = 0;

    cards.forEach(function (card) {
      const text = [card.dataset.title, card.dataset.genre, card.dataset.tags, card.dataset.year]
        .join(' ')
        .toLowerCase();
      const okKeyword = !keyword || text.indexOf(keyword) !== -1;
      const okYear = !year || card.dataset.year === year;
      const ok = okKeyword && okYear;

      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  if (catalogInput) {
    catalogInput.addEventListener('input', filterCatalog);
  }

  if (catalogYear) {
    catalogYear.addEventListener('change', filterCatalog);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
