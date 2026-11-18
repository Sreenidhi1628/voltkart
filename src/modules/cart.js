import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { showToast } from './toast.js';
import { getCompatibilityEngine } from './compatibility.js';
import { products } from '../data/products.js';
import { lockScroll, unlockScroll } from './transitions.js';

const FREE_SHIPPING_THRESHOLD = 500;

export class CartManager {
  constructor() {
    this.items = [];
    this.couponCode = '';
    this.discountPercent = 0;
    this.discountFlat = 0;
    this.isOpen = false;
    this.engine = getCompatibilityEngine();

    this.loadFromStorage();
    this.initDOM();
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('voltkart_cart');
      if (data) this.items = JSON.parse(data);
      const savedCoupon = localStorage.getItem('voltkart_coupon');
      if (savedCoupon) {
        this.couponCode = savedCoupon;
        this.applyCouponLogic(savedCoupon, false);
      }
    } catch (e) {
      console.warn('Cart load error:', e);
      this.items = [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('voltkart_cart', JSON.stringify(this.items));
      if (this.couponCode) {
        localStorage.setItem('voltkart_coupon', this.couponCode);
      } else {
        localStorage.removeItem('voltkart_coupon');
      }
    } catch (e) {
      console.warn('Cart save error:', e);
    }
  }

  initDOM() {
    this.drawer = document.getElementById('cart-drawer');
    this.backdrop = document.getElementById('cart-backdrop');
    this.itemsList = document.getElementById('cart-items-list');
    this.emptyState = document.getElementById('cart-empty-state');
    this.footer = document.getElementById('cart-footer');
    this.subtotalEl = document.getElementById('cart-subtotal');
    this.discountRow = document.getElementById('cart-discount-row');
    this.discountEl = document.getElementById('cart-discount-val');
    this.totalEl = document.getElementById('cart-total');
    this.badgeEl = document.getElementById('cart-badge');
    this.shippingProgressFill = document.getElementById('shipping-progress-fill');
    this.shippingProgressText = document.getElementById('shipping-progress-text');
    this.couponInput = document.getElementById('coupon-input');
    this.applyCouponBtn = document.getElementById('apply-coupon-btn');
    this.couponMsg = document.getElementById('coupon-msg');

    // Drawer triggers
    const openBtn = document.getElementById('open-cart-btn');
    const closeBtn = document.getElementById('cart-close-btn');

    if (openBtn) openBtn.addEventListener('click', () => this.open());
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (this.backdrop) this.backdrop.addEventListener('click', () => this.close());

    // Coupon button
    if (this.applyCouponBtn && this.couponInput) {
      this.applyCouponBtn.addEventListener('click', () => {
        const code = this.couponInput.value.trim().toUpperCase();
        this.applyCoupon(code);
      });
    }

    // Checkout button
    const checkoutBtn = document.getElementById('cart-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        showToast('Redirecting to secure VoltKart payment gateway...', 'success', 'Order Processing');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      });
    }

    this.updateUI();
  }

  open() {
    if (!this.drawer || !this.backdrop) return;
    this.isOpen = true;
    this.backdrop.classList.add('open');
    this.drawer.classList.add('open');
    lockScroll();
    this.renderItems();

    // Stagger animation for cart items
    gsap.from('.cart-item', {
      x: 50,
      opacity: 0,
      stagger: 0.08,
      duration: 0.45,
      ease: 'power3.out'
    });
  }

  close() {
    if (!this.drawer || !this.backdrop) return;
    this.isOpen = false;
    this.backdrop.classList.remove('open');
    this.drawer.classList.remove('open');
    unlockScroll();
  }

  addItem(product, sourceElement = null) {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }

    this.saveToStorage();
    this.updateUI();

    if (sourceElement) {
      this.flyToCartAnimation(sourceElement, product.image);
    } else {
      this.triggerCartBounce();
    }

