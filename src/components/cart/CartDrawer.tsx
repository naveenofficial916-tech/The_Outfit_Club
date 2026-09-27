import React, { useEffect } from 'react';
import { useCart, FREE_SHIPPING_THRESHOLD } from '../../services/cartStore';
import { CloseIcon, BagIcon, TrashIcon, MinusIcon, PlusIcon } from '../common/Icons';
import { navigateTo } from '../../utils/navigation';
import './CartDrawer.css';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    count,
    subtotal,
    shipping,
    total,
    drawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // Escape key listener to close drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen, closeDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleNavigateToProduct = (slug: string) => {
    closeDrawer();
    navigateTo(`/product/${slug}`);
  };

  const handleNavigateToCart = () => {
    closeDrawer();
    navigateTo('/cart');
  };

  const handleNavigateToCheckout = () => {
    closeDrawer();
    navigateTo('/checkout');
  };

  const handleNavigateToCatalog = () => {
    closeDrawer();
    navigateTo('/catalog');
  };

  return (
    <div
      className={`cart-drawer-backdrop ${drawerOpen ? 'open' : ''}`}
      onClick={closeDrawer}
      aria-hidden={!drawerOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
    >
      <div
        className="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title-row">
            <h2 className="cart-drawer-title">SHOPPING BAG</h2>
            <span className="cart-drawer-count">({count} {count === 1 ? 'item' : 'items'})</span>
          </div>
          <button
            type="button"
            className="cart-drawer-close-btn"
            onClick={closeDrawer}
            aria-label="Close cart drawer"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        {count > 0 && (
          <div className="cart-shipping-meter" aria-label="Free shipping status">
            <div className={`shipping-meter-text ${amountRemaining === 0 ? 'unlocked' : ''}`}>
              <span>
                {amountRemaining === 0
                  ? '🎉 You unlocked FREE Express Delivery!'
                  : `Add $${amountRemaining.toFixed(0)} more for FREE Express Delivery`}
              </span>
              <span>${subtotal} / ${FREE_SHIPPING_THRESHOLD}</span>
            </div>
            <div className="shipping-meter-bar">
              <div
                className={`shipping-meter-fill ${amountRemaining === 0 ? 'complete' : ''}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Drawer Body: Items or Empty State */}
        {count === 0 ? (
          <div className="cart-drawer-empty">
            <div className="empty-icon-wrap">
              <BagIcon size={28} />
            </div>
            <h3 className="empty-drawer-title">YOUR BAG IS EMPTY</h3>
            <p className="empty-drawer-desc">
              Looks like you haven't added anything yet. Explore our curated oversized tees, baggy pants, and sneakers.
            </p>
            <button
              type="button"
              className="empty-drawer-cta"
              onClick={handleNavigateToCatalog}
            >
              SHOP MEN'S COLLECTION
            </button>
          </div>
        ) : (
          <div className="cart-drawer-body">
            {cart.map((item) => {
              const lineTotal = item.price * item.quantity;
              return (
                <div key={item.id} className="cart-drawer-item">
                  {/* Thumbnail */}
                  <a
                    href={`/product/${item.productSlug}`}
                    className="cart-item-thumb-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigateToProduct(item.productSlug);
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-thumb-img"
                      loading="lazy"
                    />
                  </a>

                  {/* Details */}
                  <div className="cart-item-details">
                    <div className="cart-item-header">
                      <a
                        href={`/product/${item.productSlug}`}
                        className="cart-item-name"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigateToProduct(item.productSlug);
                        }}
                      >
                        {item.name}
                      </a>
                      <button
                        type="button"
                        className="cart-item-remove-btn"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name} from bag`}
                        title="Remove item"
                      >
                        <TrashIcon size={15} />
                      </button>
                    </div>

                    <div className="cart-item-variant">
                      Size: <strong>{item.size}</strong> • Color: <strong>{item.color}</strong>
                    </div>

                    <div className="cart-item-bottom-row">
                      {/* Quantity Stepper */}
                      <div className="cart-drawer-qty-stepper" aria-label="Adjust quantity">
                        <button
                          type="button"
                          className="drawer-qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon size={11} />
                        </button>
                        <span className="drawer-qty-val">{item.quantity}</span>
                        <button
                          type="button"
                          className="drawer-qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 10}
                          aria-label="Increase quantity"
                        >
                          <PlusIcon size={11} />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="cart-item-price">${lineTotal}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Drawer Footer */}
        {count > 0 && (
          <div className="cart-drawer-footer">
            <div className="drawer-summary-row">
              <span>Subtotal</span>
              <span style={{ fontWeight: 700, color: 'var(--color-charcoal)' }}>${subtotal}</span>
            </div>
            <div className="drawer-summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
            </div>
            <div className="drawer-summary-row total-row">
              <span>Estimated Total</span>
              <span style={{ color: 'var(--color-cognac)' }}>${total}</span>
            </div>

            <button
              type="button"
              className="drawer-checkout-btn"
              onClick={handleNavigateToCheckout}
            >
              PROCEED TO CHECKOUT • ${total}
            </button>

            <button
              type="button"
              className="drawer-view-cart-btn"
              onClick={handleNavigateToCart}
            >
              VIEW FULL BAG
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
