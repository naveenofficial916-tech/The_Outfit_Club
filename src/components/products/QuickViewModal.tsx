import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ProductItem } from '../../types';
import {
  CloseIcon,
  HeartIcon,
  BagIcon,
  StarIcon,
  MinusIcon,
  PlusIcon,
  ArrowRightIcon,
} from '../common/Icons';
import { useWishlist } from '../../services/wishlistStore';
import { cartStore } from '../../services/cartStore';
import { navigateTo } from '../../utils/navigation';
import './QuickViewModal.css';

export interface QuickViewModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  triggerElement?: HTMLElement | null;
}

interface QuickViewContentProps {
  product: ProductItem;
  onClose: () => void;
  dialogRef: React.RefObject<HTMLDivElement | null>;
}

const QuickViewContent: React.FC<QuickViewContentProps> = ({
  product,
  onClose,
  dialogRef,
}) => {
  const { isWishlisted: checkWishlist, toggleWishlist } = useWishlist();

  // Active selections derived/initialized cleanly
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes.length === 1 ? product.sizes[0] : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [addedBanner, setAddedBanner] = useState(false);

  const isWishlisted = checkWishlist(product.id);
  const currentColor = product.colors[selectedColorIndex] || { name: 'Standard', hex: '#171717' };

  // Gallery images with color-variant connection
  const images = (() => {
    const list: string[] = [];
    if (currentColor?.image) list.push(currentColor.image);
    product.images.forEach((img) => {
      if (!list.includes(img)) list.push(img);
    });
    if (product.thumbnail && !list.includes(product.thumbnail)) {
      list.push(product.thumbnail);
    }
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518'];
  })();

  const activeImage = images[activeImageIndex] || images[0];

  // Pricing formatting
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

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      setSizeError('Please select a size before adding to cart.');
      return;
    }
    setSizeError(null);

    cartStore.addToCart(product, selectedSize || 'Standard', currentColor.name, quantity);
    setAddedBanner(true);
    setTimeout(() => {
      setAddedBanner(false);
    }, 2500);
  };

  const handleViewFullProduct = () => {
    onClose();
    navigateTo(`/product/${product.slug}`);
  };

  return (
    <div
      className="quick-view-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      ref={dialogRef}
    >
      {/* Close Button */}
      <button
        type="button"
        className="quick-view-close-btn"
        onClick={onClose}
        aria-label="Close Quick View"
      >
        <CloseIcon size={20} />
      </button>

      <div className="quick-view-body">
        {/* Left Column: Visual Gallery */}
        <div className="quick-view-gallery">
          <div className="quick-view-main-image-wrap">
            <img
              src={activeImage}
              alt={`${product.name} view`}
              className="quick-view-main-image"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85';
              }}
            />
            {product.discountPercentage && product.discountPercentage > 0 && (
              <span className="quick-view-discount-pill">
                -{product.discountPercentage}%
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="quick-view-thumbnails" role="tablist" aria-label="Product thumbnails">
              {images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  role="tab"
                  aria-selected={activeImageIndex === idx}
                  className={`quick-view-thumb ${activeImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Garment Information & Interactions */}
        <div className="quick-view-info">
          <div className="quick-view-meta">
            <span className="quick-view-brand">{product.brand}</span>
            <span className="quick-view-category">{product.subcategory}</span>
          </div>

          <h2 id="quick-view-title" className="quick-view-title">
            {product.name}
          </h2>

          {/* Price & Rating */}
          <div className="quick-view-pricing-rating">
            <div className="quick-view-pricing">
              <span className="quick-view-price-current">{formattedPrice}</span>
              {formattedOriginalPrice && (
                <span className="quick-view-price-original">{formattedOriginalPrice}</span>
              )}
            </div>

            {product.rating > 0 && (
              <div className="quick-view-rating" aria-label={`Rated ${product.rating.toFixed(1)} out of 5 stars`}>
                <StarIcon size={14} className="quick-view-star-icon" />
                <span className="quick-view-rating-num">{product.rating.toFixed(1)}</span>
                <span className="quick-view-review-count">({product.reviewCount} reviews)</span>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="quick-view-desc">{product.description}</p>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="quick-view-section">
              <div className="quick-view-section-label">
                COLOR: <span className="selected-val">{currentColor.name}</span>
              </div>
              <div className="quick-view-colors-list" role="radiogroup" aria-label="Garment color options">
                {product.colors.map((color, idx) => (
                  <button
                    key={color.name}
                    type="button"
                    role="radio"
                    aria-checked={selectedColorIndex === idx}
                    className={`quick-view-color-btn ${selectedColorIndex === idx ? 'active' : ''}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => {
                      setSelectedColorIndex(idx);
                      setActiveImageIndex(0);
                    }}
                    title={color.name}
                    aria-label={`Select color ${color.name}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="quick-view-section">
              <div className="quick-view-section-label">
                SELECT SIZE: {selectedSize && <span className="selected-val">{selectedSize}</span>}
              </div>
              <div className="quick-view-sizes-list" role="radiogroup" aria-label="Garment sizes">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={selectedSize === size}
                    className={`quick-view-size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(null);
                    }}
                    aria-label={`Size ${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p className="quick-view-error" role="alert">
                  {sizeError}
                </p>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="quick-view-section">
            <div className="quick-view-section-label">QUANTITY:</div>
            <div className="quick-view-qty-controls">
              <button
                type="button"
                className="quick-view-qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <MinusIcon size={14} />
              </button>
              <span className="quick-view-qty-value" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                className="quick-view-qty-btn"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                disabled={quantity >= 10}
                aria-label="Increase quantity"
              >
                <PlusIcon size={14} />
              </button>
            </div>
          </div>

          {/* Action Buttons: Add to Cart + Wishlist */}
          <div className="quick-view-actions">
            <button
              type="button"
              className="quick-view-add-cart-btn"
              onClick={handleAddToCart}
              disabled={product.availability === 'out-of-stock'}
            >
              <BagIcon size={16} />
              <span>
                {product.availability === 'out-of-stock'
                  ? 'OUT OF STOCK'
                  : addedBanner
                  ? 'ADDED TO BAG ✓'
                  : 'ADD TO BAG'}
              </span>
            </button>

            <button
              type="button"
              className={`quick-view-wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
              aria-label={
                isWishlisted
                  ? `Remove ${product.name} from wishlist`
                  : `Add ${product.name} to wishlist`
              }
              aria-pressed={isWishlisted}
            >
              <HeartIcon size={18} />
            </button>
          </div>

          {/* View Full Product Link */}
          <button
            type="button"
            className="quick-view-full-details-btn"
            onClick={handleViewFullProduct}
          >
            <span>VIEW FULL PRODUCT DETAILS</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  triggerElement,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Body scroll lock & focus restoration
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus inside modal
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      if (triggerElement && typeof triggerElement.focus === 'function') {
        triggerElement.focus();
      }
    };
  }, [isOpen, triggerElement]);

  // Keyboard navigation & trap focus
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

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !product) {
    return null;
  }

  return (
    <div
      className="quick-view-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <QuickViewContent
        key={product.id}
        product={product}
        onClose={onClose}
        dialogRef={dialogRef}
      />
    </div>
  );
};
