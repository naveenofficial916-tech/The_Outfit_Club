import React, { useState, useMemo, useEffect } from 'react';
import type { ProductItem } from '../types';
import { PRODUCTS_DATA } from '../data/products';
import {
  HeartIcon,
  BagIcon,
  StarIcon,
  CheckIcon,
  CloseIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  RulerIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
} from '../components/common/Icons';
import { navigateTo } from '../utils/navigation';
import { cartStore } from '../services/cartStore';
import { useWishlist } from '../services/wishlistStore';
import { recentlyViewedStore, useRecentlyViewed } from '../services/recentlyViewedStore';
import { getRelatedProducts } from '../utils/relatedProducts';
import { getCompleteTheLook } from '../utils/completeTheLook';
import { getOutfitsForProduct } from '../data/outfits';
import { ProductRail } from '../components/products/ProductRail';
import { OutfitCard } from '../components/outfits/OutfitCard';
import './ProductDetailPage.css';

export interface ProductDetailPageProps {
  productSlug?: string;
  productId?: string;
  onWishlistToggle?: (product: ProductItem) => void;
  onAddToCart?: (product: ProductItem, size: string, color: string, quantity: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productSlug,
  productId,
  onWishlistToggle,
  onAddToCart,
}) => {
  // 1. Identify Target Product & Lookup Status (Task 2.1 & 2.2)
  const { product, isNotFound } = useMemo(() => {
    let targetIdentifier: string | null = null;
    if (productSlug) targetIdentifier = productSlug;
    else if (productId) targetIdentifier = productId;
    else if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/product/')) {
        targetIdentifier = path.replace('/product/', '').replace(/\/$/, '');
      } else {
        const params = new URLSearchParams(window.location.search);
        targetIdentifier = params.get('slug') || params.get('id');
      }
    }

    // Default to first item if no route parameter is provided at all
    if (!targetIdentifier || targetIdentifier === 'product') {
      return { product: PRODUCTS_DATA[0], isNotFound: false };
    }

    const found = PRODUCTS_DATA.find(
      (p) =>
        p.slug.toLowerCase() === targetIdentifier.toLowerCase() ||
        p.id.toLowerCase() === targetIdentifier.toLowerCase()
    );

    if (found) {
      return { product: found, isNotFound: false };
    }

    return { product: null, isNotFound: true };
  }, [productSlug, productId]);

  // Error State: Product Not Found (Requirement 20)
  if (isNotFound || !product) {
    return (
      <div className="product-not-found container" role="alert">
        <div className="not-found-card">
          <span className="not-found-eyebrow">404 — MEN'S COLLECTION</span>
          <h1 className="not-found-title">PRODUCT NOT FOUND</h1>
          <p className="not-found-desc">
            The product you're looking for may have been removed, sold out, or the link is incorrect.
          </p>
          <button
            type="button"
            className="pdp-not-found-btn"
            onClick={() => navigateTo('/catalog')}
          >
            [ BACK TO SHOP ]
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProductDetailView
      key={product.id}
      product={product}
      onWishlistToggle={onWishlistToggle}
      onAddToCart={onAddToCart}
    />
  );
};

interface ProductDetailViewProps {
  product: ProductItem;
  onWishlistToggle?: (product: ProductItem) => void;
  onAddToCart?: (product: ProductItem, size: string, color: string, quantity: number) => void;
}

