import React from 'react';
import { navigateTo } from '../../utils/navigation';
import './BrandLogo.css';

export interface BrandLogoProps {
  variant?: 'primary' | 'emblem' | 'wordmark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  clickable?: boolean;
  withGlow?: boolean;
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  clickable = true,
  withGlow = false,
  showSubtitle = true,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (!clickable) return;
    e.preventDefault();
    navigateTo('/');
  };

  return (
    <div
      className={`toc-brand-logo-root variant-${variant} size-${size} ${withGlow ? 'has-gold-glow' : ''} ${className}`}
      onClick={clickable ? handleClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigateTo('/');
              }
            }
          : undefined
      }
      aria-label="THE OUTFIT CLUB — Home"
    >
      {/* 1. EMBLEM ICON (Used in 'primary' and 'emblem' variants) */}
      {(variant === 'primary' || variant === 'emblem') && (
        <div className="toc-emblem-wrapper">
          <img
            src="/assets/brand/toc-emblem-gold.jpg"
            alt="The Outfit Club Royal Emblem"
            className="toc-emblem-img"
            loading="eager"
            onError={(e) => {
              // Fallback to SVG emblem if image fails to load
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.toc-emblem-svg-fallback');
              if (fallback) (fallback as HTMLElement).style.display = 'block';
            }}
          />
          {/* Vector SVG fallback with metallic gold gradients */}
          <svg
            className="toc-emblem-svg-fallback"
            viewBox="0 0 100 100"
            style={{ display: 'none' }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="tocGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCEBA6" />
                <stop offset="40%" stopColor="#D4AF37" />
                <stop offset="70%" stopColor="#AA771C" />
                <stop offset="100%" stopColor="#E5C158" />
              </linearGradient>
            </defs>
            {/* Crown */}
            <path d="M25 35 C35 32, 65 32, 75 35 L73 40 C65 37, 35 37, 27 40 Z" fill="url(#tocGoldGrad)" />
            <path d="M47 35 L50 20 L53 35 Z" fill="url(#tocGoldGrad)" />
            <circle cx="50" cy="18" r="2.5" fill="url(#tocGoldGrad)" />
            <path d="M36 35 L37 25 L42 35 Z" fill="url(#tocGoldGrad)" />
            <path d="M64 35 L63 25 L58 35 Z" fill="url(#tocGoldGrad)" />
            {/* TOC Monogram */}
            <path d="M28 44 L72 44 L70 48 L53 48 L53 82 L47 82 L47 48 L30 48 Z" fill="url(#tocGoldGrad)" />
            <ellipse cx="50" cy="63" rx="16" ry="18" fill="none" stroke="url(#tocGoldGrad)" strokeWidth="4.5" />
            <path d="M62 52 C56 48, 42 48, 36 56 C30 64, 32 72, 40 77 C46 80, 58 80, 64 73" fill="none" stroke="url(#tocGoldGrad)" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* 2. TYPOGRAPHIC WORDMARK (Used in 'primary' and 'wordmark' variants) */}
      {(variant === 'primary' || variant === 'wordmark') && (
        <div className="toc-wordmark-wrapper">
          <div className="toc-main-brand-title">
            <span className="gold-shimmer-text">THE OUTFIT CLUB</span>
          </div>
          {showSubtitle && (
            <div className="toc-brand-subheading">
              <span className="gold-divider-dot">◆</span>
              <span className="subheading-text">EST. 2026 • ATELIER & STREETWEAR</span>
              <span className="gold-divider-dot">◆</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Reusable subtle background brand watermark
 */
export const BrandWatermark: React.FC<{
  opacity?: number;
  size?: number | string;
  className?: string;
}> = ({ opacity = 0.035, size = 420, className = '' }) => {
  return (
    <div
      className={`toc-brand-watermark ${className}`}
      style={{
        opacity,
        maxWidth: size,
        maxHeight: size,
      }}
      aria-hidden="true"
    >
      <img
        src="/assets/brand/toc-emblem-gold.jpg"
        alt=""
        className="watermark-emblem-img"
        loading="lazy"
      />
    </div>
  );
};
