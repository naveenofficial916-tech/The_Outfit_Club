import React from 'react';
import type { CuratedOutfit } from '../../types/outfit';
import { ArrowRightIcon, SparklesIcon } from '../common/Icons';
import { navigateTo } from '../../utils/navigation';
import './OutfitCard.css';

export interface OutfitCardProps {
  outfit: CuratedOutfit;
  className?: string;
  onExplore?: (outfit: CuratedOutfit) => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  className = '',
  onExplore,
}) => {
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

  const handleCardClick = () => {
    if (onExplore) {
      onExplore(outfit);
    } else {
      navigateTo(`/looks/${outfit.slug}`);
    }
  };

  return (
    <article
      className={`outfit-card ${className}`}
      id={`outfit-${outfit.id}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Explore outfit: ${outfit.name}`}
    >
      {/* Visual Collage of Outfit Pieces */}
      <div className="outfit-card-visual-wrap">
        <div className="outfit-collage-grid">
          {outfit.pieces.slice(0, 3).map((piece, idx) => (
            <div
              key={`${piece.product.id}-${idx}`}
              className={`outfit-collage-item item-${idx + 1}`}
            >
              <img
                src={piece.product.thumbnail || piece.product.images[0]}
                alt={`${piece.roleLabel} - ${piece.product.name}`}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <span className="outfit-item-role-chip">{piece.roleLabel}</span>
            </div>
          ))}
        </div>

        {/* Top Badges */}
        <div className="outfit-card-badges">
          <span className="outfit-badge-pieces">
            {outfit.pieces.length} PIECES
          </span>
          {outfit.aesthetic && (
            <span className="outfit-badge-aesthetic">
              {outfit.aesthetic.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Outfit Information */}
      <div className="outfit-card-content">
        <div className="outfit-card-header">
          <span className="outfit-curation-label">
            <SparklesIcon size={12} /> COMPLETE CURATION
          </span>
          <h3 className="outfit-card-title">{outfit.name}</h3>
          <p className="outfit-card-tagline">{outfit.tagline}</p>
        </div>

        {/* Pricing & CTA */}
        <div className="outfit-card-footer">
          <div className="outfit-pricing">
            <span className="outfit-price-label">COMPLETE LOOK</span>
            <div className="outfit-price-values">
              <span className="outfit-price-current">{formattedTotalPrice}</span>
              {formattedOriginalPrice && (
                <span className="outfit-price-original">
                  {formattedOriginalPrice}
                </span>
              )}
            </div>
          </div>

          <span className="outfit-explore-cta">
            <span>EXPLORE LOOK</span>
            <ArrowRightIcon size={14} />
          </span>
        </div>
      </div>
    </article>
  );
};
