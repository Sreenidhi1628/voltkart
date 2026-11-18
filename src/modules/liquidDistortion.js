import gsap from 'gsap';

export function initLiquidDistortion() {
  const dispMap = document.getElementById('liquid-disp');
  const turb = document.getElementById('liquid-turb');
  if (!dispMap || !turb) return;

  // Reduced motion check
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('.card-media');

  cards.forEach(card => {
    let anim = null;
    let turbAnim = null;

    card.addEventListener('mouseenter', () => {
      const img = card.querySelector('.card-img');
      if (!img) return;

      img.style.filter = 'url(#liquid-filter)';

      // Animate scale up and down
      if (anim) anim.kill();
      anim = gsap.fromTo(dispMap, 
        { attr: { scale: 0 } }, 
        { 
          attr: { scale: 16 }, 
          duration: 0.35, 
          yoyo: true, 
          repeat: 1, 
          ease: 'power2.out' 
        }
      );

      // Animate turbulence frequency for fluid ripple
      let freq = { val: 0.02 };
      if (turbAnim) turbAnim.kill();
      turbAnim = gsap.to(freq, {
        val: 0.08,
        duration: 0.7,
        ease: 'sine.inOut',
        onUpdate: () => {
          turb.setAttribute('baseFrequency', `${freq.val} ${freq.val}`);
        }
      });
    });

    card.addEventListener('mouseleave', () => {
      const img = card.querySelector('.card-img');
      if (!img) return;

      gsap.to(dispMap, {
        attr: { scale: 0 },
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          img.style.filter = '';
        }
      });
    });
  });
}
