import React from 'react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  SparklesIcon,
  CompassIcon,
  LayersIcon,
  ArrowRightIcon,
  SearchIcon,
} from '../components/common/Icons';
import { CatalogDiscovery } from '../components/products/CatalogDiscovery';
import { FeaturedCollections } from '../components/collections/FeaturedCollections';
import { ShopTheLookSection } from '../components/outfits/ShopTheLookSection';
import { PersonalizedDiscoveryRail } from '../components/discovery/PersonalizedDiscoveryRail';
import { ProductRail } from '../components/products/ProductRail';
import { useRecentlyViewed } from '../services/recentlyViewedStore';
import { PRODUCTS_DATA } from '../data/products';
import type { ProductItem } from '../types';
import { navigateTo } from '../utils/navigation';
import './HomePage.css';

const CATEGORIES_SHOWCASE = [
  {
    title: 'TEES & HOODIES',
    subtitle: 'Heavyweight oversized tees, boxy fits & drop-shoulder hoodies.',
    href: '/catalog?category=clothing',
    tag: 'Trending Streetwear',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'CARGO & BAGGY PANTS',
    subtitle: 'Relaxed baggy pants, utilitarian cargos & wide-leg denim.',
    href: '/catalog?category=clothing&subcategory=Trousers',
    tag: 'Trending Fits',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'SHOES & SNEAKERS',
    subtitle: 'Clean minimalist low-tops, chunky retro sneakers & boots.',
    href: '/catalog?category=footwear',
    tag: 'Footwear',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'ACCESSORIES',
    subtitle: 'Full-grain wallets, watches, caps, sunglasses & belts.',
    href: '/catalog?category=accessories',
    tag: 'Men\'s Accents',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
  },
];

