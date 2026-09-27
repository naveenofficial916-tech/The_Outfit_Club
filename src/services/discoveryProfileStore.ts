import { useState, useEffect, useCallback } from 'react';
import type { DiscoveryProfile, DiscoveryPreferenceCounts } from '../types/personalization';
import type { ProductItem } from '../types/product';

/**
 * THE OUTFIT CLUB — LOCAL DISCOVERY PROFILE STORE
 * Lightweight, private, and session-derived preference model.
 * Zero external analytics, zero tracking, defensive parsing with corruption resilience.
 */

const DISCOVERY_STORAGE_KEY = 'the_outfit_club_discovery_profile_v1';
const DISCOVERY_CHANGE_EVENT = 'toc_discovery_profile_updated';
const MAX_INTERACTED_PRODUCTS = 20;
const MAX_SEARCH_QUERIES = 8;
const MAX_COUNT_PER_SIGNAL = 30;

function createDefaultProfile(): DiscoveryProfile {
  return {
    preferences: {
      categories: {},
      subcategories: {},
      styles: {},
      fits: {},
      colors: {},
    },
    interactedProductIds: [],
    recentSearchQueries: [],
    lastUpdated: Date.now(),
  };
}

let inMemoryProfile: DiscoveryProfile = createDefaultProfile();

function safeParseProfile(raw: string | null): DiscoveryProfile {
  if (!raw) return createDefaultProfile();
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.preferences &&
      typeof parsed.preferences === 'object' &&
      Array.isArray(parsed.interactedProductIds)
    ) {
      return {
        preferences: {
          categories: sanitizeCountMap(parsed.preferences.categories),
          subcategories: sanitizeCountMap(parsed.preferences.subcategories),
          styles: sanitizeCountMap(parsed.preferences.styles),
          fits: sanitizeCountMap(parsed.preferences.fits),
          colors: sanitizeCountMap(parsed.preferences.colors),
        },
        interactedProductIds: parsed.interactedProductIds.filter(
          (id: unknown): id is string => typeof id === 'string'
        ),
        recentSearchQueries: Array.isArray(parsed.recentSearchQueries)
          ? parsed.recentSearchQueries.filter((q: unknown): q is string => typeof q === 'string')
          : [],
        lastActiveCollectionSlug:
          typeof parsed.lastActiveCollectionSlug === 'string'
            ? parsed.lastActiveCollectionSlug
            : undefined,
        lastUpdated: typeof parsed.lastUpdated === 'number' ? parsed.lastUpdated : Date.now(),
      };
    }
  } catch (e) {
    console.warn('[DiscoveryProfile] Storage parse failed, resetting profile safely:', e);
  }
  return createDefaultProfile();
}

function sanitizeCountMap(rawMap: unknown): Record<string, number> {
  if (!rawMap || typeof rawMap !== 'object') return {};
  const cleaned: Record<string, number> = {};
  for (const [key, val] of Object.entries(rawMap)) {
    if (typeof key === 'string' && typeof val === 'number' && Number.isFinite(val) && val > 0) {
      cleaned[key.toLowerCase()] = Math.min(val, MAX_COUNT_PER_SIGNAL);
    }
  }
  return cleaned;
}

function loadProfile(): DiscoveryProfile {
  if (typeof window === 'undefined') return inMemoryProfile;
  try {
    const raw = localStorage.getItem(DISCOVERY_STORAGE_KEY);
    inMemoryProfile = safeParseProfile(raw);
  } catch (e) {
    console.warn('[DiscoveryProfile] localStorage read failure:', e);
  }
  return inMemoryProfile;
}

function saveProfile(profile: DiscoveryProfile): void {
  inMemoryProfile = profile;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DISCOVERY_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('[DiscoveryProfile] localStorage write failure:', e);
    }
    window.dispatchEvent(new CustomEvent(DISCOVERY_CHANGE_EVENT));
  }
}

function incrementCount(map: Record<string, number>, key: string | undefined): void {
  if (!key) return;
  const normalized = key.trim().toLowerCase();
  if (!normalized) return;
  const current = map[normalized] || 0;
  map[normalized] = Math.min(current + 1, MAX_COUNT_PER_SIGNAL);
}