const ALL_STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onWishlistToggle,
  onAddToCart,
}) => {
  // Record view in recently viewed store (Requirement 11)
  useEffect(() => {
    recentlyViewedStore.recordView(product.id);
  }, [product.id]);

  // Wishlist integration (Requirement 9)
  const { isWishlisted: checkWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = checkWishlist(product.id);

  // Size & Color selection state (Requirements 3 & 6)
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes.length === 1 ? product.sizes[0] : ''
  );
  const [sizeError, setSizeError] = useState<string | null>(null);

  // Quantity selector state (Requirement 4)
  const [quantity, setQuantity] = useState(1);

  // Gallery state & transition loading (Requirement 1)
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Add to cart state & submission lock (Requirement 5)
  const [isAdding, setIsAdding] = useState(false);
  const [addedBanner, setAddedBanner] = useState<string | null>(null);
  const [wishlistBanner, setWishlistBanner] = useState<string | null>(null);
  const [buyNowMessage, setBuyNowMessage] = useState<string | null>(null);

  // Expandable Accordion sections (Requirement 7)
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    description: true,
    fit: false,
    material: false,
    shipping: false,
  });

  // Size Guide Modal state (Requirement 8)
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Handle escape key to close Size Guide modal
  useEffect(() => {
    if (!showSizeGuide) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSizeGuide(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSizeGuide]);

  // Stock evaluation (Requirement 2 & 10)
  const isOutOfStock = product.availability === 'out-of-stock' || product.inStock === false;
  const isLowStock = product.availability === 'low-stock';

  // Available Sizes computation (Requirement 3: XS–XXL support with unavailable states)
  const displaySizes = useMemo(() => {
    const isStandardApparel = product.sizes.some((s) =>
      ['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(s.toUpperCase())
    );
    if (isStandardApparel) {
      return ALL_STANDARD_SIZES.map((size) => ({
        label: size,
        isAvailable: product.sizes.includes(size) && !isOutOfStock,
      }));
    }
    // Footwear or accessories with custom sizes
    return product.sizes.map((size) => ({
      label: size,
      isAvailable: !isOutOfStock,
    }));
  }, [product.sizes, isOutOfStock]);

  // Gallery images with color-variant connection (Requirement 1 & 6)
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    const currentColorVariant = product.colors[selectedColorIndex];
    if (currentColorVariant?.image) {
      list.push(currentColorVariant.image);
    }
    product.images.forEach((img) => {
      if (!list.includes(img)) list.push(img);
    });
    if (product.thumbnail && !list.includes(product.thumbnail)) {
      list.push(product.thumbnail);
    }
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518'];
  }, [product, selectedColorIndex]);

  const currentColor = product.colors[selectedColorIndex] || { name: 'Standard', hex: '#171717' };

  // Price formatting
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

  // Handlers
  const handleColorSelect = (index: number) => {
    setSelectedColorIndex(index);
    setActiveImageIndex(0);
    setImageLoaded(false);
  };

  const handleSizeSelect = (size: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    setSelectedSize(size);
    setSizeError(null);
  };

  const handleQtyChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleManualQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      setQuantity(1);
    } else {
      setQuantity(Math.min(10, val));
    }
  };

  const handlePrevImage = () => {
    setImageLoaded(false);
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = () => {
    setImageLoaded(false);
    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  const handleWishlistToggleAction = () => {
    const isNowSaved = toggleWishlist(product);
    setWishlistBanner(
      isNowSaved
        ? `Added ${product.name} to wishlist`
        : `Removed ${product.name} from wishlist`
    );
    setTimeout(() => {
      setWishlistBanner(null);
    }, 3500);

    if (onWishlistToggle) {
      onWishlistToggle(product);
    }
  };

  const toggleAccordion = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Add to Cart handler with size validation and loading state (Requirement 5)
  const handleAddToCart = () => {
    if (isOutOfStock || isAdding) return;

    if (product.sizes.length > 0 && !selectedSize) {
      setSizeError('Please select a size.');
      const sizeListEl = document.querySelector('.pdp-sizes-list');
      if (sizeListEl) {
        sizeListEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setSizeError(null);
    setIsAdding(true);

    // Simulate smooth micro-interaction before committing
    setTimeout(() => {
      cartStore.addToCart(product, selectedSize || 'One Size', currentColor.name, quantity);

      if (onAddToCart) {
        onAddToCart(product, selectedSize || 'One Size', currentColor.name, quantity);
      }

      setIsAdding(false);
      setAddedBanner(`Added to cart — ${product.name} (${selectedSize || 'One Size'}, ${currentColor.name})`);
      setTimeout(() => {
        setAddedBanner(null);
      }, 4500);
    }, 320);
  };

  // Buy Now handler (Requirement 6)
  const handleBuyNow = () => {
    if (isOutOfStock || isAdding) return;

    if (product.sizes.length > 0 && !selectedSize) {
      setSizeError('Please select a size.');
      const sizeListEl = document.querySelector('.pdp-sizes-list');
      if (sizeListEl) {
        sizeListEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setSizeError(null);

    // Add to cart directly
    cartStore.addToCart(product, selectedSize || 'One Size', currentColor.name, quantity);

    setBuyNowMessage(
      `Proceeding to checkout with ${product.name} (${selectedSize}, ${currentColor.name}) • Ready for Module 6 Checkout`
    );
    setTimeout(() => {
      setBuyNowMessage(null);
    }, 5000);
  };

  // 10. Complete the Look: head-to-toe complementary ensemble
  const completeTheLook = useMemo(() => {
    return getCompleteTheLook(product, PRODUCTS_DATA);
  }, [product]);

  // 11. Related Products: prioritized by authentic attribute relevance
  const relatedProducts = useMemo(() => {
    return getRelatedProducts(product, PRODUCTS_DATA, 6);
  }, [product]);

  // 12. Featured in Curated Outfits
  const matchingOutfits = useMemo(() => {
    return getOutfitsForProduct(product.id);
  }, [product.id]);

  // 13. Recently Viewed Products with real-time reactivity & clear action
  const { products: recentlyViewedProducts, clear: clearRecentlyViewed } = useRecentlyViewed(product.id);

  return (
    <div className="product-detail-page container" id={`pdp-${product.id}`}>
      {/* Breadcrumb Navigation */}
      <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
        <a
          href="/"
          className="breadcrumb-link"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/');
          }}
        >
          HOME
        </a>
        <span className="breadcrumb-sep">/</span>
        <a
          href="/catalog"
          className="breadcrumb-link"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/catalog');
          }}
        >
          SHOP
        </a>
        <span className="breadcrumb-sep">/</span>
        <a
          href={`/catalog?category=${product.category}`}
          className="breadcrumb-link"
          onClick={(e) => {
            e.preventDefault();
            navigateTo(`/catalog?category=${product.category}`);
          }}
        >
          {product.category.toUpperCase()}
        </a>
        {product.subcategory && (
          <>
            <span className="breadcrumb-sep">/</span>
            <a
              href={`/catalog?category=${product.category}&subcategory=${encodeURIComponent(product.subcategory)}`}
              className="breadcrumb-link"
              onClick={(e) => {
                e.preventDefault();
                navigateTo(`/catalog?category=${product.category}&subcategory=${encodeURIComponent(product.subcategory)}`);
              }}
            >
              {product.subcategory.toUpperCase()}
            </a>
          </>
        )}
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current" aria-current="page">
          {product.name}
        </span>
      </nav>

      {/* Main Split Grid: Gallery + Purchasing Details */}
      <div className="pdp-main-grid">
        {/* 1. Product Image Gallery */}
        <div className="pdp-gallery-container" aria-label="Product Image Gallery">
          <div className="pdp-main-image-frame">
            {/* Loading Skeleton */}
            {!imageLoaded && <div className="pdp-image-skeleton" aria-hidden="true" />}

            {/* Status / Discount Badges */}
            <div className="pdp-gallery-badges">
              {product.discountPercentage && product.discountPercentage > 0 && (
                <span className="pdp-badge sale">-{product.discountPercentage}% OFF</span>
              )}
              {isOutOfStock && <span className="pdp-badge low-stock">OUT OF STOCK</span>}
              {!isOutOfStock && isLowStock && (
                <span className="pdp-badge low-stock">Low Stock</span>
              )}
              {product.newest && !product.discountPercentage && !isOutOfStock && (
                <span className="pdp-badge status">New In</span>
              )}
            </div>

            {/* Prev / Next controls (only if multiple images) */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-nav-btn prev"
                  onClick={handlePrevImage}
                  aria-label="Previous product image"
                  title="Previous image"
                >
                  <ArrowLeftIcon size={16} />
                </button>
                <button
                  type="button"
                  className="gallery-nav-btn next"
                  onClick={handleNextImage}
                  aria-label="Next product image"
                  title="Next image"
                >
                  <ArrowRightIcon size={16} />
                </button>
              </>
            )}

            <img
              src={galleryImages[activeImageIndex] || galleryImages[0]}
              alt={`${product.name} view ${activeImageIndex + 1}`}
              className={`pdp-main-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
              loading="eager"
            />
          </div>

          {/* Thumbnail Images Strip (Elegantly omitted if single image) */}
          {galleryImages.length > 1 && (
            <div className="pdp-thumbnails-strip" aria-label="Product thumbnails">
              {galleryImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  className={`pdp-thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                  onClick={() => {
                    if (activeImageIndex !== idx) {
                      setImageLoaded(false);
                      setActiveImageIndex(idx);
                    }
                  }}
                  aria-label={`View angle ${idx + 1}`}
                >
                  <img src={img} alt="" className="pdp-thumb-img" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Product Information Panel & Purchase Panel */}
        <div className="pdp-details-panel">
          <div className="pdp-header">
            <div className="pdp-meta-row">
              <span className="pdp-brand-name">{product.brand || 'THE OUTFIT CLUB'}</span>
              <span className="pdp-subcategory">{product.subcategory || product.category}</span>
            </div>

            <h1 className="pdp-title">{product.name}</h1>

            {/* Rating Stars */}
            <div className="pdp-rating-row">
              <div className="pdp-stars" aria-label={`Rated ${product.rating} out of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} size={14} />
                ))}
              </div>
              <span className="pdp-rating-val">{product.rating.toFixed(1)}</span>
              <span>•</span>
              <span className="pdp-reviews-count">({product.reviewCount} customer reviews)</span>
            </div>

            {/* Pricing */}
            <div className="pdp-price-row">
              <span className="pdp-current-price">{formattedPrice}</span>
              {formattedOriginalPrice && (
                <span className="pdp-original-price">{formattedOriginalPrice}</span>
              )}
              {product.discountPercentage && (
                <span className="pdp-discount-tag">Save {product.discountPercentage}%</span>
              )}
            </div>
          </div>

          {/* Color Selection (Requirement 6) */}
          {product.colors && product.colors.length > 0 && (
            <div className="pdp-section-block">
              <div className="pdp-block-header">
                <span className="pdp-block-label">COLOR: {currentColor.name.toUpperCase()}</span>
                <span className="pdp-selected-val">{currentColor.name}</span>
              </div>
              <div className="pdp-colors-list">
                {product.colors.map((color, idx) => (
                  <button
                    key={color.name}
                    type="button"
                    className={`pdp-color-swatch ${selectedColorIndex === idx ? 'active' : ''}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleColorSelect(idx)}
                    title={color.name}
                    aria-label={`Select color: ${color.name}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection with Validation & Unavailable States (Requirement 3) */}
          {displaySizes.length > 0 && (
            <div className="pdp-section-block">
              <div className="pdp-block-header">
                <span className="pdp-block-label">
                  SIZE{selectedSize ? `: ${selectedSize}` : ''}
                </span>
                <button
                  type="button"
                  className="pdp-size-guide-btn"
                  onClick={() => setShowSizeGuide(true)}
                  aria-haspopup="dialog"
                >
                  <RulerIcon size={14} />
                  <span>Size Guide</span>
                </button>
              </div>

              {sizeError && (
                <div className="size-validation-msg" role="alert">
                  ⚠ {sizeError}
                </div>
              )}

              <div
                className={`pdp-sizes-list ${sizeError ? 'has-error' : ''}`}
                role="radiogroup"
                aria-label="Available Sizes"
              >
                {displaySizes.map(({ label, isAvailable }) => (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={selectedSize === label}
                    disabled={!isAvailable}
                    className={`pdp-size-btn ${selectedSize === label ? 'active' : ''} ${
                      !isAvailable ? 'unavailable' : ''
                    }`}
                    onClick={() => handleSizeSelect(label, isAvailable)}
                    title={!isAvailable ? `${label} — Unavailable` : `Select size ${label}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status Indicator (Requirement 2 & 10) */}
          <div className={`pdp-stock-status ${isOutOfStock ? 'out' : ''}`}>
            <span
              className={`stock-indicator-dot ${
                isOutOfStock ? 'out' : isLowStock ? 'low' : ''
              }`}
            />
            <span>
              {isOutOfStock
                ? 'OUT OF STOCK'
                : isLowStock
                ? 'Only a few left'
                : 'IN STOCK — Ready to dispatch'}
            </span>
          </div>

          {/* Quantity & Add to Cart & Buy Now Actions (Requirements 4, 5, 6) */}
          <div className="pdp-actions-row">
            {/* Quantity Stepper with Manual Input */}
            <div className="pdp-qty-stepper" aria-label="Select quantity">
              <button
                type="button"
                className="qty-step-btn"
                onClick={() => handleQtyChange(-1)}
                disabled={quantity <= 1 || isOutOfStock || isAdding}
                aria-label="Decrease quantity"
              >
                <MinusIcon size={14} />
              </button>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={handleManualQtyChange}
                disabled={isOutOfStock || isAdding}
                className="qty-input"
                aria-label="Product quantity"
              />
              <button
                type="button"
                className="qty-step-btn"
                onClick={() => handleQtyChange(1)}
                disabled={quantity >= 10 || isOutOfStock || isAdding}
                aria-label="Increase quantity"
              >
                <PlusIcon size={14} />
              </button>
            </div>

            {/* Action Buttons Split: Add to Cart + Buy Now */}
            <div className="pdp-actions-split">
              <button
                type="button"
                className={`pdp-add-to-bag-btn ${addedBanner ? 'added' : ''} ${
                  isAdding ? 'loading' : ''
                }`}
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
              >
                {isOutOfStock ? (
                  <span>OUT OF STOCK</span>
                ) : isAdding ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    <span>Adding...</span>
                  </>
                ) : addedBanner ? (
                  <>
                    <CheckIcon size={18} />
                    <span>Added To Cart</span>
                  </>
                ) : (
                  <>
                    <BagIcon size={18} />
                    <span>ADD TO CART</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="pdp-buy-now-btn"
                onClick={handleBuyNow}
                disabled={isOutOfStock || isAdding}
              >
                BUY NOW
              </button>

              {/* Wishlist Button (Requirement 5 & 9) */}
              <button
                type="button"
                className={`pdp-wishlist-toggle-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlistToggleAction}
                aria-label={
                  isWishlisted
                    ? `Remove ${product.name} from wishlist`
                    : `Add ${product.name} to wishlist`
                }
                title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                aria-pressed={isWishlisted}
              >
                <HeartIcon size={18} />
                <span className="pdp-wishlist-btn-text">
                  {isWishlisted ? 'SAVED' : 'SAVE'}
                </span>
              </button>
            </div>
          </div>

          {/* Wishlist Feedback Banner */}
          {wishlistBanner && (
            <div className="pdp-wishlist-banner" role="status" aria-live="polite">
              <span className="wishlist-banner-text">{wishlistBanner}</span>
              <span
                className="feedback-view-bag-link"
                role="button"
                tabIndex={0}
                onClick={() => navigateTo('/wishlist')}
              >
                View Wishlist →
              </span>
            </div>
          )}

          {/* Visual Add-to-Cart Feedback Banner (Requirement 5) */}
          {addedBanner && (
            <div className="pdp-feedback-banner" role="status" aria-live="polite">
              <span>✓ {addedBanner}</span>
              <span
                className="feedback-view-bag-link"
                role="button"
                tabIndex={0}
                onClick={() => navigateTo('/catalog')}
              >
                Continue Shopping →
              </span>
            </div>
          )}

          {/* Buy Now Feedback Alert (Requirement 6) */}
          {buyNowMessage && (
            <div className="pdp-feedback-banner" role="status" aria-live="polite">
              <span>🚀 {buyNowMessage}</span>
            </div>
          )}

          {/* Delivery Information Area */}
          <div className="pdp-trust-strip">
            <div className="trust-item">
              <TruckIcon size={20} className="trust-icon" />
              <div className="trust-text">
                🚚 Fast delivery available
                <br />
                <span style={{ fontWeight: 400, color: 'var(--color-warm-gray)' }}>
                  Dispatches within 24h
                </span>
              </div>
            </div>
            <div className="trust-item">
              <RotateCcwIcon size={20} className="trust-icon" />
              <div className="trust-text">
                📦 Easy returns
                <br />
                <span style={{ fontWeight: 400, color: 'var(--color-warm-gray)' }}>
                  30-day hassle-free policy
                </span>
              </div>
            </div>
            <div className="trust-item">
              <ShieldCheckIcon size={20} className="trust-icon" />
              <div className="trust-text">
                🛡️ 100% Authentic
                <br />
                <span style={{ fontWeight: 400, color: 'var(--color-warm-gray)' }}>
                  Men's fashion guaranteed
                </span>
              </div>
            </div>
          </div>

          {/* 7. Product Description Expandable Sections (Requirement 7) */}
          <div className="pdp-accordions-group">
            {/* Section 1: Description */}
            <div className="pdp-accordion-item">
              <button
                type="button"
                className="pdp-accordion-header"
                onClick={() => toggleAccordion('description')}
                aria-expanded={expandedSections.description}
              >
                <span>Description</span>
                <ChevronDownIcon size={16} className="accordion-chevron" />
              </button>
              {expandedSections.description && (
                <div className="pdp-accordion-body">
                  <p>{product.description}</p>
                  {product.details && product.details.length > 0 && (
                    <ul>
                      {product.details.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Section 2: Fit & Style */}
            <div className="pdp-accordion-item">
              <button
                type="button"
                className="pdp-accordion-header"
                onClick={() => toggleAccordion('fit')}
                aria-expanded={expandedSections.fit}
              >
                <span>Fit & Style</span>
                <ChevronDownIcon size={16} className="accordion-chevron" />
              </button>
              {expandedSections.fit && (
                <div className="pdp-accordion-body">
                  <p>
                    <strong>Fit Profile:</strong>{' '}
                    {product.fit ? product.fit.toUpperCase() : 'RELAXED / OVERSIZED'}
                  </p>
                  <p>
                    <strong>Silhouette:</strong> Engineered with dropped shoulders and a boxy,
                    relaxed drape tailored for modern men's casual and streetwear styling.
                  </p>
                  <p>
                    <strong>Style Code:</strong> {product.id.toUpperCase()}
                  </p>
                </div>
              )}
            </div>

            {/* Section 3: Material & Care */}
            <div className="pdp-accordion-item">
              <button
                type="button"
                className="pdp-accordion-header"
                onClick={() => toggleAccordion('material')}
                aria-expanded={expandedSections.material}
              >
                <span>Material & Care</span>
                <ChevronDownIcon size={16} className="accordion-chevron" />
              </button>
              {expandedSections.material && (
                <div className="pdp-accordion-body">
                  <div className="pdp-specs-grid" style={{ marginBottom: 'var(--space-3)' }}>
                    {product.material && (
                      <div className="spec-item">
                        <span className="spec-key">Material</span>
                        <span className="spec-val">{product.material}</span>
                      </div>
                    )}
                    {product.fit && (
                      <div className="spec-item">
                        <span className="spec-key">Fit</span>
                        <span className="spec-val">{product.fit.toUpperCase()}</span>
                      </div>
                    )}
                    {product.style && (
                      <div className="spec-item">
                        <span className="spec-key">Style</span>
                        <span className="spec-val">{product.style}</span>
                      </div>
                    )}
                    {product.aesthetic && (
                      <div className="spec-item">
                        <span className="spec-key">Aesthetic</span>
                        <span className="spec-val">{product.aesthetic.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="spec-item">
                      <span className="spec-key">Gender</span>
                      <span className="spec-val">Men's</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-key">Category</span>
                      <span className="spec-val">
                        {product.category.toUpperCase()} / {product.subcategory}
                      </span>
                    </div>
                  </div>
                  <p>
                    Machine wash cold with like colors. Do not bleach. Tumble dry low or line dry to
                    preserve garment longevity.
                  </p>
                </div>
              )}
            </div>

            {/* Section 4: Shipping & Returns */}
            <div className="pdp-accordion-item">
              <button
                type="button"
                className="pdp-accordion-header"
                onClick={() => toggleAccordion('shipping')}
                aria-expanded={expandedSections.shipping}
              >
                <span>Shipping & Returns</span>
                <ChevronDownIcon size={16} className="accordion-chevron" />
              </button>
              {expandedSections.shipping && (
                <div className="pdp-accordion-body">
                  <p>
                    All items are carefully packaged and dispatched from our atelier within 24 hours
                    of order confirmation. Free express shipping on orders over $75.
                  </p>
                  <p>
                    Enjoy 30-day hassle-free returns on all unworn items with original tags attached.
                    Prepaid return labels are provided upon request.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 8. Size Guide Modal (Requirement 8) */}
      {showSizeGuide && (
        <div
          className="size-guide-modal-backdrop"
          onClick={() => setShowSizeGuide(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Men's Sizing Chart"
        >
          <div className="size-guide-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowSizeGuide(false)}
              aria-label="Close size guide"
            >
              <CloseIcon size={18} />
            </button>

            <h3 style={{ margin: '0 0 var(--space-2) 0', fontFamily: 'var(--font-display)' }}>
              Men's Sizing Guide (XS – XXL)
            </h3>
            <p style={{ color: 'var(--color-warm-gray)', fontSize: 'var(--text-xs)', margin: 0 }}>
              Measurements are in inches. Cut with an intentional modern, relaxed drape.
            </p>

            <table className="size-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest</th>
                  <th>Waist</th>
                  <th>Length</th>
                  <th>Shoulder</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>XS</strong></td>
                  <td>34 - 36"</td>
                  <td>28 - 30"</td>
                  <td>27.0"</td>
                  <td>19.5"</td>
                </tr>
                <tr>
                  <td><strong>S</strong></td>
                  <td>36 - 38"</td>
                  <td>30 - 32"</td>
                  <td>28.0"</td>
                  <td>20.5"</td>
                </tr>
                <tr>
                  <td><strong>M</strong></td>
                  <td>38 - 40"</td>
                  <td>32 - 34"</td>
                  <td>29.0"</td>
                  <td>21.5"</td>
                </tr>
                <tr>
                  <td><strong>L</strong></td>
                  <td>40 - 42"</td>
                  <td>34 - 36"</td>
                  <td>30.0"</td>
                  <td>22.5"</td>
                </tr>
                <tr>
                  <td><strong>XL</strong></td>
                  <td>42 - 44"</td>
                  <td>36 - 38"</td>
                  <td>31.0"</td>
                  <td>23.5"</td>
                </tr>
                <tr>
                  <td><strong>XXL</strong></td>
                  <td>44 - 46"</td>
                  <td>38 - 40"</td>
                  <td>32.0"</td>
                  <td>24.5"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. Complete the Look Discovery */}
      {completeTheLook.items.length > 0 && (
        <ProductRail
          id="pdp-complete-the-look"
          eyebrow="HEAD-TO-TOE CURATION"
          title="COMPLETE THE LOOK"
          description="Complementary menswear pieces tailored to pair seamlessly with this silhouette."
          products={completeTheLook.items}
          roleMap={completeTheLook.outfitRoleMap}
          onWishlistToggle={onWishlistToggle}
          onQuickAdd={(p, s) => onAddToCart && onAddToCart(p, s, p.colors[0]?.name || 'Standard', 1)}
        />
      )}

      {/* 11. Featured in Complete Looks (Task 3.5) */}
      {matchingOutfits.length > 0 && (
        <section className="pdp-outfits-feature-section" aria-labelledby="pdp-featured-looks-heading">
          <div className="section-label">OUTFIT CURATION</div>
          <h2 id="pdp-featured-looks-heading" className="section-title">
            FEATURED IN COMPLETE LOOKS
          </h2>
          <div className="pdp-outfits-grid">
            {matchingOutfits.map((look) => (
              <OutfitCard key={look.id} outfit={look} />
            ))}
          </div>
        </section>
      )}

      {/* 12. Related Products: "YOU MAY ALSO LIKE" */}
      {relatedProducts.length > 0 && (
        <ProductRail
          id="pdp-related-products"
          eyebrow="RECOMMENDED PAIRINGS"
          title="YOU MAY ALSO LIKE"
          description="Garments matching this piece's aesthetic, cut, and sartorial tier."
          products={relatedProducts}
          onWishlistToggle={onWishlistToggle}
          onQuickAdd={(p, s) => onAddToCart && onAddToCart(p, s, p.colors[0]?.name || 'Standard', 1)}
        />
      )}

      {/* 12. Recently Viewed Products with Clear Action */}
      {recentlyViewedProducts.length > 0 && (
        <ProductRail
          id="pdp-recently-viewed"
          eyebrow="PREVIOUSLY EXPLORED"
          title="RECENTLY VIEWED"
          products={recentlyViewedProducts}
          onClear={clearRecentlyViewed}
          clearLabel="Clear Recently Viewed"
          onWishlistToggle={onWishlistToggle}
          onQuickAdd={(p, s) => onAddToCart && onAddToCart(p, s, p.colors[0]?.name || 'Standard', 1)}
        />
      )}

      {/* 12. Mobile Sticky Purchase Bar (Requirement 12) */}
      <div className="pdp-mobile-sticky-bar" aria-label="Quick mobile purchase">
        <div className="sticky-bar-info">
          <span className="sticky-bar-price">{formattedPrice}</span>
          <span className="sticky-bar-size">
            {selectedSize ? `Size: ${selectedSize}` : 'Choose size'} • {currentColor.name}
          </span>
        </div>
        <button
          type="button"
          className="sticky-bar-cta"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
        >
          {isOutOfStock ? 'Out of Stock' : isAdding ? 'Adding...' : addedBanner ? 'Added ✓' : 'Add To Cart'}
        </button>
      </div>
    </div>
  );
};
