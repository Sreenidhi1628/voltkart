import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import VanillaTilt from 'vanilla-tilt';

import { products, categories } from './data/products.js';
import { phones, laptops, tvs } from './data/devices.js';
import { initPreloader } from './modules/preloader.js';
import { initTheme } from './modules/theme.js';
import { initCursor } from './modules/cursor.js';
import { initHero3D } from './modules/hero3d.js';
import { initTransitions } from './modules/transitions.js';
import { initCart, getCart } from './modules/cart.js';
import { initWishlist, getWishlist } from './modules/wishlist.js';
import { initSearch } from './modules/search.js';
import { initQuickView, openQuickView } from './modules/quickview.js';
import { renderRecentlyViewed } from './modules/recentlyViewed.js';
import { getCompatibilityEngine } from './modules/compatibility.js';
import { showToast } from './modules/toast.js';
import { initMyDevicesPanel } from './modules/myDevicesPanel.js';
import { initShowcase3D } from './modules/showcase3d.js';
import { initCompare, getCompare } from './modules/compare.js';
import { initDealTimer } from './modules/dealTimer.js';
import { initStatsCounter } from './modules/statsCounter.js';
import { initNewsletter } from './modules/newsletter.js';
import { initTextScramble } from './modules/scramble.js';
import { initLiquidDistortion } from './modules/liquidDistortion.js';
import { initFloatingShapes } from './modules/floatingShapes.js';
import { initSpotlight } from './modules/spotlight.js';

gsap.registerPlugin(ScrollTrigger, Flip);

// Global application state
export const state = {
  selectedCategory: 'all',
  selectedBrand: 'all',
  maxPrice: 2500,
  minRating: 0,
  sortBy: 'featured',
  compatibleOnly: false
};

// Expose modal opener globally for recently viewed items
window.openQuickViewModal = (id) => openQuickView(id);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Core Theme, Preloader & Navigation
  initTheme();
  initTransitions();
  initCursor();

  initPreloader(() => {
    revealHeroContent();
  });

  // 2. Initialize Three.js Hero 3D Stage
  initHero3D();

  // 3. Initialize E-Commerce & Interactive Modules
  initCart();
  initWishlist();
  initSearch();
  initQuickView();
  renderRecentlyViewed();
  initMyDevicesPanel();
  initCompare();
  initDealTimer();
  initStatsCounter();
  initNewsletter();

  // Listen for user setup changes to re-evaluate and animate cards
  window.addEventListener('setupChanged', () => {
    renderProducts(true);
  });

  // 4. Render Categories & Products
  renderCategories();
  renderProducts(false);

  // 5. Initialize Pinned 3D Showcase
  try {
    initShowcase3D();
  } catch (err) {
    console.warn('Showcase3D init error:', err);
  }

  // 6. Setup Navigation, Filter controls & GSAP Flip
  try { setupNavigation(); } catch (e) { console.error(e); }
  try { setupFilterControls(); } catch (e) { console.error(e); }
  try { setupHomeSetupChecker(); } catch (e) { console.error(e); }
  try { setupCategoriesHorizontalScroll(); } catch (e) { console.error(e); }
  try { setupBackToTop(); } catch (e) { console.error(e); }
  try { setupFooterEvents(); } catch (e) { console.error(e); }

  // 7. Stage 5 Polish: Scramble, Liquid, Floating Shards, Spotlight & Deck Fanout
  initSpotlight();
  initFloatingShapes();
  initTextScramble();
  initLiquidDistortion();
  initScrollTextEffects();
  initCardDeckFanout();
});

/**
 * Headline & Hero stagger reveal after preloader
 */
