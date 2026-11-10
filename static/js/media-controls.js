'use strict';

// Use consistent controls without exposing volume, download, or playback speed.
(() => {
  const hoverSupport = window.matchMedia('(hover: hover)');
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
    seek.step = '0.01';
    seek.value = '0';
    seek.disabled = true;
    seek.setAttribute('aria-label', `Playback position: ${title}`);
    bar.append(seek);
    const time = document.createElement('span');
    time.className = 'media-time';
    time.setAttribute('aria-hidden', 'true');
    bar.append(time);

    let scrubbing = false;
    let touchInteraction = false;
    let controlsTimer;
    let hovered = false;
    let keyboardFocused = false;
    let progressFrame = 0;

    function formatTime(seconds) {
      const total = Math.floor(Math.max(0, seconds));
      return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
    }

    function updateProgress() {
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      if (seek.disabled !== (duration === 0)) seek.disabled = duration === 0;
      if (seek.max !== String(duration)) seek.max = String(duration);
      const position = scrubbing ? Number(seek.value) : video.currentTime;
      const current = Math.min(duration, Math.max(0, position || 0));
      const displayedValue = Math.round(current * 100) / 100;
      if (!scrubbing && Number(seek.value) !== displayedValue) seek.value = String(displayedValue);
      seek.style.setProperty('--progress', `${duration ? current / duration * 100 : 0}%`);
      const currentText = formatTime(current);
      const durationText = duration ? formatTime(duration) : '--:--';
      const accessibleTime = `${currentText} of ${durationText}`;
      if (seek.getAttribute('aria-valuetext') !== accessibleTime) seek.setAttribute('aria-valuetext', accessibleTime);
      const displayTime = `${currentText} / ${durationText}`;
      if (time.textContent !== displayTime) time.textContent = displayTime;
    }

    // Smoothly follow the media clock while controls are visible, without running
    // an animation loop for all 34 hidden control bars.
    function controlsVisible() {
      return hovered || scrubbing || frame.classList.contains('controls-visible') || keyboardFocused;
    }
    function shouldAnimateProgress() {
      return !video.paused && !video.ended && !document.hidden && controlsVisible();
    }
    function animateProgress() {
      progressFrame = 0;
      if (controlsVisible()) updateProgress();
      if (shouldAnimateProgress()) progressFrame = requestAnimationFrame(animateProgress);
    }
    function syncProgressAnimation() {
      if (controlsVisible()) updateProgress();
      if (shouldAnimateProgress()) {
        if (!progressFrame) progressFrame = requestAnimationFrame(animateProgress);
      } else if (progressFrame) {
        cancelAnimationFrame(progressFrame);
        progressFrame = 0;
      }
    }
    frame.addEventListener('pointerenter', event => {
      hovered = hoverSupport.matches && event.pointerType !== 'touch';
      syncProgressAnimation();
    });
    frame.addEventListener('pointerleave', () => {
      hovered = false;
      syncProgressAnimation();
    });
    function updateKeyboardFocus() {
      keyboardFocused = Boolean(bar.querySelector(':focus-visible'));
      syncProgressAnimation();
    }
    bar.addEventListener('focusin', updateKeyboardFocus);
    bar.addEventListener('focusout', () => queueMicrotask(updateKeyboardFocus));
    document.addEventListener('visibilitychange', syncProgressAnimation);

    // The native range supports dragging, tapping, and keyboard seeking.
    // Use source-video seconds so playback speed and phase annotations stay aligned.
    function seekToValue() {
      const value = Number(seek.value);
      if (!seek.disabled && Number.isFinite(value)) {
        video.currentTime = Math.min(video.duration, Math.max(0, value));
        updateProgress();
      }
    }
    seek.addEventListener('input', seekToValue);
    seek.addEventListener('keydown', event => {
      if (seek.disabled) return;
      const steps = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -5, PageUp: 5 };
      let next = Number(seek.value) + steps[event.key];
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = video.duration;
      if (!Number.isFinite(next)) return;
      event.preventDefault();
      seek.value = String(Math.min(video.duration, Math.max(0, next)));
      seekToValue();
    });
    seek.addEventListener('pointerdown', () => {
      scrubbing = !seek.disabled;
      frame.classList.toggle('is-seeking', scrubbing);
      syncProgressAnimation();
    });

    function showTouchControls() {
      frame.classList.add('controls-visible');
      syncProgressAnimation();
      clearTimeout(controlsTimer);
      controlsTimer = setTimeout(() => {
        if (!scrubbing) {
          frame.classList.remove('controls-visible');
          syncProgressAnimation();
        }
      }, 3000);
    }

    function finishSeek() {
      if (!scrubbing) return;
      scrubbing = false;
      frame.classList.remove('is-seeking');
      updateProgress();
      if (touchInteraction) showTouchControls();
      else syncProgressAnimation();
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
      syncProgressAnimation();
    }
    toggle.addEventListener('click', async () => {
      const wantsPlay = video.paused;
      video.dispatchEvent(new CustomEvent('sara:playback-intent', { detail: { playing: wantsPlay } }));
      if (wantsPlay) {
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
    for (const event of ['loadedmetadata', 'durationchange', 'emptied']) {
      video.addEventListener(event, updateProgress);
    }
    for (const event of ['timeupdate', 'seeking', 'seeked', 'ended']) {
      video.addEventListener(event, () => {
        if (controlsVisible()) updateProgress();
      });
    }
    frame.append(bar);
    video.controls = false;
    update();
    updateProgress();
  }
})();
