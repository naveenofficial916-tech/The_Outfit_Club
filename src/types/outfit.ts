import type { ProductItem, ProductAesthetic } from './product';

/**
 * THE OUTFIT CLUB — OUTFIT DISCOVERY & VISUAL MERCHANDISING CONTRACTS
 * Reusable data architecture for complete men's fashion ensembles (Head-to-Toe).
 */

export type OutfitRole = 'top' | 'bottom' | 'footwear' | 'layer' | 'accessory';

export interface OutfitPiece {
  product: ProductItem;
  role: OutfitRole;
  roleLabel: string;
}

export interface CuratedOutfit {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  aesthetic: ProductAesthetic;
  collectionSlug?: string;
  heroImage: string;
  featured?: boolean;
  order?: number;
  pieces: OutfitPiece[];
  totalPrice: number;
  originalTotalPrice?: number;
  discountPercentage?: number;
}
