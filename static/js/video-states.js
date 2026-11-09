'use strict';

// Intervals use source-video seconds, independent of playback rate.
// Each range includes its start and excludes its end.
(() => {
  const timelines = {
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

  for (const card of document.querySelectorAll('.video-card[data-state]')) {
    const video = card.querySelector('video');
    const label = card.querySelector('.video-state-label');
    const filename = video.querySelector('source').getAttribute('src').split('/').pop();
    const key = filename.replace(/_X[12]\.mp4$/i, '').toLowerCase();
    const intervals = Object.entries(timelines).find(([name]) => name.toLowerCase() === key)?.[1] || [];

    function updateState(time = video.currentTime) {
      const state = intervals.find(([start, end]) => time >= start && time < end)?.[2] || 'normal';
      if (card.dataset.state !== state || label.textContent !== labels[state]) {
        card.dataset.state = state;
        label.textContent = labels[state];
      }
    }
    for (const event of ['loadedmetadata', 'timeupdate', 'seeking', 'seeked', 'ended']) {
      video.addEventListener(event, () => updateState());
    }
    // Frame callbacks keep transitions aligned even during accelerated playback.
    if ('requestVideoFrameCallback' in video) {
      const onFrame = (now, metadata) => {
        updateState(metadata.mediaTime);
        video.requestVideoFrameCallback(onFrame);
      };
      video.requestVideoFrameCallback(onFrame);
    }
    updateState();
  }
})();
