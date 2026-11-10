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

// Let native muted autoplay handle buffering, without viewport-driven pause/load calls.
const autoplayVideos = [...document.querySelectorAll('video[autoplay]')];
const startingVideos = new WeakSet();
const manuallyPausedVideos = new WeakSet();

async function startAutoplay(video) {
  if (document.hidden || manuallyPausedVideos.has(video) || !video.paused || startingVideos.has(video)) return;
  startingVideos.add(video);
  try {
    await video.play();
    delete video.dataset.autoplayBlocked;
  } catch (error) {
    if (error.name === 'NotAllowedError') video.dataset.autoplayBlocked = 'true';
  } finally {
    startingVideos.delete(video);
  }
}

for (const video of autoplayVideos) {
  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  video.addEventListener('sara:playback-intent', event => {
    if (event.detail.playing) manuallyPausedVideos.delete(video);
    else manuallyPausedVideos.add(video);
    video.autoplay = event.detail.playing;
  });
  video.addEventListener('playing', () => {
    delete video.dataset.autoplayBlocked;
  });
  video.addEventListener('loadeddata', () => startAutoplay(video));
  video.addEventListener('canplay', () => startAutoplay(video));
  startAutoplay(video);
}

// Retry when a browser permits a newly visible clip; never pause clips on scroll.
if ('IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) startAutoplay(entry.target);
    }
  }, { threshold: 0.1 });
  autoplayVideos.forEach(video => videoObserver.observe(video));
}

function retryAutoplay() {
  autoplayVideos.forEach(video => startAutoplay(video));
}
function retryAfterGesture(event) {
  // A control click handles its own play/pause intent.
  if (!event.target?.closest?.('.media-controls')) retryAutoplay();
}
document.addEventListener('pointerdown', retryAfterGesture, { passive: true });
document.addEventListener('keydown', retryAfterGesture);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) retryAutoplay();
});

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
