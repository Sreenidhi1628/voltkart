import gsap from 'gsap';
import { products } from '../data/products.js';
import { getCart } from './cart.js';
import { getWishlist } from './wishlist.js';
import { addRecentlyViewed } from './recentlyViewed.js';
import { getCompatibilityEngine } from './compatibility.js';
import { createCircularGaugeSvg } from './myDevicesPanel.js';
import { createEmiCalculatorHtml, attachEmiEventListeners } from './emi.js';
import { lockScroll, unlockScroll } from './transitions.js';

let quickViewModal = null;
let currentProductId = null;

export function initQuickView() {
  quickViewModal = document.getElementById('quickview-modal');
  const closeBtn = document.getElementById('quickview-close-btn');

  if (closeBtn && quickViewModal) {
    closeBtn.addEventListener('click', closeQuickView);
    quickViewModal.addEventListener('click', (e) => {
      if (e.target === quickViewModal) closeQuickView();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && quickViewModal && quickViewModal.classList.contains('open')) {
      closeQuickView();
    }
  });

  // Delegate clicks on quick view buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.quick-view-btn');
    if (btn) {
      const id = btn.getAttribute('data-quickview-id');
      const card = btn.closest('.product-card');
      openQuickView(id, card);
    }
  });
}

export function openQuickView(productId, sourceCard = null) {
  const prod = products.find(p => p.id === productId);
  if (!prod || !quickViewModal) return;

  currentProductId = productId;
  addRecentlyViewed(productId);

  const box = quickViewModal.querySelector('.quickview-box');
  const content = document.getElementById('quickview-content');

  // Format specs table
  const specsRows = Object.entries(prod.specs || {}).map(([key, value]) => {
    let formattedVal = value;
    if (typeof value === 'object' && value !== null) {
      formattedVal = Object.entries(value).map(([k, v]) => `<strong>${k}:</strong> ${v}`).join(', ');
    } else if (Array.isArray(value)) {
      formattedVal = value.join(', ');
    }
    const cleanKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return `
      <tr>
        <td class="spec-label">${cleanKey}</td>
        <td class="spec-val">${formattedVal}</td>
      </tr>
    `;
  }).join('');

  const isWishlisted = getWishlist().ids.includes(prod.id);
  const compatEngine = getCompatibilityEngine();
  const compat = compatEngine.evaluate(prod);
  const recAdapter = compat.recommendedProductId ? products.find(p => p.id === compat.recommendedProductId) : null;

  const statusClassMap = {
    compatible: 'compat-status-compatible',
    works_with_limits: 'compat-status-limited',
    needs_adapter: 'compat-status-needs_adapter'
  };

  const statusLabelMap = {
    compatible: '100% Compatible',
    works_with_limits: 'Works with Limits',
    needs_adapter: 'Needs Adapter'
  };

  content.innerHTML = `
    <div class="quickview-grid">
      <!-- Left Column: Visual Media -->
      <div class="quickview-media-col">
        <div class="quickview-badge-tag">${prod.badge || prod.category}</div>
        <div class="quickview-img-wrapper">
          <img src="${prod.image}" alt="${prod.name}" class="quickview-main-img" id="quickview-main-image" />
        </div>

        <!-- Animated Circular Compatibility Meter in Quick View -->
        <div class="quickview-compat-card">
          <div class="quickview-compat-top">
            ${createCircularGaugeSvg(compat.score, 76)}
            <div class="quickview-compat-summary">
              <span class="card-compat-badge ${statusClassMap[compat.status] || 'compat-status-compatible'}">
                ${statusLabelMap[compat.status] || 'Compatible'}
              </span>
              <p class="quickview-compat-reason">${compat.reason}</p>
            </div>
          </div>

          ${recAdapter ? `
            <div class="quickview-rec-adapter-box">
              <div class="rec-adapter-text">
                <span class="rec-adapter-title">Recommended Fix:</span>
                <span class="rec-adapter-name">${recAdapter.name} (+$${recAdapter.price})</span>
              </div>
              <button class="btn-primary quickview-add-adapter-btn" id="qv-add-adapter-btn" data-adapter-id="${recAdapter.id}">
                + Add Adapter
              </button>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Right Column: Details & Specs -->
      <div class="quickview-details-col">
        <div class="quickview-brand">${prod.brand.toUpperCase()}</div>
        <h2 class="quickview-title">${prod.name}</h2>

        <div class="quickview-rating-row">
          <span class="rating-stars">★★★★★</span>
          <span class="rating-val">${prod.rating}</span>
          <span class="rating-count">(${prod.reviews} customer reviews)</span>
        </div>

        <div class="quickview-price-row">
          <span class="quickview-price">$${prod.price}</span>
          ${prod.oldPrice ? `<span class="quickview-old-price">$${prod.oldPrice}</span>` : ''}
          ${prod.oldPrice ? `<span class="quickview-save-pill">SAVE $${prod.oldPrice - prod.price}</span>` : ''}
        </div>

        <p class="quickview-desc">${prod.description}</p>

        <!-- Specs Table -->
        <div class="quickview-specs-wrapper">
          <h4 class="specs-title">Hardware Architecture & Specs</h4>
          <table class="specs-table">
            <tbody>
              ${specsRows}
            </tbody>
          </table>
        </div>

        <!-- Interactive EMI Calculator with Animated Slider -->
        ${createEmiCalculatorHtml(prod.price)}

        <!-- Action CTAs -->
        <div class="quickview-cta-row">
          <button class="btn-primary quickview-add-cart-btn" id="qv-add-cart-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span>Add to Cart • $${prod.price}</span>
          </button>
          
          <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" id="qv-wishlist-btn" title="Add to Wishlist" style="width:48px; height:48px;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach adapter add event
  const addAdapterBtn = document.getElementById('qv-add-adapter-btn');
  if (addAdapterBtn && recAdapter) {
    addAdapterBtn.addEventListener('click', () => {
      getCart().addItem(recAdapter, addAdapterBtn);
    });
  }

  // Attach button events
  const addCartBtn = document.getElementById('qv-add-cart-btn');
  const imgEl = document.getElementById('quickview-main-image');
  if (addCartBtn) {
    addCartBtn.addEventListener('click', () => {
      getCart().addItem(prod, imgEl || addCartBtn);
    });
  }

  const wishlistBtn = document.getElementById('qv-wishlist-btn');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      getWishlist().toggle(prod.id, wishlistBtn);
    });
  }

  // Attach EMI Calculator Slider listeners
  attachEmiEventListeners(content, prod.price);

  // Open modal with morph/expansion animation
  quickViewModal.classList.add('open');
  lockScroll();

  if (sourceCard) {
    const cardRect = sourceCard.getBoundingClientRect();
    gsap.fromTo(box, 
      {
        scale: 0.7,
        opacity: 0,
        x: (cardRect.left + cardRect.width / 2) - (window.innerWidth / 2),
        y: (cardRect.top + cardRect.height / 2) - (window.innerHeight / 2)
      },
      {
        scale: 1,
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'power3.out'
      }
    );
  } else {
    gsap.fromTo(box, 
      { scale: 0.9, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
    );
  }
}

export function closeQuickView() {
  if (!quickViewModal) return;
  const box = quickViewModal.querySelector('.quickview-box');

  gsap.to(box, {
    scale: 0.9,
    opacity: 0,
    y: 20,
    duration: 0.3,
    ease: 'power2.in',
    onComplete: () => {
      quickViewModal.classList.remove('open');
      unlockScroll();
    }
  });
}
