import React, { useState } from 'react';
import { useCustomerSession } from '../../hooks/useCustomerSession';
import { BRAND_CONFIG, MAIN_NAVIGATION } from '../../config/brand.config';
import { SearchIcon, BagIcon, HeartIcon, UserIcon, MenuIcon, CloseIcon, MicIcon } from '../common/Icons';
import { Badge } from '../common/Badge';
import { navigateTo } from '../../utils/navigation';
import { useCart, cartStore } from '../../services/cartStore';
import { useWishlist } from '../../services/wishlistStore';
import { PRODUCTS_DATA } from '../../data/products';
import { SmartSearchInput } from '../products/SmartSearchInput';
import { BrandLogo } from '../brand/BrandLogo';
import './Header.css';

// Type definitions for web speech recognition
interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isLoggedIn, name } = useCustomerSession();
  const firstName = isLoggedIn ? (name.split(' ')[0] || name) : null;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/')) {
      e.preventDefault();
      navigateTo(href);
      setMobileMenuOpen(false);
    }
  };

  const handleVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as IWindowWithSpeech;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      // Graceful fallback: navigate to search/catalog directly
      navigateTo('/catalog');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        setIsListening(false);
        if (transcript) {
          navigateTo(`/catalog?q=${encodeURIComponent(transcript.trim())}`);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        navigateTo('/catalog');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      navigateTo('/catalog');
    }
  };

  return (
    <header className="site-header">
      <div className="container header-container">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="icon-button mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <MenuIcon size={22} />
        </button>

        {/* Official Brand Royal Logo */}
        <div className="header-logo-wrap">
          <BrandLogo variant="primary" size="md" withGlow={true} />
        </div>

        {/* Desktop Primary Navigation */}
        <nav className="nav-menu" aria-label="Main Navigation">
          {MAIN_NAVIGATION.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="nav-link"
              onClick={(e) => handleLinkClick(e, item.href)}
            >
              <span>{item.label}</span>
              {item.badge && (
                <Badge
                  variant={item.featured ? 'accent' : 'subtle'}
                  className="nav-link-badge"
                >
                  {item.badge}
                </Badge>
              )}
            </a>
          ))}
        </nav>

        {/* Header Action Utilities: Search, Voice Search, Wishlist, Account, Cart */}
        <div className="header-actions">
          <button
            type="button"
            className={`icon-button ${isHeaderSearchOpen ? 'active' : ''}`}
            aria-label="Search collection"
            title="Search products"
            onClick={() => setIsHeaderSearchOpen(!isHeaderSearchOpen)}
            aria-expanded={isHeaderSearchOpen}
          >
            <SearchIcon size={20} />
          </button>

          <button
            type="button"
            className={`icon-button voice-search-btn ${isListening ? 'listening' : ''}`}
            aria-label="Voice search products"
            title={isListening ? 'Listening...' : 'Voice Search (Tap & Speak)'}
            onClick={handleVoiceSearch}
          >
            <MicIcon size={20} />
            {isListening && <span className="listening-pulse" />}
          </button>
          
          <button
            type="button"
            className="icon-button"
            aria-label={`Saved looks and wishlist (${wishlistCount} items)`}
            title="My Wishlist"
            onClick={() => navigateTo('/wishlist')}
          >
            <HeartIcon size={20} />
            {wishlistCount > 0 && <span className="action-count">{wishlistCount}</span>}
          </button>

          <button
            type="button"
            className={`icon-button header-account-btn ${isLoggedIn ? 'is-logged-in' : ''}`}
            aria-label={isLoggedIn ? `My Account — ${name}` : 'Customer account and profile'}
            title={isLoggedIn ? `My Account — ${name}` : 'My Account'}
            onClick={() => navigateTo('/account')}
          >
            <UserIcon size={20} />
            {firstName && (
              <span className="header-account-name">{firstName}</span>
            )}
          </button>

          <button
            type="button"
            className="icon-button"
            aria-label="Shopping bag"
            title="Shopping Bag"
            onClick={() => cartStore.openDrawer()}
          >
            <BagIcon size={20} />
            {cartCount > 0 && <span className="action-count">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Header Search Dropdown Bar */}
      {isHeaderSearchOpen && (
        <div className="header-search-bar-wrap">
          <div className="container header-search-inner">
            <SmartSearchInput
              value=""
              onChange={(q) => {
                if (q.trim()) {
                  setIsHeaderSearchOpen(false);
                  navigateTo(`/catalog?search=${encodeURIComponent(q.trim())}`);
                }
              }}
              onClear={() => setIsHeaderSearchOpen(false)}
              products={PRODUCTS_DATA}
              placeholder="Search oversized tees, baggy pants, streetwear..."
            />
            <button
              type="button"
              className="icon-button header-search-close-btn"
              onClick={() => setIsHeaderSearchOpen(false)}
              aria-label="Close search bar"
            >
              <CloseIcon size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={`mobile-drawer-backdrop ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside
        className={`mobile-drawer ${mobileMenuOpen ? 'active' : ''}`}
        aria-label="Mobile Navigation"
      >
        <div className="drawer-header">
          <BrandLogo variant="primary" size="sm" showSubtitle={false} />
          <button
            type="button"
            className="icon-button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <CloseIcon size={22} />
          </button>
        </div>

        <ul className="mobile-nav-list">
          <li>
            <a
              href="/catalog"
              className="mobile-nav-link"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                navigateTo('/catalog');
              }}
            >
              <span>Search Collection</span>
            </a>
          </li>
          {MAIN_NAVIGATION.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="mobile-nav-link"
                onClick={(e) => handleLinkClick(e, item.href)}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant={item.featured ? 'accent' : 'subtle'}>
                    {item.badge}
                  </Badge>
                )}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/wishlist"
              className="mobile-nav-link"
              onClick={(e) => handleLinkClick(e, '/wishlist')}
            >
              <span>My Wishlist ({wishlistCount})</span>
            </a>
          </li>
          <li>
            <a
              href="/account"
              className="mobile-nav-link"
              onClick={(e) => handleLinkClick(e, '/account')}
            >
              <span>My Account</span>
            </a>
          </li>
          <li>
            <a
              href="/orders"
              className="mobile-nav-link"
              onClick={(e) => handleLinkClick(e, '/orders')}
            >
              <span>Order History</span>
            </a>
          </li>
        </ul>
      </aside>
    </header>
  );
};
