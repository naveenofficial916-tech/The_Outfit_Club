import React from 'react';
import './ProductCardSkeleton.css';

export interface ProductCardSkeletonProps {
  className?: string;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`product-card-skeleton ${className}`} aria-hidden="true">
      <div className="skeleton-image skeleton-pulse" />
      <div className="skeleton-body">
        <div className="skeleton-meta skeleton-pulse" />
        <div className="skeleton-title skeleton-pulse" />
        <div className="skeleton-title-sub skeleton-pulse" />
        <div className="skeleton-swatches">
          <div className="skeleton-swatch skeleton-pulse" />
          <div className="skeleton-swatch skeleton-pulse" />
          <div className="skeleton-swatch skeleton-pulse" />
        </div>
        <div className="skeleton-price skeleton-pulse" />
      </div>
    </div>
  );
};
