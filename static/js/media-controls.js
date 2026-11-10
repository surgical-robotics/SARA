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
    const frame = card.querySelector('.video-frame');
    const seek = document.createElement('input');
    seek.type = 'range';
    seek.className = 'media-seek';
    seek.min = '0';
    seek.max = '0';
    seek.step = '0.1';
    seek.value = '0';
    seek.disabled = true;
    seek.setAttribute('aria-label', `Playback position: ${title}`);
    bar.append(seek);

    let scrubbing = false;
    let touchInteraction = false;
    let controlsTimer;

    function formatTime(seconds) {
      const total = Math.floor(Math.max(0, seconds));
      return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
    }

    function updateProgress() {
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      seek.disabled = duration === 0;
      seek.max = String(duration);
      const position = scrubbing ? Number(seek.value) : video.currentTime;
      const current = Math.min(duration, Math.max(0, position || 0));
      if (!scrubbing) seek.value = String(current);
      seek.style.setProperty('--progress', `${duration ? current / duration * 100 : 0}%`);
      seek.setAttribute('aria-valuetext', `${formatTime(current)} of ${formatTime(duration)}`);
    }

    // The native range supports dragging, tapping, and keyboard seeking.
    // Use source-video seconds so playback speed and phase annotations stay aligned.
    seek.addEventListener('input', () => {
      const value = Number(seek.value);
      if (!seek.disabled && Number.isFinite(value)) {
        video.currentTime = Math.min(video.duration, Math.max(0, value));
        updateProgress();
      }
    });
    seek.addEventListener('pointerdown', () => {
      scrubbing = !seek.disabled;
      frame.classList.toggle('is-seeking', scrubbing);
    });

    function showTouchControls() {
      frame.classList.add('controls-visible');
      clearTimeout(controlsTimer);
      controlsTimer = setTimeout(() => {
        if (!scrubbing) frame.classList.remove('controls-visible');
      }, 3000);
    }

    function finishSeek() {
      if (!scrubbing) return;
      scrubbing = false;
      frame.classList.remove('is-seeking');
      updateProgress();
      if (touchInteraction) showTouchControls();
    }
    seek.addEventListener('change', finishSeek);
    seek.addEventListener('blur', finishSeek);
    document.addEventListener('pointerup', finishSeek);
    document.addEventListener('pointercancel', finishSeek);
    frame.addEventListener('pointerdown', event => {
      touchInteraction = event.pointerType === 'touch' || event.pointerType === 'pen';
      if (touchInteraction) showTouchControls();
    }, { passive: true });

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'media-toggle';
    toggle.textContent = 'Play';
    toggle.setAttribute('aria-label', `Play ${title}`);
    bar.append(toggle);

    function update() {
      const playing = !video.paused && !video.ended;
      toggle.textContent = playing ? 'Ⅱ' : '▶';
      toggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${title}`);
      toggle.title = playing ? 'Pause' : 'Play';
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
    for (const event of ['loadedmetadata', 'durationchange', 'timeupdate', 'seeking', 'seeked', 'emptied', 'ended']) {
      video.addEventListener(event, updateProgress);
    }
    frame.append(bar);
    video.controls = false;
    update();
    updateProgress();
  }
})();
