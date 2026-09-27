import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { ProductItem } from '../../types';
import { ProductCard } from './ProductCard';
import { ChevronLeftIcon, ChevronRightIcon } from '../common/Icons';
import './ProductRail.css';

export interface ProductRailProps {
  title: string;
  eyebrow?: string;
  description?: string;
  products: ProductItem[];
  roleMap?: Record<string, string>; // Optional role badges (e.g., Complete the Look)
  onWishlistToggle?: (product: ProductItem) => void;
  onQuickAdd?: (product: ProductItem, size: string) => void;
  onQuickView?: (product: ProductItem) => void;
  onClear?: () => void;
  clearLabel?: string;
  className?: string;
  id?: string;
}

export const ProductRail: React.FC<ProductRailProps> = ({
  title,
  eyebrow,
  description,
  products,
  roleMap,
  onWishlistToggle,
  onQuickAdd,
  onQuickView,
  onClear,
  clearLabel = 'Clear All',
  className = '',
  id,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = trackRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, products]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={`product-rail-section ${className}`} id={id} aria-labelledby={`${id || 'rail'}-title`}>
      <div className="product-rail-header">
        <div className="product-rail-headings">
          {eyebrow && <span className="product-rail-eyebrow">{eyebrow}</span>}
          <h2 id={`${id || 'rail'}-title`} className="product-rail-title">
            {title}
          </h2>
          {description && <p className="product-rail-desc">{description}</p>}
        </div>

        <div className="product-rail-controls">
          {onClear && (
            <button
              type="button"
              className="product-rail-clear-btn"
              onClick={onClear}
              aria-label={`Clear ${title}`}
            >
              [ {clearLabel.toUpperCase()} ]
            </button>
          )}

          <div className="product-rail-arrows" aria-hidden="false">
            <button
              type="button"
              className="rail-arrow-btn"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeftIcon size={16} />
            </button>
            <button
              type="button"
              className="rail-arrow-btn"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        className="product-rail-track"
        ref={trackRef}
        role="region"
        aria-label={`${title} carousel`}
        tabIndex={0}
      >
        {products.map((product) => (
          <div key={product.id} className="product-rail-item">
            {roleMap && roleMap[product.id] && (
              <span className="product-rail-role-badge">
                {roleMap[product.id]}
              </span>
            )}
            <ProductCard
              product={product}
              onWishlistToggle={onWishlistToggle}
              onQuickAdd={onQuickAdd}
              onQuickView={onQuickView}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
