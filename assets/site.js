(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterRoot = document.querySelector("[data-filter-root]");
  if (filterRoot) {
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
    var keywordInput = document.querySelector("[data-page-search]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var typeSelect = document.querySelector("[data-type-filter]");
    var noResult = document.querySelector("[data-no-result]");
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get("q") || "";

    if (keywordInput && initialKeyword) {
      keywordInput.value = initialKeyword;
    }

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    function filterCards() {
      var keyword = normalize(keywordInput ? keywordInput.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year) && (!type || cardType === type);
        card.style.display = matched ? "" : "none";
        if (matched) {
          visibleCount += 1;
        }
      });

      if (noResult) {
        noResult.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    if (keywordInput) {
      keywordInput.addEventListener("input", filterCards);
    }

    document.querySelectorAll(".inline-search button").forEach(function (button) {
      button.addEventListener("click", filterCards);
    });

    if (yearSelect) {
      yearSelect.addEventListener("change", filterCards);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", filterCards);
    }

    filterCards();
  }
})();

function setupMoviePlayer(source) {
  var shell = document.querySelector("[data-player]");
  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var cover = shell.querySelector(".player-cover");
  var button = shell.querySelector(".play-button");
  var started = false;

  function beginPlayback() {
    if (started || !video) {
      return;
    }

    started = true;
    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.setAttribute("controls", "controls");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = source;
    video.play().catch(function () {});
  }

  shell.addEventListener("click", function (event) {
    if (started && event.target && event.target.closest("video")) {
      return;
    }
    beginPlayback();
  });

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      beginPlayback();
    });
  }
}
