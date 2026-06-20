(function () {
    window.initPlayer = function (source) {
        var video = document.getElementById('movieVideo');
        var cover = document.querySelector('.player-cover');
        var button = document.querySelector('[data-player-button]');
        var prepared = false;
        var hls = null;

        function prepare() {
            if (!video || prepared) return;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.load();
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
                video.load();
            }
            prepared = true;
        }

        function play() {
            prepare();
            if (cover) cover.classList.add('is-hidden');
            if (video) {
                video.controls = true;
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {});
                }
            }
        }

        if (button) button.addEventListener('click', play);
        if (cover) cover.addEventListener('click', play);
        if (video) {
            video.addEventListener('click', function () {
                if (!prepared) play();
            });
            video.addEventListener('play', function () {
                if (cover) cover.classList.add('is-hidden');
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hls) hls.destroy();
        });
    };
})();
