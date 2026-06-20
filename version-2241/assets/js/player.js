(function () {
  const players = Array.from(document.querySelectorAll('[data-stream]'));

  players.forEach(function (root) {
    const video = root.querySelector('video');
    const button = root.querySelector('.player-start');
    const error = root.querySelector('.player-error');
    const stream = root.getAttribute('data-stream');
    let hls = null;
    let loaded = false;

    function showError(message) {
      if (error) {
        error.textContent = message;
        error.classList.add('is-visible');
      }
    }

    function loadStream() {
      if (!video || !stream || loaded) {
        return;
      }

      loaded = true;
      video.controls = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            showError('网络连接不稳定，正在尝试重新连接');
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            showError('视频加载异常，正在尝试恢复');
          } else {
            showError('视频暂时无法播放，请刷新重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        showError('视频暂时无法播放，请刷新重试');
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }

      loadStream();
      root.classList.add('is-ready');

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showError('点击视频区域后可继续播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
