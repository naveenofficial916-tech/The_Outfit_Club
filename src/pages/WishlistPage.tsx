import React, { useState, useMemo } from 'react';
import { useWishlist } from '../services/wishlistStore';
import { cartStore } from '../services/cartStore';
import { PRODUCTS_DATA } from '../data/products';
import { ProductCard } from '../components/products/ProductCard';
import { WishlistQuickAddModal } from '../components/wishlist/WishlistQuickAddModal';
import {
  HeartIcon,
  ArrowRightIcon,
  BagIcon,
  CheckIcon,
  CloseIcon,
  EyeIcon,
  RotateCcwIcon,
} from '../components/common/Icons';
import { navigateTo } from '../utils/navigation';
import type { ProductItem } from '../types';
import './WishlistPage.css';

export interface WishlistPageProps {
  onNavigateHome?: () => void;
}

type WishlistSortOption = 'recently-added' | 'price-asc' | 'price-desc' | 'name-asc';

interface ToastMessage {
  id: string;
  type: 'cart-added' | 'removed';
  title: string;
  desc?: string;
  undoProduct?: {
    id: string;
    index: number;
  };
}

export const WishlistPage: React.FC<WishlistPageProps> = () => {
  const { wishlistIds, count, clearWishlist, removeFromWishlist, insertWishlist } = useWishlist();

  // Sorting state
  const [sortBy, setSortBy] = useState<WishlistSortOption>('recently-added');

  // Quick Add Modal state
  const [quickAddProduct, setQuickAddProduct] = useState<ProductItem | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);

  // Success / Notification Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // 1. Resolve saved products from active catalog by ID (Requirements 10 & 16)
  const rawSavedProducts = useMemo(() => {
    return wishlistIds
      .map((id) => PRODUCTS_DATA.find((p) => p.id === id))
      .filter((p): p is ProductItem => Boolean(p));
  }, [wishlistIds]);

  // 2. Deterministic Sorting (Requirements 3 & 4)
  const sortedProducts = useMemo(() => {
    const list = [...rawSavedProducts];

    switch (sortBy) {
      case 'recently-added':
        // Preserves insertion sequence (wishlistIds array has newest at index 0)
        return list.sort((a, b) => {
          const indexA = wishlistIds.indexOf(a.id);
          const indexB = wishlistIds.indexOf(b.id);
          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });

      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);

      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);

      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name));

      default:
        return list;
    }
  }, [rawSavedProducts, sortBy, wishlistIds]);

  // Toast Helpers
  const showCartToast = (product: ProductItem, size: string, color: string) => {
    const toastId = `cart-${product.id}-${Date.now()}`;
    setToast({
      id: toastId,
      type: 'cart-added',
      title: 'Added to cart',
      desc: `${product.name} (${size}, ${color})`,
    });

    setTimeout(() => {
      setToast((current) => (current?.id === toastId ? null : current));
    }, 4500);
  };

  const handleRemoveWithUndo = (product: ProductItem) => {
    const origIndex = wishlistIds.indexOf(product.id);
    removeFromWishlist(product.id);

    const toastId = `remove-${product.id}-${Date.now()}`;
    setToast({
      id: toastId,
      type: 'removed',
      title: 'Removed from wishlist',
      desc: product.name,
      undoProduct: {
        id: product.id,
        index: origIndex >= 0 ? origIndex : 0,
      },
    });

    setTimeout(() => {
      setToast((current) => (current?.id === toastId ? null : current));
    }, 5000);
  };

  const handleUndoRemove = () => {
    if (toast?.undoProduct) {
      insertWishlist(toast.undoProduct.id, toast.undoProduct.index);
      setToast(null);
    }
  };

  // Add to Cart Interaction
  const handleAddToCartClick = (product: ProductItem) => {
    const isOutOfStock = product.availability === 'out-of-stock' || product.inStock === false;
    if (isOutOfStock) return;

    const hasMultipleSizes = product.sizes && product.sizes.length > 1;
    const hasMultipleColors = product.colors && product.colors.length > 1;

    if (!hasMultipleSizes && !hasMultipleColors) {
      // Single variant — immediately add
      const singleSize = product.sizes?.[0] || 'One Size';
      const singleColor = product.colors?.[0]?.name || 'Standard';

      cartStore.addToCart(product, singleSize, singleColor, 1, false);
      showCartToast(product, singleSize, singleColor);
    } else {
      // Multiple options require size/color selection — open Quick Add panel
      setQuickAddProduct(product);
      setIsQuickAddOpen(true);
    }
  };

  const handleQuickAddSuccess = (product: ProductItem, size: string, color: string) => {
    showCartToast(product, size, color);
  };

  // Count text with proper singular/plural grammar (Requirement 2)
  const savedCountText = count === 1 ? '1 SAVED ITEM' : `${count} SAVED ITEMS`;

  return (
    <main className="wishlist-page container" id="wishlist-main">
      {/* Toast Notification Banner with Cart Drawer / Undo Support */}
      {toast && (
        <div className="wishlist-toast-banner" role="status" aria-live="polite">
          <div className="toast-left">
            <span
              className={`toast-icon-wrap ${toast.type === 'removed' ? 'remove-type' : 'check-type'}`}
              aria-hidden="true"
            >
              {toast.type === 'removed' ? <CloseIcon size={14} /> : <CheckIcon size={15} />}
            </span>
            <div className="toast-content">
              <strong className="toast-title">{toast.title}</strong>
              {toast.desc && <span className="toast-desc">{toast.desc}</span>}
            </div>
          </div>
          <div className="toast-right">
            {toast.type === 'cart-added' && (
              <button
                type="button"
                className="toast-action-btn"
                onClick={() => cartStore.openDrawer()}
              >
                VIEW CART
              </button>
            )}
            {toast.type === 'removed' && toast.undoProduct && (
              <button
                type="button"
                className="toast-action-btn undo-btn"
                onClick={handleUndoRemove}
              >
                <RotateCcwIcon size={12} />
                <span>UNDO</span>
              </button>
            )}
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="wishlist-breadcrumbs" aria-label="Breadcrumb">
        <a
          href="/"
          className="wishlist-breadcrumb-link"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/');
          }}
        >
          HOME
        </a>
        <span className="wishlist-breadcrumb-sep">/</span>
        <a
          href="/catalog"
          className="wishlist-breadcrumb-link"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/catalog');
          }}
        >
          SHOP
        </a>
        <span className="wishlist-breadcrumb-sep">/</span>
        <span className="wishlist-breadcrumb-current" aria-current="page">
          WISHLIST
        </span>
      </nav>

      {/* Wishlist Header (Requirement 1) */}
      <header className="wishlist-header">
        <div className="wishlist-header-content">
          <div className="wishlist-eyebrow">
            <span className="wishlist-eyebrow-badge">SAVED STYLES</span>
            <span className="wishlist-eyebrow-text">{savedCountText}</span>
          </div>
          <h1 className="wishlist-title">MY WISHLIST</h1>
          <p className="wishlist-subtitle">Your saved men's styles, ready when you are.</p>
        </div>

        {count > 0 && (
          <div className="wishlist-header-controls">
            {/* Sorting Control (Requirement 3) */}
            <div className="wishlist-sort-wrapper">
              <label htmlFor="wishlist-sort-select" className="wishlist-sort-label">
                SORT BY:
              </label>
              <select
                id="wishlist-sort-select"
                className="wishlist-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as WishlistSortOption)}
                aria-label="Sort saved products"
              >
                <option value="recently-added">Recently Added</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
            </div>

            {/* Clear & Continue Shopping Actions (Requirements 1 & 7) */}
            <button
              type="button"
              className="wishlist-continue-shop-btn"
              onClick={() => navigateTo('/catalog')}
            >
              <span>Continue Shopping</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>
        )}
      </header>

      {/* Main Wishlist Body */}
      {sortedProducts.length > 0 ? (
        <section className="wishlist-grid-section" aria-label="Saved Products Grid">
          <div className="wishlist-products-grid">
            {sortedProducts.map((product) => {
              const isOutOfStock = product.availability === 'out-of-stock' || product.inStock === false;

              return (
                <div key={product.id} className="wishlist-card-wrapper">
                  <ProductCard
                    product={product}
                    isWishlisted={true}
                    onWishlistToggle={() => handleRemoveWithUndo(product)}
                    onQuickAdd={() => handleAddToCartClick(product)}
                  />
                  
                  {/* Action Bar (Requirements 5 & 9) */}
                  <div className="wishlist-card-action-bar">
                    <button
                      type="button"
                      className={`wishlist-card-add-btn ${isOutOfStock ? 'disabled-out-of-stock' : ''}`}
                      onClick={() => handleAddToCartClick(product)}
                      disabled={isOutOfStock}
                      aria-label={
                        isOutOfStock
                          ? `${product.name} is out of stock`
                          : `Add ${product.name} to cart`
                      }
                    >
                      <BagIcon size={14} />
                      <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}</span>
                    </button>

                    <button
                      type="button"
                      className="wishlist-card-remove-btn"
                      onClick={() => handleRemoveWithUndo(product)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      title="Remove from wishlist"
                    >
                      <CloseIcon size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        /* Empty State (Requirement 8) */
        <section className="wishlist-empty-state" aria-label="Empty Wishlist">
          <div className="wishlist-empty-card">
            <div className="wishlist-empty-icon-wrap" aria-hidden="true">
              <HeartIcon size={36} />
            </div>
            <h2 className="wishlist-empty-title">MY WISHLIST</h2>
            <p className="wishlist-empty-text">Your saved products will appear here.</p>
            <p className="wishlist-empty-hint">
              Explore oversized tees, baggy pants, cargo trousers, footwear, and accessories. Tap the heart icon to save your favorite pieces.
            </p>
            <button
              type="button"
              className="wishlist-empty-cta-btn"
              onClick={() => navigateTo('/catalog')}
              aria-label="Shop the menswear collection"
            >
              [ SHOP MEN'S COLLECTION ]
            </button>
          </div>
        </section>
      )}

      {/* Quick Add Modal */}
      <WishlistQuickAddModal
        product={quickAddProduct}
        isOpen={isQuickAddOpen}
        onClose={() => {
          setIsQuickAddOpen(false);
          setQuickAddProduct(null);
        }}
        onSuccess={handleQuickAddSuccess}
      />
    </main>
  );
};
