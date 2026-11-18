import gsap from 'gsap';
import { showToast } from './toast.js';

export function createEmiCalculatorHtml(price) {
  return `
    <div class="emi-calc-wrapper" data-base-price="${price}">
      <div class="emi-calc-header">
        <div class="emi-calc-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--neon-emerald)" stroke-width="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          <strong>Flexible EMI Financing</strong>
        </div>
        <span class="emi-promo-badge">0% NO-COST EMI AVAILABLE</span>
      </div>

      <!-- Monthly Installment Display -->
      <div class="emi-monthly-box">
        <div class="emi-monthly-label">Monthly Installment:</div>
        <div class="emi-monthly-value">
          <span class="emi-amount" id="emi-monthly-amount">$${Math.round(price / 12)}</span>
          <span class="emi-per-month">/ month</span>
        </div>
        <div class="emi-interest-info" id="emi-interest-info">0% Interest • 12 Months Zero Cost Plan</div>
      </div>

      <!-- Repayment Duration Slider -->
      <div class="emi-control-row">
        <div class="emi-control-label">
          <span>Repayment Period:</span>
          <strong id="emi-months-label">12 Months</strong>
        </div>
        <input 
          type="range" 
          class="emi-slider" 
          id="emi-months-slider" 
          min="3" 
          max="24" 
          step="3" 
          value="12" 
        />
        <div class="emi-ticks">
          <span>3m</span>
          <span>6m</span>
          <span>9m</span>
          <span>12m</span>
          <span>18m</span>
          <span>24m</span>
        </div>
      </div>

      <!-- Down Payment Slider -->
      <div class="emi-control-row" style="margin-top:12px;">
        <div class="emi-control-label">
          <span>Down Payment:</span>
          <strong id="emi-downpayment-label">$0 (0%)</strong>
        </div>
        <input 
          type="range" 
          class="emi-slider" 
          id="emi-downpayment-slider" 
          min="0" 
          max="50" 
          step="10" 
          value="0" 
        />
      </div>

      <button class="btn-secondary emi-apply-btn" id="emi-apply-btn" style="width:100%; margin-top:14px; font-size:0.85rem; padding:10px;">
        <span>Pre-Approve Instant 0% EMI</span>
      </button>
    </div>
  `;
}

export function attachEmiEventListeners(container, basePrice) {
  if (!container) return;

  const monthsSlider = container.querySelector('#emi-months-slider');
  const monthsLabel = container.querySelector('#emi-months-label');
  const downSlider = container.querySelector('#emi-downpayment-slider');
  const downLabel = container.querySelector('#emi-downpayment-label');
  const amountEl = container.querySelector('#emi-monthly-amount');
  const interestInfo = container.querySelector('#emi-interest-info');
  const applyBtn = container.querySelector('#emi-apply-btn');

  function calculate() {
    const months = parseInt(monthsSlider?.value || '12', 10);
    const downPercent = parseInt(downSlider?.value || '0', 10);

    const downAmount = Math.round((basePrice * downPercent) / 100);
    const principal = basePrice - downAmount;

    // 0% interest for 3, 6, or 12 months, otherwise 12% APR
    const isZeroCost = months <= 12;
    const interestRate = isZeroCost ? 0 : 0.12;
    const interestAmount = Math.round(principal * interestRate * (months / 12));
    const totalToPay = principal + interestAmount;
    const monthly = Math.round(totalToPay / months);

    if (monthsLabel) monthsLabel.textContent = `${months} Months`;
    if (downLabel) downLabel.textContent = `$${downAmount} (${downPercent}%)`;

    if (interestInfo) {
      if (isZeroCost) {
        interestInfo.textContent = `0% Interest • ${months} Months Zero Cost Plan (No Extra Fees)`;
        interestInfo.style.color = 'var(--neon-emerald)';
      } else {
        interestInfo.textContent = `12% Annual APR • Total Interest: $${interestAmount}`;
        interestInfo.style.color = 'var(--text-secondary)';
      }
    }

    if (amountEl) {
      animateNumber(amountEl, monthly);
    }
  }

  function animateNumber(element, target) {
    const cur = parseInt(element.textContent.replace(/\D/g, '') || '0', 10);
    const obj = { val: cur };
    gsap.to(obj, {
      val: target,
      duration: 0.35,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = `$${Math.round(obj.val)}`;
      }
    });
  }

  if (monthsSlider) monthsSlider.addEventListener('input', calculate);
  if (downSlider) downSlider.addEventListener('input', calculate);

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      showToast('Instant EMI credit check approved up to $5,000!', 'success', 'Financing Pre-Approved');
    });
  }

  calculate();
}
