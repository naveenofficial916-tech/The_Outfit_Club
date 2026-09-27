import { useState, useEffect, useCallback } from 'react';
import type { ProductItem } from '../types';
import { PRODUCTS_DATA } from '../data/products';
import { discoveryProfileStore } from './discoveryProfileStore';

/**
 * THE OUTFIT CLUB — RECENTLY VIEWED PRODUCTS STORE
 * Lightweight, safe localStorage persistence for viewed men's fashion products.
 * Includes reactive event subscription, duplicate prevention, and corruption resilience.
 */

const RECENTLY_VIEWED_STORAGE_KEY = 'the_outfit_club_recently_viewed_v1';
const MAX_RECENT_ITEMS = 10;
const CHANGE_EVENT_NAME = 'toc_recently_viewed_changed';

function dispatchChangeEvent(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT_NAME));
  }
}

export const recentlyViewedStore = {
  recordView(productId: string): void {
    if (typeof window === 'undefined' || !productId) return;
    try {
      // Validate product exists in dataset
      const foundProduct = PRODUCTS_DATA.find((p) => p.id === productId || p.slug === productId);
      if (!foundProduct) return;

      // Update discovery preference signals (Task 3.6)
      discoveryProfileStore.recordProductInteraction(foundProduct);

      const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      let list: string[] = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            list = parsed.filter((id) => typeof id === 'string');
          }
        } catch {
          list = [];
        }
      }

      // Remove duplicate and push to front (newest first)
      const filtered = list.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, MAX_RECENT_ITEMS);
      localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated));
      dispatchChangeEvent();
    } catch (e) {
      console.warn('[RecentlyViewed] Failed to save viewed item:', e);
    }
  },

  getRecentIds(excludeId?: string): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const validIds = parsed.filter((id) => typeof id === 'string');
        return excludeId ? validIds.filter((id) => id !== excludeId) : validIds;
      }
    } catch (e) {
      console.warn('[RecentlyViewed] Failed to retrieve viewed items:', e);
    }
    return [];
  },

  getRecentProducts(excludeId?: string): ProductItem[] {
    const ids = this.getRecentIds(excludeId);
    return ids
      .map((id) => PRODUCTS_DATA.find((p) => p.id === id || p.slug === id))
      .filter((p): p is ProductItem => Boolean(p));
  },

  clearRecentlyViewed(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
      dispatchChangeEvent();
    } catch (e) {
      console.warn('[RecentlyViewed] Failed to clear viewed items:', e);
    }
  },
};

/**
 * React hook to reactively subscribe to recently viewed items.
 */
export function useRecentlyViewed(excludeId?: string) {
  const [products, setProducts] = useState<ProductItem[]>(() =>
    recentlyViewedStore.getRecentProducts(excludeId)
  );

  const refresh = useCallback(() => {
    setProducts(recentlyViewedStore.getRecentProducts(excludeId));
  }, [excludeId]);

  useEffect(() => {
    const handleUpdate = () => refresh();
    window.addEventListener(CHANGE_EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(CHANGE_EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  const clear = useCallback(() => {
    recentlyViewedStore.clearRecentlyViewed();
  }, []);

  return {
    products,
    clear,
    count: products.length,
  };
}
