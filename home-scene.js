(() => {
  'use strict';
  const image = document.querySelector('.scene-illustration');
  if (!image) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;

  // The original scroll-triggered wipe plays once. Without JavaScript, the
  // illustration stays visible; reduced-motion changes also reveal it at once.
  const reveal = () => { image.dataset.reveal = 'complete'; };
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      reveal();
      observer.disconnect();
    }
  }, { threshold: 0.2 });
  image.dataset.reveal = 'waiting';
  // Observe the unclipped band: a fully clipped image has no intersection area.
  observer.observe(image.parentElement);
  motion.addEventListener('change', event => {
    if (event.matches) {
      reveal();
      observer.disconnect();
    }
  });
})();
