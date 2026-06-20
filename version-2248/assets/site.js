(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function bindSearchForms() {
    document.querySelectorAll(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q'], input[type='search']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        window.location.href = query ? target + "?q=" + encodeURIComponent(query) : target;
      });
    });
  }

  function bindMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function bindFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var keyword = scope.querySelector("[data-filter-keyword]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var category = scope.querySelector("[data-filter-category]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var incoming = params.get("q") || "";

      if (keyword && incoming) {
        keyword.value = incoming;
      }

      function apply() {
        var k = normalize(keyword && keyword.value);
        var t = normalize(type && type.value);
        var y = normalize(year && year.value);
        var c = normalize(category && category.value);
        var visible = 0;

        cards.forEach(function (card) {
          var cardText = normalize(card.getAttribute("data-text"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var matched = true;

          if (k && cardText.indexOf(k) === -1) {
            matched = false;
          }
          if (t && cardType.indexOf(t) === -1) {
            matched = false;
          }
          if (y && cardYear !== y) {
            matched = false;
          }
          if (c && cardCategory !== c) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [keyword, type, year, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  window.runSite = function () {
    ready(function () {
      bindSearchForms();
      bindMobileMenu();
      bindHero();
      bindFilters();
    });
  };

  window.activatePlayer = function (streamUrl) {
    ready(function () {
      var video = document.querySelector("[data-player-video]");
      var start = document.querySelector("[data-player-start]");
      if (!video || !streamUrl) {
        return;
      }
      var attached = false;
      var hlsInstance = null;

      function attachStream() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              }
            }
          });
        } else {
          video.src = streamUrl;
        }
      }

      function begin() {
        attachStream();
        if (start) {
          start.classList.add("is-hidden");
        }
        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
          playAttempt.catch(function () {
            if (start) {
              start.classList.remove("is-hidden");
            }
          });
        }
      }

      if (start) {
        start.addEventListener("click", begin);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
      video.addEventListener("play", function () {
        if (start) {
          start.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (start && video.currentTime === 0) {
          start.classList.remove("is-hidden");
        }
      });
    });
  };
}());
