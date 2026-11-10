'use strict';

// Intervals use source-video seconds, independent of playback rate.
// Each range includes its start and excludes its end.
(() => {
  const timelines = {
    i_1: [[2, 9, 'recovery']],
    i_2: [[3, 11, 'recovery']],
    i_3: [[8, 14, 'recovery']],
    i_4: [[2, 8, 'recovery']],
    i_5: [[3, 9, 'recovery']],
    i_6: [[2, 8, 'recovery'], [15, 20, 'recovery']],
    i_7: [[10, 16, 'recovery'], [24, 32, 'recovery']],
    i_8: [[2, 14, 'recovery']],
    F_pickplace: [[3, 14, 'recovery']],
    I_pickplace: [[0, 2, 'disturbance'], [6, 9, 'disturbance'], [10, 14, 'recovery']],
    F_peg: [[2, 6, 'recovery']],
    I_peg: [[1, 4, 'disturbance'], [4, 10, 'recovery'], [17, 21, 'disturbance'], [21, 26, 'recovery']],
    F_ring: [[11, 17, 'recovery']],
    I_ring: [[2, 4, 'disturbance'], [4, 12, 'recovery'], [14, 17, 'disturbance'], [17, 22, 'recovery']],
    F_shunt: [[7, 21, 'recovery']],
    I_shunt: [[6, 8, 'disturbance'], [8, 12, 'recovery'], [13, 15, 'disturbance'], [15, 18, 'recovery']],
    F_debridement: [[11, 19, 'recovery']],
    I_debridement: [[27, 33, 'disturbance'], [33, 43, 'recovery'], [43, 46, 'disturbance'], [46, 53, 'recovery']],
    F_stitch: [[3, 21, 'recovery']],
    I_stitch: [[4, 8, 'disturbance'], [8, 12, 'recovery']]
  };
  const labels = {
    normal: 'Normal Execution',
    recovery: 'Failure Recovery',
    disturbance: 'External Disturbance'
  };

  const visibilityHandlers = new WeakMap();
  const visibilityObserver = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(entries => {
      for (const entry of entries) visibilityHandlers.get(entry.target)?.(entry.isIntersecting);
    }, { rootMargin: '100px 0px' })
    : null;

  for (const card of document.querySelectorAll('.video-card[data-state]')) {
    const video = card.querySelector('video');
    const label = card.querySelector('.video-state-label');
    const timeline = card.querySelector('.phase-timeline');
    const track = card.querySelector('.phase-segments');
    const playhead = card.querySelector('.phase-playhead');
    const filename = video.querySelector('source').getAttribute('src').split(/[?#]/)[0].split('/').pop();
    const key = filename.replace(/(?:_X[12])?\.mp4$/i, '').toLowerCase();
    const intervals = Object.entries(timelines).find(([name]) => name.toLowerCase() === key)?.[1] || [];

    let duration = 0;
    let visible = !visibilityObserver;
    let frameHandle = null;
    let lastProgress = '';
    const useVideoFrames = typeof video.requestVideoFrameCallback === 'function' &&
      typeof video.cancelVideoFrameCallback === 'function';

    function stateAt(time) {
      return intervals.find(([start, end]) => time >= start && time < end)?.[2] || 'normal';
    }

    function renderTimeline() {
      duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      playhead.hidden = duration === 0;
      if (!duration) {
        track.replaceChildren();
        timeline.setAttribute('aria-label', 'Video phase timeline loading');
        return;
      }
      const boundaries = new Set([0, duration]);
      for (const [start, end] of intervals) {
        boundaries.add(Math.min(duration, Math.max(0, start)));
        boundaries.add(Math.min(duration, Math.max(0, end)));
      }
      const points = [...boundaries].sort((a, b) => a - b);
      const phases = [];
      for (let i = 1; i < points.length; i++) {
        const start = points[i - 1], end = points[i];
        const state = stateAt((start + end) / 2);
        const previous = phases[phases.length - 1];
        if (previous?.state === state) previous.end = end;
        else phases.push({ start, end, state });
      }
      const segments = phases.map(({ start, end, state }) => {
        const segment = document.createElement('span');
        segment.className = 'phase-segment';
        segment.dataset.state = state;
        segment.style.width = `${(end - start) / duration * 100}%`;
        return segment;
      });
      track.replaceChildren(...segments);
      timeline.setAttribute('aria-label', 'Video phases: ' + phases.map(({ start, end, state }) =>
        `${labels[state]} from ${Number(start.toFixed(1))} to ${Number(end.toFixed(1))} seconds`
      ).join('; '));
    }

    function updateState(time = video.currentTime) {
      const position = Number.isFinite(time) ? time : 0;
      const state = stateAt(position);
      if (card.dataset.state !== state || label.textContent !== labels[state]) {
        card.dataset.state = state;
        label.textContent = labels[state];
      }
      const progress = `${duration ? Math.min(100, Math.max(0, position / duration * 100)) : 0}%`;
      if (progress !== lastProgress) {
        playhead.style.transform = `translateX(${progress})`;
        lastProgress = progress;
      }
    }

    function stopAnimation() {
      if (frameHandle === null) return;
      if (useVideoFrames) video.cancelVideoFrameCallback(frameHandle);
      else cancelAnimationFrame(frameHandle);
      frameHandle = null;
    }
    function scheduleAnimation() {
      if (!visible || document.hidden || video.paused || video.ended || !duration) {
        stopAnimation();
        return;
      }
      if (frameHandle === null) frameHandle = useVideoFrames
        ? video.requestVideoFrameCallback(onFrame)
        : requestAnimationFrame(onFrame);
    }
    function onFrame(now, metadata) {
      frameHandle = null;
      updateState(useVideoFrames ? metadata.mediaTime : video.currentTime);
      scheduleAnimation();
    }
    function refresh() {
      updateState();
      scheduleAnimation();
    }
    for (const event of ['loadedmetadata', 'durationchange', 'emptied']) {
      video.addEventListener(event, () => {
        renderTimeline();
        refresh();
      });
    }
    for (const event of ['seeking', 'seeked', 'play', 'pause', 'ended']) {
      video.addEventListener(event, refresh);
    }
    video.addEventListener('timeupdate', () => {
      if (visible && !document.hidden) refresh();
    });
    document.addEventListener('visibilitychange', refresh);
    if (visibilityObserver) {
      visibilityHandlers.set(card, isVisible => {
        visible = isVisible;
        refresh();
      });
      visibilityObserver.observe(card);
    }
    renderTimeline();
    updateState();
    scheduleAnimation();
  }
})();
