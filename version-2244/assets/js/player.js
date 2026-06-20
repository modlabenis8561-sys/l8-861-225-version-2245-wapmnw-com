import { H as Hls } from './video-vendor-dru42stk.js';

function initPlayers() {
  const players = document.querySelectorAll('[data-player]');

  players.forEach((stage) => {
    const video = stage.querySelector('video[data-hls-src]');
    const startButton = stage.querySelector('[data-player-start]');
    const status = stage.querySelector('[data-player-status]');

    if (!video || !startButton) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function attachSource() {
      const source = video.dataset.hlsSrc;
      if (!source) {
        setStatus('未找到播放源');
        return Promise.resolve(false);
      }

      if (video.dataset.loaded === 'true') {
        return Promise.resolve(true);
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.dataset.loaded = 'true';
        return Promise.resolve(true);
      }

      if (Hls && Hls.isSupported()) {
        return new Promise((resolve) => {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          video._hlsInstance = hls;

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.dataset.loaded = 'true';
            setStatus('播放源已就绪');
            resolve(true);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data && data.fatal) {
              setStatus('播放源加载失败，请稍后重试');
              try {
                hls.destroy();
              } catch (error) {
                console.warn(error);
              }
              resolve(false);
            }
          });
        });
      }

      setStatus('当前浏览器不支持 HLS 播放');
      return Promise.resolve(false);
    }

    async function playVideo() {
      setStatus('正在加载播放源...');
      const ready = await attachSource();
      if (!ready) {
        return;
      }

      try {
        await video.play();
        stage.classList.add('is-playing');
        setStatus('');
      } catch (error) {
        setStatus('请再次点击播放按钮');
      }
    }

    startButton.addEventListener('click', playVideo);
    video.addEventListener('play', () => stage.classList.add('is-playing'));
    video.addEventListener('pause', () => stage.classList.remove('is-playing'));
  });
}

initPlayers();
