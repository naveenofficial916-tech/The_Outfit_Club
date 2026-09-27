import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type {
  ProductItem,
  CatalogFilterState,
  ProductSortOption,
  ProductCategory,
  ProductFit,
} from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import {
  filterProductsByState,
  sortProducts,
  getMinMaxPrice,
  PRODUCTS_DATA,
} from '../data/products';
import { SmartSearchInput } from '../components/products/SmartSearchInput';
import { discoveryProfileStore } from '../services/discoveryProfileStore';
import { FilterSidebar } from '../components/products/FilterSidebar';
import { ActiveFilterChips } from '../components/products/ActiveFilterChips';
import { MobileFilterDrawer } from '../components/products/MobileFilterDrawer';
import { CatalogCategoryNav } from '../components/products/CatalogCategoryNav';
import { ProductGrid } from '../components/products/ProductGrid';
import { Button } from '../components/common/Button';
import {
  SlidersIcon,
  GridCompactIcon,
  GridEditorialIcon,
  CompassIcon,
} from '../components/common/Icons';
import './CatalogPage.css';

const INITIAL_PAGE_SIZE = 12;
const PAGE_INCREMENT = 12;

const VALID_CATEGORIES: ProductCategory[] = [
  'clothing',
  'tailoring',
  'knitwear',
  'footwear',
  'accessories',
  'outerwear',
];

const VALID_FITS: ProductFit[] = [
  'slim',
  'regular',
  'relaxed',
  'oversized',
  'tailored',
  'straight',
];

const VALID_SORTS: ProductSortOption[] = [
  'featured',
  'newest',
  'price-asc',
  'price-desc',
  'rating-desc',
];