function revealHeroContent() {
  const tl = gsap.timeline();
  tl.from('#hero-headline', {
    y: 40,
    opacity: 0,
    duration: 1.0,
    ease: 'power3.out'
  })
  .from('.hero-subtitle', {
    y: 25,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.6')
  .from('.hero-ctas > *', {
    y: 20,
    opacity: 0,
    stagger: 0.15,
    duration: 0.7,
    ease: 'back.out(1.5)'
  }, '-=0.5')
  .from('.hero-spec-pill', {
    scale: 0.8,
    opacity: 0,
    stagger: 0.2,
    duration: 0.8,
    ease: 'elastic.out(1, 0.5)'
  }, '-=0.4');
}

/**
 * Render Horizontal Categories with icons & tilt
 */
function renderCategories() {
  const track = document.getElementById('categories-track');
  const pillsContainer = document.getElementById('category-filter-pills');
  if (!track || !pillsContainer) return;

  const categoryIcons = {
    all: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    Mobiles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    Laptops: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
    TVs: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>`,
    Audio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`,
    Accessories: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`
  };

  // Render Horizontal Cards Track
  track.innerHTML = categories.map(cat => `
    <div class="category-card ${state.selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
      <span class="category-count">${cat.count} Units</span>
      <div class="category-icon-wrap">
        ${categoryIcons[cat.id] || categoryIcons.all}
      </div>
      <div>
        <h3 class="category-name">${cat.name}</h3>
        <p class="category-highlight">${cat.highlight || 'Browse Catalog'}</p>
      </div>
    </div>
  `).join('');

  // Render Filter Pills
  pillsContainer.innerHTML = categories.map(cat => `
    <button class="filter-pill ${state.selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
      ${cat.name}
    </button>
  `).join('');

  // Attach card & pill events
  document.querySelectorAll('.category-card, .filter-pill').forEach(el => {
    el.addEventListener('click', () => {
      const catId = el.getAttribute('data-cat');
      selectCategory(catId);
    });
  });

  // Init 3D Tilt on Category Cards
  VanillaTilt.init(document.querySelectorAll('.category-card'), {
    max: 12,
    speed: 400,
    glare: true,
    'max-glare': 0.25,
    scale: 1.03
  });
}

function selectCategory(catId) {
  state.selectedCategory = catId;

  document.querySelectorAll('.category-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-cat') === catId);
  });
  document.querySelectorAll('.filter-pills .filter-pill').forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-cat') === catId);
  });

  renderProducts(true);
}

/**
 * Render Product Grid with GSAP Flip smooth card transitions
 */
export function renderProducts(useFlip = false) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  // Capture current positions for GSAP Flip
  let flipState = null;
  if (useFlip) {
    flipState = Flip.getState('.product-card');
  }

  // Filter products by Category, Brand, Price Slider, Rating, and Compatible Only
  const compatEngine = getCompatibilityEngine();

  let filtered = products.filter(prod => {
    if (state.selectedCategory !== 'all' && prod.category !== state.selectedCategory) {
      return false;
    }
    if (state.selectedBrand !== 'all' && prod.brand !== state.selectedBrand) {
      return false;
    }
    if (prod.price > state.maxPrice) {
      return false;
    }
    if (prod.rating < state.minRating) {
      return false;
    }
    if (state.compatibleOnly) {
      const evaluation = compatEngine.evaluate(prod);
      if (evaluation.status === 'needs_adapter') return false;
    }
    return true;
  });

  // Sort products
  if (state.sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  const wishlist = getWishlist();
  const compare = getCompare();

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding: 60px 20px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--neon-blue)" stroke-width="1.5" style="margin-bottom:12px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        <h3 style="font-family:var(--font-heading); font-size:1.3rem; margin-bottom:8px;">No matching electronics found</h3>
        <p style="color:var(--text-muted); font-size:0.9rem;">Try adjusting your price slider, brand, or "Compatible Only" filters.</p>
      </div>
    `;
    return;
  }

  const statusClassMap = {
    compatible: 'compat-status-compatible',
    works_with_limits: 'compat-status-limited',
    needs_adapter: 'compat-status-needs_adapter'
  };

  const statusLabelMap = {
    compatible: 'Compatible',
    works_with_limits: 'Works with limits',
    needs_adapter: 'Needs adapter'
  };

  const statusIconMap = {
    compatible: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    works_with_limits: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="1"/></svg>`,
    needs_adapter: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
  };

  grid.innerHTML = filtered.map(prod => {
    const isWishlisted = wishlist.ids.includes(prod.id);
    const isCompared = compare.compareIds.includes(prod.id);
    const compat = compatEngine.evaluate(prod);
    const recAdapter = compat.recommendedProductId ? products.find(p => p.id === compat.recommendedProductId) : null;

    return `
      <div class="product-card" data-tilt data-id="${prod.id}">
        <div class="product-card-shine"></div>
        
        <div class="card-top-row">
          <span class="product-tag">${prod.badge || prod.category}</span>
          <div class="card-actions-top">
            <button class="compare-btn ${isCompared ? 'active' : ''}" data-compare-id="${prod.id}" title="Compare Specs" aria-label="Compare Product">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
            </button>
            <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-wishlist-id="${prod.id}" title="Add to Wishlist" aria-label="Add to Wishlist">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="card-media">
          <img 
            src="${prod.image}" 
            alt="${prod.name}" 
            class="card-img" 
            loading="lazy" 
            onerror="this.onerror=null; this.src='/public/favicon.svg';" 
          />
          <button class="quick-view-btn" data-quickview-id="${prod.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Quick View
          </button>
        </div>

        <!-- Setup Compatibility Badge & Explanation -->
        <div class="card-compat-wrapper">
          <div class="card-compat-badge ${statusClassMap[compat.status] || 'compat-status-compatible'}" id="compat-badge-${prod.id}">
            ${statusIconMap[compat.status] || statusIconMap.compatible}
            <span>${statusLabelMap[compat.status] || 'Compatible'}</span>
          </div>
          <div class="card-compat-reason">${compat.reason}</div>
          ${recAdapter ? `
            <button class="card-rec-adapter-btn" data-adapter-id="${recAdapter.id}">
              + Add ${recAdapter.name.split(' ')[1] || 'Adapter'} ($${recAdapter.price})
            </button>
          ` : ''}
        </div>

        <div class="card-body">
          <span class="card-brand">${prod.brand}</span>
          <h4 class="card-title">${prod.name}</h4>

          <div class="card-rating">
            <span class="card-rating-stars">★</span>
            <strong>${prod.rating}</strong>
            <span style="color:var(--text-muted);">(${prod.reviews})</span>
          </div>

          <div class="card-footer-row">
            <div class="card-pricing">
              <span class="card-price">$${prod.price}</span>
              ${prod.oldPrice ? `<span class="card-old-price">$${prod.oldPrice}</span>` : ''}
            </div>

            <button class="add-to-cart-btn" data-add-id="${prod.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Smooth layout animation with GSAP Flip
  if (useFlip && flipState) {
    Flip.from(flipState, {
      duration: 0.55,
      ease: 'power3.inOut',
      stagger: 0.03,
      absolute: true,
      onEnter: elements => gsap.fromTo(elements, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4 }),
      onLeave: elements => gsap.to(elements, { opacity: 0, scale: 0.8, duration: 0.3 })
    });
  }

  // 3D Tilt Initialization
  VanillaTilt.init(document.querySelectorAll('.product-card'), {
    max: 10,
    speed: 400,
    glare: true,
    'max-glare': 0.18,
    scale: 1.02
  });

  // Attach card interactions
  setupCardActions();
  initLiquidDistortion();

  // Update cursor hover states
  if (typeof window.updateCursorListeners === 'function') {
    window.updateCursorListeners();
  }

  // Recalculate ScrollTrigger triggers and pin positions after products DOM changes
  ScrollTrigger.refresh();

  // Also refresh when product images finish loading
  const productImages = grid.querySelectorAll('img');
  let loadedImgs = 0;
  productImages.forEach(img => {
    if (img.complete) {
      loadedImgs++;
    } else {
      img.addEventListener('load', () => {
        loadedImgs++;
        if (loadedImgs === productImages.length || loadedImgs % 6 === 0) {
          ScrollTrigger.refresh();
        }
      }, { once: true });
    }
  });
}

function setupCardActions() {
  const cart = getCart();
  const wishlist = getWishlist();

  // Add to Cart with Fly-to-Cart Animation
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-add-id');
      const prod = products.find(p => p.id === id);
      if (!prod) return;

      const card = btn.closest('.product-card');
      const img = card?.querySelector('.card-img') || btn;

      cart.addItem(prod, img);
    });
  });

  // Wishlist with Particle Burst Animation
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-wishlist-id');
      wishlist.toggle(id, btn);
    });
  });

  // Add Recommended Adapter directly to cart with fly-to-cart
  document.querySelectorAll('.card-rec-adapter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const adapterId = btn.getAttribute('data-adapter-id');
      const adapterProd = products.find(p => p.id === adapterId);
      if (adapterProd) {
        cart.addItem(adapterProd, btn);
      }
    });
  });
}

