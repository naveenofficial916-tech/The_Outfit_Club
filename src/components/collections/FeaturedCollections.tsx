import React from 'react';
import { getFeaturedCollections, getCollectionProducts } from '../../data/collections';
import { PRODUCTS_DATA } from '../../data/products';
import { ArrowRightIcon } from '../common/Icons';
import { navigateTo } from '../../utils/navigation';
import './FeaturedCollections.css';

export const FeaturedCollections: React.FC = () => {
  const collections = getFeaturedCollections();

  return (
    <section className="container featured-collections-section" aria-label="Curated Men's Collections">
      <div className="section-label">Curated Menswear Edits</div>
      <h2 className="section-title">Explore The Fit</h2>
      <p className="featured-collections-subtitle">
        Curated menswear collections built for oversized silhouettes, relaxed drape, and everyday street fashion.
      </p>

      <div className="featured-collections-grid">
        {collections.map((col) => {
          const count = getCollectionProducts(col, PRODUCTS_DATA).length;
          return (
            <article
              key={col.id}
              className="featured-collection-card"
              onClick={() => navigateTo(`/collections/${col.slug}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigateTo(`/collections/${col.slug}`);
                }
              }}
            >
              <div className="collection-card-img-wrap">
                <img
                  src={col.bannerImage}
                  alt={col.name}
                  className="collection-card-img"
                  loading="lazy"
                />
                <div className="collection-card-scrim" />
                <span className="collection-card-badge">{count} Pieces</span>
              </div>

              <div className="collection-card-overlay-body">
                <h3 className="collection-card-title">{col.name}</h3>
                <p className="collection-card-tagline">{col.tagline}</p>
                <span className="collection-card-cta">
                  Explore Collection <ArrowRightIcon size={14} />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
