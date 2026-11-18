import { products } from '../data/products.js';
import { getCart } from './cart.js';
import { getWishlist } from './wishlist.js';

const STORAGE_KEY = 'voltkart_recently_viewed';

export function getRecentlyViewedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn(e);
    return [];
  }
}

export function addRecentlyViewed(productId) {
  try {
    let ids = getRecentlyViewedIds();
    ids = ids.filter(id => id !== productId);
    ids.unshift(productId);
    if (ids.length > 6) ids = ids.slice(0, 6);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    renderRecentlyViewed();
  } catch (e) {
    console.warn(e);
  }
}

export function renderRecentlyViewed() {
  const container = document.getElementById('recently-viewed-section');
  const grid = document.getElementById('recently-viewed-grid');
  if (!container || !grid) return;

  const ids = getRecentlyViewedIds();
  if (ids.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  const items = ids.map(id => products.find(p => p.id === id)).filter(Boolean);

  grid.innerHTML = items.map(prod => `
    <div class="recent-card" data-recent-id="${prod.id}">
      <div class="recent-media">
        <img src="${prod.image}" alt="${prod.name}" class="recent-img" />
      </div>
      <div class="recent-info">
        <div class="recent-brand">${prod.brand}</div>
        <h4 class="recent-title">${prod.name}</h4>
        <div class="recent-price-row">
          <span class="recent-price">$${prod.price}</span>
          <button class="recent-add-btn" data-recent-add="${prod.id}" title="Quick Add">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Attach click events
  grid.querySelectorAll('.recent-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.recent-add-btn')) return;
      const id = card.getAttribute('data-recent-id');
      const openQuickView = window.openQuickViewModal;
      if (typeof openQuickView === 'function') openQuickView(id);
    });
  });

  grid.querySelectorAll('.recent-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-recent-add');
      const prod = products.find(p => p.id === id);
      if (prod) {
        getCart().addItem(prod, btn);
      }
    });
  });
}