function setupNavigation() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav-overlay');

  if (!hamburgerBtn || !mobileNav) return;

  function closeMobileNav() {
    hamburgerBtn.classList.remove('active');
    mobileNav.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('scroll-locked');
    if (window.lenis) window.lenis.start();
  }

  hamburgerBtn.addEventListener('click', () => {
    const isOpen = hamburgerBtn.classList.toggle('active');
    mobileNav.classList.toggle('open', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('scroll-locked', isOpen);
    if (window.lenis) {
      if (isOpen) window.lenis.stop();
      else window.lenis.start();
    }
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  const mobileDevicesBtn = document.getElementById('mobile-open-devices-btn');
  if (mobileDevicesBtn) {
    mobileDevicesBtn.addEventListener('click', () => {
      closeMobileNav();
      const openBtn = document.getElementById('open-my-devices-btn');
      if (openBtn) openBtn.click();
    });
  }

  const mobileWishlistBtn = document.getElementById('mobile-open-wishlist-btn');
  if (mobileWishlistBtn) {
    mobileWishlistBtn.addEventListener('click', () => {
      closeMobileNav();
      const openBtn = document.getElementById('open-wishlist-btn');
      if (openBtn) openBtn.click();
    });
  }
}

function setupFilterControls() {
  // Sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderProducts(true);
    });
  }

  // Brand Filter
  const brandSelect = document.getElementById('brand-filter');
  if (brandSelect) {
    brandSelect.addEventListener('change', (e) => {
      state.selectedBrand = e.target.value;
      renderProducts(true);
    });
  }

  // Price Slider
  const priceSlider = document.getElementById('price-slider');
  const priceVal = document.getElementById('price-slider-val');
  if (priceSlider && priceVal) {
    priceSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.maxPrice = val;
      priceVal.textContent = `$${val}`;
      renderProducts(true);
    });
  }

  // Rating Filter
  const ratingSelect = document.getElementById('rating-filter');
  if (ratingSelect) {
    ratingSelect.addEventListener('change', (e) => {
      state.minRating = parseFloat(e.target.value) || 0;
      renderProducts(true);
    });
  }

  // Compatible Only Filter Checkbox
  const compatToggle = document.getElementById('compatible-only-toggle');
  if (compatToggle) {
    compatToggle.addEventListener('change', (e) => {
      state.compatibleOnly = e.target.checked;
      renderProducts(true);
    });
  }
}

