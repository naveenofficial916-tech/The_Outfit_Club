import React, { useState, useMemo, useEffect } from 'react';
import type {
  CatalogFilterState,
  ProductSortOption,
} from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import {
  filterProductsByState,
  sortProducts,
  getMinMaxPrice,
  PRODUCTS_DATA,
} from '../data/products';
import {
  CURATED_COLLECTIONS,
  getCollectionBySlug,
  getCollectionProducts,
  getRelatedCollections,
} from '../data/collections';
import { getOutfitsForCollection } from '../data/outfits';
import { OutfitCard } from '../components/outfits/OutfitCard';
import { discoveryProfileStore } from '../services/discoveryProfileStore';
import { SmartSearchInput } from '../components/products/SmartSearchInput';
import { FilterSidebar } from '../components/products/FilterSidebar';
import { ActiveFilterChips } from '../components/products/ActiveFilterChips';
import { MobileFilterDrawer } from '../components/products/MobileFilterDrawer';
import { ProductGrid } from '../components/products/ProductGrid';
import { Button } from '../components/common/Button';
import {
  SlidersIcon,
  GridCompactIcon,
  GridEditorialIcon,
  CompassIcon,
  ShareIcon,
  CheckIcon,
  ArrowRightIcon,
} from '../components/common/Icons';
import { navigateTo } from '../utils/navigation';
import './CollectionPage.css';

const INITIAL_PAGE_SIZE = 12;
const PAGE_INCREMENT = 12;

export interface CollectionPageProps {
  collectionSlug?: string;
  onNavigateHome?: () => void;
}

