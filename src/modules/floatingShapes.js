import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initFloatingShapes() {
  // Mobile optimization: disable heavy background canvas on small viewports
  if (window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'ambient-floating-canvas';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  canvas.style.opacity = '0.7';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Track scroll velocity
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    scrollVelocity = (currentY - lastScrollY) * 0.15;
    lastScrollY = currentY;
  }, { passive: true });

  // Mouse Parallax coordinates
  let mouseX = width / 2;
  let mouseY = height / 2;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });

  // Cyber geometric floating shapes
  const shapesCount = 20;
  const shapes = [];

  const colors = [
    'rgba(56, 189, 248, 0.4)', // Cyan
    'rgba(139, 92, 246, 0.35)', // Purple
    'rgba(6, 182, 212, 0.3)',  // Teal
    'rgba(244, 63, 94, 0.25)'   // Rose
  ];

  for (let i = 0; i < shapesCount; i++) {
    shapes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 24 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: (Math.random() - 0.5) * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      sides: Math.random() > 0.5 ? 3 : 4, // Triangles and Diamonds
      depth: Math.random() * 0.8 + 0.2
    });
  }

  function drawPolygon(x, y, radius, sides, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = (i * 2 * Math.PI) / sides;
      const px = radius * Math.cos(a);
      const py = radius * Math.sin(a);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Subtle translucent fill
    ctx.fillStyle = color.replace(/[\d.]+\)$/, '0.08)');
    ctx.fill();
    ctx.restore();
  }

  let animId = null;

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Lerp mouse
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Decay scroll velocity
    scrollVelocity *= 0.92;

    const mouseOffsetX = (mouseX - width / 2) * 0.03;
    const mouseOffsetY = (mouseY - height / 2) * 0.03;

    for (let i = 0; i < shapes.length; i++) {
      const s = shapes[i];

      // Update position with drift + scroll velocity + mouse parallax
      s.x += s.speedX - mouseOffsetX * s.depth * 0.02;
      s.y += s.speedY - scrollVelocity * s.depth;
      s.rotation += s.rotSpeed;

      // Wrap around edges
      if (s.x < -50) s.x = width + 50;
      if (s.x > width + 50) s.x = -50;
      if (s.y < -50) s.y = height + 50;
      if (s.y > height + 50) s.y = -50;

      drawPolygon(s.x, s.y, s.size, s.sides, s.rotation, s.color);
    }

    animId = requestAnimationFrame(render);
  }

  render();
}
