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

// Explicitly start muted videos and retry clips that the browser has not started.
// A successful start is remembered so later retries respect manual pauses.
const autoplayVideos = [...document.querySelectorAll('video[autoplay]')];
const startedVideos = new WeakSet();
const startingVideos = new WeakSet();

async function startAutoplay(video) {
  if (document.hidden || startedVideos.has(video) || startingVideos.has(video)) return;
  startingVideos.add(video);
  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  try {
    await video.play();
    startedVideos.add(video);
    delete video.dataset.autoplayBlocked;
  } catch (error) {
    // The custom Play button remains available when autoplay is blocked.
    if (error.name === 'NotAllowedError') video.dataset.autoplayBlocked = 'true';
  } finally {
    startingVideos.delete(video);
  }
}

for (const video of autoplayVideos) {
  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  video.addEventListener('playing', () => {
    startedVideos.add(video);
    delete video.dataset.autoplayBlocked;
  });
  video.addEventListener('loadeddata', () => startAutoplay(video));
  video.addEventListener('canplay', () => startAutoplay(video));
  startAutoplay(video);
}

// Safari and mobile browsers can defer playback until a video becomes visible.
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
// Calls run directly inside a trusted gesture for stricter browser policies.
document.addEventListener('pointerdown', retryAutoplay, { passive: true });
document.addEventListener('keydown', retryAutoplay);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) retryAutoplay();
});

// Full-size figures use native dialog focus management and Escape handling.
const dialog = document.querySelector('#figure-dialog');
const expanded = dialog.querySelector('img');
for (const button of document.querySelectorAll('.figure-zoom')) {
  button.addEventListener('click', () => {
    expanded.src = button.dataset.image;
    expanded.alt = button.querySelector('img').alt;
    dialog.showModal();
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
