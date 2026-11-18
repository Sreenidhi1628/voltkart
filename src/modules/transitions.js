import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;

export function initTransitions() {
  // Initialize Lenis Smooth Scroll
  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.8
  });

  // Sync Lenis with GSAP ScrollTrigger
  lenisInstance.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenisInstance.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Scroll Progress Bar
  const progressLine = document.querySelector('.scroll-progress-line');
  if (progressLine) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressLine.style.width = `${progress}%`;
    });
  }

  // Header background blur on scroll
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Back to Top Rocket
  const rocketBtn = document.getElementById('rocket-btn');
  if (rocketBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        rocketBtn.classList.add('visible');
      } else {
        rocketBtn.classList.remove('visible');
      }
    });

    rocketBtn.addEventListener('click', () => {
      rocketBtn.classList.add('rocket-launching');
      if (lenisInstance) {
        lenisInstance.scrollTo(0, {
          duration: 1.5,
          onComplete: () => {
            rocketBtn.classList.remove('rocket-launching');
          }
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => rocketBtn.classList.remove('rocket-launching'), 1000);
      }
    });
  }
}

export function getLenis() {
  return lenisInstance;
}

/**
 * Lock background Lenis scroll and page when modal or drawer is open
 */
export function lockScroll() {
  if (lenisInstance) {
    lenisInstance.stop();
  }
  document.documentElement.classList.add('lenis-stopped');
  document.body.classList.add('scroll-locked');
}

/**
 * Resume background Lenis scroll and page when modal or drawer closes
 */
export function unlockScroll() {
  // Only unlock if no other modal/drawer is still open
  const anyOpen = document.querySelector('.quickview-overlay.open, .slide-drawer.open, .search-overlay.open, .compare-modal.open');
  if (anyOpen) return;

  if (lenisInstance) {
    lenisInstance.start();
  }
  document.documentElement.classList.remove('lenis-stopped');
  document.body.classList.remove('scroll-locked');
}

