'use strict';

// Apply the playback speed declared by each real-world clip's X1/X2 suffix.
for (const video of document.querySelectorAll('video[data-playback-rate]')) {
  const rate = Number(video.dataset.playbackRate);
  video.defaultPlaybackRate = rate;
  video.playbackRate = rate;
  video.addEventListener('loadedmetadata', () => {
    video.playbackRate = rate;
  });
}

// Explicitly start muted videos and retry clips that the browser has not started.
// A successful start is remembered so later retries respect manual pause/unmute.
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
    // Native controls remain available if autoplay is disabled in the browser.
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
