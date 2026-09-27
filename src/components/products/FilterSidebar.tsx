import React, { useState } from 'react';
import type {
  CatalogFilterState,
  ProductCategory,
  ProductFit,
  ProductAesthetic,
  ProductAvailability,
  ProductItem,
} from '../../types';
import {
  getAllCategories,
  getAllFits,
  getAllAesthetics,
  getAvailableSubcategories,
  getAvailableSizes,
  getAvailableColors,
  getMinMaxPrice,
} from '../../data/products';
import { ChevronDownIcon, CheckIcon } from '../common/Icons';
import './FilterSidebar.css';

export interface FilterSidebarProps {
  products: ProductItem[];
  filterState: CatalogFilterState;
  onFilterChange: (nextState: CatalogFilterState) => void;
  onResetFilters: () => void;
  className?: string;
  hideHeader?: boolean;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  products,
  filterState,
  onFilterChange,
  onResetFilters,
  className = '',
  hideHeader = false,
}) => {
  // Accordion open/close state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    subcategories: true,
    price: true,
    sizes: true,
    colors: true,
    fits: true,
    aesthetics: false,
    availability: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Metadata derived from catalog
  const allCategories = getAllCategories();
  const availableSubcategories = getAvailableSubcategories(products, filterState.categories);
  const availableSizes = getAvailableSizes(products, filterState.categories);
  const availableColors = getAvailableColors(products);
  const allFits = getAllFits();
  const allAesthetics = getAllAesthetics();
  const priceBounds = getMinMaxPrice(products);

  // Compute active filters count
  const activeCount =
    filterState.categories.length +
    filterState.subcategories.length +
    filterState.sizes.length +
    filterState.colors.length +
    filterState.fits.length +
    filterState.aesthetics.length +
    filterState.availability.length +
    (filterState.priceRange.min > priceBounds.min || filterState.priceRange.max < priceBounds.max ? 1 : 0);

  // 1. Toggle Category
  const handleCategoryToggle = (category: ProductCategory) => {
    const exists = filterState.categories.includes(category);
    const nextCategories = exists
      ? filterState.categories.filter((c) => c !== category)
      : [...filterState.categories, category];

    // Clear subcategories that no longer apply to remaining categories
    const nextAvailableSubs = getAvailableSubcategories(products, nextCategories);
    const validSubs = filterState.subcategories.filter((s) => nextAvailableSubs.includes(s));

    onFilterChange({
      ...filterState,
      categories: nextCategories,
      subcategories: validSubs,
    });
  };

  // 2. Toggle Subcategory
  const handleSubcategoryToggle = (subcategory: string) => {
    const exists = filterState.subcategories.includes(subcategory);
    const nextSubs = exists
      ? filterState.subcategories.filter((s) => s !== subcategory)
      : [...filterState.subcategories, subcategory];
    onFilterChange({ ...filterState, subcategories: nextSubs });
  };

  // 3. Price change
  const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val <= filterState.priceRange.max) {
      onFilterChange({
        ...filterState,
        priceRange: { ...filterState.priceRange, min: val },
      });
    }
  };

  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= filterState.priceRange.min) {
      onFilterChange({
        ...filterState,
        priceRange: { ...filterState.priceRange, max: val },
      });
    }
  };

  const handlePriceSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onFilterChange({
      ...filterState,
      priceRange: { ...filterState.priceRange, max: val },
    });
  };

  // 4. Toggle Size
  const handleSizeToggle = (size: string) => {
    const exists = filterState.sizes.includes(size);
    const nextSizes = exists
      ? filterState.sizes.filter((s) => s !== size)
      : [...filterState.sizes, size];
    onFilterChange({ ...filterState, sizes: nextSizes });
  };

  // 5. Toggle Color
  const handleColorToggle = (colorName: string) => {
    const exists = filterState.colors.includes(colorName);
    const nextColors = exists
      ? filterState.colors.filter((c) => c !== colorName)
      : [...filterState.colors, colorName];
    onFilterChange({ ...filterState, colors: nextColors });
  };

  // 6. Toggle Fit
  const handleFitToggle = (fit: ProductFit) => {
    const exists = filterState.fits.includes(fit);
    const nextFits = exists
      ? filterState.fits.filter((f) => f !== fit)
      : [...filterState.fits, fit];
    onFilterChange({ ...filterState, fits: nextFits });
  };

  // 7. Toggle Aesthetic
  const handleAestheticToggle = (aes: ProductAesthetic) => {
    const exists = filterState.aesthetics.includes(aes);
    const nextAesthetics = exists
      ? filterState.aesthetics.filter((a) => a !== aes)
      : [...filterState.aesthetics, aes];
    onFilterChange({ ...filterState, aesthetics: nextAesthetics });
  };

  // 8. Toggle Availability
  const handleAvailabilityToggle = (av: ProductAvailability) => {
    const exists = filterState.availability.includes(av);
    const nextAv = exists
      ? filterState.availability.filter((a) => a !== av)
      : [...filterState.availability, av];
    onFilterChange({ ...filterState, availability: nextAv });
  };

  return (
    <aside className={`filter-sidebar ${className}`} aria-label="Product Filters">
      {/* Sidebar Top Header */}
      {!hideHeader && (
        <div className="filter-sidebar-header">
          <div className="filter-sidebar-title">
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="filter-active-count">{activeCount}</span>
            )}
          </div>
          <button
            type="button"
            className="filter-reset-action"
            onClick={onResetFilters}
            disabled={activeCount === 0 && filterState.searchQuery === ''}
          >
            Reset
          </button>
        </div>
      )}

      {/* Accordion 1: Categories */}
      <div className="filter-accordion-group">
        <button
          type="button"
          className="filter-accordion-header"
          onClick={() => toggleSection('categories')}
          aria-expanded={openSections.categories}
        >
          <span>Category</span>
          <ChevronDownIcon
            size={16}
            className={`filter-accordion-icon ${openSections.categories ? 'open' : ''}`}
          />
        </button>
        {openSections.categories && (
          <div className="filter-accordion-body">
            {allCategories.map((cat) => {
              const isChecked = filterState.categories.includes(cat);
              const count = products.filter((p) => p.category === cat).length;
              return (
                <label key={cat} className="filter-checkbox-row">
                  <span className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCategoryToggle(cat)}
                      className="filter-checkbox-input"
                    />
                    <span>{cat}</span>
                  </span>
                  <span className="filter-item-count">{count}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Accordion 2: Subcategories */}
      {availableSubcategories.length > 0 && (
        <div className="filter-accordion-group">
          <button
            type="button"
            className="filter-accordion-header"
            onClick={() => toggleSection('subcategories')}
            aria-expanded={openSections.subcategories}
          >
            <span>Subcategory</span>
            <ChevronDownIcon
              size={16}
              className={`filter-accordion-icon ${openSections.subcategories ? 'open' : ''}`}
            />
          </button>
          {openSections.subcategories && (
            <div className="filter-accordion-body">
              {availableSubcategories.map((sub) => {
                const isChecked = filterState.subcategories.includes(sub);
                const count = products.filter((p) => p.subcategory === sub).length;
                return (
                  <label key={sub} className="filter-checkbox-row">
                    <span className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSubcategoryToggle(sub)}
                        className="filter-checkbox-input"
                      />
                      <span>{sub}</span>
                    </span>
                    <span className="filter-item-count">{count}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Accordion 3: Price Range */}
      <div className="filter-accordion-group">
        <button
          type="button"
          className="filter-accordion-header"
          onClick={() => toggleSection('price')}
          aria-expanded={openSections.price}
        >
          <span>Price Range</span>
          <ChevronDownIcon
            size={16}
            className={`filter-accordion-icon ${openSections.price ? 'open' : ''}`}
          />
        </button>
        {openSections.price && (
          <div className="filter-accordion-body">
            {/* Quick Price Range Presets */}
            <div className="filter-price-presets" aria-label="Price range presets">
              {[
                { label: 'Under $100', min: priceBounds.min, max: 100 },
                { label: '$100–$200', min: 100, max: 200 },
                { label: '$200–$350', min: 200, max: 350 },
                { label: '$350+', min: 350, max: priceBounds.max },
              ].map((preset) => {
                const isActive =
                  filterState.priceRange.min === preset.min &&
                  filterState.priceRange.max === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    className={`filter-price-preset-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (isActive) {
                        onFilterChange({
                          ...filterState,
                          priceRange: { min: priceBounds.min, max: priceBounds.max },
                        });
                      } else {
                        onFilterChange({
                          ...filterState,
                          priceRange: { min: preset.min, max: preset.max },
                        });
                      }
                    }}
                    aria-pressed={isActive}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="price-inputs-row">
              <div className="price-input-box">
                <span className="price-currency-symbol">$</span>
                <input
                  type="number"
                  min={priceBounds.min}
                  max={filterState.priceRange.max}
                  value={filterState.priceRange.min}
                  onChange={handlePriceMinChange}
                  className="price-number-input"
                  aria-label="Minimum price"
                />
              </div>
              <span style={{ color: 'var(--color-neutral-400)' }}>–</span>
              <div className="price-input-box">
                <span className="price-currency-symbol">$</span>
                <input
                  type="number"
                  min={filterState.priceRange.min}
                  max={priceBounds.max}
                  value={filterState.priceRange.max}
                  onChange={handlePriceMaxChange}
                  className="price-number-input"
                  aria-label="Maximum price"
                />
              </div>
            </div>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={filterState.priceRange.max}
              onChange={handlePriceSliderChange}
              className="price-range-slider"
              aria-label="Adjust maximum price slider"
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.65rem',
                color: 'var(--color-neutral-400)',
              }}
            >
              <span>${priceBounds.min}</span>
              <span>${priceBounds.max}</span>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 4: Sizes */}
      {availableSizes.length > 0 && (
        <div className="filter-accordion-group">
          <button
            type="button"
            className="filter-accordion-header"
            onClick={() => toggleSection('sizes')}
            aria-expanded={openSections.sizes}
          >
            <span>Size</span>
            <ChevronDownIcon
              size={16}
              className={`filter-accordion-icon ${openSections.sizes ? 'open' : ''}`}
            />
          </button>
          {openSections.sizes && (
            <div className="filter-accordion-body">
              <div className="size-chips-grid">
                {availableSizes.map((size) => {
                  const isSelected = filterState.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      className={`size-chip-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSizeToggle(size)}
                      aria-label={`Size ${size}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accordion 5: Colors */}
      {availableColors.length > 0 && (
        <div className="filter-accordion-group">
          <button
            type="button"
            className="filter-accordion-header"
            onClick={() => toggleSection('colors')}
            aria-expanded={openSections.colors}
          >
            <span>Color</span>
            <ChevronDownIcon
              size={16}
              className={`filter-accordion-icon ${openSections.colors ? 'open' : ''}`}
            />
          </button>
          {openSections.colors && (
            <div className="filter-accordion-body">
              <div className="colors-swatch-grid">
                {availableColors.map((color) => {
                  const isSelected = filterState.colors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      type="button"
                      className={`color-filter-swatch ${isSelected ? 'active' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => handleColorToggle(color.name)}
                      title={color.name}
                      aria-label={`Filter by color: ${color.name}`}
                    >
                      {isSelected && <CheckIcon size={12} className="color-swatch-check" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accordion 6: Fits */}
      <div className="filter-accordion-group">
        <button
          type="button"
          className="filter-accordion-header"
          onClick={() => toggleSection('fits')}
          aria-expanded={openSections.fits}
        >
          <span>Fit</span>
          <ChevronDownIcon
            size={16}
            className={`filter-accordion-icon ${openSections.fits ? 'open' : ''}`}
          />
        </button>
        {openSections.fits && (
          <div className="filter-accordion-body">
            <div className="filter-pills-wrap">
              {allFits.map((fit) => {
                const isSelected = filterState.fits.includes(fit);
                return (
                  <button
                    key={fit}
                    type="button"
                    className={`filter-pill-option ${isSelected ? 'active' : ''}`}
                    onClick={() => handleFitToggle(fit)}
                  >
                    {fit}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Accordion 7: Aesthetics */}
      <div className="filter-accordion-group">
        <button
          type="button"
          className="filter-accordion-header"
          onClick={() => toggleSection('aesthetics')}
          aria-expanded={openSections.aesthetics}
        >
          <span>Aesthetic</span>
          <ChevronDownIcon
            size={16}
            className={`filter-accordion-icon ${openSections.aesthetics ? 'open' : ''}`}
          />
        </button>
        {openSections.aesthetics && (
          <div className="filter-accordion-body">
            <div className="filter-pills-wrap">
              {allAesthetics.map((aes) => {
                const isSelected = filterState.aesthetics.includes(aes);
                return (
                  <button
                    key={aes}
                    type="button"
                    className={`filter-pill-option ${isSelected ? 'active' : ''}`}
                    onClick={() => handleAestheticToggle(aes)}
                  >
                    {aes}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Accordion 8: Availability */}
      <div className="filter-accordion-group" style={{ borderBottom: 'none' }}>
        <button
          type="button"
          className="filter-accordion-header"
          onClick={() => toggleSection('availability')}
          aria-expanded={openSections.availability}
        >
          <span>Availability</span>
          <ChevronDownIcon
            size={16}
            className={`filter-accordion-icon ${openSections.availability ? 'open' : ''}`}
          />
        </button>
        {openSections.availability && (
          <div className="filter-accordion-body">
            {[
              { id: 'in-stock', label: 'In Stock' },
              { id: 'low-stock', label: 'Low Stock' },
              { id: 'pre-order', label: 'Pre-Order' },
            ].map((item) => {
              const isChecked = filterState.availability.includes(item.id as ProductAvailability);
              return (
                <label key={item.id} className="filter-checkbox-row">
                  <span className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleAvailabilityToggle(item.id as ProductAvailability)}
                      className="filter-checkbox-input"
                    />
                    <span>{item.label}</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
