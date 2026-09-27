import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { ProductItem } from '../../types';
import {
  SearchIcon,
  CloseIcon,
  ClockIcon,
  CompassIcon,
  ChevronRightIcon,
} from '../common/Icons';
import {
  recentSearchesService,
  getSearchSuggestions,
  searchProductsWithRelevance,
  CURATED_MEN_EXPLORE_TAGS,
  type SearchSuggestion,
} from '../../utils/searchUtils';
import { discoveryProfileStore } from '../../services/discoveryProfileStore';
import { navigateTo } from '../../utils/navigation';
import './SmartSearchInput.css';

export interface SmartSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  products?: ProductItem[];
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export const SmartSearchInput: React.FC<SmartSearchInputProps> = ({
  value,
  onChange,
  onClear,
  products = [],
  placeholder = 'Search oversized tees, baggy pants, streetwear...',
  debounceMs = 250,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    recentSearchesService.getRecentSearches()
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when external value changes (e.g. on Clear All)
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
  }

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
        if (localValue.trim().length > 1) {
          recentSearchesService.addRecentSearch(localValue.trim());
          setRecentSearches(recentSearchesService.getRecentSearches());
          discoveryProfileStore.recordSearch(localValue.trim());
        }
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localValue, debounceMs, onChange, value]);

  // Dismiss dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Compute live suggestions
  const suggestions: SearchSuggestion[] = useMemo(() => {
    return getSearchSuggestions(products, localValue);
  }, [products, localValue]);

  // Compute top preview product matches
  const productPreviews: ProductItem[] = useMemo(() => {
    if (!localValue.trim() || localValue.trim().length < 2) return [];
    const scored = searchProductsWithRelevance(products, localValue);
    return scored.slice(0, 3).map((item) => item.product);
  }, [products, localValue]);

  // Total navigable items in the active dropdown
  const totalNavItems = useMemo(() => {
    if (localValue.trim().length >= 2) {
      return suggestions.length + productPreviews.length;
    }
    return recentSearches.length + CURATED_MEN_EXPLORE_TAGS.length;
  }, [localValue, suggestions.length, productPreviews.length, recentSearches.length]);

  const handleSelectQuery = (query: string) => {
    setLocalValue(query);
    onChange(query);
    recentSearchesService.addRecentSearch(query);
    setRecentSearches(recentSearchesService.getRecentSearches());
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleRemoveRecent = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    const updated = recentSearchesService.removeRecentSearch(query);
    setRecentSearches(updated);
  };

  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    recentSearchesService.clearRecentSearches();
    setRecentSearches([]);
  };

  const handleClearInput = () => {
    setLocalValue('');
    onClear();
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setHighlightedIndex((prev) => (prev + 1 < totalNavItems ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalNavItems - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0) {
        e.preventDefault();
        // Execute highlighted item
        if (localValue.trim().length >= 2) {
          if (highlightedIndex < suggestions.length) {
            const item = suggestions[highlightedIndex];
            if (item.productSlug) {
              navigateTo(`/product/${item.productSlug}`);
              setIsOpen(false);
            } else {
              handleSelectQuery(item.label);
            }
          } else {
            const prodIndex = highlightedIndex - suggestions.length;
            const prod = productPreviews[prodIndex];
            if (prod) {
              navigateTo(`/product/${prod.slug}`);
              setIsOpen(false);
            }
          }
        } else {
          if (highlightedIndex < recentSearches.length) {
            handleSelectQuery(recentSearches[highlightedIndex]);
          } else {
            const tagIndex = highlightedIndex - recentSearches.length;
            handleSelectQuery(CURATED_MEN_EXPLORE_TAGS[tagIndex]);
          }
        }
      } else {
        // Normal enter submission
        if (localValue.trim()) {
          recentSearchesService.addRecentSearch(localValue.trim());
          setRecentSearches(recentSearchesService.getRecentSearches());
        }
        setIsOpen(false);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`smart-search-container ${className}`}
      role="search"
    >
      <div className={`smart-search-bar ${isOpen ? 'focused' : ''}`}>
        <span className="smart-search-icon" aria-hidden="true">
          <SearchIcon size={18} />
        </span>
        <input
          ref={inputRef}
          type="search"
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setRecentSearches(recentSearchesService.getRecentSearches());
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search collection"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          className="smart-search-input-field"
        />
        {localValue.length > 0 && (
          <button
            type="button"
            onClick={handleClearInput}
            className="smart-search-clear-btn"
            aria-label="Clear search input"
            title="Clear search"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      {/* Smart Search Suggestions Dropdown */}
      {isOpen && (
        <div className="smart-search-dropdown" role="listbox">
          {/* STATE A: Suggestions & Product Matches (query >= 2 chars) */}
          {localValue.trim().length >= 2 ? (
            <div className="search-dropdown-content">
              {suggestions.length > 0 && (
                <div className="dropdown-section">
                  <div className="dropdown-section-title">Discovery Suggestions</div>
                  <ul className="dropdown-suggestions-list">
                    {suggestions.map((item, idx) => {
                      const isHighlighted = highlightedIndex === idx;
                      return (
                        <li
                          key={item.id}
                          className={`dropdown-suggestion-item ${
                            isHighlighted ? 'highlighted' : ''
                          }`}
                          onClick={() => {
                            if (item.productSlug) {
                              navigateTo(`/product/${item.productSlug}`);
                              setIsOpen(false);
                            } else {
                              handleSelectQuery(item.label);
                            }
                          }}
                          role="option"
                          aria-selected={isHighlighted}
                        >
                          <span className="suggestion-type-badge">{item.type}</span>
                          <span className="suggestion-label">{item.label}</span>
                          <ChevronRightIcon size={14} className="suggestion-arrow" />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Product Match Previews */}
              {productPreviews.length > 0 && (
                <div className="dropdown-section products-section">
                  <div className="dropdown-section-title">Matching Garments</div>
                  <div className="dropdown-products-grid">
                    {productPreviews.map((prod, idx) => {
                      const itemIdx = suggestions.length + idx;
                      const isHighlighted = highlightedIndex === itemIdx;
                      const thumb =
                        prod.thumbnail ||
                        prod.images?.[0] ||
                        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=85';
                      return (
                        <div
                          key={prod.id}
                          className={`dropdown-product-card ${
                            isHighlighted ? 'highlighted' : ''
                          }`}
                          onClick={() => {
                            navigateTo(`/product/${prod.slug}`);
                            setIsOpen(false);
                          }}
                          role="option"
                          aria-selected={isHighlighted}
                        >
                          <img
                            src={thumb}
                            alt={prod.name}
                            className="dropdown-product-img"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=85';
                            }}
                          />
                          <div className="dropdown-product-info">
                            <span className="dropdown-product-name">{prod.name}</span>
                            <span className="dropdown-product-sub">{prod.subcategory}</span>
                            <span className="dropdown-product-price">
                              ${prod.price}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {suggestions.length === 0 && productPreviews.length === 0 && (
                <div className="dropdown-empty-note">
                  No quick suggestions found. Press Enter to view all results.
                </div>
              )}
            </div>
          ) : (
            /* STATE B: Recent Searches & Curated Men's Style Tags (query is empty) */
            <div className="search-dropdown-content">
              {recentSearches.length > 0 && (
                <div className="dropdown-section">
                  <div className="dropdown-section-header">
                    <span className="dropdown-section-title">
                      <ClockIcon size={13} style={{ marginRight: 6 }} />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      className="clear-recent-action"
                      onClick={handleClearAllRecent}
                    >
                      Clear All
                    </button>
                  </div>
                  <ul className="recent-searches-list">
                    {recentSearches.map((term, idx) => {
                      const isHighlighted = highlightedIndex === idx;
                      return (
                        <li
                          key={term}
                          className={`recent-search-item ${
                            isHighlighted ? 'highlighted' : ''
                          }`}
                          onClick={() => handleSelectQuery(term)}
                          role="option"
                          aria-selected={isHighlighted}
                        >
                          <span className="recent-search-term">{term}</span>
                          <button
                            type="button"
                            className="remove-recent-btn"
                            onClick={(e) => handleRemoveRecent(e, term)}
                            aria-label={`Remove ${term} from recent searches`}
                          >
                            <CloseIcon size={12} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Curated Men's Explore Styles Section */}
              <div className="dropdown-section">
                <div className="dropdown-section-title">
                  <CompassIcon size={13} style={{ marginRight: 6 }} />
                  Explore Men's Styles
                </div>
                <div className="explore-styles-pills">
                  {CURATED_MEN_EXPLORE_TAGS.map((tag, idx) => {
                    const itemIdx = recentSearches.length + idx;
                    const isHighlighted = highlightedIndex === itemIdx;
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`explore-style-pill ${
                          isHighlighted ? 'highlighted' : ''
                        }`}
                        onClick={() => handleSelectQuery(tag)}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Outfit Discovery Suggestion (Task 3.5 Requirement 20) */}
          <div className="dropdown-outfit-prompt">
            <span className="outfit-prompt-text">Looking for a complete fit?</span>
            <button
              type="button"
              className="outfit-prompt-link"
              onClick={() => {
                setIsOpen(false);
                navigateTo('/looks');
              }}
            >
              SHOP THE LOOK &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
