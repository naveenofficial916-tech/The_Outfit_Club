import React, { useState, useMemo } from 'react';
import type {
  ProductItem,
  CatalogFilterState,
  ProductSortOption,
} from '../../types';
import { DEFAULT_FILTER_STATE } from '../../types';
import {
  filterProductsByState,
  sortProducts,
  getMinMaxPrice,
} from '../../data/products';
import { SearchInput } from './SearchInput';
import { FilterSidebar } from './FilterSidebar';
import { ActiveFilterChips } from './ActiveFilterChips';
import { MobileFilterDrawer } from './MobileFilterDrawer';
import { ProductGrid } from './ProductGrid';
import { SlidersIcon } from '../common/Icons';
import './CatalogDiscovery.css';

export interface CatalogDiscoveryProps {
  products: ProductItem[];
  initialCategory?: string;
  onWishlistToggle?: (product: ProductItem) => void;
  onQuickAdd?: (product: ProductItem, size: string) => void;
  className?: string;
}

export const CatalogDiscovery: React.FC<CatalogDiscoveryProps> = ({
  products,
  onWishlistToggle,
  onQuickAdd,
  className = '',
}) => {
  // Master Filter State
  const [filterState, setFilterState] = useState<CatalogFilterState>(DEFAULT_FILTER_STATE);
  const [sortBy, setSortBy] = useState<ProductSortOption>('featured');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Default Price Bounds for reset comparisons
  const defaultPriceRange = useMemo(() => getMinMaxPrice(products), [products]);

  // Derived Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    const matched = filterProductsByState(products, filterState);
    return sortProducts(matched, sortBy);
  }, [products, filterState, sortBy]);

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

  return (
    <div className={`catalog-discovery-container ${className}`}>
      {/* Top Search & Filter Bar */}
      <div className="discovery-top-bar">
        {/* Real-time Search Input */}
        <div className="discovery-search-wrapper">
          <SearchInput
            value={filterState.searchQuery}
            onChange={(q) => setFilterState((prev) => ({ ...prev, searchQuery: q }))}
            onClear={handleClearSearch}
            placeholder="Search men's garments, shirts, jackets, footwear, fits..."
          />
        </div>

        {/* Controls: Mobile Filter Button & Sorting */}
        <div className="discovery-top-controls">
          {/* Mobile Filter Button */}
          <button
            type="button"
            className="mobile-filter-trigger"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open filter sidebar"
          >
            <SlidersIcon size={16} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="mobile-filter-badge">{activeFiltersCount}</span>
            )}
          </button>

          {/* Sort Select */}
          <div className="catalog-sort-wrapper">
            <span className="catalog-sort-label">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
              className="catalog-sort-select"
              aria-label="Sort catalog by"
            >
              <option value="featured">Featured Curation</option>
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Split: Left Sidebar + Right Catalog Grid */}
      <div className="discovery-content-split">
        {/* Left Desktop Filter Sidebar */}
        <aside className="discovery-sidebar-column">
          <FilterSidebar
            products={products}
            filterState={filterState}
            onFilterChange={setFilterState}
            onResetFilters={handleClearAll}
          />
        </aside>

        {/* Right Catalog Main Column */}
        <main className="discovery-catalog-column">
          {/* Active Filter Chips & Result Count */}
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

          {/* Product Grid */}
          <ProductGrid
            products={filteredProducts}
            emptyTitle="No Pieces Found"
            emptyMessage="No pieces match your specific search and filter criteria. Adjust your filters or reset to view all pieces."
            onResetFilters={handleClearAll}
            onWishlistToggle={onWishlistToggle}
            onQuickAdd={onQuickAdd}
          />
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
