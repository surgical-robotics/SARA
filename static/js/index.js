'use strict';

// Hide common saving actions on video elements; public media remains accessible.
for (const video of document.querySelectorAll('video')) {
  video.addEventListener('contextmenu', event => event.preventDefault());
  video.addEventListener('dragstart', event => event.preventDefault());
}

// Lock each clip to its configured speed and keep all demonstrations silent.
for (const video of document.querySelectorAll('video')) {
  const rate = Number(video.dataset.playbackRate || 1);
  function enforcePlayback() {
    if (video.defaultPlaybackRate !== rate) video.defaultPlaybackRate = rate;
    if (video.playbackRate !== rate) video.playbackRate = rate;
    video.defaultMuted = true;
    if (!video.muted) video.muted = true;
  }
  enforcePlayback();
  video.addEventListener('loadedmetadata', enforcePlayback);
  video.addEventListener('ratechange', enforcePlayback);
  video.addEventListener('volumechange', enforcePlayback);
}

// Attach only the current demonstration group: paused players alone can retain
// media resources. Releasing other groups prevents 34 simultaneous media loads.
const autoplayVideos = [...document.querySelectorAll('video[data-autoplay]')];
const videoGroups = [...document.querySelectorAll('.results-group')];
const playbackStates = new Map(autoplayVideos.map(video => [video, {
  source: video.querySelector('source'), group: video.closest('.results-group'),
  attached: false, wantsPlay: true, savedTime: 0, restoring: false,
  generation: 0, starting: false
}]));
let activeVideoGroup = null;
let pendingVideoGroup;
let groupChangeTimer;
let groupFrame = 0;

async function startAutoplay(video) {
  const state = playbackStates.get(video);
  if (!state.attached || !state.wantsPlay || state.restoring || document.hidden ||
      !video.paused || state.starting) return;
  const generation = state.generation;
  state.starting = true;
  try {
    await video.play();
    if (generation === state.generation) delete video.dataset.autoplayBlocked;
  } catch (error) {
    if (generation === state.generation && error.name === 'NotAllowedError') {
      video.dataset.autoplayBlocked = 'true';
    }
  } finally {
    if (generation === state.generation) state.starting = false;
  }
}

function releaseVideo(video) {
  const state = playbackStates.get(video);
  if (!state.attached) return;
  if (!state.restoring && Number.isFinite(video.currentTime)) state.savedTime = video.currentTime;
  state.attached = false;
  state.generation++;
  state.starting = false;
  state.restoring = false;
  video.autoplay = false;
  video.pause();
  state.source.removeAttribute('src');
  video.preload = 'none';
  delete video.dataset.autoplayBlocked;
  // Abort the old resource selection and release its media pipeline.
  video.load();
}

function attachVideo(video) {
  const state = playbackStates.get(video);
  if (!state.attached) {
    state.attached = true;
    state.generation++;
    state.starting = false;
    state.restoring = state.savedTime > 0;
    video.preload = 'auto';
    video.autoplay = state.wantsPlay && !state.restoring;
    state.source.setAttribute('src', state.source.dataset.src);
    video.load();
  }
  startAutoplay(video);
}

function activateVideoGroup(group) {
  clearTimeout(groupChangeTimer);
  pendingVideoGroup = undefined;
  activeVideoGroup = group;
  const fullscreen = document.fullscreenElement;
  const targets = new Set(autoplayVideos.filter(video =>
    group && playbackStates.get(video).group === group && (!fullscreen || fullscreen.contains(video))
  ));
  // Finish releasing the previous group before loading any videos in the next.
  for (const video of autoplayVideos) if (!targets.has(video)) releaseVideo(video);
  for (const video of targets) attachVideo(video);
}

function chooseVideoGroup() {
  if (document.hidden) return null;
  if (document.fullscreenElement) return document.fullscreenElement.closest('.results-group');
  const top = Math.min(160, window.innerHeight / 3);
  let best = null, bestOverlap = 0, activeOverlap = 0;
  let nearby = null, nearbyDistance = 301;
  for (const group of videoGroups) {
    const rect = group.querySelector('.video-grid').getBoundingClientRect();
    const overlap = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, top));
    if (group === activeVideoGroup) activeOverlap = overlap;
    if (overlap > bestOverlap) { best = group; bestOverlap = overlap; }
    const distance = rect.top - window.innerHeight;
    if (distance >= 0 && distance < nearbyDistance) { nearby = group; nearbyDistance = distance; }
  }
  // A small overlap margin prevents repeated switching at a section boundary.
  if (activeOverlap > 0 && activeOverlap >= bestOverlap - 80) return activeVideoGroup;
  return best || nearby;
}

function updateVideoGroup(immediate = false) {
  const group = chooseVideoGroup();
  if (immediate) { activateVideoGroup(group); return; }
  if (group === activeVideoGroup) {
    clearTimeout(groupChangeTimer);
    pendingVideoGroup = undefined;
    return;
  }
  if (group === pendingVideoGroup) return;
  clearTimeout(groupChangeTimer);
  pendingVideoGroup = group;
  groupChangeTimer = setTimeout(() => activateVideoGroup(chooseVideoGroup()), 120);
}

