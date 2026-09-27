import React, { useState, useMemo, useEffect } from 'react';
import {
  getOutfitBySlug,
  getCuratedOutfits,
} from '../data/outfits';
import type { CuratedOutfit } from '../types/outfit';
import {
  HeartIcon,
  BagIcon,
  CheckIcon,
  ArrowRightIcon,
  SparklesIcon,
  EyeIcon,
} from '../components/common/Icons';
import { OutfitCard } from '../components/outfits/OutfitCard';
import { useWishlist } from '../services/wishlistStore';
import { cartStore } from '../services/cartStore';
import { quickViewStore } from '../services/quickViewStore';
import { navigateTo } from '../utils/navigation';
import './OutfitDetailPage.css';

export interface OutfitDetailPageProps {
  lookSlug?: string;
  onNavigateHome?: () => void;
}

export const OutfitDetailPage: React.FC<OutfitDetailPageProps> = ({
  lookSlug,
  onNavigateHome,
}) => {
  const { isWishlisted: checkWishlist, toggleWishlist } = useWishlist();

  // Resolve target outfit from slug or path
  const targetSlug = useMemo(() => {
    if (lookSlug) return lookSlug;
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/looks/')) {
        return path.replace('/looks/', '').replace(/\/$/, '');
      }
    }
    return '';
  }, [lookSlug]);

  const allOutfits = useMemo(() => getCuratedOutfits(), []);

  const outfit: CuratedOutfit | undefined = useMemo(() => {
    if (!targetSlug || targetSlug === 'looks') {
      return allOutfits[0];
    }
    return getOutfitBySlug(targetSlug);
  }, [targetSlug, allOutfits]);

  // Selected sizes for each product in the outfit: { [productId]: size }
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(() => {
    const initialSizes: Record<string, string> = {};
    if (outfit) {
      for (const piece of outfit.pieces) {
        if (piece.product.sizes.length === 1) {
          initialSizes[piece.product.id] = piece.product.sizes[0];
        }
      }
    }
    return initialSizes;
  });
  const [sizeErrors, setSizeErrors] = useState<Record<string, string>>({});
  const [addedItemsMap, setAddedItemsMap] = useState<Record<string, boolean>>({});
  const [addAllSuccess, setAddAllSuccess] = useState(false);
  const [masterError, setMasterError] = useState<string | null>(null);

  // Reset selections when transitioning to a different outfit
  const [prevOutfitId, setPrevOutfitId] = useState<string | undefined>(outfit?.id);
  if (outfit?.id !== prevOutfitId) {
    setPrevOutfitId(outfit?.id);
    const initialSizes: Record<string, string> = {};
    if (outfit) {
      for (const piece of outfit.pieces) {
        if (piece.product.sizes.length === 1) {
          initialSizes[piece.product.id] = piece.product.sizes[0];
        }
      }
    }
    setSelectedSizes(initialSizes);
    setSizeErrors({});
    setAddedItemsMap({});
    setAddAllSuccess(false);
    setMasterError(null);
  }

  // Update document title for SEO
  useEffect(() => {
    if (outfit) {
      document.title = `${outfit.name} | Curated Men's Ensembles | THE OUTFIT CLUB`;
    }
  }, [outfit]);

  // Handle individual size selection
  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
    setSizeErrors((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    setMasterError(null);
  };

  // Add individual piece to cart
  const handleAddPiece = (piece: CuratedOutfit['pieces'][0]) => {
    const prod = piece.product;
    const chosenSize = selectedSizes[prod.id];

    if (prod.sizes.length > 0 && !chosenSize) {
      setSizeErrors((prev) => ({
        ...prev,
        [prod.id]: 'Please select a size',
      }));
      return;
    }

    cartStore.addToCart(
      prod,
      chosenSize || 'Standard',
      prod.colors[0]?.name || 'Standard',
      1
    );

    setAddedItemsMap((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedItemsMap((prev) => ({ ...prev, [prod.id]: false }));
    }, 2500);
  };

  // Add COMPLETE look to cart
  const handleAddEntireLook = () => {
    if (!outfit) return;

    const newErrors: Record<string, string> = {};
    for (const piece of outfit.pieces) {
      const prod = piece.product;
      if (prod.sizes.length > 0 && !selectedSizes[prod.id]) {
        newErrors[prod.id] = 'Select size';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setSizeErrors(newErrors);
      setMasterError(
        'Please select sizes for all required garments before adding the complete look.'
      );
      return;
    }

    setMasterError(null);

    // Dispatch all pieces to cart
    for (const piece of outfit.pieces) {
      const prod = piece.product;
      const chosenSize = selectedSizes[prod.id] || 'Standard';
      cartStore.addToCart(
        prod,
        chosenSize,
        prod.colors[0]?.name || 'Standard',
        1
      );
    }

    setAddAllSuccess(true);
    setTimeout(() => {
      setAddAllSuccess(false);
    }, 3500);
  };

  // Invalid Look State (Requirement 10)
  if (!outfit) {
    return (
      <div className="container outfit-not-found-page" role="alert">
        <div className="outfit-not-found-card">
          <span className="outfit-eyebrow-chip">OUTFIT CURATION</span>
          <h1 className="outfit-not-found-title">LOOK NOT FOUND</h1>
          <p className="outfit-not-found-desc">
            The curated ensemble you requested is either unavailable or has been re-curated for the current season.
          </p>
          <div className="outfit-not-found-actions">
            <button
              type="button"
              className="outfit-btn-primary"
              onClick={() => navigateTo('/catalog')}
            >
              SHOP MEN'S COLLECTION
            </button>
            <button
              type="button"
              className="outfit-btn-secondary"
              onClick={onNavigateHome || (() => navigateTo('/'))}
            >
              GO HOME
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Related outfits (excluding current)
  const relatedOutfits = allOutfits.filter((o) => o.id !== outfit.id);

  const formattedTotalPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(outfit.totalPrice);

  const formattedOriginalPrice = outfit.originalTotalPrice
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(outfit.originalTotalPrice)
    : null;

  return (
    <div className="container outfit-detail-page" id={`look-${outfit.id}`}>
      {/* Semantic Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="outfit-breadcrumbs">
        <span
          className="outfit-breadcrumb-link"
          role="button"
          tabIndex={0}
          onClick={onNavigateHome || (() => navigateTo('/'))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (onNavigateHome) onNavigateHome();
              else navigateTo('/');
            }
          }}
        >
          Home
        </span>
        <span className="breadcrumb-sep">&gt;</span>
        <span
          className="outfit-breadcrumb-link"
          role="button"
          tabIndex={0}
          onClick={() => navigateTo('/catalog')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigateTo('/catalog');
            }
          }}
        >
          Curated Looks
        </span>
        <span className="breadcrumb-sep">&gt;</span>
        <span className="outfit-breadcrumb-current" aria-current="page">
          {outfit.name}
        </span>
      </nav>

      {/* Editorial Look Hero */}
      <header className="outfit-hero-banner">
        <div className="outfit-hero-meta">
          <div className="outfit-hero-badges">
            <span className="outfit-hero-badge primary">
              <SparklesIcon size={12} /> {outfit.pieces.length} PIECE ENSEMBLE
            </span>
            {outfit.aesthetic && (
              <span className="outfit-hero-badge secondary">
                {outfit.aesthetic.toUpperCase()}
              </span>
            )}
            {outfit.collectionSlug && (
              <button
                type="button"
                className="outfit-hero-collection-link"
                onClick={() => navigateTo(`/collections/${outfit.collectionSlug}`)}
              >
                VIEW COLLECTION &rarr;
              </button>
            )}
          </div>

          <h1 className="outfit-hero-title">{outfit.name}</h1>
          <p className="outfit-hero-tagline">{outfit.tagline}</p>
          <p className="outfit-hero-description">{outfit.description}</p>
        </div>

        {/* Hero Price & Master Add to Cart Box */}
        <div className="outfit-hero-purchase-card">
          <span className="purchase-card-eyebrow">COMPLETE ENSEMBLE PRICE</span>
          <div className="purchase-card-pricing">
            <span className="purchase-card-price-current">{formattedTotalPrice}</span>
            {formattedOriginalPrice && (
              <span className="purchase-card-price-original">
                {formattedOriginalPrice}
              </span>
            )}
          </div>
          {outfit.discountPercentage && (
            <span className="purchase-card-savings">
              Save {outfit.discountPercentage}% when purchasing complete look
            </span>
          )}

          {masterError && (
            <div className="outfit-master-error" role="alert">
              {masterError}
            </div>
          )}

          <button
            type="button"
            className={`outfit-add-all-btn ${addAllSuccess ? 'success' : ''}`}
            onClick={handleAddEntireLook}
            aria-label="Add complete look to bag"
          >
            {addAllSuccess ? (
              <>
                <CheckIcon size={16} />
                <span>ADDED {outfit.pieces.length} PIECES TO BAG ✓</span>
              </>
            ) : (
              <>
                <BagIcon size={16} />
                <span>ADD COMPLETE LOOK TO BAG</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Visual Product Ensemble Breakdown */}
      <section className="outfit-breakdown-section" aria-labelledby="outfit-breakdown-heading">
        <div className="section-label">ENSEMBLE COMPOSITION</div>
        <h2 id="outfit-breakdown-heading" className="outfit-breakdown-title">
          Head-To-Toe Garment Breakdown
        </h2>

        <div className="outfit-pieces-grid">
          {outfit.pieces.map((piece, idx) => {
            const prod = piece.product;
            const chosenSize = selectedSizes[prod.id] || '';
            const error = sizeErrors[prod.id];
            const isAdded = addedItemsMap[prod.id];
            const isWishlisted = checkWishlist(prod.id);

            const piecePrice = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            }).format(prod.price);

            return (
              <div
                key={prod.id}
                className={`outfit-piece-card ${error ? 'has-error' : ''}`}
                id={`piece-${prod.id}`}
              >
                {/* Role Chip */}
                <div className="piece-card-header">
                  <span className="piece-step-num">0{idx + 1}</span>
                  <span className="piece-role-badge">{piece.roleLabel}</span>
                </div>

                {/* Product Image */}
                <div className="piece-card-image-wrap">
                  <img
                    src={prod.thumbnail || prod.images[0]}
                    alt={prod.name}
                    loading="lazy"
                    onClick={() => navigateTo(`/product/${prod.slug}`)}
                  />
                  <button
                    type="button"
                    className={`piece-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={() => toggleWishlist(prod)}
                    aria-label={
                      isWishlisted
                        ? `Remove ${prod.name} from wishlist`
                        : `Add ${prod.name} to wishlist`
                    }
                  >
                    <HeartIcon size={16} />
                  </button>
                  <button
                    type="button"
                    className="piece-quick-view-btn"
                    onClick={() => quickViewStore.open(prod)}
                    aria-label={`Quick view ${prod.name}`}
                  >
                    <EyeIcon size={14} />
                    <span>Quick View</span>
                  </button>
                </div>

                {/* Product Meta */}
                <div className="piece-card-body">
                  <span className="piece-brand">{prod.brand}</span>
                  <h3
                    className="piece-title"
                    onClick={() => navigateTo(`/product/${prod.slug}`)}
                  >
                    {prod.name}
                  </h3>
                  <div className="piece-price">{piecePrice}</div>

                  {/* Size Selector */}
                  {prod.sizes.length > 0 && (
                    <div className="piece-size-section">
                      <span className="piece-size-label">
                        SELECT SIZE: {chosenSize && <strong>{chosenSize}</strong>}
                      </span>
                      <div className="piece-size-pills">
                        {prod.sizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            className={`piece-size-btn ${chosenSize === size ? 'active' : ''}`}
                            onClick={() => handleSelectSize(prod.id, size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      {error && (
                        <span className="piece-size-error" role="alert">
                          {error}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="piece-card-actions">
                    <button
                      type="button"
                      className={`piece-add-btn ${isAdded ? 'success' : ''}`}
                      onClick={() => handleAddPiece(piece)}
                      disabled={prod.availability === 'out-of-stock'}
                    >
                      {prod.availability === 'out-of-stock'
                        ? 'OUT OF STOCK'
                        : isAdded
                        ? 'ADDED ✓'
                        : 'ADD TO BAG'}
                    </button>
                    <button
                      type="button"
                      className="piece-view-btn"
                      onClick={() => navigateTo(`/product/${prod.slug}`)}
                    >
                      <span>DETAILS</span>
                      <ArrowRightIcon size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Related Outfits Section */}
      {relatedOutfits.length > 0 && (
        <section className="outfit-related-section" aria-labelledby="related-looks-heading">
          <div className="outfit-related-header">
            <div>
              <div className="section-label">MORE EDITS</div>
              <h2 id="related-looks-heading" className="outfit-breakdown-title">
                Explore More Curated Looks
              </h2>
            </div>
            <button
              type="button"
              className="outfit-view-all-link"
              onClick={() => navigateTo('/catalog')}
            >
              Browse All Products <ArrowRightIcon size={14} />
            </button>
          </div>

          <div className="outfit-related-grid">
            {relatedOutfits.map((relOutfit) => (
              <OutfitCard key={relOutfit.id} outfit={relOutfit} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