export const CollectionPage: React.FC<CollectionPageProps> = ({
  collectionSlug = 'oversized-edit',
  onNavigateHome,
}) => {
  // 1. Identify active collection
  const collection = useMemo(() => {
    return getCollectionBySlug(collectionSlug);
  }, [collectionSlug]);

  // SEO Update
  useEffect(() => {
    if (collection) {
      document.title = `${collection.name} | The Outfit Club Atelier`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', collection.description);
      }
    } else {
      document.title = `Collection Not Found | The Outfit Club`;
    }
  }, [collection]);

  // 2. Baseline products for this collection
  const baselineCollectionProducts = useMemo(() => {
    if (!collection) return [];
    return getCollectionProducts(collection, PRODUCTS_DATA);
  }, [collection]);

  // Price bounds based on collection's products
  const defaultPriceRange = useMemo(
    () => getMinMaxPrice(baselineCollectionProducts.length > 0 ? baselineCollectionProducts : PRODUCTS_DATA),
    [baselineCollectionProducts]
  );

  // 3. Filter and Sort State
  const [filterState, setFilterState] = useState<CatalogFilterState>(() => ({
    ...DEFAULT_FILTER_STATE,
    priceRange: defaultPriceRange,
  }));

  const [sortBy, setSortBy] = useState<ProductSortOption>('featured');
  const [viewMode, setViewMode] = useState<'compact' | 'editorial'>('compact');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  // Reset filters when changing collections
  const [prevSlug, setPrevSlug] = useState(collectionSlug);
  if (collectionSlug !== prevSlug) {
    setPrevSlug(collectionSlug);
    setFilterState({
      ...DEFAULT_FILTER_STATE,
      priceRange: defaultPriceRange,
    });
    setVisibleCount(INITIAL_PAGE_SIZE);
  }

  // 4. Derived filtered & sorted dataset
  const filteredProducts = useMemo(() => {
    const matched = filterProductsByState(baselineCollectionProducts, filterState);
    return sortProducts(matched, sortBy, filterState.searchQuery);
  }, [baselineCollectionProducts, filterState, sortBy]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Reset pagination on filter or sort change
  const [prevFilterState, setPrevFilterState] = useState(filterState);
  const [prevSortBy, setPrevSortBy] = useState(sortBy);
  if (prevFilterState !== filterState || prevSortBy !== sortBy) {
    setPrevFilterState(filterState);
    setPrevSortBy(sortBy);
    setVisibleCount(INITIAL_PAGE_SIZE);
  }

  // Related collections
  const relatedCollections = useMemo(() => {
    if (!collection) return [];
    return getRelatedCollections(collection);
  }, [collection]);

  // Curated outfits matching this collection
  const collectionOutfits = useMemo(() => {
    if (!collection) return [];
    return getOutfitsForCollection(collection.slug);
  }, [collection]);

  // Record collection context for session personalization (Task 3.6)
  useEffect(() => {
    if (collection) {
      discoveryProfileStore.recordCollectionContext(collection.slug);
    }
  }, [collection]);

  // Share collection handler
  const handleShare = async () => {
    if (!collection) return;
    const shareData = {
      title: `${collection.name} — The Outfit Club`,
      text: collection.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or unsupported
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  // Filter actions
  const handleClearAll = () => {
    setFilterState({
      ...DEFAULT_FILTER_STATE,
      priceRange: { min: defaultPriceRange.min, max: defaultPriceRange.max },
    });
  };

  const handleClearSearch = () => {
    setFilterState((prev) => ({ ...prev, searchQuery: '' }));
  };

  const handleRemoveCategory = (cat: string) => {
    setFilterState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== cat),
    }));
  };

  const handleRemoveSubcategory = (sub: string) => {
    setFilterState((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((s) => s !== sub),
    }));
  };

  const handleRemoveSize = (size: string) => {
    setFilterState((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }));
  };

  const handleRemoveColor = (color: string) => {
    setFilterState((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }));
  };

  const handleRemoveFit = (fit: string) => {
    setFilterState((prev) => ({
      ...prev,
      fits: prev.fits.filter((f) => f !== fit),
    }));
  };

  const handleRemoveAesthetic = (aes: string) => {
    setFilterState((prev) => ({
      ...prev,
      aesthetics: prev.aesthetics.filter((a) => a !== aes),
    }));
  };

  const handleRemoveAvailability = (av: string) => {
    setFilterState((prev) => ({
      ...prev,
      availability: prev.availability.filter((a) => a !== av),
    }));
  };

  const handleResetPriceRange = () => {
    setFilterState((prev) => ({
      ...prev,
      priceRange: { min: defaultPriceRange.min, max: defaultPriceRange.max },
    }));
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_INCREMENT, filteredProducts.length));
      setIsLoadingMore(false);
    }, 180);
  };

  // Active filter count for mobile badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterState.searchQuery.trim() !== '') count++;
    count += filterState.categories.length;
    count += filterState.subcategories.length;
    count += filterState.sizes.length;
    count += filterState.colors.length;
    count += filterState.fits.length;
    count += filterState.aesthetics.length;
    count += filterState.availability.length;
    if (
      filterState.priceRange.min > defaultPriceRange.min ||
      filterState.priceRange.max < defaultPriceRange.max
    ) {
      count++;
    }
    return count;
  }, [filterState, defaultPriceRange]);

  // CASE 1: Invalid Collection State
  if (!collection) {
    return (
      <div className="container collection-not-found-page">
        <div className="collection-not-found-card">
          <div className="not-found-icon-wrap">
            <CompassIcon size={36} />
          </div>
          <h1 className="not-found-title">Collection Not Found</h1>
          <p className="not-found-message">
            The collection you are looking for does not exist or has been archived. Explore
            our active menswear edits or browse the complete catalog.
          </p>
          <div className="not-found-actions">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigateTo('/catalog')}
            >
              Shop Men's Collection
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigateTo('/')}
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Count labels
  const totalCount = filteredProducts.length;
  const countLabel =
    totalCount === 0
      ? '0 products'
      : totalCount === 1
      ? '1 product'
      : `${totalCount} products`;

  const hasMore = visibleCount < filteredProducts.length;
  const progressRatio = Math.min(
    100,
    Math.round((displayedProducts.length / (totalCount || 1)) * 100)
  );

  return (
    <div className="container collection-page">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="collection-breadcrumbs">
        <span
          className="breadcrumb-item-link"
          role="button"
          tabIndex={0}
          onClick={onNavigateHome || (() => navigateTo('/'))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (onNavigateHome) {
                onNavigateHome();
              } else {
                navigateTo('/');
              }
            }
          }}
        >
          Home
        </span>
        <span className="breadcrumb-sep">&gt;</span>
        <span
          className="breadcrumb-item-link"
          role="button"
          tabIndex={0}
          onClick={() => navigateTo('/catalog')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigateTo('/catalog');
            }
          }}
        >
          Collections
        </span>
        <span className="breadcrumb-sep">&gt;</span>
        <span className="breadcrumb-current">{collection.name}</span>
      </nav>

      {/* Collection Hero Header */}
      <header className="collection-hero-card">
        <div className="collection-hero-bg-wrap">
          <img
            src={collection.bannerImage}
            alt={collection.name}
            className="collection-hero-bg-img"
          />
          <div className="collection-hero-scrim" />
        </div>

        <div className="collection-hero-content">
          <div className="collection-hero-eyebrow-row">
            <span className="collection-eyebrow-badge">Curated Edit</span>
            <span className="collection-eyebrow-count">
              {baselineCollectionProducts.length} Pieces
            </span>
          </div>

          <h1 className="collection-hero-title">{collection.name}</h1>
          <p className="collection-hero-tagline">{collection.tagline}</p>
          <p className="collection-hero-desc">{collection.description}</p>

          <div className="collection-hero-actions">
            <button
              type="button"
              className="collection-share-btn"
              onClick={handleShare}
              aria-label="Share this collection"
              title="Share collection"
            >
              {shareSuccess ? (
                <>
                  <CheckIcon size={16} />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <ShareIcon size={16} />
                  <span>Share Collection</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="collection-catalog-link-btn"
              onClick={() => navigateTo('/catalog')}
            >
              <span>Explore All Catalog</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Horizontal Collection Switcher Bar */}
      <nav className="collection-switcher-nav" aria-label="Collections Switcher">
        <div className="collection-switcher-scroll">
          {CURATED_COLLECTIONS.map((c) => {
            const active = c.slug === collection.slug;
            return (
              <button
                key={c.id}
                type="button"
                className={`collection-switcher-pill ${active ? 'active' : ''}`}
                onClick={() => navigateTo(`/collections/${c.slug}`)}
                aria-pressed={active}
              >
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Collection Discovery Toolbar: Search + Mobile Drawer Trigger + Sort + View */}
      <section className="catalog-toolbar" aria-label="Collection controls">
        <div className="catalog-toolbar-left">
          <SmartSearchInput
            value={filterState.searchQuery}
            onChange={(q) => setFilterState((prev) => ({ ...prev, searchQuery: q }))}
            onClear={handleClearSearch}
            products={baselineCollectionProducts}
            placeholder={`Search within ${collection.name}...`}
          />
        </div>

        <div className="catalog-toolbar-right">
          <button
            type="button"
            className="mobile-filter-trigger"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open filter options"
          >
            <SlidersIcon size={16} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="mobile-filter-badge">{activeFiltersCount}</span>
            )}
          </button>

          {/* Sort Selection */}
          <div className="catalog-sort-wrapper">
            <label htmlFor="collection-sort-select" className="catalog-sort-label">
              Sort:
            </label>
            <select
              id="collection-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
              className="catalog-sort-select"
              aria-label="Sort products by"
            >
              <option value="featured">Featured Curation</option>
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
            </select>
          </div>

          {/* View Mode Controls */}
          <div className="view-mode-switcher" role="group" aria-label="Product layout">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'compact' ? 'active' : ''}`}
              onClick={() => setViewMode('compact')}
              aria-label="Compact grid (4 columns)"
              aria-pressed={viewMode === 'compact'}
              title="Compact grid (4 columns)"
            >
              <GridCompactIcon size={18} />
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'editorial' ? 'active' : ''}`}
              onClick={() => setViewMode('editorial')}
              aria-label="Editorial grid (2 columns)"
              aria-pressed={viewMode === 'editorial'}
              title="Editorial grid (2 columns)"
            >
              <GridEditorialIcon size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Layout: Sidebar + Products */}
      <div className="catalog-content-layout">
        <aside className="catalog-sidebar-area" aria-label="Collection filters">
          <FilterSidebar
            products={baselineCollectionProducts}
            filterState={filterState}
            onFilterChange={setFilterState}
            onResetFilters={handleClearAll}
          />
        </aside>

        <main className="catalog-main-area">
          {/* Active Filter Chips */}
          <ActiveFilterChips
            filterState={filterState}
            resultCount={filteredProducts.length}
            defaultPriceRange={defaultPriceRange}
            onRemoveCategory={handleRemoveCategory}
            onRemoveSubcategory={handleRemoveSubcategory}
            onRemoveSize={handleRemoveSize}
            onRemoveColor={handleRemoveColor}
            onRemoveFit={handleRemoveFit}
            onRemoveAesthetic={handleRemoveAesthetic}
            onRemoveAvailability={handleRemoveAvailability}
            onResetPriceRange={handleResetPriceRange}
            onClearSearch={handleClearSearch}
            onClearAll={handleClearAll}
          />

          {/* Empty State vs Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="product-grid-empty" role="region" aria-label="No products found">
              <div className="empty-state-icon-wrap">
                <CompassIcon size={28} />
              </div>
              <h3 className="empty-state-title">
                {filterState.searchQuery.trim()
                  ? `No Products Found in "${collection.name}" for "${filterState.searchQuery}"`
                  : 'Collection Currently Empty'}
              </h3>
              <p className="empty-state-message">
                {filterState.searchQuery.trim()
                  ? `Try clearing your search query or adjust your filters to view pieces in ${collection.name}.`
                  : 'Explore our full men\'s collection of oversized silhouettes, relaxed fits, and everyday streetwear.'}
              </p>
              <div className="empty-state-actions-row">
                {filterState.searchQuery.trim() && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleClearSearch}
                    className="empty-state-action"
                  >
                    Clear Search
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleClearAll}
                  className="empty-state-action"
                >
                  Clear Collection Filters
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigateTo('/catalog')}
                  className="empty-state-action"
                >
                  Shop All Products
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ProductGrid
                products={displayedProducts}
                viewMode={viewMode}
              />

              {/* Load More & Pagination Bar */}
              <section className="load-more-section" aria-label="Pagination">
                <div className="pagination-progress-container">
                  <span className="pagination-progress-text">
                    Showing {displayedProducts.length} of {countLabel}
                  </span>
                  <div
                    className="pagination-progress-bar"
                    role="progressbar"
                    aria-valuenow={displayedProducts.length}
                    aria-valuemin={0}
                    aria-valuemax={totalCount}
                  >
                    <div
                      className="pagination-progress-fill"
                      style={{ width: `${progressRatio}%` }}
                    />
                  </div>
                </div>

                {hasMore ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    aria-label="Load more products"
                  >
                    {isLoadingMore ? 'Loading Pieces...' : 'Load More Pieces'}
                  </Button>
                ) : (
                  <span className="catalog-end-note">
                    You have viewed all {countLabel} in {collection.name}
                  </span>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {/* Curated Outfits in this Collection (Task 3.5) */}
      {collectionOutfits.length > 0 && (
        <section className="collection-outfits-section" aria-labelledby="collection-outfits-heading">
          <div className="section-eyebrow">Visual Merchandising</div>
          <h2 id="collection-outfits-heading" className="related-collections-title">
            Complete Looks in {collection.name}
          </h2>
          <div className="collection-outfits-grid">
            {collectionOutfits.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        </section>
      )}

      {/* Related Collections Section */}
      {relatedCollections.length > 0 && (
        <section className="related-collections-section" aria-label="Related collections">
          <div className="section-eyebrow">Explore More</div>
          <h2 className="related-collections-title">Curated Menswear Edits</h2>

          <div className="related-collections-grid">
            {relatedCollections.map((rel) => {
              const relCount = getCollectionProducts(rel, PRODUCTS_DATA).length;
              return (
                <div
                  key={rel.id}
                  className="related-collection-card"
                  onClick={() => navigateTo(`/collections/${rel.slug}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigateTo(`/collections/${rel.slug}`);
                    }
                  }}
                >
                  <div className="related-card-img-wrap">
                    <img
                      src={rel.bannerImage}
                      alt={rel.name}
                      className="related-card-img"
                    />
                    <span className="related-card-badge">{relCount} Pieces</span>
                  </div>
                  <div className="related-card-body">
                    <h3 className="related-card-title">{rel.name}</h3>
                    <p className="related-card-tagline">{rel.tagline}</p>
                    <span className="related-card-cta">
                      Explore Collection <ArrowRightIcon size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        products={baselineCollectionProducts}
        filteredCount={filteredProducts.length}
        filterState={filterState}
        onFilterChange={setFilterState}
        onResetFilters={handleClearAll}
      />
    </div>
  );
};
