function getQueryParameter(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

function escapeHtml(value) {
  return (value || '').toString().replace(/[&<>"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[character]));
}

function normalize(value) {
  return (value || '').toString().toLowerCase().trim();
}

function buildCard(movie) {
  const tags = (movie.tags || movie.genres || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  return `
    <a class="movie-card" href="${movie.url}" data-card>
      <div class="movie-poster image-fallback">
        <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="poster-play">播放</span>
      </div>
      <div class="movie-card-body">
        <div class="movie-meta-line">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <h3>${escapeHtml(movie.title)}</h3>
        <p>${escapeHtml(movie.one_line)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </a>
  `;
}

async function initSearchPage() {
  const form = document.querySelector('[data-search-page-form]');
  const input = form ? form.querySelector('input[name="q"]') : null;
  const results = document.querySelector('[data-search-results]');
  const count = document.querySelector('[data-search-count]');
  const empty = document.querySelector('[data-search-empty]');
  const sort = document.querySelector('[data-search-sort]');
  const keywordButtons = document.querySelectorAll('[data-search-keyword]');

  if (!form || !input || !results) {
    return;
  }

  const response = await fetch('./data/search-index.json');
  const movies = await response.json();
  input.value = getQueryParameter('q');

  function score(movie, query) {
    if (!query) {
      return 1;
    }

    const title = normalize(movie.title);
    const haystack = normalize([
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      (movie.genres || []).join(' '),
      (movie.tags || []).join(' '),
      movie.one_line,
      movie.summary
    ].join(' '));

    if (title === query) {
      return 100;
    }
    if (title.includes(query)) {
      return 80;
    }
    if (haystack.includes(query)) {
      return 40;
    }
    return 0;
  }

  function render() {
    const query = normalize(input.value);
    const sortValue = sort ? sort.value : 'relevance';
    let matched = movies
      .map((movie) => ({ movie, score: score(movie, query) }))
      .filter((item) => !query || item.score > 0);

    if (sortValue === 'year-desc') {
      matched.sort((a, b) => Number(b.movie.year || 0) - Number(a.movie.year || 0));
    } else if (sortValue === 'year-asc') {
      matched.sort((a, b) => Number(a.movie.year || 0) - Number(b.movie.year || 0));
    } else if (sortValue === 'title-asc') {
      matched.sort((a, b) => (a.movie.title || '').localeCompare(b.movie.title || '', 'zh-Hans-CN'));
    } else {
      matched.sort((a, b) => b.score - a.score || Number(b.movie.year || 0) - Number(a.movie.year || 0));
    }

    const visible = matched.slice(0, 120).map((item) => item.movie);
    results.innerHTML = visible.map(buildCard).join('');

    if (count) {
      count.textContent = matched.length.toString();
    }

    if (empty) {
      empty.hidden = matched.length > 0;
    }

    results.querySelectorAll('img').forEach((image) => {
      image.addEventListener('error', () => {
        image.classList.add('is-missing');
        const parent = image.closest('.image-fallback');
        if (parent) {
          parent.classList.add('poster-missing');
        }
      }, { once: true });
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const url = query ? `search.html?q=${encodeURIComponent(query)}` : 'search.html';
    window.history.replaceState({}, '', url);
    render();
  });

  if (sort) {
    sort.addEventListener('change', render);
  }

  keywordButtons.forEach((button) => {
    button.addEventListener('click', () => {
      input.value = button.dataset.searchKeyword || '';
      form.dispatchEvent(new Event('submit'));
    });
  });

  render();
}

initSearchPage();