function setupHomeSetupChecker() {
  const input = document.getElementById('home-plain-input');
  const btn = document.getElementById('home-analyze-btn');
  const previewChips = document.getElementById('home-chips-preview');
  const scanline = document.getElementById('home-scanline');
  const compatEngine = getCompatibilityEngine();

  if (!btn || !input || !previewChips) return;

  function renderResultCard(items, currentSetup, suggestions = []) {
    if (!items || items.length === 0) {
      previewChips.innerHTML = `
        <div class="setup-no-detect glow-pulse-active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neon-rose)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>We couldn't find a device. Try: <em>"I have a phone with Bluetooth 4.2"</em> or <em>"I have a Samsung A54"</em></span>
        </div>
      `;
      return;
    }

    // Calculate how many products work vs need an adapter vs work with limits
    let workCount = 0;
    let needAdapterCount = 0;
    let limitsCount = 0;

    products.forEach(p => {
      const ev = compatEngine.evaluate(p);
      if (ev.status === 'compatible') {
        workCount++;
      } else if (ev.status === 'works_with_limits') {
        limitsCount++;
      } else if (ev.status === 'needs_adapter') {
        needAdapterCount++;
      }
    });

    const isMatchActive0 = currentSetup && (currentSetup.phoneId === suggestions[0]?.id || currentSetup.laptopId === suggestions[0]?.id || currentSetup.tvId === suggestions[0]?.id);
    const isMatchActive1 = currentSetup && (currentSetup.phoneId === suggestions[1]?.id || currentSetup.laptopId === suggestions[1]?.id || currentSetup.tvId === suggestions[1]?.id);

    const suggestionsHtml = (suggestions && suggestions.length >= 2 && currentSetup) ? `
      <div class="setup-suggestions-bar">
        <span class="suggestions-label">Did you mean:</span>
        <div class="suggestions-chips-row">
          <button class="suggestion-chip ${isMatchActive0 ? 'active' : ''}" data-device-id="${suggestions[0].id}">
            ${suggestions[0].label}
          </button>
          <span class="suggestion-or">or</span>
          <button class="suggestion-chip ${isMatchActive1 ? 'active' : ''}" data-device-id="${suggestions[1].id}">
            ${suggestions[1].label}
          </button>
        </div>
      </div>
    ` : '';

    const solution = compatEngine.getRecommendedSolution();
    let solutionHtml = '';

    if (solution && solution.recommendedProducts && solution.recommendedProducts.length > 0) {
      solutionHtml = `
        <!-- ================= ⚡ YOUR RECOMMENDED SOLUTION SECTION ================= -->
        <div class="recommended-solution-container" id="recommended-solution-container">
          <div class="rec-solution-header">
            <div class="rec-solution-title-wrap">
              <span class="rec-solution-icon">⚡</span>
              <h4 class="rec-solution-title">YOUR RECOMMENDED SOLUTION</h4>
              ${solution.totalRecommendedWattage ? `<span class="rec-wattage-pill">${solution.totalRecommendedWattage}</span>` : ''}
            </div>
            <p class="rec-solution-subtitle">Curated hardware package matching your exact device ports, wattages, and protocol curves.</p>
          </div>

          <!-- DEVICE-WISE COMPATIBILITY -->
          <div class="rec-device-status-block">
            <span class="rec-block-label">Device-Wise Compatibility Audit:</span>
            <div class="rec-device-status-grid">
              ${solution.devices.map(d => `
                <div class="rec-device-card ${d.badgeClass}">
                  <div class="rec-device-card-header">
                    <span class="status-indicator-dot ${d.status}"></span>
                    <span class="rec-device-name">${d.name}</span>
                    <span class="status-badge ${d.badgeClass}">${d.label}</span>
                  </div>
                  <p class="rec-device-note">${d.note}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- SMART MULTI-DEVICE RECOMMENDATION BANNER -->
          ${solution.smartNote ? `
            <div class="rec-smart-banner">
              <div class="smart-banner-icon">💡</div>
              <div class="smart-banner-content">
                <span class="smart-banner-heading">SMART MULTI-DEVICE ALL-IN-ONE PICK</span>
                <p class="smart-banner-text">${solution.smartNote}</p>
              </div>
            </div>
          ` : ''}

          <!-- RECOMMENDED PRODUCTS CARDS -->
          <div class="rec-products-block">
            <span class="rec-block-label">Recommended Hardware Package:</span>
            <div class="rec-products-grid">
              ${solution.recommendedProducts.map(item => `
                <div class="rec-product-card glow-card" data-product-id="${item.product.id}">
                  <div class="rec-card-top">
                    <span class="rec-role-badge">${item.role}</span>
                    <span class="rec-wattage-badge">${item.wattage}</span>
                  </div>
                  <div class="rec-card-media">
                    <img src="${item.product.image}" alt="${item.product.name}" class="rec-product-img" onerror="this.onerror=null; this.src='/images/products/acc-hub.svg';" />
                  </div>
                  <div class="rec-card-body">
                    <h5 class="rec-prod-name">${item.product.name}</h5>
                    <p class="rec-prod-desc">${item.product.description}</p>
                    <div class="rec-prod-supports">
                      <span class="supports-tag">Supports:</span>
                      <span class="supports-val">${item.supportedDevices}</span>
                    </div>
                    <div class="rec-card-bottom">
                      <span class="rec-prod-price">$${item.product.price}</span>
                      <button class="btn-secondary rec-view-btn" data-product-id="${item.product.id}">
                        <span>View Product</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- WHY THIS SOLUTION? -->
          <div class="rec-why-solution-box">
            <div class="why-solution-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span class="why-solution-title">WHY THIS SOLUTION?</span>
            </div>
            <p class="why-solution-text">${solution.whyExplanation}</p>
            ${solution.clarificationPrompt ? `
              <div class="rec-clarification-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>${solution.clarificationPrompt}</span>
              </div>
            ` : ''}
          </div>

          <!-- FOOTER / SHOP THIS SETUP ACTION -->
          <div class="rec-solution-footer">
            <div class="rec-bundle-summary">
              <span class="bundle-count-label">Complete Solution (${solution.recommendedProducts.length} items):</span>
              <span class="bundle-total-price">$${solution.recommendedProducts.reduce((sum, item) => sum + item.product.price, 0)}</span>
            </div>
            <button class="btn-primary shop-setup-btn" id="shop-setup-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <span>Shop This Setup</span>
            </button>
          </div>
        </div>
      `;
    }

    previewChips.innerHTML = `
      <div class="check-setup-result-card glow-pulse-active" id="check-setup-result-card">
        <div class="result-card-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span class="result-card-title">We understood this:</span>
        </div>

        <div class="detected-chips-row">
          ${items.map(item => `
            <div class="detected-chip" data-device-type="${item.type}" data-device-id="${item.id}">
              <span class="chip-text">${item.label}</span>
              <button class="chip-action-btn chip-edit-btn" data-edit-type="${item.type}" title="Edit device in profile" aria-label="Edit">✎</button>
              <button class="chip-action-btn chip-remove-btn" data-remove-type="${item.type}" data-remove-id="${item.id}" title="Remove item" aria-label="Remove">×</button>
            </div>
          `).join('')}
        </div>

        ${suggestionsHtml}

        <div class="setup-summary-row">
          <div class="setup-summary-stats">
            <span class="summary-badge-work">⚡ ${workCount} products work</span>
            <span class="summary-badge-adapter">⚠️ ${needAdapterCount} need an adapter</span>
            <span class="summary-badge-limits">ℹ️ ${limitsCount} work with limits</span>
          </div>

          <button class="btn-primary see-compat-btn" id="see-compat-btn">
            <span>See compatible products</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        ${solutionHtml}
      </div>
    `;

    // Attach suggestions click listener (handles Phones, Laptops, and TVs)
    previewChips.querySelectorAll('.suggestion-chip').forEach(sugBtn => {
      sugBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chosenId = sugBtn.getAttribute('data-device-id');
        const chosenPhone = phones.find(p => p.id === chosenId);
        const chosenLaptop = laptops.find(l => l.id === chosenId);
        const chosenTv = tvs.find(t => t.id === chosenId);
        const chosen = chosenPhone || chosenLaptop || chosenTv;
        if (!chosen) return;

        const setup = { ...compatEngine.userSetup };
        let updatedItems = [...items];

        if (chosenPhone) {
          setup.phoneId = chosen.id;
          if (setup.customDevices) setup.customDevices.phone = null;
          const phoneIdx = updatedItems.findIndex(it => it.type === 'phone');
          const newChip = {
            type: 'phone',
            id: chosen.id,
            label: `Phone: ${chosen.name.replace('Apple ', '')} (${chosen.portType} ${chosen.fastChargeWattage}W)`
          };
          if (phoneIdx > -1) {
            updatedItems[phoneIdx] = newChip;
          } else {
            updatedItems.unshift(newChip);
          }
        } else if (chosenLaptop) {
          setup.laptopId = chosen.id;
          if (setup.customDevices) setup.customDevices.laptop = null;
          const laptopIdx = updatedItems.findIndex(it => it.type === 'laptop');
          const newChip = {
            type: 'laptop',
            id: chosen.id,
            label: `Laptop: ${chosen.name.replace('Apple ', '')}`
          };
          if (laptopIdx > -1) {
            updatedItems[laptopIdx] = newChip;
          } else {
            updatedItems.push(newChip);
          }
        } else if (chosenTv) {
          setup.tvId = chosen.id;
          if (setup.customDevices) setup.customDevices.tv = null;
          const tvIdx = updatedItems.findIndex(it => it.type === 'tv');
          const newChip = {
            type: 'tv',
            id: chosen.id,
            label: `TV: ${chosen.name}`
          };
          if (tvIdx > -1) {
            updatedItems[tvIdx] = newChip;
          } else {
            updatedItems.push(newChip);
          }
        }

        compatEngine.saveUserSetup(setup);
        renderResultCard(updatedItems, setup, suggestions);
      });
    });

    // Attach Edit button listener -> opens My Devices drawer
    previewChips.querySelectorAll('.chip-edit-btn').forEach(editBtn => {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const devicesNavBtn = document.getElementById('open-my-devices-btn');
        if (devicesNavBtn) devicesNavBtn.click();
      });
    });

    // Attach Remove button listener -> removes device/spec and re-renders
    previewChips.querySelectorAll('.chip-remove-btn').forEach(remBtn => {
      remBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = remBtn.getAttribute('data-remove-type');
        const chipId = remBtn.getAttribute('data-remove-id');
        const setup = { ...compatEngine.userSetup };
        if (!setup.customDevices) setup.customDevices = {};

        if (type === 'phone') {
          setup.phoneId = null;
          setup.customDevices.phone = null;
        } else if (type === 'laptop') {
          setup.laptopId = null;
          setup.customDevices.laptop = null;
        } else if (type === 'tv') {
          setup.tvId = null;
          setup.customDevices.tv = null;
        } else if (type === 'audio') {
          setup.customDevices.audio = null;
        } else if (type === 'spec-bt') {
          if (setup.customDevices.phone) setup.customDevices.phone.bluetoothVersion = '5.3';
          if (setup.customDevices.laptop) setup.customDevices.laptop.bluetoothVersion = '5.3';
        } else if (type === 'spec-hdmi') {
          if (setup.customDevices.tv) setup.customDevices.tv.maxHdmiVersion = '2.1';
        } else if (type === 'spec-port') {
          if (setup.customDevices.phone) setup.customDevices.phone.audioJack = true;
          if (setup.customDevices.laptop && setup.customDevices.laptop.ports) setup.customDevices.laptop.ports.headphoneJack = true;
        }

        compatEngine.saveUserSetup(setup);

        const updatedItems = items.filter(it => it.id !== chipId && it.type !== type);
        renderResultCard(updatedItems, setup, suggestions);
      });
    });

    // Attach "See compatible products" scroll button
    const seeCompatBtn = document.getElementById('see-compat-btn');
    if (seeCompatBtn) {
      seeCompatBtn.addEventListener('click', () => {
        const prodSec = document.getElementById('products');
        if (prodSec) {
          prodSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Attach "View Product" button listener for Recommended Solution cards
    previewChips.querySelectorAll('.rec-view-btn').forEach(viewBtn => {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = viewBtn.getAttribute('data-product-id');
        if (pId) openQuickView(pId);
      });
    });

    // Attach "Shop This Setup" button listener
    const shopSetupBtn = previewChips.querySelector('#shop-setup-btn');
    if (shopSetupBtn && solution && solution.recommendedProducts) {
      shopSetupBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cart = getCart();
        solution.recommendedProducts.forEach(item => {
          cart.addItem(item.product);
        });
        showToast(`Added ${solution.recommendedProducts.length} recommended solution products to your cart!`, 'success', 'Setup Bundled');
        const openCartBtn = document.getElementById('cart-btn');
        if (openCartBtn) openCartBtn.click();
      });
    }
  }

  function doAnalyze() {
    const text = input.value.trim();
    if (!text) {
      previewChips.innerHTML = '';
      compatEngine.saveUserSetup({
        phoneId: null,
        laptopId: null,
        tvId: null,
        customDevices: null,
        isAnalyzedSetup: true
      });
      renderResultCard([], null);
      return;
    }

    // Immediately clear old chips before showing new ones!
    previewChips.innerHTML = `
      <div class="setup-analyzing-indicator glow-pulse-active">
        <span class="analyzing-spinner"></span>
        <span>Scanning sentence specs & compatibility...</span>
      </div>
    `;

    // 1. Show visible "Analysing..." typing animation for ~1 second
    btn.disabled = true;
    const originalBtnHtml = btn.innerHTML;
    btn.innerHTML = `
      <div class="analyzing-dots-wrapper">
        <span class="analyzing-spinner"></span>
        <span>Analysing<span class="typing-dot-1">.</span><span class="typing-dot-2">.</span><span class="typing-dot-3">.</span></span>
      </div>
    `;

    if (scanline) {
      gsap.fromTo(scanline, 
        { top: '-20%', opacity: 0.9 }, 
        { top: '120%', opacity: 0, duration: 1.0, ease: 'power2.inOut' }
      );
    }

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalBtnHtml;

      const result = compatEngine.parsePlainEnglish(text);

      if (result && result.items && result.items.length > 0) {
        // REPLACE old setup with newly detected devices
        const newSetup = {
          phoneId: result.phone ? result.phone.id : null,
          laptopId: result.laptop ? result.laptop.id : null,
          tvId: result.tv ? result.tv.id : null,
          customDevices: {
            phone: result.phone || null,
            laptop: result.laptop || null,
            tv: result.tv || null,
            audio: result.audio || null
          },
          isAnalyzedSetup: true
        };

        compatEngine.saveUserSetup(newSetup);
        renderResultCard(result.items, newSetup, result.suggestions || []);
      } else {
        compatEngine.saveUserSetup({
          phoneId: null,
          laptopId: null,
          tvId: null,
          customDevices: null,
          isAnalyzedSetup: true
        });
        renderResultCard([], null);
      }
    }, 1000);
  }

  btn.addEventListener('click', doAnalyze);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doAnalyze();
    }
  });

  // Initial load: parse the default input value and display the result card immediately
  const initialResult = compatEngine.parsePlainEnglish(input.value.trim());
  if (initialResult && initialResult.items && initialResult.items.length > 0) {
    renderResultCard(initialResult.items, compatEngine.userSetup, initialResult.suggestions || []);
  }
}

