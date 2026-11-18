import gsap from 'gsap';
import { products } from '../data/products.js';
import { getCart } from './cart.js';

export function initDealTimer() {
  const container = document.getElementById('deal-timer-container');
  if (!container) return;

  // Deal ends in 8 hours 42 minutes 19 seconds from load, or fixed daily midnight
  const now = new Date();
  const targetTime = new Date(now.getTime() + (8 * 60 * 60 + 42 * 60 + 19) * 1000);

  let prevHours = '';
  let prevMins = '';
  let prevSecs = '';

  const hoursEl = document.getElementById('deal-flip-hours');
  const minsEl = document.getElementById('deal-flip-mins');
  const secsEl = document.getElementById('deal-flip-secs');
  const progressFill = document.getElementById('deal-progress-fill');

  function update() {
    const current = new Date();
    const diff = Math.max(0, targetTime - current);

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const strH = String(h).padStart(2, '0');
    const strM = String(m).padStart(2, '0');
    const strS = String(s).padStart(2, '0');

    if (strH !== prevHours && hoursEl) {
      flipDigit(hoursEl, strH);
      prevHours = strH;
    }
    if (strM !== prevMins && minsEl) {
      flipDigit(minsEl, strM);
      prevMins = strM;
    }
    if (strS !== prevSecs && secsEl) {
      flipDigit(secsEl, strS);
      prevSecs = strS;
    }
  }

  function flipDigit(element, newText) {
    gsap.to(element, {
      rotateX: -90,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        element.textContent = newText;
        gsap.fromTo(element, 
          { rotateX: 90 }, 
          { rotateX: 0, duration: 0.35, ease: 'back.out(2)' }
        );
      }
    });
  }

  setInterval(update, 1000);
  update();

  // Animate progress bar fill smoothly
  if (progressFill) {
    gsap.fromTo(progressFill, 
      { width: '0%' }, 
      { width: '78%', duration: 1.5, ease: 'power2.out', delay: 0.5 }
    );
  }

  // Claim Deal button
  const claimBtn = document.getElementById('deal-claim-btn');
  if (claimBtn) {
    claimBtn.addEventListener('click', () => {
      const dealProd = products.find(p => p.id === 'prod-mob-1'); // Volt Titan
      if (dealProd) {
        getCart().addItem(dealProd, claimBtn);
      }
    });
  }
}
