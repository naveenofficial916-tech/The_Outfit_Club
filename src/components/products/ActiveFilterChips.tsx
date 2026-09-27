import React from 'react';
import type { CatalogFilterState } from '../../types';
import { CloseIcon } from '../common/Icons';
import './ActiveFilterChips.css';

export interface ActiveFilterChipsProps {
  filterState: CatalogFilterState;
  resultCount: number;
  defaultPriceRange: { min: number; max: number };
  onRemoveCategory: (category: string) => void;
  onRemoveSubcategory: (subcategory: string) => void;
  onRemoveSize: (size: string) => void;
  onRemoveColor: (color: string) => void;
  onRemoveFit: (fit: string) => void;
  onRemoveAesthetic: (aesthetic: string) => void;
  onRemoveAvailability: (availability: string) => void;
  onResetPriceRange: () => void;
  onClearSearch: () => void;
  onClearAll: () => void;
  className?: string;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filterState,
  resultCount,
  defaultPriceRange,
  onRemoveCategory,
  onRemoveSubcategory,
  onRemoveSize,
  onRemoveColor,
  onRemoveFit,
  onRemoveAesthetic,
  onRemoveAvailability,
  onResetPriceRange,
  onClearSearch,
  onClearAll,
  className = '',
}) => {
  const isPriceFiltered =
    filterState.priceRange.min > defaultPriceRange.min ||
    filterState.priceRange.max < defaultPriceRange.max;

  const hasActiveFilters =
    filterState.searchQuery.trim() !== '' ||
    filterState.categories.length > 0 ||
    filterState.subcategories.length > 0 ||
    filterState.sizes.length > 0 ||
    filterState.colors.length > 0 ||
    filterState.fits.length > 0 ||
    filterState.aesthetics.length > 0 ||
    filterState.availability.length > 0 ||
    isPriceFiltered;

  // Format count text: "1 piece" vs "36 pieces" vs "No pieces found"
  const countText =
    resultCount === 0
      ? 'No pieces found'
      : resultCount === 1
      ? '1 piece'
      : `${resultCount} pieces`;

  return (
    <div className={`active-filters-container ${className}`}>
      {/* Active Chips List */}
      <div className="active-chips-list" aria-label="Active Filters">
        {/* Search Chip */}
        {filterState.searchQuery.trim() !== '' && (
          <span className="filter-chip">
            <span className="filter-chip-label">Search:</span>
            <span className="filter-chip-value">"{filterState.searchQuery}"</span>
            <button
              type="button"
              className="filter-chip-remove"
              onClick={onClearSearch}
              aria-label="Remove search filter"
            >
              <CloseIcon size={12} />
            </button>
          </span>
        )}

        {/* Categories */}
        {filterState.categories.map((cat) => (
          <span key={`cat-${cat}`} className="filter-chip">
            <span className="filter-chip-label">Category:</span>
            <span className="filter-chip-value">{cat}</span>
            <button
              type="button"
              className="filter-chip-remove"
              onClick={() => onRemoveCategory(cat)}
              aria-label={`Remove category filter: ${cat}`}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        ))}

        {/* Subcategories */}
        {filterState.subcategories.map((sub) => (
          <span key={`sub-${sub}`} className="filter-chip">
            <span className="filter-chip-label">Subcategory:</span>
            <span className="filter-chip-value">{sub}</span>
            <button
              type="button"
              className="filter-chip-remove"
              onClick={() => onRemoveSubcategory(sub)}
              aria-label={`Remove subcategory filter: ${sub}`}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        ))}

        {/* Price Range */}
        {isPriceFiltered && (
          <span className="filter-chip">
            <span className="filter-chip-label">Price:</span>
            <span className="filter-chip-value">
              ${filterState.priceRange.min} – ${filterState.priceRange.max}
            </span>
            <button
              type="button"
              className="filter-chip-remove"
              onClick={onResetPriceRange}
              aria-label="Reset price filter"
            >
              <CloseIcon size={12} />
            </button>
          </span>
        )}

        {/* Sizes */}
        {filterState.sizes.map((size) => (
          <span key={`size-${size}`} className="filter-chip">
            <span className="filter-chip-label">Size:</span>
            <span className="filter-chip-value">{size}</span>
            <button
              type="button"
              className="filter-chip-remove"
              onClick={() => onRemoveSize(size)}
              aria-label={`Remove size filter: ${size}`}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        ))}

        {/* Colors */}
        {filterState.colors.map((color) => (
          <span key={`color-${color}`} className="filter-chip">
            <span className="filter-chip-label">Color:</span>
            <span className="filter-chip-value">{color}</span>
            <button
              type="button"
              className="filter-chip-remove"
              onClick={() => onRemoveColor(color)}
              aria-label={`Remove color filter: ${color}`}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        ))}

        {/* Fits */}
        {filterState.fits.map((fit) => (
          <span key={`fit-${fit}`} className="filter-chip">
            <span className="filter-chip-label">Fit:</span>
            <span className="filter-chip-value">{fit}</span>
            <button
              type="button"
              className="filter-chip-remove"
              onClick={() => onRemoveFit(fit)}
              aria-label={`Remove fit filter: ${fit}`}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        ))}

        {/* Aesthetics */}
        {filterState.aesthetics.map((aes) => (
          <span key={`aes-${aes}`} className="filter-chip">
            <span className="filter-chip-label">Aesthetic:</span>
            <span className="filter-chip-value">{aes}</span>
            <button
              type="button"
              className="filter-chip-remove"
              onClick={() => onRemoveAesthetic(aes)}
              aria-label={`Remove aesthetic filter: ${aes}`}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        ))}

        {/* Availability */}
        {filterState.availability.map((av) => (
          <span key={`av-${av}`} className="filter-chip">
            <span className="filter-chip-label">Availability:</span>
            <span className="filter-chip-value">
              {av === 'in-stock'
                ? 'In Stock'
                : av === 'low-stock'
                ? 'Low Stock'
                : av === 'pre-order'
                ? 'Pre-Order'
                : 'Out of Stock'}
            </span>
            <button
              type="button"
              className="filter-chip-remove"
              onClick={() => onRemoveAvailability(av)}
              aria-label={`Remove availability filter: ${av}`}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        ))}

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="clear-all-btn"
            onClick={onClearAll}
            aria-label="Clear all active filters"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Result Count Indicator */}
      <span className="result-count-indicator" aria-live="polite">
        {countText}
      </span>
    </div>
  );
};