/**
 * Enable smooth mousewheel & drag horizontal scrolling on Categories Gallery
 */
function setupCategoriesHorizontalScroll() {
  const container = document.getElementById('categories-track-container');
  if (!container) return;

  // Convert vertical wheel to horizontal scroll inside categories track
  container.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      container.scrollLeft += e.deltaY * 1.5;
    }
  }, { passive: false });

  // Mouse Drag to scroll
  let isDown = false;
  let startX;
  let scrollLeft;

  container.addEventListener('mousedown', (e) => {
    isDown = true;
    container.classList.add('grabbing');
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  window.addEventListener('mouseup', () => {
    isDown = false;
    container.classList.remove('grabbing');
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.8;
    container.scrollLeft = scrollLeft - walk;
  });
}

/**
 * Back to Top Rocket Button
 */
function setupBackToTop() {
  const rocketBtn = document.getElementById('rocket-btn');
  if (!rocketBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      rocketBtn.classList.add('visible');
    } else {
      rocketBtn.classList.remove('visible');
    }
  }, { passive: true });

  rocketBtn.addEventListener('click', () => {
    rocketBtn.classList.add('rocket-launching');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    setTimeout(() => {
      rocketBtn.classList.remove('rocket-launching');
    }, 1000);
  });
}

/**
 * Footer link triggers
 */
