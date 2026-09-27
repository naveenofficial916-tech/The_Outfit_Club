import React, { useState } from 'react';
import type { ProductItem } from '../../types';
import { HeartIcon, BagIcon, StarIcon, CheckIcon, CloseIcon, EyeIcon } from '../common/Icons';
import { navigateTo } from '../../utils/navigation';
import { useWishlist } from '../../services/wishlistStore';
import { cartStore } from '../../services/cartStore';
import { quickViewStore } from '../../services/quickViewStore';
import './ProductCard.css';

export interface ProductCardProps {
  product: ProductItem;
  onWishlistToggle?: (product: ProductItem) => void;
  onQuickAdd?: (product: ProductItem, size: string) => void;
  onQuickView?: (product: ProductItem) => void;
  isWishlisted?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onWishlistToggle,
  onQuickAdd,
  onQuickView,
  isWishlisted: propWishlisted,
  className = '',
}) => {
  const { isWishlisted: checkWishlist, toggleWishlist } = useWishlist();
  const isCardWishlisted = propWishlisted !== undefined ? propWishlisted : checkWishlist(product.id);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isSizeTrayOpen, setIsSizeTrayOpen] = useState(false);
  const [addedSize, setAddedSize] = useState<string | null>(null);

  // Determine images
  const currentColor = product.colors[selectedColorIndex];
  const primaryImage = currentColor?.image || product.thumbnail || product.images[0];
  const secondaryImage = product.images.length > 1 ? product.images[1] : null;

  // Format currency
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

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (onWishlistToggle) {
      onWishlistToggle(product);
    }
  };

  const handleQuickAddTrigger = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.sizes.length === 1) {
      handleSelectSize(e, product.sizes[0]);
    } else {
      setIsSizeTrayOpen(true);
    }
  };

  const handleSelectSize = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSizeTrayOpen(false);
    setAddedSize(size);

    cartStore.addToCart(product, size, currentColor?.name || 'Standard', 1);

    if (onQuickAdd) {
      onQuickAdd(product, size);
    }

    setTimeout(() => {
      setAddedSize(null);
    }, 2200);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      quickViewStore.open(product, e.currentTarget as HTMLElement);
    }
  };

  const handleColorSelect = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColorIndex(index);
  };

  return (
    <article className={`product-card ${className}`} id={`product-${product.id}`}>
      {/* Product Image Frame */}
      <div
        className="product-card-image-wrap"
        role="button"
        tabIndex={0}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('.wishlist-btn, .quick-add-btn, .quick-view-btn, .size-selection-tray, .quick-add-success')) return;
          navigateTo(`/product/${product.slug}`);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            navigateTo(`/product/${product.slug}`);
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        {/* Status / Discount Badges */}
        <div className="product-badges-overlay">
          {product.discountPercentage && product.discountPercentage > 0 && (
            <span className="discount-pill">-{product.discountPercentage}%</span>
          )}
          {product.availability === 'low-stock' && (
            <span className="status-pill low-stock">Low Stock</span>
          )}
          {product.newest && !product.discountPercentage && (
            <span className="status-pill">New In</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          className={`wishlist-btn ${isCardWishlisted ? 'active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isCardWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isCardWishlisted}
        >
          <HeartIcon size={17} />
        </button>

        {/* Primary Product Image */}
        <img
          src={primaryImage}
          alt={`${product.name} - ${product.brand}`}
          className="product-card-image primary"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85';
          }}
        />

        {/* Secondary Crossfade Image on Desktop Hover */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className="product-card-image secondary"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        {/* Quick Action Buttons: Quick View & Quick Add */}
        {!isSizeTrayOpen && !addedSize && (
          <div className="product-card-quick-actions">
            <button
              type="button"
              className="quick-view-btn"
              onClick={handleQuickViewClick}
              aria-label={`Quick view ${product.name}`}
            >
              <EyeIcon size={14} />
              <span>Quick View</span>
            </button>
            <button
              type="button"
              className="quick-add-btn"
              onClick={handleQuickAddTrigger}
              aria-label={`Quick add ${product.name} to bag`}
            >
              <BagIcon size={14} />
              <span>Quick Add</span>
            </button>
          </div>
        )}

        {/* Size Selection Drawer Tray */}
        {isSizeTrayOpen && (
          <div className="size-selection-tray" role="dialog" aria-label="Select size">
            <div className="size-tray-header">
              <span>Select Size</span>
              <button
                type="button"
                className="size-tray-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSizeTrayOpen(false);
                }}
                aria-label="Close size selector"
              >
                <CloseIcon size={14} />
              </button>
            </div>
            <div className="size-pills-row">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className="size-pill-btn"
                  onClick={(e) => handleSelectSize(e, size)}
                  aria-label={`Select size ${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Add Confirmation Banner */}
        {addedSize && (
          <div className="quick-add-success" role="status" aria-live="polite">
            <CheckIcon size={15} />
            <span>Added — Size {addedSize}</span>
          </div>
        )}
      </div>

      {/* Card Content Hierarchy */}
      <div className="product-card-body">
        {/* Brand & Subcategory */}
        <div className="product-card-meta">
          <span className="product-card-brand">{product.brand}</span>
          <span className="product-card-category">{product.subcategory}</span>
        </div>

        {/* Title */}
        <h3
          className="product-card-title"
          title={product.name}
          onClick={() => navigateTo(`/product/${product.slug}`)}
          style={{ cursor: 'pointer' }}
        >
          {product.name}
        </h3>

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="product-card-swatches" aria-label="Available colors">
            {product.colors.map((color, idx) => (
              <button
                key={color.name}
                type="button"
                className={`color-swatch-item ${selectedColorIndex === idx ? 'active' : ''}`}
                style={{ backgroundColor: color.hex }}
                onClick={(e) => handleColorSelect(e, idx)}
                title={color.name}
                aria-label={`Color option: ${color.name}`}
              />
            ))}
            {product.colors.length > 1 && (
              <span className="swatches-count">
                +{product.colors.length}
              </span>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="product-card-pricing">
          <span className="price-current">{formattedPrice}</span>
          {formattedOriginalPrice && (
            <span className="price-original">{formattedOriginalPrice}</span>
          )}
        </div>

        {/* Rating & Review Count */}
        {product.rating > 0 && (
          <div className="product-card-rating">
            <StarIcon size={12} className="rating-star-icon" />
            <span className="rating-value">{product.rating.toFixed(1)}</span>
            <span className="review-count">({product.reviewCount})</span>
          </div>
        )}
      </div>
    </article>
  );
};
