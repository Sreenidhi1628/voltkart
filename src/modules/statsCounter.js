import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initStatsCounter() {
  const section = document.getElementById('stats-section');
  if (!section) return;

  const statItems = [
    { id: 'stat-customers', target: 48500, suffix: '+', format: true },
    { id: 'stat-products', target: 29, suffix: '+ Flagships', format: false },
    { id: 'stat-cities', target: 140, suffix: '+ Profiles', format: false },
    { id: 'stat-synergy', target: 99.8, suffix: '%', decimal: true }
  ];

  ScrollTrigger.create({
    trigger: section,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      statItems.forEach(item => {
        const el = document.getElementById(item.id);
        if (!el) return;

        const obj = { val: 0 };
        gsap.to(obj, {
          val: item.target,
          duration: 2.0,
          ease: 'power3.out',
          onUpdate: () => {
            if (item.decimal) {
              el.textContent = `${obj.val.toFixed(1)}${item.suffix}`;
            } else if (item.format) {
              el.textContent = `${Math.round(obj.val).toLocaleString()}${item.suffix}`;
            } else {
              el.textContent = `${Math.round(obj.val)}${item.suffix}`;
            }
          }
        });
      });

      // Stagger animate stat cards entrance
      gsap.from('.stat-card', {
        y: 35,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
      });
    }
  });

  // Safety fallback: ensure stat values and cards are visible even if ScrollTrigger fails
  setTimeout(() => {
    statItems.forEach(item => {
      const el = document.getElementById(item.id);
      if (!el) return;
      if (el.textContent === '0' || el.textContent === '') {
        if (item.decimal) {
          el.textContent = `${item.target.toFixed(1)}${item.suffix}`;
        } else if (item.format) {
          el.textContent = `${item.target.toLocaleString()}${item.suffix}`;
        } else {
          el.textContent = `${item.target}${item.suffix}`;
        }
      }
    });
    document.querySelectorAll('.stat-card').forEach(card => {
      if (parseFloat(window.getComputedStyle(card).opacity) < 0.1) {
        card.style.opacity = '1';
        card.style.transform = 'none';
      }
    });
  }, 2000);
}
