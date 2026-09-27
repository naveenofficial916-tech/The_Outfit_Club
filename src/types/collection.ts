import type { ProductItem } from './product';

/**
 * THE OUTFIT CLUB — CURATED MEN'S COLLECTION CONTRACTS
 */
export interface CuratedCollection {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  bannerImage: string;
  featured: boolean;
  order: number;
  relatedSlugs: string[];
  filterFn: (product: ProductItem) => boolean;
}
