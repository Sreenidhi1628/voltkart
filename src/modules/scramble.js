import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01X$%&~';

export class TextScramble {
  constructor(element) {
    this.el = element;
    this.originalText = element.textContent.trim();
    this.chars = this.originalText.split('');
    this.frame = 0;
    this.queue = [];
    this.isScrambling = false;
  }

  scramble(duration = 1.0) {
    if (this.isScrambling) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.isScrambling = true;
    this.queue = [];

    const totalFrames = Math.round(duration * 60);

    for (let i = 0; i < this.chars.length; i++) {
      const from = this.chars[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      const to = this.chars[i];
      const start = Math.floor(Math.random() * (totalFrames * 0.4));
      const end = start + Math.floor(Math.random() * (totalFrames * 0.6));
      this.queue.push({ from, to, start, end, char: from });
    }

    this.frame = 0;
    const update = () => {
      let output = '';
      let complete = 0;

      for (let i = 0; i < this.queue.length; i++) {
        const item = this.queue[i];
        if (this.frame >= item.end) {
          complete++;
          output += item.to;
        } else if (this.frame >= item.start) {
          if (!item.char || Math.random() < 0.28) {
            item.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          output += `<span class="scramble-glyph">${item.char}</span>`;
        } else {
          output += item.from;
        }
      }

      this.el.innerHTML = output;

      if (complete === this.queue.length) {
        this.el.textContent = this.originalText;
        this.isScrambling = false;
      } else {
        this.frame++;
        requestAnimationFrame(update);
      }
    };

    update();
  }
}

export function initTextScramble() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const headings = document.querySelectorAll('.section-title, .showcase-headline, .deal-title, .check-setup-title');

  headings.forEach((heading) => {
    const scrambler = new TextScramble(heading);
    ScrollTrigger.create({
      trigger: heading,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        scrambler.scramble(1.2);
      }
    });
  });
}
