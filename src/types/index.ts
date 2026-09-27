/**
 * THE OUTFIT CLUB — CORE DOMAIN TYPES
 * Establishes typed interfaces for products, outfits, styling, and platform entities.
 */

export * from './product';
export * from './collection';
export * from './outfit';
export * from './personalization';
import type { ProductItem } from './product';

export interface OutfitLook {
  id: string;
  title: string;
  curator: string;
  season: string;
  description: string;
  coverImage: string;
  productIds: string[];
  tags: string[];
  aesthetic: string;
}

export interface StylingRecommendation {
  id: string;
  lookTitle: string;
  matchScore: number;
  occasion: string;
  description: string;
  products: ProductItem[];
}

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  featured?: boolean;
  subItems?: { label: string; href: string; description?: string }[];
}

export interface BrandInfo {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  establishedYear: number;
  contactEmail: string;
  socials: {
    instagram: string;
    tiktok: string;
    pinterest: string;
    linkedin: string;
  };
}
