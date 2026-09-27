import React from 'react';
import { BRAND_CONFIG } from '../../config/brand.config';
import { BrandLogo } from '../brand/BrandLogo';
import { Button } from '../common/Button';
import './Footer.css';

const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#instagram', icon: '◈' },
  { label: 'TikTok', href: '#tiktok', icon: '◉' },
  { label: 'Pinterest', href: '#pinterest', icon: '◇' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      {/* Gold Rule Divider */}
      <div className="footer-gold-rule" aria-hidden="true">
        <span className="gold-rule-line" />
        <span className="gold-rule-emblem">◆</span>
        <span className="gold-rule-line" />
      </div>

      <div className="container">
        <div className="footer-top-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <BrandLogo
              variant="primary"
              size="sm"
              clickable={false}
              showSubtitle={true}
              className="footer-brand-logo"
            />
            <p className="footer-tagline">
              Premium men's streetwear &amp; contemporary fashion. Curated for the intentional wardrobe.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter email for exclusive drops"
                className="newsletter-input"
                aria-label="Email for exclusive newsletter drops"
              />
              <Button variant="accent" size="sm" type="submit">
                Join
              </Button>
            </form>
            {/* Social Icons */}
            <div className="footer-social-row">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="footer-social-btn"
                  aria-label={s.label}
                  title={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="footer-heading">Collections</h4>
            <div className="footer-links">
              <a href="#new-in" className="footer-link">New Arrivals</a>
              <a href="#streetwear" className="footer-link">Streetwear</a>
              <a href="#oversized" className="footer-link">Oversized Tees</a>
              <a href="#baggy-pants" className="footer-link">Baggy &amp; Cargo Pants</a>
              <a href="#accessories" className="footer-link">Accessories</a>
            </div>
          </div>

          {/* Outfit Studio */}
          <div>
            <h4 className="footer-heading">The Studio</h4>
            <div className="footer-links">
              <a href="#outfit-builder" className="footer-link">Outfit Builder</a>
              <a href="#curated-looks" className="footer-link">Curated Looks</a>
              <a href="#styling-guide" className="footer-link">Styling Guide</a>
              <a href="#sizing-guide" className="footer-link">Sizing Guide</a>
              <a href="#editorial" className="footer-link">Journal &amp; Insights</a>
            </div>
          </div>

          {/* Client Care */}
          <div>
            <h4 className="footer-heading">Client Care</h4>
            <div className="footer-links">
              <a href="#orders" className="footer-link">Order Status</a>
              <a href="#shipping" className="footer-link">Global Delivery</a>
              <a href="#returns" className="footer-link">Free Returns</a>
              <a href="#contact" className="footer-link">{BRAND_CONFIG.contactEmail}</a>
              <a href="#sustainability" className="footer-link">Conscious Sourcing</a>
            </div>
          </div>
        </div>

        {/* Bottom Legal Strip */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} <span className="footer-brand-name">THE OUTFIT CLUB</span>. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <a href="#privacy" className="footer-link">Privacy Policy</a>
            <span className="footer-separator" aria-hidden="true">◆</span>
            <a href="#terms" className="footer-link">Terms of Service</a>
            <span className="footer-separator" aria-hidden="true">◆</span>
            <a href="#cookies" className="footer-link">Cookies</a>
            <span className="footer-separator" aria-hidden="true">◆</span>
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => window.dispatchEvent(new CustomEvent('replay-brand-intro'))}
              title="Replay brand intro animation"
            >
              Replay Intro
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