function scheduleVideoGroup() {
  if (groupFrame) return;
  groupFrame = requestAnimationFrame(() => { groupFrame = 0; updateVideoGroup(); });
}

for (const video of autoplayVideos) {
  const state = playbackStates.get(video);
  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  video.addEventListener('loadedmetadata', () => {
    if (!state.attached) return;
    if (state.restoring && Number.isFinite(video.duration)) {
      video.currentTime = Math.min(state.savedTime, Math.max(0, video.duration - 0.01));
      state.restoring = false;
    }
    video.autoplay = state.wantsPlay;
    startAutoplay(video);
  });
  video.addEventListener('sara:playback-intent', event => {
    event.preventDefault();
    state.wantsPlay = event.detail.playing;
    video.autoplay = state.wantsPlay;
    if (state.wantsPlay) {
      activateVideoGroup(state.group);
      startAutoplay(video);
    } else video.pause();
  });
  video.addEventListener('playing', () => {
    if (!state.attached || !state.wantsPlay || document.hidden) video.pause();
    else delete video.dataset.autoplayBlocked;
  });
  video.addEventListener('loadeddata', () => startAutoplay(video));
  video.addEventListener('canplay', () => startAutoplay(video));
}

function retryAutoplay(event) {
  if (event.target?.closest?.('.media-controls')) return;
  autoplayVideos.forEach(video => startAutoplay(video));
}
window.addEventListener('scroll', scheduleVideoGroup, { passive: true });
window.addEventListener('resize', scheduleVideoGroup);
window.addEventListener('load', scheduleVideoGroup);
document.addEventListener('visibilitychange', () => updateVideoGroup(true));
document.addEventListener('fullscreenchange', () => updateVideoGroup(true));
document.addEventListener('pointerdown', retryAutoplay, { passive: true });
document.addEventListener('keydown', retryAutoplay);
updateVideoGroup(true);

// Full-size figures use native dialog focus management and Escape handling.
const dialog = document.querySelector('#figure-dialog');
const expanded = dialog.querySelector('img');
let figureRequest = 0;
for (const button of document.querySelectorAll('.figure-zoom')) {
  button.addEventListener('click', () => {
    const preview = button.querySelector('img');
    const request = ++figureRequest;
    expanded.src = preview.currentSrc || preview.src;
    expanded.alt = preview.alt;
    dialog.showModal();
    // Show the cached preview immediately, then swap in the full-resolution figure.
    const fullSize = new Image();
    fullSize.onload = async () => {
      try { await fullSize.decode(); } catch { /* The loaded image remains usable. */ }
      if (dialog.open && request === figureRequest) expanded.src = fullSize.src;
    };
    fullSize.src = button.dataset.image;
  });
}
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});
const topButton = document.querySelector('.scroll-to-top');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function updateTopButton() { topButton.classList.toggle('visible', window.scrollY > 650); }
window.addEventListener('scroll', updateTopButton, { passive: true });
updateTopButton();
topButton.addEventListener('click', () => window.scrollTo({top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth'}));

// A reading indicator and chapter markers keep the long experimental page legible.
const readingProgress = document.querySelector('.reading-progress span');
const chapterLinks = [...document.querySelectorAll('.nav-links a')];
const galleryNavs = [...document.querySelectorAll('.gallery-nav')];
const linkTargets = new Map([...chapterLinks, ...document.querySelectorAll('.gallery-nav a')]
  .map(link => [link, document.querySelector(link.getAttribute('href'))]));
let readingFramePending = false;
function markCurrent(links, active) {
  links.forEach(link => {
    if (link === active) {
      if (!link.hasAttribute('aria-current')) link.setAttribute('aria-current', 'location');
    } else if (link.hasAttribute('aria-current')) link.removeAttribute('aria-current');
  });
}
function updateReadingPosition() {
  readingFramePending = false;
  const available = document.documentElement.scrollHeight - window.innerHeight;
  if (readingProgress) readingProgress.style.transform = `scaleX(${available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0})`;
  let currentChapter;
  for (const link of chapterLinks) {
    if (linkTargets.get(link)?.getBoundingClientRect().top <= 170) currentChapter = link;
  }
  markCurrent(chapterLinks, currentChapter);
  for (const nav of galleryNavs) {
    const links = [...nav.querySelectorAll('a')];
    const section = nav.closest('.results-section').getBoundingClientRect();
    let currentGroup;
    if (section.top <= 170 && section.bottom > 170) {
      for (const link of links) {
        if (linkTargets.get(link)?.getBoundingClientRect().top <= 180) currentGroup = link;
      }
    }
    markCurrent(links, currentGroup);
  }
}
function scheduleReadingUpdate() {
  if (readingFramePending) return;
  readingFramePending = true;
  window.requestAnimationFrame(updateReadingPosition);
}
window.addEventListener('scroll', scheduleReadingUpdate, { passive: true });
window.addEventListener('resize', scheduleReadingUpdate, { passive: true });
window.addEventListener('load', scheduleReadingUpdate);
updateReadingPosition();
