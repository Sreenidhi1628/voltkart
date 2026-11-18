import gsap from 'gsap';
import { products } from '../data/products.js';
import { getCart } from './cart.js';
import { showToast } from './toast.js';
import { lockScroll, unlockScroll } from './transitions.js';

export class WishlistManager {
  constructor() {
    this.ids = [];
    this.isOpen = false;

    this.loadFromStorage();
    this.initDOM();
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('voltkart_wishlist');
      if (data) this.ids = JSON.parse(data);
    } catch (e) {
      console.warn('Wishlist load error:', e);
      this.ids = [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('voltkart_wishlist', JSON.stringify(this.ids));
    } catch (e) {
      console.warn('Wishlist save error:', e);
    }
  }

  initDOM() {
    this.drawer = document.getElementById('wishlist-drawer');
    this.backdrop = document.getElementById('wishlist-backdrop');
    this.itemsList = document.getElementById('wishlist-items-list');
    this.emptyState = document.getElementById('wishlist-empty-state');
    this.badgeEl = document.getElementById('wishlist-badge');

    // Triggers
    const openBtn = document.getElementById('open-wishlist-btn');
    const closeBtn = document.getElementById('wishlist-close-btn');

    if (openBtn) openBtn.addEventListener('click', () => this.open());
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (this.backdrop) this.backdrop.addEventListener('click', () => this.close());

    this.updateUI();
  }

  open() {
    if (!this.drawer || !this.backdrop) return;
    this.isOpen = true;
    this.backdrop.classList.add('open');
    this.drawer.classList.add('open');
    lockScroll();
    this.renderItems();

    gsap.from('.wishlist-item', {
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

  toggle(productId, targetBtn = null) {
    const idx = this.ids.indexOf(productId);
    const prod = products.find(p => p.id === productId);

    if (idx > -1) {
      this.ids.splice(idx, 1);
      showToast(`Removed ${prod?.name || 'product'} from Wishlist`, 'info');
      this.updateCardHeart(productId, false);
    } else {
      this.ids.push(productId);
      showToast(`Saved ${prod?.name || 'product'} to Wishlist!`, 'success');
      this.updateCardHeart(productId, true);

      if (targetBtn) {
        this.triggerParticleBurst(targetBtn);
      }
    }

    this.saveToStorage();
    this.updateUI();
    if (this.isOpen) this.renderItems();
  }

  updateCardHeart(productId, active) {
    document.querySelectorAll(`.wishlist-btn[data-wishlist-id="${productId}"]`).forEach(btn => {
      btn.classList.toggle('active', active);
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', active ? 'currentColor' : 'none');
    });
  }

  triggerParticleBurst(targetBtn) {
    const rect = targetBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const colors = ['#f43f5e', '#fb7185', '#ec4899', '#a855f7', '#ffffff'];
    const particleCount = 14;

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'heart-particle';
      document.body.appendChild(p);

      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const distance = 30 + Math.random() * 40;
      const destX = centerX + Math.cos(angle) * distance;
      const destY = centerY + Math.sin(angle) * distance;
      const color = colors[Math.floor(Math.random() * colors.length)];

      gsap.set(p, {
        x: centerX,
        y: centerY,
        backgroundColor: color,
        scale: 0.8
      });

      gsap.to(p, {
        x: destX,
        y: destY,
        scale: 0,
        opacity: 0,
        duration: 0.6 + Math.random() * 0.3,
        ease: 'power2.out',
        onComplete: () => p.remove()
      });
    }

    // Bounce button itself
    gsap.fromTo(targetBtn, 
      { scale: 1.4 }, 
      { scale: 1, duration: 0.45, ease: 'elastic.out(1.5, 0.3)' }
    );
  }

  updateUI() {
    if (this.badgeEl) {
      if (this.ids.length > 0) {
        this.badgeEl.style.display = 'flex';
        this.badgeEl.textContent = this.ids.length;
      } else {
        this.badgeEl.style.display = 'none';
      }
    }

    if (this.ids.length === 0) {
      if (this.emptyState) this.emptyState.style.display = 'flex';
      if (this.itemsList) this.itemsList.style.display = 'none';
    } else {
      if (this.emptyState) this.emptyState.style.display = 'none';
      if (this.itemsList) this.itemsList.style.display = 'flex';
    }
  }

  renderItems() {
    if (!this.itemsList) return;

    const wishlistedProducts = products.filter(p => this.ids.includes(p.id));

    this.itemsList.innerHTML = wishlistedProducts.map(prod => `
      <div class="wishlist-item" data-wishlist-item-id="${prod.id}">
        <div class="wishlist-item-media">
          <img src="${prod.image}" alt="${prod.name}" class="wishlist-item-img" />
        </div>
        <div class="wishlist-item-info">
          <h4 class="wishlist-item-title">${prod.name}</h4>
          <div class="wishlist-item-brand">${prod.brand} • ${prod.category}</div>
          <div class="wishlist-item-price">$${prod.price}</div>
          <div class="wishlist-item-actions">
            <button class="wishlist-move-to-cart-btn btn-primary" data-move-id="${prod.id}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span>Move to Cart</span>
            </button>
            <button class="wishlist-remove-btn" data-del-id="${prod.id}" title="Remove" aria-label="Remove from Wishlist">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach listeners
    this.itemsList.querySelectorAll('.wishlist-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-id');
        this.toggle(id);
      });
    });

    this.itemsList.querySelectorAll('.wishlist-move-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-move-id');
        const prod = products.find(p => p.id === id);
        if (prod) {
          getCart().addItem(prod, btn);
          this.toggle(id);
        }
      });
    });
  }
}

let wishlistInstance = null;
export function initWishlist() {
  if (!wishlistInstance) {
    wishlistInstance = new WishlistManager();
  }
  return wishlistInstance;
}

export function getWishlist() {
  return wishlistInstance || initWishlist();
}
