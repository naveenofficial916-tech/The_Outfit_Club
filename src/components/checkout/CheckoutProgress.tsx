import React from 'react';
import { navigateTo } from '../../utils/navigation';
import { CheckIcon } from '../common/Icons';
import './CheckoutProgress.css';

interface CheckoutProgressProps {
  currentStep: 'cart' | 'checkout' | 'payment';
}

export const CheckoutProgress: React.FC<CheckoutProgressProps> = ({ currentStep }) => {
  return (
    <nav className="checkout-progress-bar" aria-label="Checkout steps">
      <div className="progress-container">
        {/* Step 1: Cart */}
        <button
          type="button"
          className="progress-step is-completed"
          onClick={() => navigateTo('/cart')}
        >
          <span className="step-indicator">
            <CheckIcon size={14} />
          </span>
          <span className="step-label">1. CART</span>
        </button>

        <div className="step-connector is-active" />

        {/* Step 2: Checkout */}
        <div 
          className={`progress-step ${currentStep === 'checkout' ? 'is-active' : ''}`}
          aria-current={currentStep === 'checkout' ? 'step' : undefined}
        >
          <span className="step-indicator">2</span>
          <span className="step-label">2. CHECKOUT & DELIVERY</span>
        </div>

        <div className="step-connector" />

        {/* Step 3: Payment */}
        <div className="progress-step is-upcoming">
          <span className="step-indicator">3</span>
          <span className="step-label">3. PAYMENT</span>
          <span className="upcoming-tag">NEXT MODULE</span>
        </div>
      </div>
    </nav>
  );
};