export interface CatalogPageProps {
  products?: ProductItem[];
  isLoading?: boolean;
  onWishlistToggle?: (product: ProductItem) => void;
  onQuickAdd?: (product: ProductItem, size: string) => void;
  onNavigateHome?: () => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  products = PRODUCTS_DATA,
  isLoading = false,
  onWishlistToggle,
  onQuickAdd,
  onNavigateHome,
}) => {
  // Default Price Bounds for baseline comparisons
  const defaultPriceRange = useMemo(() => getMinMaxPrice(products), [products]);

  // Robust URL state parser
  const parseUrlToState = useCallback(
    (bounds: { min: number; max: number }) => {
      if (typeof window === 'undefined') {
        return {
          filters: { ...DEFAULT_FILTER_STATE, priceRange: bounds },
          sortBy: 'featured' as ProductSortOption,
          viewMode: 'compact' as 'compact' | 'editorial',
        };
      }

      const params = new URLSearchParams(window.location.search);

      // Categories
      const catParam = params.get('category');
      const categories: ProductCategory[] = [];
      if (catParam) {
        catParam.split(',').forEach((c) => {
          const trimmed = c.trim().toLowerCase() as ProductCategory;
          if (VALID_CATEGORIES.includes(trimmed) && !categories.includes(trimmed)) {
            categories.push(trimmed);
          }
        });
      }

      // Subcategories
      const subParam = params.get('subcategory');
      const subcategories: string[] = subParam
        ? subParam.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      // Sizes
      const sizeParam = params.get('size') || params.get('sizes');
      const sizes: string[] = sizeParam
        ? sizeParam.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      // Fits
      const fitParam = params.get('fit') || params.get('fits');
      const fits: ProductFit[] = [];
      if (fitParam) {
        fitParam.split(',').forEach((f) => {
          const trimmed = f.trim().toLowerCase() as ProductFit;
          if (VALID_FITS.includes(trimmed) && !fits.includes(trimmed)) {
            fits.push(trimmed);
          }
        });
      }

      // Price range
      const minPriceParam = params.get('minPrice');
      const maxPriceParam = params.get('maxPrice');
      const minPrice =
        minPriceParam && !isNaN(Number(minPriceParam))
          ? Math.max(bounds.min, Number(minPriceParam))
          : bounds.min;
      const maxPrice =
        maxPriceParam && !isNaN(Number(maxPriceParam))
          ? Math.min(bounds.max, Number(maxPriceParam))
          : bounds.max;

      // Search query
      const searchQuery = params.get('search') || params.get('q') || '';

      // Sorting
      const sortParam = params.get('sort') as ProductSortOption;
      const sortBy: ProductSortOption = VALID_SORTS.includes(sortParam)
        ? sortParam
        : 'featured';

      // View layout
      const viewParam = params.get('view');
      const viewMode: 'compact' | 'editorial' =
        viewParam === 'editorial' ? 'editorial' : 'compact';

      return {
        filters: {
          ...DEFAULT_FILTER_STATE,
          categories,
          subcategories,
          sizes,
          fits,
          priceRange: { min: minPrice, max: maxPrice },
          searchQuery,
        },
        sortBy,
        viewMode,
      };
    },
    []
  );

  // Initialize master filter state from URL
  const [filterState, setFilterState] = useState<CatalogFilterState>(
    () => parseUrlToState(defaultPriceRange).filters
  );

  const [sortBy, setSortBy] = useState<ProductSortOption>(
    () => parseUrlToState(defaultPriceRange).sortBy
  );

  const [viewMode, setViewMode] = useState<'compact' | 'editorial'>(
    () => parseUrlToState(defaultPriceRange).viewMode
  );

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Derived filtered & sorted dataset with smart relevance scoring
  const filteredProducts = useMemo(() => {
    const matched = filterProductsByState(products, filterState);
    return sortProducts(matched, sortBy, filterState.searchQuery);
  }, [products, filterState, sortBy]);

  // Slice visible products for pagination / load more
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Reset pagination during render when filter criteria or sort change
  const [prevFilterState, setPrevFilterState] = useState(filterState);
  const [prevSortBy, setPrevSortBy] = useState(sortBy);

  if (prevFilterState !== filterState || prevSortBy !== sortBy) {
    setPrevFilterState(filterState);
    setPrevSortBy(sortBy);
    setVisibleCount(INITIAL_PAGE_SIZE);
  }

  // Category Memory Tracking (Task 3.6 Requirement 11)
  useEffect(() => {
    if (filterState.categories.length > 0) {
      for (const cat of filterState.categories) {
        discoveryProfileStore.recordCategoryView(cat);
      }
    }
  }, [filterState.categories]);

  // Synchronize state with URL parameters (deep 2-way sync)
  const syncStateToUrl = useCallback(
    (filters: CatalogFilterState, currentSort: ProductSortOption, currentView: string) => {
      if (typeof window === 'undefined') return;

      const params = new URLSearchParams();
      if (filters.categories.length > 0) {
        params.set('category', filters.categories.join(','));
      }
      if (filters.subcategories.length > 0) {
        params.set('subcategory', filters.subcategories.join(','));
      }
      if (filters.sizes.length > 0) {
        params.set('size', filters.sizes.join(','));
      }
      if (filters.fits.length > 0) {
        params.set('fit', filters.fits.join(','));
      }
      if (filters.priceRange.min > defaultPriceRange.min) {
        params.set('minPrice', String(filters.priceRange.min));
      }
      if (filters.priceRange.max < defaultPriceRange.max) {
        params.set('maxPrice', String(filters.priceRange.max));
      }
      if (filters.searchQuery.trim()) {
        params.set('search', filters.searchQuery.trim());
      }
      if (currentSort !== 'featured') {
        params.set('sort', currentSort);
      }
      if (currentView !== 'compact') {
        params.set('view', currentView);
      }

      const newQuery = params.toString();
      const newRelativePathQuery =
        window.location.pathname + (newQuery ? `?${newQuery}` : '');

      window.history.replaceState({}, '', newRelativePathQuery);
    },
    [defaultPriceRange]
  );

  // Sync URL when filters, sort, or viewMode change
  useEffect(() => {
    syncStateToUrl(filterState, sortBy, viewMode);
  }, [filterState, sortBy, viewMode, syncStateToUrl]);

  // Handle browser back/forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlToState(defaultPriceRange);
      setFilterState(parsed.filters);
      setSortBy(parsed.sortBy);
      setViewMode(parsed.viewMode);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [defaultPriceRange, parseUrlToState]);

  // Total active filter count for mobile badge
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

  // Load More Handler with brief micro-transition
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_INCREMENT, filteredProducts.length));
      setIsLoadingMore(false);
    }, 180);
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

  const handleSelectCategoryNav = (
    category?: ProductCategory,
    subcategories?: string[]
  ) => {
    setFilterState((prev) => ({
      ...prev,
      categories: category ? [category] : [],
      subcategories: subcategories || [],
    }));
  };

  // Format piece count labels
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
    <div className="container catalog-page">
      {/* Editorial Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="catalog-breadcrumbs">
        <span
          className="catalog-breadcrumb-link"
          role="button"
          tabIndex={0}
          onClick={onNavigateHome}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onNavigateHome?.();
            }
          }}
        >
          Home
        </span>
        <span className="catalog-breadcrumb-sep">/</span>
        <span>The Menswear Collection</span>
        {filterState.categories.length > 0 && (
          <>
            <span className="catalog-breadcrumb-sep">/</span>
            <span style={{ color: 'var(--color-black)', fontWeight: 600 }}>
              {filterState.categories[0]}
            </span>
          </>
        )}
      </nav>

      {/* Upgraded Premium Men's Fashion Discovery Hero */}
      <header className="catalog-hero-header">
        <div className="catalog-hero-eyebrow">
          <span className="hero-eyebrow-badge">Atelier 2026</span>
          <span className="hero-eyebrow-text">Men's Streetwear & Silhouettes</span>
        </div>
        <h1 className="catalog-hero-title">The Men's Collection</h1>
        <p className="catalog-hero-subtitle">
          Built for oversized silhouettes, relaxed fits and everyday streetwear. An
          expansive curation of heavyweight tees, baggy trousers, architectural
          tailoring, and premium footwear designed exclusively for men.
        </p>
        <div className="catalog-hero-tags" aria-label="Collection focus areas">
          <span className="hero-tag">Oversized Silhouettes</span>
          <span className="hero-tag">Heavyweight 280+ GSM</span>
          <span className="hero-tag">Baggy & Relaxed Cuts</span>
          <span className="hero-tag">Streetwear Essentials</span>
          <span className="hero-tag">Architectural Tailoring</span>
        </div>
      </header>

      {/* Men's Category Navigation Pills */}
      <CatalogCategoryNav
        filterState={filterState}
        onSelectNav={handleSelectCategoryNav}
      />

      {/* Discovery Toolbar: Search + Mobile Filters Trigger + Sort + View Mode */}
      <section className="catalog-toolbar" aria-label="Catalog controls">
        <div className="catalog-toolbar-left">
          <SmartSearchInput
            value={filterState.searchQuery}
            onChange={(q) => setFilterState((prev) => ({ ...prev, searchQuery: q }))}
            onClear={handleClearSearch}
            products={products}
            placeholder="Search oversized tees, baggy pants, streetwear..."
          />
        </div>

        <div className="catalog-toolbar-right">
          {/* Mobile Filter Drawer Button */}
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
            <label htmlFor="catalog-sort-select" className="catalog-sort-label">
              Sort:
            </label>
            <select
              id="catalog-sort-select"
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

          {/* View Mode Controls: Compact (4-col) vs Editorial (2-col) */}
          <div
            className="view-mode-switcher"
            role="group"
            aria-label="Product grid layout mode"
          >
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

      {/* Main Content Layout: Sidebar + Catalog Grid */}
      <div className="catalog-content-layout">
        {/* Desktop Filter Sidebar */}
        <aside className="catalog-sidebar-area" aria-label="Catalog filters">
          <FilterSidebar
            products={products}
            filterState={filterState}
            onFilterChange={setFilterState}
            onResetFilters={handleClearAll}
          />
        </aside>

        {/* Catalog Main Area */}
        <main className="catalog-main-area">
          {/* Active Filter Chips & Live Result Count */}
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
            <div
              className="product-grid-empty"
              role="region"
              aria-label="No products found"
            >
              <div className="empty-state-icon-wrap">
                <CompassIcon size={28} />
              </div>
              <h3 className="empty-state-title">
                {filterState.searchQuery.trim()
                  ? `No Products Found for "${filterState.searchQuery}"`
                  : 'No Products Found'}
              </h3>
              <p className="empty-state-message">
                {filterState.searchQuery.trim()
                  ? `We could not find any garments matching "${filterState.searchQuery}". Try searching for popular men's cuts like "oversized tee", "baggy pants", or "streetwear".`
                  : 'Try changing your filters or searching for another men\'s style. Explore our full collection of oversized silhouettes, relaxed fits, and everyday streetwear.'}
              </p>

              {/* Quick style suggestion pills when empty */}
              <div className="empty-search-suggestions">
                <span className="empty-suggestions-label">Explore styles:</span>
                <div className="empty-suggestions-chips">
                  {['Oversized Tees', 'Baggy Pants', 'Relaxed Denim', 'Streetwear'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="empty-suggestion-pill"
                      onClick={() =>
                        setFilterState((prev) => ({ ...prev, searchQuery: tag }))
                      }
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

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
                  Clear All Filters
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    handleClearAll();
                    handleClearSearch();
                  }}
                  className="empty-state-action"
                >
                  View All Products
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Product Grid supporting both Compact and Editorial view modes */}
              <ProductGrid
                products={displayedProducts}
                isLoading={isLoading}
                viewMode={viewMode}
                onWishlistToggle={onWishlistToggle}
                onQuickAdd={onQuickAdd}
              />

              {/* Load More & Pagination Progress Section */}
              <section className="load-more-section" aria-label="Catalog pagination">
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
                    You have viewed all {countLabel} in this curation
                  </span>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {/* Mobile & Tablet Slide-Over Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        products={products}
        filteredCount={filteredProducts.length}
        filterState={filterState}
        onFilterChange={setFilterState}
        onResetFilters={handleClearAll}
      />
    </div>
  );
};
