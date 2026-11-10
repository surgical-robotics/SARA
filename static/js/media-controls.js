'use strict';

// Use consistent controls without exposing volume, download, or playback speed.
(() => {
  for (const card of document.querySelectorAll('.video-card')) {
    const video = card.querySelector('video');
    const title = video.getAttribute('aria-label') || 'Demonstration';
    const bar = document.createElement('div');
    bar.className = 'media-controls';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', `${title} playback controls`);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'media-toggle';
    toggle.textContent = 'Play';
    toggle.setAttribute('aria-label', `Play ${title}`);
    bar.append(toggle);
    const frame = card.querySelector('.video-frame');

    function update() {
      const playing = !video.paused && !video.ended;
      toggle.textContent = playing ? 'Ⅱ' : '▶';
      toggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${title}`);
      toggle.title = playing ? 'Pause' : 'Play';
      frame.classList.toggle('is-paused', !playing);
    }
    toggle.addEventListener('click', async () => {
      if (video.paused) {
        try { await video.play(); } catch { /* Keep the Play control available for retry. */ }
      } else {
        video.pause();
      }
      update();
    });
    if (document.fullscreenEnabled && card.requestFullscreen) {
      const fullscreen = document.createElement('button');
      fullscreen.type = 'button';
      fullscreen.className = 'media-fullscreen';
      fullscreen.textContent = '⛶';
      fullscreen.setAttribute('aria-label', `Fullscreen ${title}`);
      fullscreen.title = 'Fullscreen';
      fullscreen.addEventListener('click', async () => {
        try {
          if (document.fullscreenElement === card) await document.exitFullscreen();
          else await card.requestFullscreen();
        } catch { /* Fullscreen can be denied by the browser or embedding policy. */ }
      });
      document.addEventListener('fullscreenchange', () => {
        fullscreen.setAttribute('aria-label', `${document.fullscreenElement === card ? 'Exit fullscreen' : 'Fullscreen'} ${title}`);
      });
      bar.append(fullscreen);
    }
    for (const event of ['play', 'pause', 'ended']) {
      video.addEventListener(event, update);
    }
    frame.append(bar);
    video.controls = false;
    update();
  }
})();