function setupFooterEvents() {
  const myDevicesFooterBtn = document.getElementById('footer-my-devices-btn');
  const myDevicesNavBtn = document.getElementById('open-devices-btn');

  if (myDevicesFooterBtn && myDevicesNavBtn) {
    myDevicesFooterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      myDevicesNavBtn.click();
    });
  }
}

/**
 * Text that scales, blurs and fades based on scroll position + section titles outline-to-fill
 */
function initScrollTextEffects() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Hero content scale, blur and fade out
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    gsap.to(heroContent, {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom 20%',
        scrub: 1
      },
      scale: 0.9,
      opacity: 0,
      y: -40,
      filter: 'blur(8px)',
      ease: 'none'
    });
  }

  // Section titles outline-to-fill as they scroll into view
  document.querySelectorAll('.section-title').forEach(title => {
    ScrollTrigger.create({
      trigger: title,
      start: 'top 85%',
      onEnter: () => title.classList.add('title-in-view'),
      onLeaveBack: () => title.classList.remove('title-in-view')
    });
  });

  // Parallax on deal image
  const dealImg = document.querySelector('.deal-product-img');
  if (dealImg) {
    gsap.to(dealImg, {
      scrollTrigger: {
        trigger: '#deal-of-the-day',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      },
      y: -50,
      ease: 'none'
    });
  }
}