    showToast(`Added ${product.name} to your cart!`, 'success');
  }

  removeItem(productId) {
    const itemEl = document.querySelector(`.cart-item[data-cart-id="${productId}"]`);
    if (itemEl) {
      gsap.to(itemEl, {
        x: 80,
        opacity: 0,
        height: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          this.items = this.items.filter(item => item.id !== productId);
          this.saveToStorage();
          this.updateUI();
        }
      });
    } else {
      this.items = this.items.filter(item => item.id !== productId);
      this.saveToStorage();
      this.updateUI();
    }
  }

  updateQuantity(productId, delta) {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
    } else {
      this.saveToStorage();
      this.updateUI();
    }
  }

  applyCouponLogic(code, showNotifications = true) {
    if (code === 'VOLT10') {
      this.discountPercent = 10;
      this.discountFlat = 0;
      this.couponCode = code;
      if (showNotifications) showToast('10% Cyber Discount Applied!', 'promo', 'Coupon Activated');
      return true;
    } else if (code === 'CYBER20') {
      this.discountPercent = 20;
      this.discountFlat = 0;
      this.couponCode = code;
      if (showNotifications) showToast('20% Mega VIP Discount Applied!', 'promo', 'Coupon Activated');
      return true;
    } else if (code === 'SUPER50') {
      this.discountPercent = 0;
      this.discountFlat = 50;
      this.couponCode = code;
      if (showNotifications) showToast('$50 Flat Instant Discount Applied!', 'promo', 'Coupon Activated');
      return true;
    }
    return false;
  }

  applyCoupon(code) {
    if (!code) {
      this.couponCode = '';
      this.discountPercent = 0;
      this.discountFlat = 0;
      this.saveToStorage();
      this.updateUI();
      if (this.couponMsg) {
        this.couponMsg.textContent = 'Coupon removed';
        this.couponMsg.style.color = 'var(--text-muted)';
      }
      return;
    }

    const success = this.applyCouponLogic(code, true);
    if (success) {
      this.saveToStorage();
      this.updateUI();
      if (this.couponMsg) {
        this.couponMsg.textContent = `Applied: ${this.couponCode}`;
        this.couponMsg.style.color = 'var(--neon-emerald)';
      }
    } else {
      if (this.couponMsg) {
        this.couponMsg.textContent = 'Invalid code. Try VOLT10 or CYBER20';
        this.couponMsg.style.color = 'var(--neon-rose)';
      }
      showToast('Invalid coupon code. Try "VOLT10"', 'error');
    }
  }

  getTotals() {
    const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    if (this.discountPercent > 0) {
      discount = Math.round((subtotal * this.discountPercent) / 100);
    } else if (this.discountFlat > 0) {
      discount = Math.min(subtotal, this.discountFlat);
    }

    const total = Math.max(0, subtotal - discount);
    return { subtotal, discount, total };
  }

  updateUI() {
    const totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0);

    // Update Header Badge
    if (this.badgeEl) {
      this.badgeEl.textContent = totalCount;
      if (totalCount > 0) {
        this.badgeEl.style.display = 'flex';
      } else {
        this.badgeEl.style.display = 'none';
      }
    }

    // Toggle items vs empty state
    if (this.items.length === 0) {
      if (this.emptyState) this.emptyState.style.display = 'flex';
      if (this.itemsList) this.itemsList.style.display = 'none';
      if (this.footer) this.footer.style.display = 'none';
    } else {
      if (this.emptyState) this.emptyState.style.display = 'none';
      if (this.itemsList) this.itemsList.style.display = 'flex';
      if (this.footer) this.footer.style.display = 'block';
      this.renderItems();
    }

    // Update Shipping & Totals
    const { subtotal, discount, total } = this.getTotals();

    // Free shipping bar
    if (this.shippingProgressFill && this.shippingProgressText) {
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      if (remaining <= 0) {
        this.shippingProgressFill.style.width = '100%';
        this.shippingProgressFill.style.background = 'var(--neon-emerald)';
        this.shippingProgressText.innerHTML = `🎉 You unlocked <strong>FREE Express Shipping</strong>!`;
      } else {
        const percent = Math.min(100, Math.max(0, (subtotal / FREE_SHIPPING_THRESHOLD) * 100));
        this.shippingProgressFill.style.width = `${percent}%`;
        this.shippingProgressFill.style.background = 'var(--grad-primary)';
        this.shippingProgressText.innerHTML = `Add <strong>$${remaining}</strong> more for <strong>FREE Express Shipping</strong>`;
      }
    }

    // Update Compatibility Audit Summary
    this.renderCompatibilityAudit();

    // Animate Number Roll for Total & Subtotal
    this.animateNumberRoll(this.subtotalEl, subtotal);
    this.animateNumberRoll(this.totalEl, total);

    if (this.discountRow && this.discountEl) {
      if (discount > 0) {
        this.discountRow.style.display = 'flex';
        this.discountEl.textContent = `-$${discount}`;
      } else {
        this.discountRow.style.display = 'none';
      }
    }
  }

  renderCompatibilityAudit() {
    let auditContainer = document.getElementById('cart-compat-audit-container');
    if (!auditContainer) {
      auditContainer = document.createElement('div');
      auditContainer.id = 'cart-compat-audit-container';
      if (this.itemsList && this.itemsList.parentNode) {
        this.itemsList.parentNode.insertBefore(auditContainer, this.itemsList);
      }
    }

    if (this.items.length === 0) {
      auditContainer.style.display = 'none';
      return;
    }

    const audit = this.engine.auditCart(this.items);

    if (audit.needsAdapterCount === 0 && audit.limitsCount === 0) {
      auditContainer.style.display = 'block';
      auditContainer.innerHTML = `
        <div class="cart-compat-banner cart-compat-perfect">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Ecosystem Synergy: All ${this.items.length} items work 100% with your saved setup!</span>
        </div>
      `;
    } else {
      auditContainer.style.display = 'block';
      const summaryText = `${audit.compatibleCount} items work, ${audit.needsAdapterCount > 0 ? `${audit.needsAdapterCount} item needs an adapter` : `${audit.limitsCount} works with limits`}`;

      const recHtml = audit.adapterSuggestions.map(rec => `
        <div class="cart-compat-fix-row">
          <div class="cart-compat-fix-info">
            <span class="cart-compat-fix-name">${rec.name}</span>
            <span class="cart-compat-fix-price">+$${rec.price}</span>
          </div>
          <button class="cart-compat-fix-btn" data-fix-id="${rec.id}">
            + 1-Click Fix
          </button>
        </div>
      `).join('');

      auditContainer.innerHTML = `
        <div class="cart-compat-banner cart-compat-warning">
          <div class="cart-compat-header">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#f59e0b" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <strong>Hardware Setup Audit:</strong> ${summaryText}
          </div>
          ${recHtml ? `<div class="cart-compat-fixes-list">${recHtml}</div>` : ''}
        </div>
      `;

      auditContainer.querySelectorAll('.cart-compat-fix-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-fix-id');
          const prod = products.find(p => p.id === id);
          if (prod) {
            this.addItem(prod, btn);
          }
        });
      });
    }
  }

  animateNumberRoll(element, targetValue) {
    if (!element) return;
    const currentVal = parseInt(element.getAttribute('data-value') || '0', 10);
    if (currentVal === targetValue) {
      element.textContent = `$${targetValue}`;
      return;
    }

    const obj = { val: currentVal };
    gsap.to(obj, {
      val: targetValue,
      duration: 0.6,
      ease: 'power3.out',
      onUpdate: () => {
        element.textContent = `$${Math.round(obj.val)}`;
      },
      onComplete: () => {
        element.setAttribute('data-value', targetValue);
        element.textContent = `$${targetValue}`;
      }
    });
  }

  renderItems() {
    if (!this.itemsList) return;

    this.itemsList.innerHTML = this.items.map(item => `
      <div class="cart-item" data-cart-id="${item.id}">
        <div class="cart-item-media">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        </div>
        <div class="cart-item-info">
          <div class="cart-item-top">
            <h4 class="cart-item-title">${item.name}</h4>
            <button class="cart-item-remove-btn" data-remove-id="${item.id}" aria-label="Remove item">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
          <div class="cart-item-category">${item.category} • ${item.brand}</div>
          <div class="cart-item-bottom">
            <div class="cart-qty-stepper">
              <button class="cart-qty-btn cart-qty-minus" data-qty-id="${item.id}" data-delta="-1">−</button>
              <span class="cart-qty-val">${item.quantity}</span>
              <button class="cart-qty-btn cart-qty-plus" data-qty-id="${item.id}" data-delta="1">+</button>
            </div>
            <div class="cart-item-pricing">
              <span class="cart-item-unit-price">$${item.price} each</span>
              <span class="cart-item-total-price">$${item.price * item.quantity}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Attach listeners
    this.itemsList.querySelectorAll('.cart-item-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-remove-id');
        this.removeItem(id);
      });
    });

    this.itemsList.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-qty-id');
        const delta = parseInt(btn.getAttribute('data-delta'), 10);
        this.updateQuantity(id, delta);
      });
    });
  }

  flyToCartAnimation(sourceElement, imageSrc) {
    const cartNavIcon = document.getElementById('open-cart-btn') || document.getElementById('cart-nav-icon');
    if (!cartNavIcon) {
      this.triggerCartBounce();
      return;
    }

    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = cartNavIcon.getBoundingClientRect();

    // Create flying image element
    const flyer = document.createElement('img');
    flyer.src = imageSrc;
    flyer.className = 'fly-to-cart-item';
    document.body.appendChild(flyer);

    // Initial position
    const startX = sourceRect.left + sourceRect.width / 2 - 30;
    const startY = sourceRect.top + sourceRect.height / 2 - 30;
    const destX = targetRect.left + targetRect.width / 2 - 12;
    const destY = targetRect.top + targetRect.height / 2 - 12;

    gsap.set(flyer, {
      x: startX,
      y: startY,
      scale: 1,
      opacity: 1
    });

    // Control point for arc trajectory
    const midX = (startX + destX) / 2 - 100;
    const midY = Math.min(startY, destY) - 120;

    // Curved Flight using GSAP timeline
    const tl = gsap.timeline({
      onComplete: () => {
        flyer.remove();
        this.triggerCartBounce();
        this.burstConfetti(destX, destY);
      }
    });

    tl.to(flyer, {
      x: destX,
      y: destY,
      scale: 0.25,
      opacity: 0.8,
      duration: 0.85,
      ease: 'power2.inOut'
    });
  }

  triggerCartBounce() {
    const icon = document.getElementById('cart-nav-icon');
    const badge = document.getElementById('cart-badge');

    if (icon) {
      icon.classList.remove('cart-shake-active');
      void icon.offsetWidth;
      icon.classList.add('cart-shake-active');
    }

    if (badge) {
      gsap.fromTo(badge, 
        { scale: 1.8 }, 
        { scale: 1, duration: 0.45, ease: 'elastic.out(1.5, 0.4)' }
      );
    }
  }

  burstConfetti(x, y) {
    // Relative coordinates
    const normX = x / window.innerWidth;
    const normY = y / window.innerHeight;

    confetti({
      particleCount: 28,
      spread: 60,
      startVelocity: 25,
      origin: { x: normX, y: normY },
      colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#ffffff'],
      disableForReducedMotion: true
    });
  }
}

let cartInstance = null;
export function initCart() {
  if (!cartInstance) {
    cartInstance = new CartManager();
  }
  return cartInstance;
}

export function getCart() {
  return cartInstance || initCart();
}
