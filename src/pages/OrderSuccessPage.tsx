import React, { useState } from 'react';
import { orderService } from '../services/orderService';
import type { OrderPayload } from '../services/orderService';
import { navigateTo } from '../utils/navigation';
import { 
  CheckIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  ArrowRightIcon, 
  BagIcon 
} from '../components/common/Icons';
import './OrderSuccessPage.css';

export const OrderSuccessPage: React.FC = () => {
  // Extract order reference from URL query params or latest saved order
  const [orderData] = useState<OrderPayload | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        const found = orderService.getOrderById(ref);
        if (found) return found;
      }
    } catch {
      // Ignore URL parse error
    }
    return orderService.getLatestOrder();
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handlePrintSummary = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <main className="order-success-wrapper" id="order-success-page">
      <div className="order-success-container">
        {/* Status Confirmation Hero */}
        <section className="success-hero-card">
          <div className="success-badge-icon">
            <CheckIcon size={36} />
          </div>

          <h1 className="success-title">ORDER CONFIRMED</h1>
          <p className="success-ref-label">
            ORDER REFERENCE: <strong>#{orderData?.orderId || 'TOC-2026-000001'}</strong>
          </p>
          {orderData?.createdAt && (
            <p className="success-date-text">
              Order Date: {new Date(orderData.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}

          <p className="success-subtitle">
            ✓ Thank you for shopping with <strong>THE OUTFIT CLUB</strong>. Your order has been recorded for this frontend demonstration.
          </p>

          {/* Module Notice */}
          <div className="module-disclaimer-box">
            <ShieldCheckIcon size={18} />
            <div>
              <strong>Frontend Order Lifecycle Demonstration</strong>
              <p>
                This order was processed safely in local storage. Real payment gateway processing will be completed in Module 6.
              </p>
            </div>
          </div>
        </section>

        {orderData ? (
          <div className="order-summary-grid">
            {/* Left: Items breakdown */}
            <div className="order-items-column">
              <div className="order-panel">
                <h2 className="panel-title">ORDER ITEMS ({orderData.items.length})</h2>

                <div className="order-items-list">
                  {orderData.items.map((item) => (
                    <article key={item.id} className="order-item-card">
                      <div className="item-media">
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80';
                          }}
                        />
                      </div>

                      <div className="item-meta">
                        <h3 className="item-name">{item.name}</h3>
                        <div className="item-specs">
                          <span>Size: <strong>{item.size}</strong></span>
                          {item.color && <span> • Color: <strong>{item.color}</strong></span>}
                          <span> • Qty: <strong>{item.quantity}</strong></span>
                        </div>
                        <span className="item-price">{formatPrice(item.price)} each</span>
                      </div>

                      <div className="item-line-total">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Order details & totals */}
            <div className="order-details-column">
              {/* Delivery Details */}
              <div className="order-panel">
                <h2 className="panel-title">DELIVERY INFORMATION</h2>
                <div className="detail-block">
                  <span className="detail-label">Recipient:</span>
                  <span className="detail-value">
                    {orderData.customer.firstName} {orderData.customer.lastName}
                  </span>
                </div>
                <div className="detail-block">
                  <span className="detail-label">Contact:</span>
                  <span className="detail-value">
                    {orderData.customer.email} • {orderData.customer.phone}
                  </span>
                </div>
                <div className="detail-block">
                  <span className="detail-label">Destination:</span>
                  <span className="detail-value">
                    {orderData.shippingAddress.addressLine1}
                    {orderData.shippingAddress.addressLine2 && `, ${orderData.shippingAddress.addressLine2}`}
                    <br />
                    {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.postalCode}
                    <br />
                    {orderData.shippingAddress.country}
                  </span>
                </div>
                <div className="detail-block">
                  <span className="detail-label">Transit Speed:</span>
                  <div className="transit-value">
                    <TruckIcon size={16} />
                    <span>
                      <strong>{orderData.deliveryMethod.name}</strong> ({orderData.deliveryMethod.estimate})
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment & Pricing Breakdown */}
              <div className="order-panel">
                <h2 className="panel-title">PAYMENT SUMMARY</h2>
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(orderData.subtotal)}</span>
                </div>
                <div className="price-row">
                  <span>Delivery</span>
                  <span>
                    {orderData.shipping === 0 ? 'FREE' : formatPrice(orderData.shipping)}
                  </span>
                </div>
                {orderData.discount > 0 && (
                  <div className="price-row discount">
                    <span>Discount {orderData.promoCode ? `(${orderData.promoCode})` : ''}</span>
                    <span>−{formatPrice(orderData.discount)}</span>
                  </div>
                )}
                <div className="price-divider" />
                <div className="price-row grand-total">
                  <span>Estimated Total</span>
                  <span className="grand-price">{formatPrice(orderData.total)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-order-fallback">
            <BagIcon size={44} />
            <p>No recent order payload found in local session.</p>
          </div>
        )}

        {/* Action Buttons (Requirement 3) */}
        <div className="order-success-actions">
          <button
            type="button"
            className="btn-continue-shopping"
            onClick={() => navigateTo('/catalog')}
          >
            CONTINUE SHOPPING
            <ArrowRightIcon size={18} />
          </button>

          {orderData && (
            <button
              type="button"
              className="btn-view-order"
              onClick={() => navigateTo(`/orders/${orderData.orderId}`)}
            >
              VIEW ORDER
            </button>
          )}

          <button
            type="button"
            className="btn-print-order"
            onClick={handlePrintSummary}
          >
            PRINT RECEIPT
          </button>
        </div>
      </div>
    </main>
  );
};
