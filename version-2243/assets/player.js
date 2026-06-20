(function () {
    window.startPlayer = function (sourceUrl) {
        const video = document.getElementById('main-video');
        const cover = document.getElementById('player-cover');
        const button = document.getElementById('player-button');
        const Hls = window.Hls;
        let attached = false;
        let hls = null;

        if (!video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                return;
            }

            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = sourceUrl;
        }

        function begin() {
            attachSource();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', begin);
        }

        if (button) {
            button.addEventListener('click', begin);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    };
})();
