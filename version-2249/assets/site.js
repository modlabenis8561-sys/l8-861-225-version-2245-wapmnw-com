(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initSpotlight() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-spotlight-slide]"));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-slide-dot]"));
    var prev = document.querySelector("[data-spotlight-prev]");
    var next = document.querySelector("[data-spotlight-next]");
    var progress = document.querySelector("[data-spotlight-progress]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
      if (progress) {
        progress.style.width = ((index + 1) / slides.length * 100) + "%";
      }
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-dot")) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    show(0);
    start();
  }

  function initTabs() {
    var wrap = document.querySelector("[data-home-tabs]");
    if (!wrap) {
      return;
    }
    var buttons = Array.prototype.slice.call(wrap.querySelectorAll("[data-tab-target]"));
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-tab-panel]"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var target = button.getAttribute("data-tab-target");
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === target);
        });
      });
    });
  }

  function initCatalogFilter() {
    var wrap = document.querySelector("[data-catalog-filter]");
    var grid = document.querySelector("[data-catalog-grid]");
    if (!wrap || !grid) {
      return;
    }
    var year = wrap.querySelector("[data-filter-year]");
    var type = wrap.querySelector("[data-filter-type]");
    var reset = wrap.querySelector("[data-filter-reset]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function apply() {
      var y = year ? year.value : "";
      var t = type ? type.value : "";
      cards.forEach(function (card) {
        var matchYear = !y || card.getAttribute("data-year") === y;
        var matchType = !t || card.getAttribute("data-type") === t;
        card.classList.toggle("is-hidden", !(matchYear && matchType));
      });
    }

    if (year) {
      year.addEventListener("change", apply);
    }
    if (type) {
      type.addEventListener("change", apply);
    }
    if (reset) {
      reset.addEventListener("click", function () {
        if (year) {
          year.value = "";
        }
        if (type) {
          type.value = "";
        }
        apply();
      });
    }
  }

  function movieCard(movie) {
    return "" +
      "<article class=\"movie-card\">" +
      "<a class=\"card-cover\" href=\"" + escapeHtml(movie.url) + "\">" +
      "<img src=\"" + escapeHtml(movie.poster) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>" +
      "<span class=\"play-badge\">▶</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<a href=\"" + escapeHtml(movie.url) + "\"><h3>" + escapeHtml(movie.title) + "</h3></a>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "</div>" +
      "</article>";
  }

  function initSearch() {
    var mount = document.getElementById("searchResults");
    if (!mount || !window.siteMovies) {
      return;
    }
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var category = document.querySelector("[data-search-category]");
    var year = document.querySelector("[data-search-year]");
    var type = document.querySelector("[data-search-type]");
    var params = new URLSearchParams(window.location.search);
    if (input) {
      input.value = params.get("q") || "";
    }

    function render() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var c = category ? category.value : "";
      var y = year ? year.value.trim() : "";
      var t = type ? type.value.trim().toLowerCase() : "";
      var results = window.siteMovies.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.year, movie.oneLine].join(" ").toLowerCase();
        var okQ = !q || text.indexOf(q) !== -1;
        var okC = !c || movie.category === c;
        var okY = !y || String(movie.year).indexOf(y) !== -1;
        var okT = !t || String(movie.type).toLowerCase().indexOf(t) !== -1 || String(movie.genre).toLowerCase().indexOf(t) !== -1;
        return okQ && okC && okY && okT;
      }).slice(0, 240);
      if (!results.length) {
        mount.innerHTML = "<div class=\"empty-state\">没有找到匹配内容</div>";
        return;
      }
      mount.innerHTML = results.map(movieCard).join("");
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render();
      });
    }
    [input, category, year, type].forEach(function (el) {
      if (el) {
        el.addEventListener("input", render);
        el.addEventListener("change", render);
      }
    });
    render();
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".video-shell"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".video-cover");
      var url = shell.getAttribute("data-video-url");
      var prepared = false;
      var hls;

      function prepare() {
        if (prepared || !video || !url) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        prepare();
        shell.classList.add("is-playing");
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0) {
            shell.classList.remove("is-playing");
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initSpotlight();
    initTabs();
    initCatalogFilter();
    initSearch();
    initPlayers();
  });
}());
