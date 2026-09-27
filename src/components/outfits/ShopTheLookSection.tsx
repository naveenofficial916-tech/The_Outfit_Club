import React from 'react';
import { getFeaturedOutfits } from '../../data/outfits';
import { OutfitCard } from './OutfitCard';
import { ArrowRightIcon, SparklesIcon } from '../common/Icons';
import { navigateTo } from '../../utils/navigation';
import './ShopTheLookSection.css';

export interface ShopTheLookSectionProps {
  className?: string;
  limit?: number;
}

export const ShopTheLookSection: React.FC<ShopTheLookSectionProps> = ({
  className = '',
  limit = 3,
}) => {
  const outfits = getFeaturedOutfits().slice(0, limit);

  if (outfits.length === 0) {
    return null;
  }

  return (
    <section className={`shop-the-look-section container ${className}`} aria-labelledby="shop-the-look-title">
      <div className="shop-the-look-header">
        <div className="shop-the-look-headings">
          <div className="section-label">
            <SparklesIcon size={13} /> VISUAL MERCHANDISING
          </div>
          <h2 id="shop-the-look-title" className="shop-the-look-title">
            SHOP THE LOOK — CURATED MEN'S EDITS
          </h2>
          <p className="shop-the-look-subtitle">
            Complete head-to-toe silhouettes coordinated by our atelier stylists. Explore balanced proportions, relaxed volumes, and architectural menswear tailoring.
          </p>
        </div>

        <button
          type="button"
          className="shop-the-look-view-all-btn"
          onClick={() => navigateTo('/looks/oversized-streetwear-look')}
          aria-label="Explore all curated looks"
        >
          <span>ALL LOOKS</span>
          <ArrowRightIcon size={14} />
        </button>
      </div>

      <div className="shop-the-look-grid">
        {outfits.map((outfit) => (
          <OutfitCard key={outfit.id} outfit={outfit} />
        ))}
      </div>
    </section>
  );
};
