import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initShowcase3D() {
  const container = document.getElementById('showcase-canvas-container');
  const section = document.getElementById('showcase');
  if (!container || !section) return;

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  // Renderer with ACES ToneMapping
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x38bdf8, 3.5);
  keyLight.position.set(5, 6, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x8b5cf6, 3.0);
  fillLight.position.set(-5, -4, 4);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0x06b6d4, 4.0, 14);
  rimLight.position.set(1.2, 2.5, -3);
  scene.add(rimLight);

  // Group holding the 3D Workstation Laptop
  const laptopGroup = new THREE.Group();
  scene.add(laptopGroup);

  // Laptop Base
  const baseGeom = new THREE.BoxGeometry(3.6, 0.14, 2.4);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.2
  });
  const baseMesh = new THREE.Mesh(baseGeom, baseMat);
  laptopGroup.add(baseMesh);

  // Trackpad
  const trackpadGeom = new THREE.PlaneGeometry(1.2, 0.8);
  trackpadGeom.rotateX(-Math.PI / 2);
  const trackpadMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
  const trackpad = new THREE.Mesh(trackpadGeom, trackpadMat);
  trackpad.position.set(0, 0.08, 0.6);
  laptopGroup.add(trackpad);

  // Keyboard Deck Glow
  const kbGeom = new THREE.PlaneGeometry(2.8, 1.1);
  kbGeom.rotateX(-Math.PI / 2);
  const kbMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, emissive: 0x38bdf8, emissiveIntensity: 0.25 });
  const keyboard = new THREE.Mesh(kbGeom, kbMat);
  keyboard.position.set(0, 0.08, -0.3);
  laptopGroup.add(keyboard);

  // Display Lid Group (hinged at z: -1.2)
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.07, -1.2);
  laptopGroup.add(lidGroup);

  const lidGeom = new THREE.BoxGeometry(3.6, 2.3, 0.08);
  lidGeom.translate(0, 1.15, 0);
  const lidMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
  const lidMesh = new THREE.Mesh(lidGeom, lidMat);
  lidGroup.add(lidMesh);

  // Display Screen Glass with Cyber Wallpaper
  const screenGeom = new THREE.PlaneGeometry(3.4, 2.1);
  screenGeom.translate(0, 1.15, 0.045);
  
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 1024;
  screenCanvas.height = 640;
  const sCtx = screenCanvas.getContext('2d');
  
  // Draw sleek futuristic desktop
  const grad = sCtx.createLinearGradient(0, 0, 1024, 640);
  grad.addColorStop(0, '#020617');
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, '#0284c7');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 1024, 640);

  sCtx.fillStyle = '#f8fafc';
  sCtx.font = '700 48px "Space Grotesk", sans-serif';
  sCtx.fillText('VOLTKART APEXBOOK 16', 80, 200);

  sCtx.fillStyle = '#38bdf8';
  sCtx.font = '500 24px "Poppins", sans-serif';
  sCtx.fillText('3.5K OLED 240Hz • LIQUID RETINA XDR', 80, 250);

  sCtx.strokeStyle = '#06b6d4';
  sCtx.lineWidth = 4;
  sCtx.strokeRect(80, 300, 400, 120);
  sCtx.fillStyle = '#ffffff';
  sCtx.font = '700 32px "Space Grotesk", sans-serif';
  sCtx.fillText('140W MAGSAFE PD', 110, 360);

  const screenTex = new THREE.CanvasTexture(screenCanvas);
  const screenMat = new THREE.MeshStandardMaterial({
    map: screenTex,
    emissive: 0x38bdf8,
    emissiveMap: screenTex,
    emissiveIntensity: 0.45,
    roughness: 0.1
  });
  const screenMesh = new THREE.Mesh(screenGeom, screenMat);
  lidGroup.add(screenMesh);

  // Initial Open Angle (115 degrees)
  lidGroup.rotation.x = 0.4;
  laptopGroup.rotation.set(0.3, -0.6, 0.1);

  // Orbit Rings around showcase model
  const showcaseRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(3.8, 0.02, 16, 100),
    new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.5 })
  );
  showcaseRing1.rotation.x = Math.PI / 2.5;
  scene.add(showcaseRing1);

  // Responsive scale & position: lower and shifted to the right on desktop/tablet, below text on mobile
  let currentScale = 0.72;
  function updateLaptopTransform() {
    const w = window.innerWidth;
    if (w <= 768) {
      // Mobile: centered horizontally, placed lower so laptop sits cleanly below text
      currentScale = 0.52;
      laptopGroup.position.set(0, -0.50, 0);
      showcaseRing1.position.set(0, -0.50, 0);
    } else if (w <= 1024) {
      // Tablet: shifted right and lower
      currentScale = 0.65;
      laptopGroup.position.set(0.65, -0.35, 0);
      showcaseRing1.position.set(0.65, -0.35, 0);
    } else {
      // Desktop: shifted right (x: 0.95) and lower (y: -0.32), clear gap from header and subtitle
      currentScale = 0.72;
      laptopGroup.position.set(0.95, -0.32, 0);
      showcaseRing1.position.set(0.95, -0.32, 0);
    }
    laptopGroup.scale.set(currentScale, currentScale, currentScale);
    showcaseRing1.scale.set(currentScale, currentScale, currentScale);
  }
  updateLaptopTransform();

  // Colors cycle array (Titanium Grey, Deep Cyber Blue, Royal Violet)
  const colorways = [0x1e293b, 0x0284c7, 0x7c3aed];

  // SVG Callout line drawing elements
  const calloutLine1 = document.getElementById('callout-line-1');
  const calloutLine2 = document.getElementById('callout-line-2');
  const calloutLine3 = document.getElementById('callout-line-3');

  // GSAP ScrollTrigger Pinned Showcase Scrub Timeline (tight scrub distance, zero empty gap)
  const showcaseTl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => (window.innerWidth <= 768 ? '+=400' : '+=900'),
      pin: true,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  // Colorway indicator buttons
  const colorwayNameEl = document.getElementById('showcase-colorway-name');

  showcaseTl
    // Phase 1: Orbit Camera & Reveal Spec 1 (Display)
    .to(laptopGroup.rotation, { y: 0.5, x: 0.2, z: -0.1, duration: 1 })
    .to(showcaseRing1.rotation, { z: Math.PI, duration: 1 }, 0)
    .to('.showcase-callout-1', { opacity: 1, scale: 1, duration: 0.5 }, 0.1)
    .to(calloutLine1, { strokeDashoffset: 0, duration: 0.6 }, 0.1)

    // Phase 2: Color Shift to Cyber Cyan & Rotate to I/O Ports (Spec 2)
    .call(() => {
      baseMat.color.setHex(colorways[1]);
      lidMat.color.setHex(colorways[1]);
      if (colorwayNameEl) colorwayNameEl.textContent = 'Cyber Cyan Anodized';
    }, null, 1.2)
    .to(laptopGroup.rotation, { y: 1.8, x: -0.15, duration: 1 }, 1)
    .to('.showcase-callout-1', { opacity: 0, scale: 0.8, duration: 0.3 }, 1)
    .to('.showcase-callout-2', { opacity: 1, scale: 1, duration: 0.5 }, 1.3)
    .to(calloutLine2, { strokeDashoffset: 0, duration: 0.6 }, 1.3)

    // Phase 3: Color Shift to Royal Violet & Top-Down Power Delivery (Spec 3)
    .call(() => {
      baseMat.color.setHex(colorways[2]);
      lidMat.color.setHex(colorways[2]);
      if (colorwayNameEl) colorwayNameEl.textContent = 'Quantum Purple Edition';
    }, null, 2.2)
    .to(laptopGroup.rotation, { y: 3.2, x: 0.4, z: 0.1, duration: 1 }, 2)
    .to('.showcase-callout-2', { opacity: 0, scale: 0.8, duration: 0.3 }, 2)
    .to('.showcase-callout-3', { opacity: 1, scale: 1, duration: 0.5 }, 2.3)
    .to(calloutLine3, { strokeDashoffset: 0, duration: 0.6 }, 2.3)

    // Reset back to Titanium Grey near end
    .call(() => {
      baseMat.color.setHex(colorways[0]);
      lidMat.color.setHex(colorways[0]);
      if (colorwayNameEl) colorwayNameEl.textContent = 'Space Titanium Alloy';
    }, null, 3.2)
    .to(laptopGroup.rotation, { y: 6.28, x: 0.3, z: 0, duration: 1 }, 3);

  // Fallback: ensure callouts are visible on mobile, reduced motion, or if scroll animation fails
  const isMobile = window.innerWidth <= 768;
  if (isMobile || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.showcase-spec-callout').forEach(c => {
      c.classList.add('fallback-visible');
    });
  }
  setTimeout(() => {
    document.querySelectorAll('.showcase-spec-callout').forEach(c => {
      if (window.innerWidth <= 768) {
        c.classList.add('fallback-visible');
      }
    });
  }, 1200);

  // Manual Color Swatch Clickers
  document.querySelectorAll('.showcase-color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const hex = parseInt(dot.getAttribute('data-hex'), 16);
      const name = dot.getAttribute('data-name');
      baseMat.color.setHex(hex);
      lidMat.color.setHex(hex);
      if (colorwayNameEl) colorwayNameEl.textContent = name;

      document.querySelectorAll('.showcase-color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');

      const base = currentScale;
      gsap.fromTo(laptopGroup.scale, 
        { x: base * 0.94, y: base * 0.94, z: base * 0.94 }, 
        { x: base, y: base, z: base, duration: 0.4, ease: 'back.out(2)' }
      );
      renderer.render(scene, camera);
    });
  });

  // Initial immediate render to guarantee visible canvas
  renderer.render(scene, camera);

  // Reliable render loop linked with ScrollTrigger & Page Visibility
  let isVisible = true;
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: () => { isVisible = true; },
    onLeave: () => { isVisible = false; },
    onEnterBack: () => { isVisible = true; },
    onLeaveBack: () => { isVisible = false; }
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) isVisible = true;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible || document.hidden) return;

    showcaseRing1.rotation.y += 0.003;
    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    updateLaptopTransform();
    ScrollTrigger.refresh();
  });
}
