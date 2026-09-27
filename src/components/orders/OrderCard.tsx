import React, { useState } from 'react';
import { orderService, normalizeOrderItem } from '../../services/orderService';
import type { OrderPayload } from '../../services/orderService';
import { navigateTo } from '../../utils/navigation';
import { ArrowRightIcon, BagIcon } from '../common/Icons';
import './OrderCard.css';

interface OrderCardProps {
  order: OrderPayload;
  onReorderSuccess?: (message: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onReorderSuccess }) => {
  const [isReordering, setIsReordering] = useState(false);

  const normalizedItems = (order.items || []).map(normalizeOrderItem);
  const totalItemsCount = normalizedItems.reduce((sum, it) => sum + (it.quantity || 1), 0);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleReorder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReordering(true);
    const countAdded = orderService.reorder(order);
    setTimeout(() => {
      setIsReordering(false);
      if (onReorderSuccess) {
        onReorderSuccess(`Added ${countAdded} ${countAdded === 1 ? 'item' : 'items'} to your cart.`);
      }
      navigateTo('/cart');
    }, 350);
  };

  const getStatusBadgeClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return 'status-delivered';
    if (s.includes('shipped') || s.includes('transit') || s.includes('delivery')) return 'status-transit';
    if (s.includes('processing')) return 'status-processing';
    if (s.includes('cancel')) return 'status-cancelled';
    return 'status-confirmed';
  };

  const orderNum = order.orderNumber || order.orderId || order.id;
  const previewItems = normalizedItems.slice(0, 4);
  const remainingCount = normalizedItems.length - previewItems.length;

  return (
    <article className="order-history-card" id={`order-card-${orderNum}`}>
      {/* Header Info */}
      <div className="order-card-header">
        <div className="order-header-main">
          <div className="order-id-date">
            <h3 className="order-ref-number">ORDER #{orderNum}</h3>
            <span className="order-date-text">Placed on {formattedDate}</span>
          </div>
          <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
            {order.status.toUpperCase()}
          </span>
        </div>

        <div className="order-header-totals">
          <span className="order-items-count">
            {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}
          </span>
          <span className="order-total-price">{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Item Thumbs Strip */}
      <div className="order-card-body">
        <div className="order-thumbs-strip" aria-label="Items in this order">
          {previewItems.map((item, idx) => (
            <div
              key={`${item.productId}-${idx}`}
              className="thumb-item"
              title={`${item.productName} (${item.selectedSize})`}
            >
              <img
                src={item.image}
                alt={item.productName}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80';
                }}
              />
              <span className="thumb-qty">×{item.quantity}</span>
            </div>
          ))}

          {remainingCount > 0 && (
            <div className="thumb-more-tag">+{remainingCount} more</div>
          )}
        </div>

        {order.shippingAddress && (
          <div className="order-recipient-snippet">
            <span>
              Ship to: <strong>{order.shippingAddress.name}</strong>
            </span>
            {order.shippingAddress.city && (
              <span>• {order.shippingAddress.city}, {order.shippingAddress.state}</span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="order-card-footer">
        <button
          type="button"
          className="btn-view-order-details"
          onClick={() => navigateTo(`/account/orders/${orderNum}`)}
          aria-label={`View details for order ${orderNum}`}
        >
          <span>VIEW DETAILS</span>
          <ArrowRightIcon size={14} />
        </button>

        <button
          type="button"
          className="btn-reorder"
          onClick={handleReorder}
          disabled={isReordering}
          aria-label={`Reorder items from order ${orderNum}`}
        >
          {isReordering ? (
            <span>ADDING...</span>
          ) : (
            <>
              <BagIcon size={14} />
              <span>REORDER</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
