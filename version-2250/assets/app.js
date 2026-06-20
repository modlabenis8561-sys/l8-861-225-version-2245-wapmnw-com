(function () {
  var ready = function (callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  };

  var escapeText = function (value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  var initMenu = function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  };

  var initQuickSearch = function () {
    var forms = document.querySelectorAll('[data-quick-search]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = './search.html';
        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  };

  var initHero = function () {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer;
    var setActive = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    };
    var start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setActive(active + 1);
      }, 5200);
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setActive(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        setActive(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        setActive(active + 1);
        start();
      });
    }
    setActive(0);
    start();
  };

  var initPlayer = function () {
    var frame = document.querySelector('[data-player]');
    if (!frame) {
      return;
    }
    var video = frame.querySelector('[data-player-video]');
    var button = frame.querySelector('[data-player-button]');
    var stream = frame.getAttribute('data-stream');
    var hlsInstance = null;
    var loaded = false;
    if (!video || !stream) {
      return;
    }
    var play = function () {
      if (loaded) {
        video.play().catch(function () {});
        return;
      }
      loaded = true;
      frame.classList.add('is-playing');
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            hlsInstance.destroy();
            hlsInstance = null;
            video.src = stream;
            video.play().catch(function () {});
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      } else {
        video.src = stream;
        video.play().catch(function () {});
      }
    };
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
    }
    frame.addEventListener('click', function (event) {
      if (event.target === video && !video.paused) {
        return;
      }
      play();
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  var cardTemplate = function (item) {
    var meta = [item.year, item.region, item.type].filter(Boolean).join(' · ');
    var tags = String(item.tags || item.genre || item.category || '').split(/[,，/、\s]+/).filter(Boolean).slice(0, 3).map(function (tag) {
      return '<span>' + escapeText(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeText(item.url) + '" aria-label="' + escapeText(item.title) + ' 在线观看">',
      '<img src="' + escapeText(item.cover) + '" alt="' + escapeText(item.title) + '" loading="lazy">',
      '<span class="quality-badge">HD</span>',
      '<span class="play-badge">▶</span>',
      '</a>',
      '<div class="card-content">',
      '<div class="card-meta">' + escapeText(meta) + '</div>',
      '<h3><a href="' + escapeText(item.url) + '">' + escapeText(item.title) + '</a></h3>',
      '<p>' + escapeText(item.oneLine || item.genre || item.category || '') + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  };

  var initSearchPage = function () {
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var button = document.querySelector('[data-search-button]');
    var category = document.querySelector('[data-search-category]');
    var year = document.querySelector('[data-search-year]');
    var summary = document.querySelector('[data-search-summary]');
    var items = window.SEARCH_ITEMS || [];
    if (!input || !results || !items.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    var render = function () {
      var q = input.value.trim().toLowerCase();
      var cat = category ? category.value : '';
      var y = year ? year.value : '';
      var filtered = items.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.genre, item.tags, item.oneLine, item.category, item.year].join(' ').toLowerCase();
        if (q && haystack.indexOf(q) === -1) {
          return false;
        }
        if (cat && item.category !== cat) {
          return false;
        }
        if (y && item.year !== y) {
          return false;
        }
        return true;
      }).slice(0, 120);
      if (summary) {
        summary.textContent = filtered.length ? '为你匹配到相关影片' : '暂未匹配到结果';
      }
      results.innerHTML = filtered.length ? filtered.map(cardTemplate).join('') : '<div class="content-card"><h2>暂无结果</h2><p>可以尝试更换片名、地区、题材或标签继续搜索。</p></div>';
    };
    input.addEventListener('input', render);
    if (button) {
      button.addEventListener('click', render);
    }
    if (category) {
      category.addEventListener('change', render);
    }
    if (year) {
      year.addEventListener('change', render);
    }
    render();
  };

  ready(function () {
    initMenu();
    initQuickSearch();
    initHero();
    initPlayer();
    initSearchPage();
  });
})();
