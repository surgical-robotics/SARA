'use strict';

// Use consistent controls without exposing volume, download, or playback speed.
(() => {
  const clock = seconds => {
    if (!Number.isFinite(seconds)) return '0:00';
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  };
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
    const seek = document.createElement('input');
    seek.type = 'range';
    seek.min = '0';
    seek.max = '0';
    seek.step = '0.01';
    seek.value = '0';
    seek.disabled = true;
    seek.setAttribute('aria-label', `Seek ${title}`);
    const time = document.createElement('span');
    time.className = 'media-time';
    bar.append(toggle, seek, time);

    function update() {
      const playing = !video.paused && !video.ended;
      toggle.textContent = playing ? 'Pause' : 'Play';
      toggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${title}`);
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      seek.disabled = duration <= 0;
      seek.max = String(duration);
      seek.value = String(video.currentTime);
      seek.setAttribute('aria-valuetext', `${clock(video.currentTime)} of ${clock(duration)}`);
      time.textContent = `${clock(video.currentTime)} / ${clock(duration)}`;
    }
    toggle.addEventListener('click', async () => {
      if (video.paused) {
        try { await video.play(); } catch { /* Keep the Play control available for retry. */ }
      } else {
        video.pause();
      }
      update();
    });
    seek.addEventListener('input', () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Number(seek.value);
        update();
      }
    });
    if (document.fullscreenEnabled && card.requestFullscreen) {
      const fullscreen = document.createElement('button');
      fullscreen.type = 'button';
      fullscreen.className = 'media-fullscreen';
      fullscreen.textContent = '⛶';
      fullscreen.setAttribute('aria-label', `Fullscreen ${title}`);
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
    for (const event of ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'ended', 'seeked']) {
      video.addEventListener(event, update);
    }
    card.querySelector('.video-frame').after(bar);
    video.controls = false;
    update();
  }
})();
