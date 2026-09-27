import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ProductItem } from '../../types';
import { CloseIcon, MinusIcon, PlusIcon, BagIcon, CheckIcon } from '../common/Icons';
import { cartStore } from '../../services/cartStore';
import './WishlistQuickAddModal.css';

export interface WishlistQuickAddModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (product: ProductItem, size: string, color: string, quantity: number) => void;
}

export const WishlistQuickAddModal: React.FC<WishlistQuickAddModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Variant selection states
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Initialize and reset selections whenever modal opens with a new product
  useEffect(() => {
    if (isOpen && product) {
      setSelectedColorIndex(0);
      setSelectedSize(product.sizes.length === 1 ? product.sizes[0] : '');
      setQuantity(1);
      setSizeError(null);
      setIsAdding(false);
    }
  }, [isOpen, product]);

  // Focus trap & Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      // Auto focus first interactive element
      setTimeout(() => {
        const firstBtn = dialogRef.current?.querySelector<HTMLElement>(
          'button.size-select-btn, button.quick-add-submit-btn'
        );
        firstBtn?.focus();
      }, 50);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !product) {
    return null;
  }

  const isOutOfStock = product.availability === 'out-of-stock' || product.inStock === false;
  const currentColor = product.colors?.[selectedColorIndex] || { name: 'Standard', hex: '#171717' };
  const currentImage = currentColor?.image || product.thumbnail || product.images?.[0] || '';

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency || 'USD',
    maximumFractionDigits: 0,
  }).format(product.price);

  const formattedOriginalPrice = product.originalPrice
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: product.currency || 'USD',
        maximumFractionDigits: 0,
      }).format(product.originalPrice)
    : null;

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setSizeError(null);
  };

  const handleQtyChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddToCartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOutOfStock || isAdding) return;

    if (product.sizes.length > 0 && !selectedSize) {
      setSizeError('Please select a size.');
      return;
    }

    setSizeError(null);
    setIsAdding(true);

    const chosenSize = selectedSize || (product.sizes[0] ?? 'One Size');
    const chosenColor = currentColor.name;

    // Commit to cartStore without forcing drawer immediately, allowing toast feedback
    cartStore.addToCart(product, chosenSize, chosenColor, quantity, false);

    if (onSuccess) {
      onSuccess(product, chosenSize, chosenColor, quantity);
    }

    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 200);
  };

  return (
    <div
      className="wishlist-quick-add-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="wishlist-quick-add-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-modal-title"
        ref={dialogRef}
      >
        {/* Header */}
        <div className="quick-add-header">
          <h2 id="quick-add-modal-title" className="quick-add-title">
            ADD TO CART
          </h2>
          <button
            type="button"
            className="quick-add-close-btn"
            onClick={onClose}
            aria-label="Close add to cart panel"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleAddToCartSubmit} className="quick-add-form">
          {/* Product Summary Row */}
          <div className="quick-add-product-summary">
            <img
              src={currentImage}
              alt={product.name}
              className="quick-add-thumbnail"
              loading="eager"
            />
            <div className="quick-add-product-info">
              <span className="quick-add-brand">{product.brand}</span>
              <h3 className="quick-add-name">{product.name}</h3>
              <div className="quick-add-pricing">
                <span className="quick-add-price">{formattedPrice}</span>
                {formattedOriginalPrice && (
                  <span className="quick-add-original-price">{formattedOriginalPrice}</span>
                )}
                {product.discountPercentage && product.discountPercentage > 0 && (
                  <span className="quick-add-discount-tag">-{product.discountPercentage}%</span>
                )}
              </div>
            </div>
          </div>

          {/* Color Selection (when available) */}
          {product.colors && product.colors.length > 0 && (
            <div className="quick-add-section">
              <div className="quick-add-section-label">
                <span>COLOR:</span>
                <strong className="label-accent">{currentColor.name.toUpperCase()}</strong>
              </div>
              <div className="quick-add-colors-list" role="radiogroup" aria-label="Product color options">
                {product.colors.map((color, idx) => (
                  <button
                    key={color.name}
                    type="button"
                    role="radio"
                    aria-checked={selectedColorIndex === idx}
                    className={`color-select-pill ${selectedColorIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedColorIndex(idx)}
                    aria-label={`Select color ${color.name}`}
                  >
                    <span className="color-swatch-dot" style={{ backgroundColor: color.hex }} />
                    <span className="color-swatch-text">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="quick-add-section">
              <div className="quick-add-section-label">
                <span>SIZE:</span>
                {selectedSize ? (
                  <strong className="label-accent">{selectedSize}</strong>
                ) : (
                  <span className="label-required">(REQUIRED)</span>
                )}
              </div>
              <div className="quick-add-sizes-list" role="radiogroup" aria-label="Garment sizes">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`size-select-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSizeSelect(size)}
                      disabled={isOutOfStock}
                      aria-label={`Size ${size}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {sizeError && (
                <p className="quick-add-error-msg" role="alert">
                  {sizeError}
                </p>
              )}
            </div>
          )}

          {/* Quantity Controls */}
          <div className="quick-add-section">
            <div className="quick-add-section-label">
              <span>QUANTITY:</span>
            </div>
            <div className="quick-add-qty-controls">
              <button
                type="button"
                className="quick-add-qty-btn"
                onClick={() => handleQtyChange(-1)}
                disabled={quantity <= 1 || isOutOfStock || isAdding}
                aria-label="Decrease quantity"
              >
                <MinusIcon size={14} />
              </button>
              <span className="quick-add-qty-num" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                className="quick-add-qty-btn"
                onClick={() => handleQtyChange(1)}
                disabled={quantity >= 10 || isOutOfStock || isAdding}
                aria-label="Increase quantity"
              >
                <PlusIcon size={14} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="quick-add-actions">
            <button
              type="submit"
              className="quick-add-submit-btn"
              disabled={isOutOfStock || isAdding}
            >
              {isOutOfStock ? (
                <span>OUT OF STOCK</span>
              ) : isAdding ? (
                <span>ADDING TO CART...</span>
              ) : (
                <>
                  <BagIcon size={16} />
                  <span>ADD TO CART</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="quick-add-cancel-btn"
              onClick={onClose}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
