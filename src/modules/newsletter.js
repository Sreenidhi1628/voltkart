import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { showToast } from './toast.js';

export function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const input = document.getElementById('newsletter-input');
  const btn = document.getElementById('newsletter-submit-btn');

  if (!form || !btn || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      gsap.fromTo(input, { x: -8 }, { x: 8, duration: 0.1, repeat: 4, yoyo: true, ease: 'linear' });
      return;
    }

    // Success animation on button
    btn.disabled = true;
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
      <span>Subscribed!</span>
    `;

    gsap.fromTo(btn, 
      { scale: 0.9 }, 
      { scale: 1, duration: 0.4, ease: 'back.out(2)' }
    );

    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.85 }
    });

    showToast('Welcome to the VoltKart VIP Tech Club! Check your inbox for $50 welcome voucher.', 'promo', 'VIP Access Granted');
    input.value = '';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = `
        <span>Subscribe</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      `;
    }, 4000);
  });
}
