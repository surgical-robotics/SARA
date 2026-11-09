'use strict';

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
