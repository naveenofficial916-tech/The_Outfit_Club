/**
 * THE OUTFIT CLUB — PERSONALIZATION & DISCOVERY TYPES
 * Local session signals, discovery profile state, and scoring contracts.
 * Fully transparent, local-first preference model with no external tracking.
 */

import type { ProductItem } from './product';

export interface DiscoveryPreferenceCounts {
  categories: Record<string, number>;
  subcategories: Record<string, number>;
  styles: Record<string, number>;
  fits: Record<string, number>;
  colors: Record<string, number>;
}

export interface DiscoveryProfile {
  preferences: DiscoveryPreferenceCounts;
  interactedProductIds: string[];
  recentSearchQueries: string[];
  lastActiveCollectionSlug?: string;
  lastUpdated: number;
}

export interface PersonalizationOptions {
  limit?: number;
  excludeIds?: string[];
  currentSearchQuery?: string;
  currentCollectionSlug?: string;
  currentCategory?: string;
  currentSubcategory?: string;
  currentStyle?: string;
}

export interface ScoredProduct {
  product: ProductItem;
  score: number;
  matchReasons: string[];
}

export interface DiscoveryRailConfig {
  id?: string;
  title: string;
  eyebrow?: string;
  description?: string;
  products: ProductItem[];
  isPersonalized: boolean;
  detectedAesthetic?: string;
}
