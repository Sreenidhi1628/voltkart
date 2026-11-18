import gsap from 'gsap';

export function initPreloader(onComplete) {
  const preloader = document.getElementById('preloader');
  const counter = document.getElementById('preloader-counter');
  const progressFill = document.getElementById('preloader-fill');
  const logoPath = document.getElementById('preloader-logo-path');
  const topCurtain = document.querySelector('.preloader-curtain-top');
  const bottomCurtain = document.querySelector('.preloader-curtain-bottom');

  if (!preloader) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  // Draw logo SVG path
  if (logoPath) {
    gsap.to(logoPath, {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: 'power2.inOut'
    });
  }

  // Counter 0 to 100%
  const counterObj = { value: 0 };
  gsap.to(counterObj, {
    value: 100,
    duration: 1.8,
    ease: 'power2.out',
    onUpdate: () => {
      const val = Math.round(counterObj.value);
      if (counter) counter.textContent = `${val}%`;
      if (progressFill) progressFill.style.width = `${val}%`;
    },
    onComplete: () => {
      // Split-curtain reveal
      const tl = gsap.timeline({
        onComplete: () => {
          preloader.style.display = 'none';
          document.body.classList.remove('preloader-active');
          if (typeof onComplete === 'function') onComplete();
        }
      });

      tl.to('.preloader-content', {
        scale: 0.85,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
      })
      .to(topCurtain, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut'
      }, '-=0.1')
      .to(bottomCurtain, {
        yPercent: 100,
        duration: 0.8,
        ease: 'power4.inOut'
      }, '<');
    }
  });
}
