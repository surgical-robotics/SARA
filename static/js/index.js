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

// Preload all clips through their HTML sources; only visible clips should play.
const autoplayVideos = [...document.querySelectorAll('video[data-autoplay]')];
const playbackStates = new Map(autoplayVideos.map(video => [video, {
  visible: false, wantsPlay: true, wanted: false,
  revision: 0, starting: false
}]));

function shouldPlayVideo(video) {
  const state = playbackStates.get(video);
  const fullscreen = document.fullscreenElement;
  return state.wantsPlay && !document.hidden &&
    (fullscreen ? fullscreen.contains(video) : state.visible);
}

async function startAutoplay(video) {
  const state = playbackStates.get(video);
  if (!shouldPlayVideo(video) || !video.paused || state.starting) return;
  const revision = state.revision;
  state.starting = true;
  let aborted = false;
  try {
    await video.play();
    delete video.dataset.autoplayBlocked;
  } catch (error) {
    if (error.name === 'NotAllowedError') video.dataset.autoplayBlocked = 'true';
    aborted = error.name === 'AbortError';
  } finally {
    state.starting = false;
    if (!shouldPlayVideo(video)) {
      if (!video.paused) video.pause();
    } else if (aborted && state.revision !== revision && video.paused) {
      // A clip can return to view before its cancelled play request settles.
      startAutoplay(video);
    }
  }
}

function syncVideoPlayback(video) {
  const state = playbackStates.get(video);
  const wanted = shouldPlayVideo(video);
  if (state.wanted !== wanted) {
    state.wanted = wanted;
    state.revision++;
  }
  video.autoplay = wanted;
  if (wanted) startAutoplay(video);
  else if (!video.paused || state.starting) video.pause();
}

function readVideoVisibility() {
  for (const video of autoplayVideos) {
    const rect = video.getBoundingClientRect();
    const width = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
    const height = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    const area = Math.max(0, rect.right - rect.left) * Math.max(0, rect.bottom - rect.top);
    playbackStates.get(video).visible = area > 0 && width * height / area >= 0.05;
  }
}

function refreshVideoPlayback() {
  readVideoVisibility();
  autoplayVideos.forEach(syncVideoPlayback);
}

for (const video of autoplayVideos) {
  const state = playbackStates.get(video);
  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  video.addEventListener('sara:playback-intent', event => {
    event.preventDefault();
    state.wantsPlay = event.detail.playing;
    // A direct Play click takes effect immediately, even at a visibility boundary.
    if (state.wantsPlay) state.visible = true;
    syncVideoPlayback(video);
  });
  video.addEventListener('playing', () => {
    if (!shouldPlayVideo(video)) video.pause();
    else delete video.dataset.autoplayBlocked;
  });
  for (const event of ['loadedmetadata', 'loadeddata', 'canplay']) {
    video.addEventListener(event, () => syncVideoPlayback(video));
  }
}

if ('IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      playbackStates.get(entry.target).visible = entry.isIntersecting && entry.intersectionRatio >= 0.05;
    }
    // Pause departing clips before starting newly visible ones.
    for (const entry of entries) if (!shouldPlayVideo(entry.target)) syncVideoPlayback(entry.target);
    for (const entry of entries) if (shouldPlayVideo(entry.target)) syncVideoPlayback(entry.target);
  }, { threshold: [0, 0.05] });
  autoplayVideos.forEach(video => videoObserver.observe(video));
} else {
  let visibilityFrame = 0;
  function scheduleVisibility() {
    if (visibilityFrame) return;
    visibilityFrame = requestAnimationFrame(() => {
      visibilityFrame = 0;
      refreshVideoPlayback();
    });
  }
  window.addEventListener('scroll', scheduleVisibility, { passive: true });
  window.addEventListener('resize', scheduleVisibility);
}

function retryAutoplay(event) {
  if (!event.target?.closest?.('.media-controls')) autoplayVideos.forEach(syncVideoPlayback);
}
document.addEventListener('visibilitychange', refreshVideoPlayback);
document.addEventListener('fullscreenchange', refreshVideoPlayback);
document.addEventListener('pointerdown', retryAutoplay, { passive: true });
document.addEventListener('keydown', retryAutoplay);
window.addEventListener('load', refreshVideoPlayback);
refreshVideoPlayback();

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
