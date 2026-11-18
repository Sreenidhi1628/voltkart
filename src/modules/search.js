import gsap from 'gsap';
import { products } from '../data/products.js';
import { openQuickView } from './quickview.js';
import { lockScroll, unlockScroll } from './transitions.js';

export class SearchManager {
  constructor() {
    this.isOpen = false;
    this.activeFilter = 'all';
    this.initDOM();
  }

  initDOM() {
    this.overlay = document.getElementById('search-overlay');
    this.input = document.getElementById('search-input');
    this.clearBtn = document.getElementById('search-clear-btn');
    this.closeBtn = document.getElementById('search-close-btn');
    this.resultsContainer = document.getElementById('search-results');
    this.emptyState = document.getElementById('search-empty-state');
    this.countEl = document.getElementById('search-results-count');
    this.openBtn = document.getElementById('open-search-btn');

    if (this.openBtn) this.openBtn.addEventListener('click', () => this.open());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });
    }

    // Keyboard shortcuts: '/' or 'Ctrl+K' / 'Cmd+K' and 'Escape'
    window.addEventListener('keydown', (e) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && !this.isOpen) {
        // Only if not focused on another input
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          this.open();
        }
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    if (this.input) {
      this.input.addEventListener('input', () => this.handleSearch());
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        if (this.input) {
          this.input.value = '';
          this.input.focus();
          this.handleSearch();
        }
      });
    }

    // Quick tags
    document.querySelectorAll('.search-quick-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const query = tag.getAttribute('data-tag');
        if (this.input) {
          this.input.value = query;
          this.handleSearch();
        }
      });
    });
  }

  open() {
    if (!this.overlay) return;
    this.isOpen = true;
    this.overlay.classList.add('open');
    lockScroll();

    // Auto-focus input
    setTimeout(() => {
      if (this.input) {
        this.input.focus();
        this.handleSearch();
      }
    }, 150);

    gsap.from('.search-modal-box', {
      scale: 0.9,
      y: -20,
      opacity: 0,
      duration: 0.35,
      ease: 'power3.out'
    });
  }

  close() {
    if (!this.overlay) return;
    this.isOpen = false;
    this.overlay.classList.remove('open');
    unlockScroll();
  }

  handleSearch() {
    const rawQuery = (this.input?.value || '').trim();
    if (this.clearBtn) {
      this.clearBtn.style.display = rawQuery.length > 0 ? 'flex' : 'none';
    }

    if (!rawQuery) {
      this.renderFeaturedSuggestions();
      return;
    }

    const query = rawQuery.toLowerCase();

    // Match products
    const matched = products.filter(p => {
      const matchName = p.name.toLowerCase().includes(query);
      const matchBrand = p.brand.toLowerCase().includes(query);
      const matchCategory = p.category.toLowerCase().includes(query);
      const matchDesc = p.description.toLowerCase().includes(query);
      
      // Match specs
      let matchSpecs = false;
      if (p.specs) {
        const specsStr = JSON.stringify(p.specs).toLowerCase();
        if (specsStr.includes(query)) matchSpecs = true;
      }

      return matchName || matchBrand || matchCategory || matchDesc || matchSpecs;
    });

    if (this.countEl) {
      this.countEl.textContent = `${matched.length} hardware match${matched.length === 1 ? '' : 'es'}`;
    }

    if (matched.length === 0) {
      this.renderEmpty(rawQuery);
    } else {
      this.renderMatches(matched, query);
    }
  }

  highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  renderMatches(matchedList, query) {
    if (!this.resultsContainer) return;
    if (this.emptyState) this.emptyState.style.display = 'none';
    this.resultsContainer.style.display = 'flex';

    this.resultsContainer.innerHTML = matchedList.map(prod => `
      <div class="search-result-item" data-prod-id="${prod.id}">
        <div class="search-result-media">
          <img src="${prod.image}" alt="${prod.name}" />
        </div>
        <div class="search-result-details">
          <div class="search-result-top">
            <span class="search-result-title">${this.highlightMatch(prod.name, query)}</span>
            <span class="search-result-price">$${prod.price}</span>
          </div>
          <div class="search-result-meta">
            <span class="search-result-brand">${this.highlightMatch(prod.brand, query)}</span> • 
            <span class="search-result-cat">${this.highlightMatch(prod.category, query)}</span> • 
            <span class="search-result-rating">★ ${prod.rating}</span>
          </div>
          <div class="search-result-desc">${this.highlightMatch(prod.description, query)}</div>
        </div>
        <button class="search-result-view-btn" data-view-id="${prod.id}">
          View Specs
        </button>
      </div>
    `).join('');

    // Attach click events
    this.resultsContainer.querySelectorAll('.search-result-item, .search-result-view-btn').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = el.getAttribute('data-prod-id') || el.getAttribute('data-view-id');
        this.close();
        openQuickView(id);
      });
    });

    // Stagger animation
    gsap.from('.search-result-item', {
      y: 20,
      opacity: 0,
      stagger: 0.05,
      duration: 0.35,
      ease: 'power2.out'
    });
  }

  renderFeaturedSuggestions() {
    if (!this.resultsContainer) return;
    if (this.emptyState) this.emptyState.style.display = 'none';
    this.resultsContainer.style.display = 'flex';

    if (this.countEl) {
      this.countEl.textContent = 'Popular Flagships';
    }

    // Top 4 rated
    const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);

    this.resultsContainer.innerHTML = topRated.map(prod => `
      <div class="search-result-item" data-prod-id="${prod.id}">
        <div class="search-result-media">
          <img src="${prod.image}" alt="${prod.name}" />
        </div>
        <div class="search-result-details">
          <div class="search-result-top">
            <span class="search-result-title">${prod.name}</span>
            <span class="search-result-price">$${prod.price}</span>
          </div>
          <div class="search-result-meta">
            <span class="search-result-brand">${prod.brand}</span> • 
            <span class="search-result-cat">${prod.category}</span> • 
            <span style="color:var(--neon-amber)">★ ${prod.rating}</span>
          </div>
          <div class="search-result-desc">${prod.description}</div>
        </div>
        <button class="search-result-view-btn" data-view-id="${prod.id}">
          Quick View
        </button>
      </div>
    `).join('');

    this.resultsContainer.querySelectorAll('.search-result-item, .search-result-view-btn').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = el.getAttribute('data-prod-id') || el.getAttribute('data-view-id');
        this.close();
        openQuickView(id);
      });
    });
  }

  renderEmpty(query) {
    if (!this.resultsContainer) return;
    this.resultsContainer.style.display = 'none';
    if (this.emptyState) {
      this.emptyState.style.display = 'flex';
      const termEl = document.getElementById('search-empty-term');
      if (termEl) termEl.textContent = `"${query}"`;
    }
  }
}

let searchInstance = null;
export function initSearch() {
  if (!searchInstance) {
    searchInstance = new SearchManager();
  }
  return searchInstance;
}
