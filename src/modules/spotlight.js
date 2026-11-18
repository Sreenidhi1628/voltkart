export function initSpotlight() {
  // Disable on mobile/touch
  if (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches) return;

  const spotlightSections = document.querySelectorAll('.hero-section, .showcase-section, .check-setup-section, .deal-section, .stats-section, .testimonials-section');
  spotlightSections.forEach(sec => sec.classList.add('spotlight-active'));

  window.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--spotlight-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--spotlight-y', `${e.clientY}px`);
  }, { passive: true });
}