/**
 * Featured product cards fan out like a deck when entering
 */
function initCardDeckFanout() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const section = document.getElementById('products');
  const cards = document.querySelectorAll('.product-card');
  if (!section || cards.length === 0) return;

  ScrollTrigger.create({
    trigger: section,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      cards.forEach((card, i) => {
        const rot = ((i % 5) - 2) * 3;
        const offX = ((i % 5) - 2) * 15;

        gsap.fromTo(card,
          {
            opacity: 0,
            y: 50,
            rotationZ: rot,
            x: offX,
            scale: 0.93
          },
          {
            opacity: 1,
            y: 0,
            rotationZ: 0,
            x: 0,
            scale: 1,
            duration: 0.7,
            delay: (i % 6) * 0.08,
            ease: 'back.out(1.4)'
          }
        );
      });
    }
  });

  // Fallback: Ensure product cards are always visible even if ScrollTrigger fails
  setTimeout(() => {
    cards.forEach(card => {
      if (card.style.opacity === '0' || parseFloat(window.getComputedStyle(card).opacity) < 0.1) {
        card.style.opacity = '1';
        card.style.transform = 'none';
      }
    });
  }, 1200);
}

// Global ScrollTrigger synchronization for fonts, images, window load, and viewport resize
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    ScrollTrigger.refresh();
  });
}

window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

let globalResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(globalResizeTimer);
  globalResizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 150);
});


