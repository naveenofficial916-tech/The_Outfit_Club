import React, { useState, useEffect } from 'react';
import { useCart, cartStore } from '../services/cartStore';
import type { CartItem } from '../services/cartStore';
import { navigateTo } from '../utils/navigation';
import { CheckoutProgress } from '../components/checkout/CheckoutProgress';
import { DeliveryMethodSelector } from '../components/checkout/DeliveryMethodSelector';
import { AddressForm } from '../components/checkout/AddressForm';
import { calculateDeliveryCost, getDeliveryMethod } from '../services/shippingService';
import { validatePromoCode } from '../services/promoService';
import type { PromoValidationResult } from '../services/promoService';
import { orderService } from '../services/orderService';
import type { CustomerInfo, Address } from '../services/orderService';
import { 
  BagIcon, 
  ArrowRightIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  CheckIcon, 
  CloseIcon 
} from '../components/common/Icons';
import './CheckoutPage.css';

const CHECKOUT_STORAGE_KEY = 'the_outfit_club_checkout_form_v1';

function getStoredCheckoutForm() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export const CheckoutPage: React.FC = () => {
  const { cart, count, subtotal } = useCart();
  const initialForm = getStoredCheckoutForm();

  // Customer Contact Information
  const [customer, setCustomer] = useState<CustomerInfo>(
    initialForm?.customer || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    }
  );

  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState<Address>(
    initialForm?.shippingAddress || {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
    }
  );

  // Billing Address Toggle & State
  const [sameAsShipping, setSameAsShipping] = useState<boolean>(
    initialForm?.sameAsShipping !== undefined ? initialForm.sameAsShipping : true
  );
  const [billingAddress, setBillingAddress] = useState<Address>(
    initialForm?.billingAddress || {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
    }
  );

  // Delivery Method
  const [deliveryMethodId, setDeliveryMethodId] = useState<string>(
    initialForm?.deliveryMethodId || 'standard'
  );

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoValidationResult | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Form Validation & Interaction States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Save non-sensitive form state to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        CHECKOUT_STORAGE_KEY,
        JSON.stringify({
          customer,
          shippingAddress,
          sameAsShipping,
          billingAddress,
          deliveryMethodId,
        })
      );
    } catch {
      // Ignore sessionStorage errors
    }
  }, [customer, shippingAddress, sameAsShipping, billingAddress, deliveryMethodId]);

  // Recalculate shipping and total based on selected method and subtotal
  const shippingFee = calculateDeliveryCost(deliveryMethodId, subtotal);
  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  const estimatedTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  // Format currencies
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Form field handlers
  const handleCustomerChange = (field: keyof CustomerInfo, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleShippingChange = (field: keyof Address, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
    const errorKey = `shipping_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const handleBillingChange = (field: keyof Address, value: string) => {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
    const errorKey = `billing_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  // Promo code apply / remove
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const result = validatePromoCode(promoCodeInput, subtotal);
    if (result.valid) {
      setAppliedPromo(result);
      setPromoCodeInput('');
    } else {
      setPromoError(result.message);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!customer.firstName.trim()) errs.firstName = 'First name is required.';
    if (!customer.lastName.trim()) errs.lastName = 'Last name is required.';

    if (!customer.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!customer.phone.trim()) {
      errs.phone = 'Phone number is required for delivery notifications.';
    } else if (customer.phone.replace(/\D/g, '').length < 8) {
      errs.phone = 'Please enter a valid phone number (at least 8 digits).';
    }

    // Shipping Address Validation
    if (!shippingAddress.addressLine1.trim()) errs.shipping_addressLine1 = 'Street address is required.';
    if (!shippingAddress.city.trim()) errs.shipping_city = 'City is required.';
    if (!shippingAddress.state.trim()) errs.shipping_state = 'State or province is required.';
    if (!shippingAddress.postalCode.trim()) {
      errs.shipping_postalCode = 'Postal / ZIP code is required.';
    } else if (shippingAddress.postalCode.trim().length < 3) {
      errs.shipping_postalCode = 'Please enter a valid postal code.';
    }

    // Billing Address Validation (if different)
    if (!sameAsShipping) {
      if (!billingAddress.addressLine1.trim()) errs.billing_addressLine1 = 'Billing street address is required.';
      if (!billingAddress.city.trim()) errs.billing_city = 'Billing city is required.';
      if (!billingAddress.state.trim()) errs.billing_state = 'Billing state or province is required.';
      if (!billingAddress.postalCode.trim()) errs.billing_postalCode = 'Billing postal code is required.';
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      // Focus first error element
      const firstErrorKey = Object.keys(errs)[0];
      const el = document.getElementById(firstErrorKey) || document.querySelector('.is-invalid');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  // Place Order Handler
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (cart.length === 0) return;

    setIsSubmitting(true);

    const deliveryMethod = getDeliveryMethod(deliveryMethodId);

    // Simulate clean order creation transition
    setTimeout(() => {
      try {
        const order = orderService.createOrder({
          customer,
          shippingAddress,
          billingAddress: {
            ...billingAddress,
            sameAsShipping,
          },
          deliveryMethod: {
            id: deliveryMethod.id,
            name: deliveryMethod.name,
            estimate: deliveryMethod.estimate,
            price: shippingFee,
          },
          items: cart,
          subtotal,
          shipping: shippingFee,
          discount: discountAmount,
          promoCode: appliedPromo?.code,
          total: estimatedTotal,
        });

        // Cart is cleared ONLY AFTER successful order creation
        cartStore.clearCart();

        // Clear checkout storage
        try {
          sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
        } catch {
          // Ignore
        }

        setIsSubmitting(false);

        // Navigate to order-success
        navigateTo(`/order-success?ref=${order.orderId}`);
      } catch (err) {
        console.error('Order creation failed:', err);
        setIsSubmitting(false);
        setErrors((prev) => ({
          ...prev,
          form: 'An unexpected error occurred while placing your order. Your cart has been preserved. Please try again.',
        }));
      }
    }, 600);
  };

  // 1. Empty Cart State Handling (Requirement 1)
  if (cart.length === 0) {
    return (
      <main className="checkout-page-wrapper" id="checkout-page">
        <div className="checkout-container">
          <div className="checkout-empty-state">
            <div className="empty-checkout-icon">
              <BagIcon size={52} />
            </div>
            <h1 className="empty-checkout-title">YOUR CART IS EMPTY</h1>
            <p className="empty-checkout-desc">
              Your shopping bag is currently empty. You must add items to your cart before proceeding through checkout.
            </p>
            <button
              type="button"
              className="btn-return-shop"
              onClick={() => navigateTo('/catalog')}
            >
              RETURN TO SHOP
              <ArrowRightIcon size={18} />
            </button>
          </div>
        </div>
      </main>
    );
  }

  const selectedDelivery = getDeliveryMethod(deliveryMethodId);

  return (
    <main className="checkout-page-wrapper" id="checkout-page">
      <CheckoutProgress currentStep="checkout" />

      <div className="checkout-container">
        {/* Module Notice */}
        <div className="checkout-module-notice">
          <ShieldCheckIcon size={18} />
          <span>
            <strong>The Outfit Club Checkout Foundation</strong> — This is a secure order preparation flow. Real payment gateway processing will be completed in Module 6.
          </span>
        </div>

        <form onSubmit={handlePlaceOrder} noValidate>
          <div className="checkout-grid">
            {/* LEFT COLUMN: Customer, Shipping, Delivery, Billing, & Review */}
            <div className="checkout-main-column">
              {/* SECTION 1: Customer Contact Information */}
              <section className="checkout-card" aria-labelledby="contact-heading">
                <div className="card-header-row">
                  <h2 id="contact-heading" className="card-title">
                    1. CUSTOMER INFORMATION
                  </h2>
                  <span className="card-badge">REQUIRED</span>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">
                      FIRST NAME <span className="required-star">*</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      className={`form-input ${errors.firstName ? 'is-invalid' : ''}`}
                      placeholder="e.g. Marcus"
                      value={customer.firstName}
                      onChange={(e) => handleCustomerChange('firstName', e.target.value)}
                      aria-required="true"
                      autoComplete="given-name"
                    />
                    {errors.firstName && (
                      <span className="form-error" role="alert">
                        {errors.firstName}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">
                      LAST NAME <span className="required-star">*</span>
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      className={`form-input ${errors.lastName ? 'is-invalid' : ''}`}
                      placeholder="e.g. Vance"
                      value={customer.lastName}
                      onChange={(e) => handleCustomerChange('lastName', e.target.value)}
                      aria-required="true"
                      autoComplete="family-name"
                    />
                    {errors.lastName && (
                      <span className="form-error" role="alert">
                        {errors.lastName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      EMAIL ADDRESS <span className="required-star">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="e.g. marcus@theoutfitclub.com"
                      value={customer.email}
                      onChange={(e) => handleCustomerChange('email', e.target.value)}
                      aria-required="true"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <span className="form-error" role="alert">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      PHONE NUMBER <span className="required-star">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className={`form-input ${errors.phone ? 'is-invalid' : ''}`}
                      placeholder="e.g. +1 (555) 019-2834"
                      value={customer.phone}
                      onChange={(e) => handleCustomerChange('phone', e.target.value)}
                      aria-required="true"
                      autoComplete="tel"
                    />
                    {errors.phone && (
                      <span className="form-error" role="alert">
                        {errors.phone}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* SECTION 2: Shipping Address */}
              <section className="checkout-card" aria-labelledby="shipping-heading">
                <div className="card-header-row">
                  <h2 id="shipping-heading" className="card-title">
                    2. SHIPPING ADDRESS
                  </h2>
                </div>

                <AddressForm
                  title=""
                  prefix="shipping"
                  values={shippingAddress}
                  errors={{
                    addressLine1: errors.shipping_addressLine1,
                    city: errors.shipping_city,
                    state: errors.shipping_state,
                    postalCode: errors.shipping_postalCode,
                  }}
                  onChange={handleShippingChange}
                />
              </section>

              {/* SECTION 3: Delivery Method */}
              <section className="checkout-card" aria-labelledby="delivery-heading">
                <div className="card-header-row">
                  <h2 id="delivery-heading" className="card-title">
                    3. DELIVERY METHOD
                  </h2>
                </div>

                <DeliveryMethodSelector
                  selectedMethodId={deliveryMethodId}
                  subtotal={subtotal}
                  onSelectMethod={(methodId) => setDeliveryMethodId(methodId)}
                />
              </section>

              {/* SECTION 4: Billing Address */}
              <section className="checkout-card" aria-labelledby="billing-heading">
                <div className="card-header-row">
                  <h2 id="billing-heading" className="card-title">
                    4. BILLING ADDRESS
                  </h2>
                </div>

                <label className="checkbox-control-label">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="custom-checkbox"
                  />
                  <span className="checkbox-text">Billing address same as shipping</span>
                </label>

                {!sameAsShipping && (
                  <div className="billing-address-container">
                    <AddressForm
                      title="Enter Billing Address"
                      prefix="billing"
                      values={billingAddress}
                      errors={{
                        addressLine1: errors.billing_addressLine1,
                        city: errors.billing_city,
                        state: errors.billing_state,
                        postalCode: errors.billing_postalCode,
                      }}
                      onChange={handleBillingChange}
                    />
                  </div>
                )}
              </section>

              {/* SECTION 5: Order Review Accordion (Requirement 11) */}
              <section className="checkout-card review-card" aria-labelledby="review-heading">
                <div className="card-header-row">
                  <h2 id="review-heading" className="card-title">
                    5. ORDER REVIEW
                  </h2>
                  <button
                    type="button"
                    className="btn-toggle-review"
                    onClick={() => setIsReviewOpen(!isReviewOpen)}
                  >
                    {isReviewOpen ? 'COLLAPSE' : 'EXPAND REVIEW'}
                  </button>
                </div>

                {isReviewOpen && (
                  <div className="order-review-details">
                    <div className="review-section">
                      <div className="review-section-header">
                        <strong>Contact Information</strong>
                      </div>
                      <p className="review-text">
                        {customer.firstName || customer.lastName
                          ? `${customer.firstName} ${customer.lastName}`
                          : 'Not entered yet'}
                        <br />
                        {customer.email || 'No email entered'}
                        <br />
                        {customer.phone || 'No phone entered'}
                      </p>
                    </div>

                    <div className="review-section">
                      <div className="review-section-header">
                        <strong>Shipping Destination</strong>
                      </div>
                      <p className="review-text">
                        {shippingAddress.addressLine1 || 'No street address entered'}
                        {shippingAddress.addressLine2 && `, ${shippingAddress.addressLine2}`}
                        <br />
                        {shippingAddress.city ? `${shippingAddress.city}, ` : ''}
                        {shippingAddress.state} {shippingAddress.postalCode}
                        <br />
                        {shippingAddress.country}
                      </p>
                    </div>

                    <div className="review-section">
                      <div className="review-section-header">
                        <strong>Selected Transit</strong>
                      </div>
                      <p className="review-text">
                        {selectedDelivery.name} ({selectedDelivery.estimate}) —{' '}
                        {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT COLUMN: Order Summary & Action */}
            <aside className="checkout-summary-column" aria-label="Order review summary">
              <div className="checkout-summary-card">
                <div className="summary-header">
                  <h2 className="summary-title">YOUR ORDER</h2>
                  <span className="summary-count">
                    {count} {count === 1 ? 'ITEM' : 'ITEMS'}
                  </span>
                </div>

                {/* Items Mini List */}
                <div className="checkout-items-list">
                  {cart.map((item: CartItem) => {
                    const lineTotal = item.price * item.quantity;
                    return (
                      <div key={item.id} className="checkout-item-row">
                        <div className="checkout-item-thumb">
                          <img
                            src={item.image}
                            alt={item.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80';
                            }}
                          />
                          <span className="item-qty-badge">{item.quantity}</span>
                        </div>

                        <div className="checkout-item-info">
                          <h4 className="item-title">{item.name}</h4>
                          <div className="item-variant">
                            <span>Size: <strong>{item.size}</strong></span>
                            {item.color && <span> • {item.color}</span>}
                          </div>
                          <span className="item-unit-price">{formatPrice(item.price)} each</span>
                        </div>

                        <div className="checkout-item-total">
                          {formatPrice(lineTotal)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Code Input */}
                <div className="checkout-promo-box">
                  {appliedPromo ? (
                    <div className="applied-promo-tag">
                      <div className="applied-promo-info">
                        <CheckIcon size={14} />
                        <span>
                          <strong>{appliedPromo.code}</strong> applied ({formatPrice(appliedPromo.discountAmount)} off)
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-remove-promo"
                        onClick={handleRemovePromo}
                        aria-label="Remove promo code"
                      >
                        <CloseIcon size={14} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="promo-input-row">
                        <input
                          type="text"
                          className="checkout-promo-input"
                          placeholder="PROMO CODE (e.g. OUTFIT10)"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn-checkout-promo-apply"
                          onClick={handleApplyPromo}
                        >
                          APPLY
                        </button>
                      </div>
                      {promoError && <p className="promo-error-msg">{promoError}</p>}
                    </div>
                  )}
                </div>

                {/* Financial Summary Lines */}
                <div className="checkout-financial-rows">
                  <div className="fin-row">
                    <span className="fin-label">Subtotal</span>
                    <span className="fin-val">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="fin-row">
                    <span className="fin-label">
                      Delivery ({selectedDelivery.name})
                    </span>
                    <span className="fin-val">
                      {shippingFee === 0 ? <span className="free-pill">FREE</span> : formatPrice(shippingFee)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="fin-row discount-row">
                      <span className="fin-label">Promotion Discount</span>
                      <span className="fin-val">−{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="fin-divider" />

                  <div className="fin-row total-row">
                    <span className="fin-label">Estimated Total</span>
                    <span className="fin-val total-val">{formatPrice(estimatedTotal)}</span>
                  </div>
                </div>

                {/* Place Order CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-place-order"
                >
                  {isSubmitting ? (
                    <span>PREPARING ORDER...</span>
                  ) : (
                    <>
                      <span>PLACE ORDER</span>
                      <ArrowRightIcon size={18} />
                    </>
                  )}
                </button>

                <p className="checkout-security-notice">
                  By clicking Place Order, your order payload will be prepared for Module 6 payment integration. No card is charged yet.
                </p>

                {/* Guarantees */}
                <div className="checkout-guarantees">
                  <div className="guarantee-row">
                    <ShieldCheckIcon size={16} />
                    <span>256-Bit SSL Encrypted Checkout</span>
                  </div>
                  <div className="guarantee-row">
                    <TruckIcon size={16} />
                    <span>Complimentary Standard Shipping Over $75</span>
                  </div>
                  <div className="guarantee-row">
                    <CheckIcon size={16} />
                    <span>30-Day Hassle-Free Returns & Size Exchanges</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
};
