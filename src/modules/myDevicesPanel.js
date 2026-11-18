import gsap from 'gsap';
import { phones, laptops, tvs } from '../data/devices.js';
import { products } from '../data/products.js';
import { getCompatibilityEngine } from './compatibility.js';
import { showToast } from './toast.js';
import { getCart } from './cart.js';
import { lockScroll, unlockScroll } from './transitions.js';

export class MyDevicesPanel {
  constructor() {
    this.engine = getCompatibilityEngine();
    this.isOpen = false;
    this.initDOM();
  }

  initDOM() {
    this.drawer = document.getElementById('my-devices-drawer');
    this.backdrop = document.getElementById('my-devices-backdrop');
    this.closeBtn = document.getElementById('my-devices-close-btn');
    this.openBtn = document.getElementById('open-my-devices-btn');
    this.heroCheckBtn = document.getElementById('hero-check-setup-btn');

    this.phoneSelect = document.getElementById('setup-phone-select');
    this.laptopSelect = document.getElementById('setup-laptop-select');
    this.tvSelect = document.getElementById('setup-tv-select');

    this.plainInput = document.getElementById('plain-english-input');
    this.analyzeBtn = document.getElementById('analyze-plain-btn');
    this.chipsContainer = document.getElementById('detected-chips-container');
    this.confirmCard = document.getElementById('did-we-get-right-card');
    this.applyChipsBtn = document.getElementById('apply-detected-setup-btn');
    this.shareBtn = document.getElementById('share-setup-btn');
    this.badgeEl = document.getElementById('my-devices-badge');

    // Populate dropdowns
    this.populateDropdowns();

    // Event listeners
    if (this.openBtn) this.openBtn.addEventListener('click', () => this.open());
    if (this.heroCheckBtn) this.heroCheckBtn.addEventListener('click', () => this.open());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
    if (this.backdrop) this.backdrop.addEventListener('click', () => this.close());

    // Dropdown change listeners
    if (this.phoneSelect) {
      this.phoneSelect.addEventListener('change', () => this.handleDropdownChange());
    }
    if (this.laptopSelect) {
      this.laptopSelect.addEventListener('change', () => this.handleDropdownChange());
    }
    if (this.tvSelect) {
      this.tvSelect.addEventListener('change', () => this.handleDropdownChange());
    }

    // Plain English NLP analyzer
    if (this.analyzeBtn && this.plainInput) {
      this.analyzeBtn.addEventListener('click', () => this.analyzeText());
      this.plainInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.analyzeText();
      });
    }

    // Share setup button
    if (this.shareBtn) {
      this.shareBtn.addEventListener('click', () => this.shareSetup());
    }

    this.syncDropdownsWithState();
  }

  populateDropdowns() {
    if (this.phoneSelect) {
      this.phoneSelect.innerHTML = phones.map(p => `
        <option value="${p.id}">${p.name} (${p.fastChargeWattage}W ${p.portType})</option>
      `).join('');
    }

    if (this.laptopSelect) {
      this.laptopSelect.innerHTML = laptops.map(l => {
        const portSummary = `${l.ports.usbC}x USB-C${l.ports.hdmi ? ', 1x HDMI' : ', No HDMI'}`;
        return `<option value="${l.id}">${l.name} (${portSummary})</option>`;
      }).join('');
    }

    if (this.tvSelect) {
      this.tvSelect.innerHTML = tvs.map(t => `
        <option value="${t.id}">${t.name} (HDMI ${t.maxHdmiVersion})</option>
      `).join('');
    }
  }

  syncDropdownsWithState() {
    const setup = this.engine.userSetup;
    if (this.phoneSelect && setup.phoneId) this.phoneSelect.value = setup.phoneId;
    if (this.laptopSelect && setup.laptopId) this.laptopSelect.value = setup.laptopId;
    if (this.tvSelect && setup.tvId) this.tvSelect.value = setup.tvId;

    if (this.badgeEl) {
      this.badgeEl.style.display = 'flex';
      this.badgeEl.textContent = '3';
    }
  }

  handleDropdownChange() {
    const newSetup = {
      phoneId: this.phoneSelect?.value,
      laptopId: this.laptopSelect?.value,
      tvId: this.tvSelect?.value
    };

    this.engine.saveUserSetup(newSetup);
    this.triggerScanlineEffect();
    showToast('Updated active hardware ecosystem profile!', 'info', 'Setup Calibrated');
  }

  open() {
    if (!this.drawer || !this.backdrop) return;
    this.isOpen = true;
    this.backdrop.classList.add('open');
    this.drawer.classList.add('open');
    lockScroll();
    this.syncDropdownsWithState();
    this.triggerScanlineEffect();
  }

  close() {
    if (!this.drawer || !this.backdrop) return;
    this.isOpen = false;
    this.backdrop.classList.remove('open');
    this.drawer.classList.remove('open');
    unlockScroll();
  }

  triggerScanlineEffect() {
    const scanline = document.getElementById('device-scanline');
    if (scanline) {
      gsap.fromTo(scanline, 
        { top: '-10%', opacity: 0.8 }, 
        { top: '110%', opacity: 0, duration: 1.2, ease: 'power2.inOut' }
      );
    }
  }

  /**
   * Plain English text analyzer with typing & scanning feedback
   */
  analyzeText() {
    const text = this.plainInput?.value?.trim();
    if (!text) {
      showToast('Please enter what devices or ports you own.', 'info');
      return;
    }

    const analyzeBtn = this.analyzeBtn;
    const originalText = analyzeBtn?.innerHTML;
    if (analyzeBtn) {
      analyzeBtn.innerHTML = `
        <svg class="spinner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <span>Analyzing Ecosystem...</span>
      `;
      analyzeBtn.disabled = true;
    }

    this.triggerScanlineEffect();

    setTimeout(() => {
      if (analyzeBtn) {
        analyzeBtn.innerHTML = originalText;
        analyzeBtn.disabled = false;
      }

      const result = this.engine.parsePlainEnglish(text);

      if (!result.phone && !result.laptop && !result.tv) {
        showToast('Could not detect specific hardware. Please pick from dropdowns.', 'error');
        return;
      }

      // Show "Did we get this right?" card with editable chips
      if (this.confirmCard && this.chipsContainer) {
        this.confirmCard.style.display = 'block';

        this.chipsContainer.innerHTML = result.rawTokens.map(token => `
          <div class="detected-chip">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${token}</span>
          </div>
        `).join('');

        gsap.from(this.confirmCard, {
          y: 20,
          opacity: 0,
          duration: 0.4,
          ease: 'back.out(1.5)'
        });

        // Set pending setup
        const pendingSetup = { ...this.engine.userSetup };
        if (result.phone) pendingSetup.phoneId = result.phone.id;
        if (result.laptop) pendingSetup.laptopId = result.laptop.id;
        if (result.tv) pendingSetup.tvId = result.tv.id;

        if (this.applyChipsBtn) {
          this.applyChipsBtn.onclick = () => {
            this.engine.saveUserSetup(pendingSetup);
            this.syncDropdownsWithState();
            this.confirmCard.style.display = 'none';
            if (this.plainInput) this.plainInput.value = '';
            showToast('Setup calibrated to your exact devices!', 'success', 'Hardware Synchronized');
          };
        }
      }
    }, 700);
  }

  shareSetup() {
    const setup = this.engine.userSetup;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('phone', setup.phoneId);
    url.searchParams.set('laptop', setup.laptopId);
    url.searchParams.set('tv', setup.tvId);

    navigator.clipboard.writeText(url.toString()).then(() => {
      showToast('Shareable hardware setup link copied to clipboard!', 'success', 'Setup Link Ready');
    }).catch(() => {
      showToast('Could not copy to clipboard. Link generated.', 'info');
    });
  }
}

let panelInstance = null;
export function initMyDevicesPanel() {
  if (!panelInstance) {
    panelInstance = new MyDevicesPanel();
  }
  return panelInstance;
}

/**
 * Render Circular Compatibility Meter (0-100%) SVG
 */
export function createCircularGaugeSvg(score = 100, size = 70) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let strokeColor = '#10b981'; // green
  if (score < 60) strokeColor = '#f43f5e'; // red
  else if (score < 90) strokeColor = '#f59e0b'; // yellow

  return `
    <div class="circular-meter-wrap" style="width:${size}px; height:${size}px;">
      <svg class="circular-meter-svg" width="${size}" height="${size}">
        <circle 
          class="circular-meter-bg" 
          cx="${size/2}" 
          cy="${size/2}" 
          r="${radius}" 
          stroke-width="${strokeWidth}"
        />
        <circle 
          class="circular-meter-fill" 
          cx="${size/2}" 
          cy="${size/2}" 
          r="${radius}" 
          stroke-width="${strokeWidth}"
          stroke="${strokeColor}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"
        />
      </svg>
      <div class="circular-meter-text" style="color:${strokeColor};">
        ${score}%
      </div>
    </div>
  `;
}
