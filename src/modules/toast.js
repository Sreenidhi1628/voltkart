import gsap from 'gsap';

let toastContainer = null;

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

export function showToast(message, type = 'info', title = null) {
  const container = ensureToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  const icons = {
    success: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#06b6d4" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    promo: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#8b5cf6" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Close Notification">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;

  container.appendChild(toast);

  // Slide & bounce in
  gsap.fromTo(toast, 
    { x: 100, opacity: 0, scale: 0.9 },
    { x: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.5)' }
  );

  let dismissTimeout = setTimeout(() => dismiss(), 3500);

  function dismiss() {
    clearTimeout(dismissTimeout);
    gsap.to(toast, {
      x: 80,
      opacity: 0,
      scale: 0.9,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        toast.remove();
      }
    });
  }

  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', dismiss);
  }
}
