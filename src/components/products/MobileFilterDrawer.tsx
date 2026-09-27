import React, { useEffect } from 'react';
import type { CatalogFilterState, ProductItem } from '../../types';
import { FilterSidebar } from './FilterSidebar';
import { Button } from '../common/Button';
import { CloseIcon } from '../common/Icons';
import './MobileFilterDrawer.css';

export interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  filteredCount: number;
  filterState: CatalogFilterState;
  onFilterChange: (nextState: CatalogFilterState) => void;
  onResetFilters: () => void;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  products,
  filteredCount,
  filterState,
  onFilterChange,
  onResetFilters,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`mobile-filter-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <div
        className={`mobile-filter-drawer ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filter Collection"
      >
        {/* Header */}
        <div className="mobile-drawer-top-bar">
          <div className="mobile-drawer-title">Filters</div>
          <button
            type="button"
            className="mobile-drawer-close-btn"
            onClick={onClose}
            aria-label="Close filters drawer"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="mobile-drawer-content">
          <FilterSidebar
            products={products}
            filterState={filterState}
            onFilterChange={onFilterChange}
            onResetFilters={onResetFilters}
            hideHeader={false}
          />
        </div>

        {/* Bottom Actions Footer */}
        <div className="mobile-drawer-footer">
          <Button
            variant="secondary"
            size="md"
            onClick={onResetFilters}
            style={{ flex: 1 }}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            style={{ flex: 2 }}
          >
            View {filteredCount} {filteredCount === 1 ? 'Piece' : 'Pieces'}
          </Button>
        </div>
      </div>
    </>
  );
};
