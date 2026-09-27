import React from 'react';
import type { ProductItem } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { Button } from '../common/Button';
import { CompassIcon } from '../common/Icons';
import './ProductGrid.css';

export interface ProductGridProps {
  products: ProductItem[];
  isLoading?: boolean;
  skeletonCount?: number;
  viewMode?: 'compact' | 'editorial';
  emptyTitle?: string;
  emptyMessage?: string;
  onResetFilters?: () => void;
  onWishlistToggle?: (product: ProductItem) => void;
  onQuickAdd?: (product: ProductItem, size: string) => void;
  onQuickView?: (product: ProductItem) => void;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  skeletonCount = 8,
  viewMode = 'compact',
  emptyTitle = 'No Pieces Found',
  emptyMessage = 'We could not find any garments matching this specific curation. Explore our full collection or reset your selection.',
  onResetFilters,
  onWishlistToggle,
  onQuickAdd,
  onQuickView,
  className = '',
}) => {
  // Loading State
  if (isLoading) {
    return (
      <div className={`product-grid-container ${className}`}>
        <div className={`product-grid view-${viewMode}`} role="status" aria-label="Loading products">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (products.length === 0) {
    return (
      <div className={`product-grid-container ${className}`}>
        <div className="product-grid-empty" role="region" aria-label="No products found">
          <div className="empty-state-icon-wrap">
            <CompassIcon size={26} />
          </div>
          <h3 className="empty-state-title">{emptyTitle}</h3>
          <p className="empty-state-message">{emptyMessage}</p>
          {onResetFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onResetFilters}
              className="empty-state-action"
            >
              View All Pieces
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Loaded Grid
  return (
    <div className={`product-grid-container ${className}`}>
      <div className={`product-grid view-${viewMode}`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onWishlistToggle={onWishlistToggle}
            onQuickAdd={onQuickAdd}
            onQuickView={onQuickView}
          />
        ))}
      </div>
    </div>
  );
};
