import type { ProductItem } from '../types/product';
import type { CuratedCollection } from '../types/collection';

/**
 * THE OUTFIT CLUB — CURATED MEN'S FASHION COLLECTIONS
 * Declarative collection definitions based exclusively on actual catalog product dataset.
 */
export const CURATED_COLLECTIONS: CuratedCollection[] = [
  {
    id: 'col-oversized',
    slug: 'oversized-edit',
    name: 'The Oversized Edit',
    tagline: 'Dropped shoulders, boxy drape & architectural volume',
    description:
      'Engineered for relaxed ease and heavyweight drape. Discover our signature edit of oversized organic cotton tees, relaxed cardigans, and architectural streetwear silhouettes crafted for the modern man.',
    bannerImage:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=85',
    featured: true,
    order: 1,
    relatedSlugs: ['baggy-fit', 'streetwear-essentials', 'everyday-basics'],
    filterFn: (p: ProductItem) =>
      p.fit === 'oversized' ||
      p.name.toLowerCase().includes('oversized') ||
      p.tags.some(
        (t) =>
          t.toLowerCase().includes('oversized') ||
          t.toLowerCase().includes('boxy') ||
          t.toLowerCase() === 'relaxed'
      ) ||
      p.subcategory === 'Hoodies',
  },
  {
    id: 'col-baggy-fit',
    slug: 'baggy-fit',
    name: 'Baggy & Relaxed Fits',
    tagline: 'Wide-leg trousers, relaxed selvedge denim & pleated chinos',
    description:
      'Modern leg silhouettes engineered with generous volume, clean stacks, and relaxed tapers. Built for everyday mobility and relaxed street fashion.',
    bannerImage:
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1600&q=85',
    featured: true,
    order: 2,
    relatedSlugs: ['oversized-edit', 'streetwear-essentials', 'everyday-basics'],
    filterFn: (p: ProductItem) =>
      ['Trousers', 'Jeans', 'Chinos'].includes(p.subcategory) ||
      p.fit === 'relaxed' ||
      p.fit === 'oversized',
  },
  {
    id: 'col-streetwear',
    slug: 'streetwear-essentials',
    name: 'Streetwear Essentials',
    tagline: 'Heavyweight basics, drop shoulders & court sneakers',
    description:
      'The modern menswear uniform. Essential heavyweight cotton tees, utilitarian outerwear, relaxed denim, and Italian court sneakers designed for effortless daily wear.',
    bannerImage:
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1600&q=85',
    featured: true,
    order: 3,
    relatedSlugs: ['oversized-edit', 'baggy-fit', 'new-arrivals'],
    filterFn: (p: ProductItem) =>
      p.aesthetic === 'streetwear' ||
      (Array.isArray(p.tags) && p.tags.includes('streetwear')),
  },
  {
    id: 'col-basics',
    slug: 'everyday-basics',
    name: 'Everyday Basics',
    tagline: 'Combed organic cotton, clean neutrals & daily staples',
    description:
      'Uncompromising quality for your daily rotation. GOTS organic cotton tees, durable chinos, minimal knitwear, and leather accents engineered to last.',
    bannerImage:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1600&q=85',
    featured: true,
    order: 4,
    relatedSlugs: ['oversized-edit', 'architectural-tailoring', 'streetwear-essentials'],
    filterFn: (p: ProductItem) =>
      (Array.isArray(p.tags) && (p.tags.includes('basics') || p.tags.includes('essential'))) ||
      ['T-Shirts', 'Polos', 'Chinos', 'Belts', 'Caps'].includes(p.subcategory),
  },
  {
    id: 'col-tailoring',
    slug: 'architectural-tailoring',
    name: 'Architectural Tailoring',
    tagline: 'Unstructured blazers, relaxed wool trousers & modern suits',
    description:
      'Sartorial excellence reimagined for contemporary relaxed living. Unstructured blazers, breathable Italian wool suiting, and crisp poplin shirts with relaxed proportions.',
    bannerImage:
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1600&q=85',
    featured: false,
    order: 5,
    relatedSlugs: ['everyday-basics', 'new-arrivals'],
    filterFn: (p: ProductItem) =>
      p.category === 'tailoring' ||
      ['Blazers', 'Suits', 'Formal Shirts', 'Trousers'].includes(p.subcategory),
  },
  {
    id: 'col-new-arrivals',
    slug: 'new-arrivals',
    name: 'New Season Drops',
    tagline: 'The latest drops from The Outfit Club Atelier',
    description:
      'Explore our most recent releases for the upcoming season. Fresh cuts in heavyweight jersey, relaxed bottomwear, and curated accessories engineered for the modern man.',
    bannerImage:
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1600&q=85',
    featured: true,
    order: 6,
    relatedSlugs: ['oversized-edit', 'streetwear-essentials', 'baggy-fit'],
    filterFn: (p: ProductItem) => Boolean(p.newest || p.isNewArrival),
  },
];

/**
 * Find collection by URL slug
 */
export function getCollectionBySlug(slug: string): CuratedCollection | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  return CURATED_COLLECTIONS.find((col) => col.slug === clean);
}

/**
 * Filter products belonging to a collection
 */
export function getCollectionProducts(
  collection: CuratedCollection,
  allProducts: ProductItem[]
): ProductItem[] {
  if (!collection || !Array.isArray(allProducts)) return [];
  return allProducts.filter(collection.filterFn);
}

/**
 * Retrieve featured collections for homepage & discovery showcases
 */
export function getFeaturedCollections(): CuratedCollection[] {
  return CURATED_COLLECTIONS.filter((col) => col.featured).sort((a, b) => a.order - b.order);
}

/**
 * Retrieve related collections for cross-discovery
 */
export function getRelatedCollections(collection: CuratedCollection): CuratedCollection[] {
  if (!collection || !Array.isArray(collection.relatedSlugs)) return [];
  return CURATED_COLLECTIONS.filter((c) => collection.relatedSlugs.includes(c.slug));
}
