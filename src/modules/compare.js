import gsap from 'gsap';
import { products } from '../data/products.js';
import { getCart } from './cart.js';
import { getCompatibilityEngine } from './compatibility.js';
import { showToast } from './toast.js';
import { lockScroll, unlockScroll } from './transitions.js';

export class CompareManager {
  constructor() {
    this.compareIds = [];
    this.isOpen = false;
    this.initDOM();
  }

  initDOM() {
    this.dock = document.getElementById('compare-dock');
    this.dockCount = document.getElementById('compare-dock-count');
    this.dockThumbs = document.getElementById('compare-dock-thumbs');
    this.openBtn = document.getElementById('compare-open-btn');
    this.clearBtn = document.getElementById('compare-clear-btn');

    this.modal = document.getElementById('compare-modal');
    this.modalClose = document.getElementById('compare-modal-close');
    this.matrixContainer = document.getElementById('compare-matrix-container');

    if (this.openBtn) this.openBtn.addEventListener('click', () => this.open());
    if (this.clearBtn) this.clearBtn.addEventListener('click', () => this.clearAll());
    if (this.modalClose) this.modalClose.addEventListener('click', () => this.close());
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });
    }

    // Delegate comparison button clicks on cards
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.compare-btn');
      if (btn) {
        e.stopPropagation();
        const id = btn.getAttribute('data-compare-id');
        this.toggle(id, btn);
      }
    });
  }

  toggle(productId, targetBtn = null) {
    const idx = this.compareIds.indexOf(productId);
    const prod = products.find(p => p.id === productId);

    if (idx > -1) {
      this.compareIds.splice(idx, 1);
      this.updateCardBtn(productId, false);
      showToast(`Removed ${prod?.name} from comparison`, 'info');
    } else {
      if (this.compareIds.length >= 3) {
        showToast('You can compare a maximum of 3 products at a time.', 'error');
        return;
      }
      this.compareIds.push(productId);
      this.updateCardBtn(productId, true);
      showToast(`Added ${prod?.name} to comparison!`, 'success');

      if (targetBtn) {
        gsap.fromTo(targetBtn, 
          { scale: 1.3 }, 
          { scale: 1, duration: 0.35, ease: 'back.out(2)' }
        );
      }
    }

    this.updateDock();
    if (this.isOpen) this.renderMatrix();
  }

  updateCardBtn(productId, active) {
    document.querySelectorAll(`.compare-btn[data-compare-id="${productId}"]`).forEach(btn => {
      btn.classList.toggle('active', active);
    });
  }

  clearAll() {
    this.compareIds.forEach(id => this.updateCardBtn(id, false));
    this.compareIds = [];
    this.updateDock();
    this.close();
    showToast('Cleared product comparison', 'info');
  }

  updateDock() {
    if (!this.dock) return;

    if (this.compareIds.length > 0) {
      this.dock.classList.add('visible');
      if (this.dockCount) this.dockCount.textContent = `(${this.compareIds.length}/3)`;

      if (this.dockThumbs) {
        const items = this.compareIds.map(id => products.find(p => p.id === id)).filter(Boolean);
        this.dockThumbs.innerHTML = items.map(p => `
          <div class="compare-dock-thumb" title="${p.name}">
            <img src="${p.image}" alt="${p.name}" />
            <button class="compare-thumb-remove" data-remove-compare="${p.id}">×</button>
          </div>
        `).join('');

        this.dockThumbs.querySelectorAll('.compare-thumb-remove').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-remove-compare');
            this.toggle(id);
          });
        });
      }
    } else {
      this.dock.classList.remove('visible');
    }
  }

  open() {
    if (this.compareIds.length < 2) {
      showToast('Select at least 2 products to compare.', 'info');
      return;
    }
    if (!this.modal) return;
    this.isOpen = true;
    this.modal.classList.add('open');
    lockScroll();
    this.renderMatrix();

    gsap.from('.compare-modal-box', {
      scale: 0.9,
      y: 30,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out'
    });
  }

  close() {
    if (!this.modal) return;
    this.isOpen = false;
    this.modal.classList.remove('open');
    unlockScroll();
  }

  /**
   * Determine best value product
   * Computes ratio of rating to price, factoring flagship specs
   */
  findBestValueProduct(items) {
    if (items.length === 0) return null;
    let best = items[0];
    let bestScore = -1;

    items.forEach(p => {
      // Score = (Rating * 1000) / Price
      const score = (p.rating * 1000) / p.price;
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    });

    return best.id;
  }

  renderMatrix() {
    if (!this.matrixContainer) return;

    const items = this.compareIds.map(id => products.find(p => p.id === id)).filter(Boolean);
    const bestValueId = this.findBestValueProduct(items);
    const engine = getCompatibilityEngine();

    const specKeys = [
      { label: 'Category', render: p => p.category },
      { label: 'Brand', render: p => p.brand },
      { label: 'Price', render: p => `<strong style="font-size:1.15rem; color:var(--text-primary);">$${p.price}</strong>` },
      { label: 'Customer Rating', render: p => `★ ${p.rating} (${p.reviews} reviews)` },
      { 
        label: 'Setup Compatibility', 
        render: p => {
          const evalRes = engine.evaluate(p);
          const color = evalRes.status === 'compatible' ? '#34d399' : evalRes.status === 'works_with_limits' ? '#fbbf24' : '#fb7185';
          return `<span style="color:${color}; font-weight:700;">${evalRes.status.toUpperCase().replace(/_/g, ' ')}</span><br><small style="color:var(--text-muted); font-size:0.75rem;">${evalRes.reason}</small>`;
        }
      },
      { 
        label: 'Fast Charging / Power', 
        render: p => p.specs?.fastChargeWattage ? `${p.specs.fastChargeWattage}W Fast Charge` : (p.specs?.wattage ? `${p.specs.wattage}W Output` : (p.specs?.chargingWattage ? `${p.specs.chargingWattage}W Input` : 'Standard')) 
      },
      { label: 'Ports / Connectivity', render: p => p.specs?.portType || p.specs?.connectorType || (p.specs?.ports ? JSON.stringify(p.specs.ports).replace(/[{}"]/g, ' ') : 'N/A') },
      { label: 'Key Innovation', render: p => p.features ? p.features[0] : p.badge }
    ];

    this.matrixContainer.innerHTML = `
      <div class="compare-table-wrapper">
        <table class="compare-table">
          <thead>
            <tr>
              <th class="compare-feature-head">Specifications</th>
              ${items.map(p => {
                const isBestValue = p.id === bestValueId;
                return `
                  <th class="compare-product-head ${isBestValue ? 'best-value-col' : ''}">
                    ${isBestValue ? `<div class="best-value-badge pulse-badge">⭐ BEST VALUE</div>` : ''}
                    <div class="compare-card-top">
                      <img src="${p.image}" alt="${p.name}" class="compare-table-img" />
                      <h4 class="compare-table-title">${p.name}</h4>
                      <div class="compare-table-price">$${p.price}</div>
                      <button class="btn-primary compare-add-cart-btn" data-compare-add="${p.id}">
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </th>
                `;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${specKeys.map(spec => `
              <tr>
                <td class="compare-spec-name">${spec.label}</td>
                ${items.map(p => {
                  const isBestValue = p.id === bestValueId;
                  return `
                    <td class="compare-spec-val ${isBestValue ? 'best-value-cell' : ''}">
                      ${spec.render(p)}
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Attach Add to Cart listeners in comparison table
    this.matrixContainer.querySelectorAll('.compare-add-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-compare-add');
        const prod = products.find(p => p.id === id);
        if (prod) {
          getCart().addItem(prod, btn);
        }
      });
    });
  }
}

let compareInstance = null;
export function initCompare() {
  if (!compareInstance) {
    compareInstance = new CompareManager();
  }
  return compareInstance;
}

export function getCompare() {
  return compareInstance || initCompare();
}
