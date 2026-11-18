import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHero3D() {
  const container = document.getElementById('hero-canvas-container');
  if (!container) return;

  const width = container.clientWidth || window.innerWidth * 0.45;
  const height = container.clientHeight || 550;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 8.5);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0x38bdf8, 3.5);
  mainLight.position.set(5, 8, 6);
  scene.add(mainLight);

  const rimLight = new THREE.DirectionalLight(0x8b5cf6, 4.0);
  rimLight.position.set(-6, -4, 4);
  scene.add(rimLight);

  const backLight = new THREE.PointLight(0x06b6d4, 3.0, 15);
  backLight.position.set(0, 0, -4);
  scene.add(backLight);

  // Group that holds the entire Phone
  const phoneGroup = new THREE.Group();
  scene.add(phoneGroup);

  // 1. Procedural Screen Dynamic Texture (Cyberpunk UI)
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 1024;
  screenCanvas.height = 2048;
  const ctx = screenCanvas.getContext('2d');

  function renderScreenCanvas(time = 0) {
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 2048);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#0e172a');
    grad.addColorStop(1, '#05070d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 2048);

    // Glowing Cyber Grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 2;
    for (let x = 0; x < 1024; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 2048);
      ctx.stroke();
    }
    for (let y = 0; y < 2048; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Dynamic Island / Pill
    ctx.fillStyle = '#020617';
    roundRect(ctx, 412, 50, 200, 50, 25);
    ctx.fill();

    // Time & Battery
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 72px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('09:41', 512, 280);

    ctx.font = '600 32px "Poppins", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('VOLTKART 5G • TITANIUM ULTRA', 512, 350);

    // Central Glowing Arc Gauge
    const centerX = 512;
    const centerY = 900;
    const radius = 220;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 14;
    ctx.stroke();

    const arcEnd = (Math.PI * 0.75) + Math.sin(time * 2) * 0.4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI * 0.75, arcEnd);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Central Spec Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 90px "Space Grotesk", sans-serif';
    ctx.fillText('A18 PRO', 512, 900);
    ctx.font = '500 34px "Poppins", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('3nm 6-Core Neural Silicon', 512, 960);

    // Live Animated Sine Waveforms
    ctx.beginPath();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 8;
    for (let x = 150; x <= 874; x += 10) {
      const y = 1400 + Math.sin(x * 0.02 + time * 3) * 60;
      if (x === 150) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Bottom Quick Action Buttons
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    roundRect(ctx, 160, 1750, 120, 120, 60);
    ctx.fill();
    roundRect(ctx, 744, 1750, 120, 120, 60);
    ctx.fill();

    // Home Bar
    ctx.fillStyle = '#f8fafc';
    roundRect(ctx, 362, 1960, 300, 12, 6);
    ctx.fill();
  }

  function roundRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  renderScreenCanvas(0);
  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.anisotropy = 8;

  // 2. Geometry: Rounded Phone Chassis
  const phoneWidth = 2.6;
  const phoneHeight = 5.2;
  const phoneDepth = 0.22;
  const cornerRadius = 0.32;

  // Shape for the Phone Chassis
  const shape = new THREE.Shape();
  const x = -phoneWidth / 2;
  const y = -phoneHeight / 2;
  shape.moveTo(x + cornerRadius, y);
  shape.lineTo(x + phoneWidth - cornerRadius, y);
  shape.quadraticCurveTo(x + phoneWidth, y, x + phoneWidth, y + cornerRadius);
  shape.lineTo(x + phoneWidth, y + phoneHeight - cornerRadius);
  shape.quadraticCurveTo(x + phoneWidth, y + phoneHeight, x + phoneWidth - cornerRadius, y + phoneHeight);
  shape.lineTo(x + cornerRadius, y + phoneHeight);
  shape.quadraticCurveTo(x, y + phoneHeight, x, y + phoneHeight - cornerRadius);
  shape.lineTo(x, y + cornerRadius);
  shape.quadraticCurveTo(x, y, x + cornerRadius, y);

  const extrudeSettings = {
    depth: phoneDepth,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 1,
    bevelSize: 0.05,
    bevelThickness: 0.05
  };

  const bodyGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  bodyGeometry.center();

  // Dark Brushed Titanium Frame Material
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e2638,
    metalness: 0.92,
    roughness: 0.22,
    envMapIntensity: 1.5
  });

  const phoneBodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
  phoneGroup.add(phoneBodyMesh);

  // 3. Screen Mesh (Front Layer)
  const screenGeom = new THREE.PlaneGeometry(phoneWidth - 0.16, phoneHeight - 0.16);
  const screenMaterial = new THREE.MeshStandardMaterial({
    map: screenTexture,
    metalness: 0.1,
    roughness: 0.15,
    emissive: 0x38bdf8,
    emissiveMap: screenTexture,
    emissiveIntensity: 0.35
  });
  const screenMesh = new THREE.Mesh(screenGeom, screenMaterial);
  screenMesh.position.z = (phoneDepth / 2) + 0.06;
  phoneGroup.add(screenMesh);

  // 4. Internal Exploded Layers (Motherboard & Battery)
  const chipGeom = new THREE.BoxGeometry(1.6, 2.0, 0.06);
  const chipMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.8,
    roughness: 0.3,
    emissive: 0x8b5cf6,
    emissiveIntensity: 0.4
  });
  const chipMesh = new THREE.Mesh(chipGeom, chipMaterial);
  chipMesh.position.set(0, 0.8, 0);
  phoneGroup.add(chipMesh);

  const batteryGeom = new THREE.BoxGeometry(1.8, 2.2, 0.05);
  const batteryMaterial = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.6,
    roughness: 0.4,
    emissive: 0x10b981,
    emissiveIntensity: 0.2
  });
  const batteryMesh = new THREE.Mesh(batteryGeom, batteryMaterial);
  batteryMesh.position.set(0, -1.2, 0);
  phoneGroup.add(batteryMesh);

  // 5. Back Camera Plateau & 3 Titanium Lenses
  const camPlateauGeom = new THREE.BoxGeometry(1.1, 1.1, 0.12);
  const camPlateauMat = new THREE.MeshStandardMaterial({ color: 0x172033, metalness: 0.85, roughness: 0.25 });
  const camPlateau = new THREE.Mesh(camPlateauGeom, camPlateauMat);
  camPlateau.position.set(-0.55, 1.6, -(phoneDepth / 2) - 0.08);
  phoneGroup.add(camPlateau);

  const lensGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.14, 32);
  lensGeom.rotateX(Math.PI / 2);
  const lensRingMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.95, roughness: 0.1 });
  const lensGlassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.2, roughness: 0.05 });

  const lensPositions = [
    [-0.75, 1.85, -(phoneDepth / 2) - 0.16],
    [-0.75, 1.35, -(phoneDepth / 2) - 0.16],
    [-0.35, 1.6, -(phoneDepth / 2) - 0.16]
  ];

  lensPositions.forEach(pos => {
    const lensRing = new THREE.Mesh(lensGeom, lensRingMat);
    lensRing.position.set(...pos);
    phoneGroup.add(lensRing);

    const innerGlass = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), lensGlassMat);
    innerGlass.position.set(pos[0], pos[1], pos[2] - 0.08);
    innerGlass.rotation.y = Math.PI;
    phoneGroup.add(innerGlass);
  });

  // 6. Orbiting Neon Rings
  const ringGeom = new THREE.TorusGeometry(3.6, 0.02, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.6 });
  const neonRing = new THREE.Mesh(ringGeom, ringMat);
  neonRing.rotation.x = Math.PI / 3;
  scene.add(neonRing);

  const ringGeom2 = new THREE.TorusGeometry(3.2, 0.015, 16, 100);
  const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.45 });
  const neonRing2 = new THREE.Mesh(ringGeom2, ringMat2);
  neonRing2.rotation.x = -Math.PI / 4;
  neonRing2.rotation.y = Math.PI / 6;
  scene.add(neonRing2);

  // 7. Ambient Particle Starfield (Reduced on mobile for max FPS)
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 60 : 200;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 16;
    particlePositions[i + 1] = (Math.random() - 0.5) * 16;
    particlePositions[i + 2] = (Math.random() - 0.5) * 12;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });
  const particleField = new THREE.Points(particleGeo, particleMat);
  scene.add(particleField);

  // Initial tilt & orientation
  phoneGroup.rotation.set(0.1, -0.4, 0.08);

  // Mouse Parallax
  let mouseTargetX = 0;
  let mouseTargetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseTargetX = (e.clientX / window.innerWidth - 0.5) * 0.8;
    mouseTargetY = (e.clientY / window.innerHeight - 0.5) * 0.8;
  });

  // Scroll Explosion Timeline with GSAP ScrollTrigger
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    const explosionTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    explosionTl
      // Rotate the phone toward camera
      .to(phoneGroup.rotation, { y: 0.2, x: 0.3, z: -0.1 }, 0)
      // Screen explodes forward
      .to(screenMesh.position, { z: 1.5 }, 0)
      // Motherboard chip floats forward
      .to(chipMesh.position, { z: 0.8, y: 1.2 }, 0)
      // Battery slides downward
      .to(batteryMesh.position, { z: 0.4, y: -1.8 }, 0)
      // Chassis stays back and recedes slightly
      .to(phoneBodyMesh.position, { z: -0.5 }, 0)
      // Orbit rings expand
      .to(neonRing.scale, { x: 1.3, y: 1.3, z: 1.3 }, 0)
      .to(neonRing2.scale, { x: 1.2, y: 1.2, z: 1.2 }, 0);
  }

  // Animation Loop with Performance Capping
  let isVisible = true;
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  });
  observer.observe(container);

  const clock = new THREE.Clock();
  let screenUpdateTimer = 0;

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Idle sine breathing
    phoneGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.15;
    
    // Smooth lerp to mouse parallax
    phoneGroup.rotation.y += (mouseTargetX - phoneGroup.rotation.y + 0.1) * 0.04;
    phoneGroup.rotation.x += (-mouseTargetY - phoneGroup.rotation.x + 0.1) * 0.04;

    // Rings slow rotation
    neonRing.rotation.z += 0.005;
    neonRing2.rotation.z -= 0.003;
    particleField.rotation.y = elapsedTime * 0.02;

    // Periodically update dynamic screen canvas
    screenUpdateTimer += delta;
    if (screenUpdateTimer > 0.08) {
      renderScreenCanvas(elapsedTime);
      screenTexture.needsUpdate = true;
      screenUpdateTimer = 0;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Resize Handler
  function handleResize() {
    if (!container) return;
    const newW = container.clientWidth;
    const newH = container.clientHeight || 550;
    camera.aspect = newW / newH;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, newH);
  }

  window.addEventListener('resize', handleResize);
}