export const HomePage: React.FC = () => {
  const { products: recentlyViewed, clear: clearRecentlyViewed } = useRecentlyViewed();

  const handleWishlistToggle = (product: ProductItem) => {
    // UI state feedback - wishlist foundation ready for Module 4 state manager
    console.log(`[Wishlist] Toggled product: ${product.name} (${product.id})`);
  };

  const handleQuickAdd = (product: ProductItem, size: string) => {
    // UI state feedback - quick add foundation ready for Cart Drawer in Module 4
    console.log(`[QuickAdd] Added product: ${product.name}, Size: ${size}`);
  };

  return (
    <main className="home-page">
      {/* Full-Bleed Editorial Campaign Hero (Tasks 2, 3, 4, 5, 6, 7, 8, 9, 10) */}
      <section className="hero-editorial-section" aria-label="Editorial Menswear Campaign">
        {/* Premium Abstract Editorial Background Treatment (No human/person image) */}
        <div className="hero-media-wrap" aria-hidden="true">
          <div className="hero-abstract-layer" />
          <div className="hero-gradient-scrim" />
        </div>

        {/* Editorial Top Metadata Pill (Task 7) */}
        <div className="hero-top-meta container">
          <div className="hero-meta-badge">
            <span className="hero-meta-tag">SS/26 MEN'S COLLECTION</span>
            <span className="hero-meta-sep">â€¢</span>
            <span className="hero-meta-sub">EST. 2026 â€¢ ATELIER / MENSWEAR</span>
          </div>
          <span className="hero-meta-location">THE OUTFIT CLUB ATELIER</span>
        </div>

        {/* Hero Central Content (Tasks 4 & 5) */}
        <div className="container hero-center-container">
          <div className="hero-text-block">
            <div className="hero-brand-eyebrow-row">
              <span className="hero-gold-line" />
              <span className="hero-eyebrow-text">EXCLUSIVELY MENSWEAR</span>
            </div>

            <h1 className="hero-headline">
              THE SEA OF<br />
              <span className="hero-headline-accent">MEN'S CLOTHING</span>
            </h1>

            <p className="hero-tagline">
              Modern menswear for every occasion. Elevated tailoring, Italian footwear,
              and refined wardrobe essentials engineered for the modern man.
            </p>

            <div className="hero-actions-row">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigateTo('/catalog')}
                className="hero-cta-primary"
              >
                SHOP MEN'S COLLECTION <ArrowRightIcon size={16} />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigateTo('/catalog?category=tailoring')}
                className="hero-cta-secondary"
              >
                EXPLORE NEW ARRIVALS
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Footer Bar: Collection Indicator + Category Quick Links (Tasks 8 & 9) */}
        <div className="hero-footer-bar">
          <div className="container hero-footer-inner">
            <div className="hero-indicator">
              <span className="hero-indicator-num">01 / 04</span>
              <span className="hero-indicator-label">MEN'S SARTORIAL CURATION</span>
            </div>

            {/* Category Quick Links (Task 9) */}
            <nav className="hero-quick-links" aria-label="Quick Category Navigation">
              <a
                href="/catalog?category=clothing"
                className="hero-quick-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/catalog?category=clothing');
                }}
              >
                CLOTHING
              </a>
              <span className="hero-quick-sep">â€¢</span>
              <a
                href="/catalog?category=clothing&subcategory=Trousers"
                className="hero-quick-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/catalog?category=clothing&subcategory=Trousers');
                }}
              >
                BAGGY & CARGOS
              </a>
              <span className="hero-quick-sep">â€¢</span>
              <a
                href="/catalog?category=footwear"
                className="hero-quick-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/catalog?category=footwear');
                }}
              >
                SHOES
              </a>
              <span className="hero-quick-sep">â€¢</span>
              <a
                href="/catalog?category=accessories"
                className="hero-quick-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/catalog?category=accessories');
                }}
              >
                ACCESSORIES
              </a>
            </nav>

            <div
              className="hero-scroll-prompt"
              role="button"
              tabIndex={0}
              onClick={() => {
                document.getElementById('shop-by-category')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  document.getElementById('shop-by-category')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <span>SCROLL TO EXPLORE</span>
              <span className="scroll-arrow">â†“</span>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Categories Section (Tasks 11 & 12) */}
      <section className="container categories-showcase-section" id="shop-by-category">
        <div className="section-label">Editorial Categories</div>
        <h2 className="section-title">The Menswear Wardrobe Pillars</h2>

        <div className="categories-grid">
          {CATEGORIES_SHOWCASE.map((cat) => (
            <div
              key={cat.title}
              className="category-card"
              role="button"
              tabIndex={0}
              onClick={() => navigateTo(cat.href)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigateTo(cat.href);
                }
              }}
            >
              <div className="category-image-wrap">
                <img src={cat.image} alt={cat.title} className="category-img" loading="lazy" />
                <span className="category-tag-pill">{cat.tag}</span>
              </div>
              <div className="category-card-body">
                <h3 className="category-card-title">{cat.title}</h3>
                <div className="category-rule" />
                <p className="category-card-sub">{cat.subtitle}</p>
                <span className="category-card-link">
                  Explore {cat.title} <ArrowRightIcon size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Curated Men's Fashion Collections (Task 3.3) */}
      <FeaturedCollections />

      {/* Visual Merchandising: Shop The Look (Task 3.5) */}
      <ShopTheLookSection />

      {/* Personalized Discovery Rail / First-Visit Style Anchor (Task 3.6) */}
      <div className="container">
        <PersonalizedDiscoveryRail limit={6} />
      </div>

      {/* Complete Product Catalog & Discovery System */}
      <section className="container catalog-preview-section" id="catalog-showcase">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div>
            <div className="section-label">Exclusively Menswear</div>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-2)' }}>
              The Spring / Summer Atelier Menswear Collection
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warm-gray)', margin: 0 }}>
              Explore structured overshirts, fine wool tailoring, heavyweight tees, Italian calfskin footwear, and sculptural accessories with real-time multi-attribute filtering.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigateTo('/catalog')}
            aria-label="Browse full menswear catalog"
          >
            Browse All 36 Pieces <ArrowRightIcon size={14} />
          </Button>
        </div>

        {/* CatalogDiscovery master interface: Search + Filter Sidebar + Active Chips + Grid */}
        <CatalogDiscovery
          products={PRODUCTS_DATA}
          onWishlistToggle={handleWishlistToggle}
          onQuickAdd={handleQuickAdd}
        />
      </section>

      {/* Recently Viewed Products Rail */}
      {recentlyViewed.length > 0 && (
        <div className="container">
          <ProductRail
            id="homepage-recently-viewed"
            eyebrow="PREVIOUSLY EXPLORED"
            title="RECENTLY VIEWED"
            products={recentlyViewed}
            onClear={clearRecentlyViewed}
            clearLabel="Clear Recently Viewed"
            onWishlistToggle={handleWishlistToggle}
            onQuickAdd={handleQuickAdd}
          />
        </div>
      )}

      {/* Brand & Platform Pillars */}
      <section className="container pillars-section">
        <div className="section-label">Core Capabilities</div>
        <h2 className="section-title">Architected Exclusively for the Modern Man</h2>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon-wrap">
              <SearchIcon size={22} />
            </div>
            <h3 className="pillar-title">Curated Discovery</h3>
            <p className="pillar-desc">
              Discover oversized tees, baggy pants, footwear, and accessories with instant voice search and fast multi-attribute filtering.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-wrap">
              <LayersIcon size={22} />
            </div>
            <h3 className="pillar-title">Streetwear & Essentials</h3>
            <p className="pillar-desc">
              Curated heavyweight cottons, utilitarian cargo pants, retro sneakers, and everyday men's essentials built for daily wear.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-wrap">
              <SparklesIcon size={22} />
            </div>
            <h3 className="pillar-title">Fit & Sizing Guide</h3>
            <p className="pillar-desc">
              Accurate garment measurements, relaxed boxy silhouettes, and size guidance tailored for confident, effortless shopping.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-wrap">
              <CompassIcon size={22} />
            </div>
            <h3 className="pillar-title">Fast Shipping & Tracking</h3>
            <p className="pillar-desc">
              Fast order fulfillment, real-time package tracking, and seamless returns on all menswear collections.
            </p>
          </div>
        </div>
      </section>

      {/* THE OUTFIT CLUB — About / Brand Manifesto Section */}
      <section className="about-club-section" id="about-club" aria-label="About The Outfit Club">
        <div className="container">
          <div className="about-club-inner">

            <div className="about-club-text-col">
              <div className="section-label">The Outfit Club</div>
              <h2 className="section-title about-club-headline">
                THE SEA OF MEN'S CLOTHING
              </h2>
              <p className="about-club-body">
                THE OUTFIT CLUB is an exclusively men's fashion destination, built from the ground up for the modern man.
                From heavyweight oversized tees and relaxed cargos to Italian calfskin footwear and architectural tailoring —
                every piece in our catalog is selected with intention.
              </p>
              <p className="about-club-body">
                We believe in clothing that does the talking. Confident silhouettes. Enduring quality.
                An effortless wardrobe that carries you from street to studio, meeting room to weekend.
              </p>
              <div className="about-club-pillars">
                <div className="about-pillar">
                  <span className="about-pillar-mark">01</span>
                  <div>
                    <strong>Men's Only.</strong>
                    <span> Every product, every collection, every fit — exclusively engineered for men.</span>
                  </div>
                </div>
                <div className="about-pillar">
                  <span className="about-pillar-mark">02</span>
                  <div>
                    <strong>Uncompromising Quality.</strong>
                    <span> GOTS organic cotton, Italian calfskin, full-grain leather, and Japanese selvedge denim.</span>
                  </div>
                </div>
                <div className="about-pillar">
                  <span className="about-pillar-mark">03</span>
                  <div>
                    <strong>Every Occasion.</strong>
                    <span> From everyday essentials and streetwear to formal tailoring and statement outerwear.</span>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigateTo('/catalog')}
                className="about-club-cta"
              >
                EXPLORE THE COLLECTION <ArrowRightIcon size={14} />
              </Button>
            </div>

            <div className="about-club-stat-col">
              <div className="about-stat-card">
                <span className="about-stat-num">36+</span>
                <span className="about-stat-label">Curated Men's Pieces</span>
              </div>
              <div className="about-stat-card">
                <span className="about-stat-num">6</span>
                <span className="about-stat-label">Signature Collections</span>
              </div>
              <div className="about-stat-card">
                <span className="about-stat-num">100%</span>
                <span className="about-stat-label">Men's Focused</span>
              </div>
              <div className="about-stat-card">
                <span className="about-stat-num">EST. 2026</span>
                <span className="about-stat-label">TOC Atelier</span>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
};