export const discoveryProfileStore = {
  getProfile(): DiscoveryProfile {
    return loadProfile();
  },

  recordProductInteraction(product: ProductItem): void {
    if (!product || !product.id) return;
    const current = loadProfile();

    const newPreferences: DiscoveryPreferenceCounts = {
      categories: { ...current.preferences.categories },
      subcategories: { ...current.preferences.subcategories },
      styles: { ...current.preferences.styles },
      fits: { ...current.preferences.fits },
      colors: { ...current.preferences.colors },
    };

    // Increment signals
    incrementCount(newPreferences.categories, product.category);
    incrementCount(newPreferences.subcategories, product.subcategory);
    incrementCount(newPreferences.styles, product.style);
    incrementCount(newPreferences.styles, product.aesthetic);
    incrementCount(newPreferences.fits, product.fit);

    if (Array.isArray(product.colors)) {
      for (const color of product.colors) {
        incrementCount(newPreferences.colors, color.name);
      }
    }

    // Interacted products list (newest first, unique)
    const existingList = current.interactedProductIds.filter((id) => id !== product.id);
    const updatedIds = [product.id, ...existingList].slice(0, MAX_INTERACTED_PRODUCTS);

    saveProfile({
      ...current,
      preferences: newPreferences,
      interactedProductIds: updatedIds,
      lastUpdated: Date.now(),
    });
  },

  recordSearch(query: string): void {
    if (!query || !query.trim()) return;
    const cleaned = query.trim().toLowerCase();
    if (cleaned.length < 2) return;

    const current = loadProfile();
    const existing = current.recentSearchQueries.filter((q) => q !== cleaned);
    const updatedQueries = [cleaned, ...existing].slice(0, MAX_SEARCH_QUERIES);

    saveProfile({
      ...current,
      recentSearchQueries: updatedQueries,
      lastUpdated: Date.now(),
    });
  },

  recordCollectionContext(collectionSlug: string): void {
    if (!collectionSlug) return;
    const current = loadProfile();
    if (current.lastActiveCollectionSlug === collectionSlug) return;

    saveProfile({
      ...current,
      lastActiveCollectionSlug: collectionSlug,
      lastUpdated: Date.now(),
    });
  },

  recordCategoryView(category: string): void {
    if (!category || !category.trim()) return;
    const current = loadProfile();
    const newCategories = { ...current.preferences.categories };
    incrementCount(newCategories, category.trim());

    saveProfile({
      ...current,
      preferences: {
        ...current.preferences,
        categories: newCategories,
      },
      lastUpdated: Date.now(),
    });
  },

  clearDiscoveryProfile(): void {
    inMemoryProfile = createDefaultProfile();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(DISCOVERY_STORAGE_KEY);
      } catch (e) {
        console.warn('[DiscoveryProfile] Failed to clear storage:', e);
      }
      window.dispatchEvent(new CustomEvent(DISCOVERY_CHANGE_EVENT));
    }
  },

  /**
   * Diagnostic check to see if the user has any meaningful browsing history
   */
  hasBrowsingSignals(): boolean {
    const profile = loadProfile();
    return (
      profile.interactedProductIds.length > 0 ||
      Object.keys(profile.preferences.categories).length > 0 ||
      Object.keys(profile.preferences.styles).length > 0 ||
      profile.recentSearchQueries.length > 0
    );
  },
};

/**
 * Hook to reactively consume the local discovery profile
 */
export function useDiscoveryProfile() {
  const [profile, setProfile] = useState<DiscoveryProfile>(() =>
    discoveryProfileStore.getProfile()
  );

  const refresh = useCallback(() => {
    setProfile(discoveryProfileStore.getProfile());
  }, []);

  useEffect(() => {
    const handleUpdate = () => refresh();
    if (typeof window !== 'undefined') {
      window.addEventListener(DISCOVERY_CHANGE_EVENT, handleUpdate);
      window.addEventListener('toc_recently_viewed_changed', handleUpdate);
      window.addEventListener('the_outfit_club_wishlist_updated', handleUpdate);
      return () => {
        window.removeEventListener(DISCOVERY_CHANGE_EVENT, handleUpdate);
        window.removeEventListener('toc_recently_viewed_changed', handleUpdate);
        window.removeEventListener('the_outfit_club_wishlist_updated', handleUpdate);
      };
    }
  }, [refresh]);

  return {
    profile,
    hasSignals: discoveryProfileStore.hasBrowsingSignals(),
    clearProfile: discoveryProfileStore.clearDiscoveryProfile.bind(discoveryProfileStore),
  };
}
