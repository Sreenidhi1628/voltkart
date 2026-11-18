import gsap from 'gsap';

export function initCursor() {
  // Disable on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.querySelector('.custom-cursor-dot');
  const ring = document.querySelector('.custom-cursor-ring');

  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Instant update for the dot
    gsap.set(dot, { x: mouseX, y: mouseY });
  });

  // Smooth lerp loop for the trailing ring
  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;

    gsap.set(ring, { x: ringX, y: ringY });
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover states
  function setupHoverListeners() {
    // Interactive links & buttons
    document.querySelectorAll('a, button, .category-card, .filter-pill, input, select').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });

    // Product cards -> "VIEW" text
    document.querySelectorAll('.product-card').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-view');
        ring.textContent = 'VIEW';
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-view');
        ring.textContent = '';
      });
    });

    // Horizontal tracks -> "DRAG"
    document.querySelectorAll('.categories-track-container').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-view');
        ring.textContent = 'DRAG';
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-view');
        ring.textContent = '';
      });
    });
  }

  setupHoverListeners();

  // Expose updater for dynamic elements
  window.updateCursorListeners = setupHoverListeners;
}
