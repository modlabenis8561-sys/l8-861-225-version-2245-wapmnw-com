function setupMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var source = options.source;
    var hls = null;
    var loaded = false;

    if (!video || !overlay || !source) {
        return;
    }

    function start() {
        overlay.classList.add("is-hidden");

        if (!loaded) {
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    overlay.addEventListener("click", start);

    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            start();
        }
    });

    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });

    video.addEventListener("ended", function () {
        overlay.classList.remove("is-hidden");
    });
}
