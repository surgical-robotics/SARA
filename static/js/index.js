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

// Autoplay visible demonstrations only; keep explicit pauses when visitors return.
const autoplayVideos = [...document.querySelectorAll('video[data-autoplay]')];
const playbackStates = new Map(autoplayVideos.map(video => [video, {
  visible: false, near: false, primed: false, wantsPlay: true, starting: false
}]));

// Warm at most one nearby row, while visible videos have first priority.
function updateVideoPreload() {
  const fullscreen = document.fullscreenElement;
  const canPrefetch = !document.hidden && !fullscreen && !navigator.connection?.saveData;
  const nearby = canPrefetch ? autoplayVideos
    .filter(video => {
      const state = playbackStates.get(video);
      return state.near && !state.visible && state.wantsPlay;
    })
    .map(video => {
      const rect = video.getBoundingClientRect();
      return { video, distance: Math.max(0, rect.top - window.innerHeight, -rect.bottom) };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 2).map(item => item.video) : [];
  const warm = new Set(nearby);
  for (const video of autoplayVideos) {
    const state = playbackStates.get(video);
    const active = !document.hidden && state.wantsPlay &&
      ((state.visible && (!fullscreen || fullscreen.contains(video))) || warm.has(video));
    const preload = active ? 'auto' : 'none';
    if (video.preload !== preload) video.preload = preload;
    if (active && !state.primed) {
      state.primed = true;
      // Initialize only untouched players; never reset a playing or resumed clip.
      if (video.readyState === 0 && video.paused && !state.starting) video.load();
    }
  }
}

function shouldAutoplay(video) {
  const state = playbackStates.get(video);
  const fullscreen = document.fullscreenElement;
  return state.visible && state.wantsPlay && !document.hidden &&
    (!fullscreen || fullscreen.contains(video));
}

async function syncAutoplay(video) {
  const state = playbackStates.get(video);
  if (!shouldAutoplay(video)) {
    if (!video.paused || state.starting) video.pause();
    return;
  }
  if (!video.paused || state.starting) return;
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
    if (!shouldAutoplay(video)) {
      if (!video.paused) video.pause();
    } else if (aborted && video.paused) {
      // A quick scroll can return to a clip before its cancelled play settles.
      syncAutoplay(video);
    }
  }
}

for (const video of autoplayVideos) {
  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  video.addEventListener('sara:playback-intent', event => {
    playbackStates.get(video).wantsPlay = event.detail.playing;
    updateVideoPreload();
  });
  video.addEventListener('playing', () => {
    delete video.dataset.autoplayBlocked;
    if (!shouldAutoplay(video)) video.pause();
  });
  video.addEventListener('loadeddata', () => syncAutoplay(video));
  video.addEventListener('canplay', () => syncAutoplay(video));
}

if ('IntersectionObserver' in window) {
  const preloadObserver = new IntersectionObserver(entries => {
    for (const entry of entries) playbackStates.get(entry.target).near = entry.isIntersecting;
    updateVideoPreload();
  }, { rootMargin: '500px 0px', threshold: 0 });
  const videoObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      playbackStates.get(entry.target).visible = entry.isIntersecting && entry.intersectionRatio >= 0.05;
    }
    updateVideoPreload();
    for (const entry of entries) syncAutoplay(entry.target);
  }, { threshold: [0, 0.05] });
  autoplayVideos.forEach(video => {
    preloadObserver.observe(video);
    videoObserver.observe(video);
  });
} else {
  let visibilityPending = false;
  function updateVideoVisibility() {
    visibilityPending = false;
    for (const video of autoplayVideos) {
      const rect = video.getBoundingClientRect();
      const state = playbackStates.get(video);
      state.visible = rect.bottom > 0 && rect.top < window.innerHeight &&
        rect.right > 0 && rect.left < window.innerWidth;
      state.near = rect.bottom > -500 && rect.top < window.innerHeight + 500 &&
        rect.right > 0 && rect.left < window.innerWidth;
    }
    updateVideoPreload();
    autoplayVideos.forEach(video => syncAutoplay(video));
  }
  function scheduleVideoVisibility() {
    if (visibilityPending) return;
    visibilityPending = true;
    window.requestAnimationFrame(updateVideoVisibility);
  }
  window.addEventListener('scroll', scheduleVideoVisibility, { passive: true });
  window.addEventListener('resize', scheduleVideoVisibility);
  updateVideoVisibility();
}

function retryAutoplay() {
  updateVideoPreload();
  autoplayVideos.forEach(video => syncAutoplay(video));
}
function retryAfterGesture(event) {
  // Let a control click express its own intent instead of starting first, then pausing.
  if (!event.target?.closest?.('.media-controls')) retryAutoplay();
}
document.addEventListener('pointerdown', retryAfterGesture, { passive: true });
document.addEventListener('keydown', retryAfterGesture);
document.addEventListener('visibilitychange', retryAutoplay);
document.addEventListener('fullscreenchange', retryAutoplay);

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
