import { useState, useEffect } from 'react';
import type { ProductItem } from '../types';

const WISHLIST_STORAGE_KEY = 'the_outfit_club_wishlist_v1';
const WISHLIST_CHANGE_EVENT = 'the_outfit_club_wishlist_updated';

let inMemoryWishlist: string[] = [];

function loadStoredWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('[WishlistStore] Failed to read from localStorage:', e);
  }
  return inMemoryWishlist;
}

function saveWishlist(ids: string[]): void {
  inMemoryWishlist = ids;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      console.warn('[WishlistStore] Failed to write to localStorage:', e);
    }
    window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
  }
}

export const wishlistStore = {
  getWishlist(): string[] {
    return loadStoredWishlist();
  },

  getWishlistCount(): number {
    return loadStoredWishlist().length;
  },

  isWishlisted(productId: string): boolean {
    return loadStoredWishlist().includes(productId);
  },

  toggleWishlist(productOrId: ProductItem | string): boolean {
    const id = typeof productOrId === 'string' ? productOrId : productOrId.id;
    const current = loadStoredWishlist();
    const exists = current.includes(id);
    let updated: string[];
    if (exists) {
      updated = current.filter((item) => item !== id);
    } else {
      updated = [id, ...current.filter((item) => item !== id)];
    }
    saveWishlist(updated);
    return !exists;
  },

  addToWishlist(productId: string): void {
    const current = loadStoredWishlist();
    if (!current.includes(productId)) {
      saveWishlist([productId, ...current]);
    }
  },

  insertWishlist(productId: string, atIndex: number = 0): void {
    const current = loadStoredWishlist().filter((id) => id !== productId);
    const targetIdx = Math.max(0, Math.min(atIndex, current.length));
    const next = [...current];
    next.splice(targetIdx, 0, productId);
    saveWishlist(next);
  },

  removeFromWishlist(productId: string): void {
    const current = loadStoredWishlist();
    if (current.includes(productId)) {
      saveWishlist(current.filter((id) => id !== productId));
    }
  },

  clearWishlist(): void {
    saveWishlist([]);
  },

  subscribe(listener: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(WISHLIST_CHANGE_EVENT, listener);
    return () => window.removeEventListener(WISHLIST_CHANGE_EVENT, listener);
  },
};

/**
 * React hook to reactively track wishlist state
 */
export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => wishlistStore.getWishlist());

  useEffect(() => {
    const handleUpdate = () => {
      setWishlistIds(wishlistStore.getWishlist());
    };
    return wishlistStore.subscribe(handleUpdate);
  }, []);

  return {
    wishlistIds,
    count: wishlistIds.length,
    isWishlisted: (id: string) => wishlistIds.includes(id),
    toggleWishlist: wishlistStore.toggleWishlist.bind(wishlistStore),
    addToWishlist: wishlistStore.addToWishlist.bind(wishlistStore),
    insertWishlist: wishlistStore.insertWishlist.bind(wishlistStore),
    removeFromWishlist: wishlistStore.removeFromWishlist.bind(wishlistStore),
    clearWishlist: wishlistStore.clearWishlist.bind(wishlistStore),
  };
}
