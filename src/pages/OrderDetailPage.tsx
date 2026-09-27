import React, { useState } from 'react';
import { orderService, normalizeOrderItem, normalizeShippingAddress } from '../services/orderService';
import type { OrderPayload } from '../services/orderService';
import { navigateTo } from '../utils/navigation';
import {
  BagIcon,
  CheckIcon,
  CloseIcon,
  ArrowLeftIcon,
} from '../components/common/Icons';
import './OrderDetailPage.css';

interface OrderDetailPageProps {
  orderId: string;
}

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ orderId }) => {
  const [order] = useState<OrderPayload | null>(() => orderService.getOrderById(orderId));
  const [isReordering, setIsReordering] = useState(false);
  const [reorderFeedback, setReorderFeedback] = useState<string | null>(null);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleReorder = () => {
    if (!order) return;
    setIsReordering(true);
    const addedCount = orderService.reorder(order);
    setTimeout(() => {
      setIsReordering(false);
      setReorderFeedback(`Added ${addedCount} ${addedCount === 1 ? 'item' : 'items'} to your cart.`);
      navigateTo('/cart');
    }, 400);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Unknown Order State
  if (!order) {
    return (
      <main className="order-detail-wrapper" id="order-not-found-page">
        <div className="order-detail-container">
          <div className="order-not-found-card">
            <div className="not-found-icon">
              <CloseIcon size={44} />
            </div>
            <h1 className="not-found-title">ORDER NOT FOUND</h1>
            <p className="not-found-desc">
              We couldn't find an order matching reference "<strong>{orderId}</strong>". It may have been cleared or the reference code is incorrect.
            </p>
            <div className="not-found-actions">
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => navigateTo('/account/orders')}
              >
                VIEW ORDERS
              </button>
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => navigateTo('/catalog')}
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const orderNum = order.orderNumber || order.orderId || order.id;
  const items = (order.items || []).map(normalizeOrderItem);
  const shipping = normalizeShippingAddress(order.shippingAddress, order.customer);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusBadgeClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return 'status-delivered';
    if (s.includes('shipped') || s.includes('transit') || s.includes('delivery')) return 'status-transit';
    if (s.includes('processing')) return 'status-processing';
    if (s.includes('cancel')) return 'status-cancelled';
    return 'status-confirmed';
  };

  return (
    <main className="order-detail-wrapper" id="order-detail-page">
      {/* Toast Feedback */}
      {reorderFeedback && (
        <div className="detail-toast" role="status" aria-live="polite">
          <CheckIcon size={16} />
          <span>{reorderFeedback}</span>
        </div>
      )}

      <div className="order-detail-container">
        {/* Navigation Breadcrumbs */}
        <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
          <button type="button" onClick={() => navigateTo('/')} className="breadcrumb-link">
            HOME
          </button>
          <span className="breadcrumb-separator">/</span>
          <button type="button" onClick={() => navigateTo('/account')} className="breadcrumb-link">
            MY ACCOUNT
          </button>
          <span className="breadcrumb-separator">/</span>
          <button type="button" onClick={() => navigateTo('/account/orders')} className="breadcrumb-link">
            MY ORDERS
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current" aria-current="page">#{orderNum}</span>
        </nav>

        {/* Back Link */}
        <div className="back-link-row">
          <button
            type="button"
            className="btn-back-orders"
            onClick={() => navigateTo('/account/orders')}
          >
            <ArrowLeftIcon size={14} /> BACK TO ORDERS
          </button>
        </div>

        {/* Header Hero */}
        <div className="order-detail-header-card">
          <div className="header-meta-group">
            <span className="order-subtitle-label">ORDER DETAILS</span>
            <h1 className="detail-order-id">ORDER #{orderNum}</h1>
            <p className="detail-order-date">Placed on {formattedDate}</p>
          </div>

          <div className="header-status-group">
            <span className={`status-badge-lg ${getStatusBadgeClass(order.status)}`}>
              {order.status.toUpperCase()}
            </span>
            <div className="header-action-buttons">
              <button
                type="button"
                className="btn-header-reorder"
                onClick={handleReorder}
                disabled={isReordering}
              >
                <BagIcon size={15} />
                <span>{isReordering ? 'ADDING...' : 'REORDER ITEMS'}</span>
              </button>
              <button
                type="button"
                className="btn-header-print"
                onClick={handlePrint}
              >
                PRINT RECEIPT
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Items Left, Delivery & Summary Right */}
        <div className="order-detail-grid">
          {/* Left Column: Ordered Items List */}
          <section className="detail-items-column" aria-label="Ordered products">
            <div className="detail-panel">
              <div className="panel-header-row">
                <h2 className="panel-heading">ORDERED PRODUCTS ({items.length})</h2>
                <span className="panel-sub-count">
                  {items.reduce((s, it) => s + (it.quantity || 1), 0)} Total Units
                </span>
              </div>

              <div className="detail-items-list">
                {items.map((item, idx) => {
                  const lineTotal = item.totalPrice || item.unitPrice * item.quantity;
                  const itemTarget = item.productSlug
                    ? `/product/${item.productSlug}`
                    : `/product/${item.productId}`;

                  return (
                    <article key={`${item.productId}-${idx}`} className="detail-item-row">
                      <div
                        className="detail-item-media"
                        onClick={() => item.productId && navigateTo(itemTarget)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${item.productName}`}
                      >
                        <img
                          src={item.image}
                          alt={item.productName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80';
                          }}
                        />
                      </div>

                      <div className="detail-item-info">
                        <button
                          type="button"
                          className="item-name-btn"
                          onClick={() => item.productId && navigateTo(itemTarget)}
                        >
                          {item.productName}
                        </button>

                        <div className="item-variant-tags">
                          <span className="v-tag">
                            Size: <strong>{item.selectedSize}</strong>
                          </span>
                          {item.selectedColor && (
                            <span className="v-tag">
                              Color: <strong>{item.selectedColor}</strong>
                            </span>
                          )}
                          <span className="v-tag">
                            Qty: <strong>{item.quantity}</strong>
                          </span>
                        </div>

                        <div className="item-pricing">
                          <span className="u-price">{formatPrice(item.unitPrice)} each</span>
                        </div>
                      </div>

                      <div className="detail-item-total">
                        <span className="total-label">ITEM TOTAL</span>
                        <span className="total-num">{formatPrice(lineTotal)}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right Column: Delivery Info & Payment Summary */}
          <aside className="detail-sidebar-column" aria-label="Order summary details">
            {/* Delivery Destination */}
            <div className="detail-panel">
              <h2 className="panel-heading">SHIPPING ADDRESS</h2>

              <div className="spec-group">
                <span className="spec-label">Name</span>
                <span className="spec-val">
                  <strong>{shipping.name}</strong>
                </span>
              </div>

              {shipping.phone && (
                <div className="spec-group">
                  <span className="spec-label">Phone</span>
                  <span className="spec-val">{shipping.phone}</span>
                </div>
              )}

              <div className="spec-group">
                <span className="spec-label">Address</span>
                <span className="spec-val">
                  {shipping.address}
                  {shipping.addressLine2 && `, ${shipping.addressLine2}`}
                  <br />
                  {shipping.city}, {shipping.state} {shipping.pin}
                  <br />
                  {shipping.country}
                </span>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="detail-panel">
              <h2 className="panel-heading">ORDER SUMMARY</h2>

              <div className="pricing-line">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>

              <div className="pricing-line">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
              </div>

              {order.discount > 0 && (
                <div className="pricing-line discount">
                  <span>Discount {order.promoCode ? `(${order.promoCode})` : ''}</span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              )}

              <div className="pricing-divider" />

              <div className="pricing-line grand-total">
                <span>Total</span>
                <span className="grand-num">{formatPrice(order.total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};
