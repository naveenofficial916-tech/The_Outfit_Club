import React, { useState } from 'react';
import { useCart, cartStore } from '../services/cartStore';
import type { CartItem } from '../services/cartStore';
import { navigateTo } from '../utils/navigation';
import { 
  TrashIcon, 
  BagIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  ArrowRightIcon, 
  CheckIcon,
  CloseIcon
} from '../components/common/Icons';
import './CartPage.css';

export const CartPage: React.FC = () => {
  const { items, count, subtotal, shipping, total, freeShippingThreshold, isFreeShipping } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [checkoutNotification, setCheckoutNotification] = useState<string | null>(null);

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleUpdateQuantity = (itemId: string, newQty: number, itemName: string) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId, itemName);
    } else {
      cartStore.updateQuantity(itemId, newQty);
    }
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    cartStore.removeItem(itemId);
    setFeedbackMessage(`Removed "${itemName}" from your cart`);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const handleClearCart = () => {
    cartStore.clearCart();
    setShowClearConfirm(false);
    setFeedbackMessage('All items removed from your cart');
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'OUTFIT10' || cleanCode === 'STREET10') {
      const discountVal = subtotal * 0.1;
      setPromoDiscount(discountVal);
      setPromoMessage({ text: '10% discount applied to your order!' });
    } else if (cleanCode === 'MEN20') {
      const discountVal = subtotal * 0.2;
      setPromoDiscount(discountVal);
      setPromoMessage({ text: 'VIP 20% discount applied to your order!' });
    } else {
      setPromoDiscount(0);
      setPromoMessage({ text: 'Invalid promo code. Try "OUTFIT10"', isError: true });
    }
  };

  const handleProceedToCheckout = () => {
    navigateTo('/checkout');
  };

  const finalTotal = Math.max(0, total - promoDiscount);

  return (
    <main className="cart-page-wrapper" id="cart-page">
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div className="cart-toast" role="status" aria-live="polite">
          <CheckIcon size={16} />
          <span>{feedbackMessage}</span>
          <button 
            type="button" 
            className="toast-close" 
            onClick={() => setFeedbackMessage(null)}
            aria-label="Close notification"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      )}

      {/* Checkout Transition Notice */}
      {checkoutNotification && (
        <div className="cart-checkout-banner" role="alert">
          <div className="banner-content">
            <span className="banner-pulse"></span>
            <strong>{checkoutNotification}</strong>
          </div>
          <button 
            type="button" 
            className="banner-close" 
            onClick={() => setCheckoutNotification(null)}
            aria-label="Dismiss banner"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      )}

      {/* Confirmation Modal for Clear Cart */}
      {showClearConfirm && (
        <div className="clear-modal-backdrop" onClick={() => setShowClearConfirm(false)}>
          <div 
            className="clear-modal-box" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="clear-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="clear-dialog-title" className="clear-modal-title">Clear Shopping Cart?</h3>
            <p className="clear-modal-desc">
              Are you sure you want to remove all {count} {count === 1 ? 'item' : 'items'} from your cart? This action cannot be undone.
            </p>
            <div className="clear-modal-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => setShowClearConfirm(false)}
              >
                CANCEL
              </button>
              <button 
                type="button" 
                className="btn-confirm-clear" 
                onClick={handleClearCart}
              >
                YES, CLEAR CART
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="cart-container">
        {/* Navigation Breadcrumbs */}
        <nav className="cart-breadcrumbs" aria-label="Breadcrumb">
          <button type="button" onClick={() => navigateTo('/')} className="breadcrumb-link">
            HOME
          </button>
          <span className="breadcrumb-separator">/</span>
          <button type="button" onClick={() => navigateTo('/catalog')} className="breadcrumb-link">
            MEN'S COLLECTION
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current" aria-current="page">YOUR CART</span>
        </nav>

        {/* Empty Cart State (Requirement 9) */}
        {items.length === 0 ? (
          <div className="cart-empty-state">
            <div className="empty-cart-icon-wrapper">
              <BagIcon size={56} />
            </div>
            <h1 className="empty-cart-heading">YOUR CART IS EMPTY</h1>
            <p className="empty-cart-subtext">
              Looks like you haven't added anything yet. Explore our curated selection of baggy pants,
              oversized tees, and premium relaxed streetwear.
            </p>
            <div className="empty-cart-actions">
              <button
                type="button"
                className="btn-shop-collection"
                onClick={() => navigateTo('/catalog')}
              >
                SHOP MEN'S COLLECTION
                <ArrowRightIcon size={18} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header with Title and Clear Cart */}
            <div className="cart-header-row">
              <div>
                <h1 className="cart-title">YOUR CART</h1>
                <span className="cart-item-count-badge">
                  {count} {count === 1 ? 'ITEM' : 'ITEMS'}
                </span>
              </div>
              <button
                type="button"
                className="cart-clear-btn"
                onClick={() => setShowClearConfirm(true)}
                aria-label="Clear all items from cart"
              >
                <TrashIcon size={14} />
                <span>CLEAR CART</span>
              </button>
            </div>

            {/* Free Shipping Meter */}
            <div className="cart-shipping-meter-card">
              <div className="meter-label-row">
                <div className="meter-icon-text">
                  <TruckIcon size={18} />
                  {isFreeShipping ? (
                    <span className="meter-text unlocked">
                      <strong>You unlocked FREE Standard Shipping!</strong>
                    </span>
                  ) : (
                    <span className="meter-text">
                      Add <strong>{formatPrice(amountNeededForFreeShipping)}</strong> more for <strong>FREE Standard Shipping</strong>
                    </span>
                  )}
                </div>
                <span className="meter-percentage">{freeShippingProgress}%</span>
              </div>
              <div className="meter-progress-track">
                <div 
                  className={`meter-progress-fill ${isFreeShipping ? 'is-complete' : ''}`}
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Main Cart Grid: Left Items List, Right Order Summary */}
            <div className="cart-grid">
              {/* Items Column */}
              <section className="cart-items-section" aria-label="Cart items list">
                <div className="cart-items-table-header">
                  <span className="col-product">PRODUCT</span>
                  <span className="col-qty">QUANTITY</span>
                  <span className="col-total">TOTAL</span>
                </div>

                <div className="cart-items-list">
                  {items.map((item: CartItem) => {
                    const lineTotal = item.price * item.quantity;
                    return (
                      <article 
                        key={item.id} 
                        className="cart-item-row"
                        id={`cart-item-${item.id}`}
                      >
                        {/* Thumbnail */}
                        <div 
                          className="cart-item-image-wrapper"
                          onClick={() => navigateTo(`/product/${item.productSlug}`)}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="cart-item-image"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80';
                            }}
                          />
                        </div>

                        {/* Details */}
                        <div className="cart-item-details">
                          <button
                            type="button"
                            className="cart-item-name-link"
                            onClick={() => navigateTo(`/product/${item.productSlug}`)}
                          >
                            {item.name}
                          </button>

                          <div className="cart-item-meta">
                            <span className="meta-tag">
                              Size: <strong>{item.size}</strong>
                            </span>
                            {item.color && (
                              <span className="meta-tag">
                                Color: <strong>{item.color}</strong>
                              </span>
                            )}
                          </div>

                          <div className="cart-item-unit-price">
                            <span className="price-current">{formatPrice(item.price)}</span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="price-original">{formatPrice(item.originalPrice)}</span>
                            )}
                          </div>

                          {/* Mobile-only Quantity Controls */}
                          <div className="cart-item-mobile-actions">
                            <div className="cart-qty-stepper" aria-label="Item quantity controls">
                              <button
                                type="button"
                                className="qty-step-btn"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.name)}
                                aria-label={`Decrease quantity of ${item.name}`}
                              >
                                −
                              </button>
                              <span className="qty-value" aria-live="polite">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className="qty-step-btn"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.name)}
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              className="cart-item-remove-btn"
                              onClick={() => handleRemoveItem(item.id, item.name)}
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <TrashIcon size={14} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Desktop Quantity Controls */}
                        <div className="cart-item-desktop-qty">
                          <div className="cart-qty-stepper">
                            <button
                              type="button"
                              className="qty-step-btn"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.name)}
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              −
                            </button>
                            <span className="qty-value">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="qty-step-btn"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.name)}
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className="cart-item-remove-link"
                            onClick={() => handleRemoveItem(item.id, item.name)}
                            aria-label={`Remove ${item.name}`}
                          >
                            <TrashIcon size={13} />
                            <span>Remove</span>
                          </button>
                        </div>

                        {/* Desktop Line Total */}
                        <div className="cart-item-line-total">
                          <span className="total-amount">{formatPrice(lineTotal)}</span>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Continue Shopping Link */}
                <div className="cart-continue-row">
                  <button
                    type="button"
                    className="btn-continue-shopping"
                    onClick={() => navigateTo('/catalog')}
                  >
                    ← CONTINUE SHOPPING
                  </button>
                </div>
              </section>

              {/* Order Summary Column */}
              <aside className="cart-summary-section" aria-label="Order summary">
                <div className="cart-summary-card">
                  <h2 className="summary-title">ORDER SUMMARY</h2>

                  <div className="summary-rows">
                    <div className="summary-row">
                      <span className="label">Subtotal ({count} items)</span>
                      <span className="value">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="summary-row">
                      <span className="label">
                        Shipping
                        {isFreeShipping && <span className="free-tag">FREE</span>}
                      </span>
                      <span className="value">
                        {isFreeShipping ? 'Free' : formatPrice(shipping)}
                      </span>
                    </div>

                    {promoDiscount > 0 && (
                      <div className="summary-row discount-row">
                        <span className="label">Promo Discount</span>
                        <span className="value">−{formatPrice(promoDiscount)}</span>
                      </div>
                    )}

                    <div className="summary-divider" />

                    <div className="summary-row total-row">
                      <span className="label">Estimated Total</span>
                      <span className="value total-price">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Promo Code Form */}
                  <form className="cart-promo-form" onSubmit={handleApplyPromo}>
                    <div className="promo-input-group">
                      <input
                        type="text"
                        className="promo-input"
                        placeholder="PROMO CODE (e.g. OUTFIT10)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        aria-label="Enter promotional or discount code"
                      />
                      <button type="submit" className="btn-apply-promo">
                        APPLY
                      </button>
                    </div>
                    {promoMessage && (
                      <p className={`promo-feedback ${promoMessage.isError ? 'error' : 'success'}`}>
                        {promoMessage.text}
                      </p>
                    )}
                  </form>

                  {/* Checkout Action Button */}
                  <button
                    type="button"
                    className="btn-checkout-primary"
                    onClick={handleProceedToCheckout}
                  >
                    <span>CHECKOUT</span>
                    <ArrowRightIcon size={18} />
                  </button>

                  {/* Trust Guarantees */}
                  <div className="summary-guarantees">
                    <div className="guarantee-item">
                      <ShieldCheckIcon size={16} />
                      <span>Encrypted 256-Bit SSL Checkout</span>
                    </div>
                    <div className="guarantee-item">
                      <TruckIcon size={16} />
                      <span>Complimentary Shipping Over $75</span>
                    </div>
                    <div className="guarantee-item">
                      <CheckIcon size={16} />
                      <span>30-Day Hassle-Free Returns & Exchanges</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
};
