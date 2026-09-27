import type { ProductItem } from '../types/product';
import type {
  DiscoveryProfile,
  PersonalizationOptions,
  ScoredProduct,
  DiscoveryRailConfig,
} from '../types/personalization';
import { PRODUCTS_DATA } from '../data/products';

/**
 * THE OUTFIT CLUB — DETERMINISTIC PERSONALIZATION & DISCOVERY ENGINE
 * Evaluates observable session behavior (views, wishlist, searches, category visits)
 * and generates transparent, strictly men's-only product recommendations.
 * No machine-learning claims, no fake customer analytics, purely explainable scoring.
 */

// Weights for preference signals
const WEIGHTS = {
  CATEGORY: 4,
  SUBCATEGORY: 3,
  STYLE: 4,
  AESTHETIC: 4,
  FIT: 3,
  COLOR: 2,
  WISHLIST_CATEGORY: 3,
  WISHLIST_STYLE: 3,
  WISHLIST_FIT: 2,
  SEARCH_MATCH: 4,
  COLLECTION_MATCH: 3,
  ALREADY_VIEWED_PENALTY: -2,
};

/**
 * Computes deterministic recommendation scores for products.
 */
export function scoreProductsForProfile(
  products: ProductItem[],
  profile: DiscoveryProfile,
  wishlistIds: string[] = [],
  recentlyViewedIds: string[] = [],
  options: PersonalizationOptions = {}
): ScoredProduct[] {
  const excludeSet = new Set(options.excludeIds || []);
  const wishlistedProducts = wishlistIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is ProductItem => Boolean(p));

  const activeSearch = (options.currentSearchQuery || '').trim().toLowerCase();
  const recentSearches = profile.recentSearchQueries || [];
  const searchTerms = [activeSearch, ...recentSearches].filter(Boolean);

  const scored: ScoredProduct[] = [];

  for (const product of products) {
    // 1. Exclude out of stock, unavailable, or explicitly excluded products
    if (product.availability === 'out-of-stock' || product.inStock === false) {
      continue;
    }
    if (excludeSet.has(product.id) || excludeSet.has(product.slug)) {
      continue;
    }

    let score = 0;
    const matchReasons: string[] = [];

    const cat = product.category?.toLowerCase();
    const subcat = product.subcategory?.toLowerCase();
    const style = product.style?.toLowerCase();
    const aesthetic = product.aesthetic?.toLowerCase();
    const fit = product.fit?.toLowerCase();

    // 2. Category Affinity
    if (cat && profile.preferences.categories[cat]) {
      const pts = Math.min(profile.preferences.categories[cat] * WEIGHTS.CATEGORY, 16);
      score += pts;
      matchReasons.push(`Category: ${product.category}`);
    }
    if (options.currentCategory && cat === options.currentCategory.toLowerCase()) {
      score += 5;
    }

    // 3. Subcategory Affinity
    if (subcat && profile.preferences.subcategories[subcat]) {
      const pts = Math.min(profile.preferences.subcategories[subcat] * WEIGHTS.SUBCATEGORY, 12);
      score += pts;
    }

    // 4. Style & Aesthetic Affinity
    if (style && profile.preferences.styles[style]) {
      const pts = Math.min(profile.preferences.styles[style] * WEIGHTS.STYLE, 16);
      score += pts;
      matchReasons.push(`Style: ${product.style}`);
    }
    if (aesthetic && profile.preferences.styles[aesthetic]) {
      const pts = Math.min(profile.preferences.styles[aesthetic] * WEIGHTS.AESTHETIC, 16);
      score += pts;
      matchReasons.push(`Aesthetic: ${product.aesthetic}`);
    }

    // 5. Fit Affinity
    if (fit && profile.preferences.fits[fit]) {
      const pts = Math.min(profile.preferences.fits[fit] * WEIGHTS.FIT, 12);
      score += pts;
      matchReasons.push(`Fit: ${product.fit}`);
    }

    // 6. Color Affinity
    if (Array.isArray(product.colors)) {
      let colorPoints = 0;
      for (const c of product.colors) {
        const colorName = c.name.toLowerCase();
        if (profile.preferences.colors[colorName]) {
          colorPoints += WEIGHTS.COLOR;
        }
      }
      if (colorPoints > 0) {
        score += Math.min(colorPoints, 8);
      }
    }

    // 7. Wishlist Similarity
    for (const wishProd of wishlistedProducts) {
      if (wishProd.id === product.id) continue;
      if (wishProd.category === product.category) {
        score += WEIGHTS.WISHLIST_CATEGORY;
      }
      if (wishProd.aesthetic === product.aesthetic || wishProd.style === product.style) {
        score += WEIGHTS.WISHLIST_STYLE;
      }
      if (wishProd.fit === product.fit) {
        score += WEIGHTS.WISHLIST_FIT;
      }
    }

    // 8. Search Terms Context
    for (const term of searchTerms) {
      if (!term) continue;
      const termWords = term.split(/\s+/).filter((w) => w.length > 2);
      for (const w of termWords) {
        if (
          product.name.toLowerCase().includes(w) ||
          product.tags.some((t) => t.toLowerCase().includes(w)) ||
          product.style?.toLowerCase().includes(w) ||
          product.fit?.toLowerCase().includes(w)
        ) {
          score += WEIGHTS.SEARCH_MATCH;
          matchReasons.push(`Matches search "${w}"`);
        }
      }
    }

    // 9. Collection Context
    const activeCollection = options.currentCollectionSlug || profile.lastActiveCollectionSlug;
    if (activeCollection) {
      if (
        (activeCollection.includes('oversized') && (fit === 'oversized' || fit === 'relaxed')) ||
        (activeCollection.includes('tailoring') && (cat === 'tailoring' || style === 'tailored')) ||
        (activeCollection.includes('baggy') && (fit === 'relaxed' || subcat?.includes('trouser') || subcat?.includes('chino'))) ||
        (activeCollection.includes('streetwear') && (aesthetic === 'streetwear' || style === 'streetwear'))
      ) {
        score += WEIGHTS.COLLECTION_MATCH;
      }
    }

    // 10. Diversity balancing: slight penalty for products already in recently viewed
    if (recentlyViewedIds.includes(product.id)) {
      score += WEIGHTS.ALREADY_VIEWED_PENALTY;
    }

    scored.push({
      product,
      score,
      matchReasons: Array.from(new Set(matchReasons)),
    });
  }

  // 11. Deterministic sorting:
  // - Primary: Score (descending)
  // - Secondary: Featured flag
  // - Tertiary: Customer rating (descending)
  // - Quaternary: ID alphabetical tie-break
  return scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.product.featured !== a.product.featured) {
      return b.product.featured ? 1 : -1;
    }
    if (b.product.rating !== a.product.rating) {
      return b.product.rating - a.product.rating;
    }
    return a.product.id.localeCompare(b.product.id);
  });
}

/**
 * Finds the top signal label (e.g. "Streetwear", "Oversized Fits", "Relaxed Tailoring")
 */
function detectTopAestheticSignal(profile: DiscoveryProfile): string | undefined {
  const styles = profile.preferences.styles;
  const entries = Object.entries(styles).sort((a, b) => b[1] - a[1]);
  if (entries.length > 0 && entries[0][1] >= 1) {
    const raw = entries[0][0];
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  const fits = profile.preferences.fits;
  const fitEntries = Object.entries(fits).sort((a, b) => b[1] - a[1]);
  if (fitEntries.length > 0 && fitEntries[0][1] >= 1) {
    const raw = fitEntries[0][0];
    return `${raw.charAt(0).toUpperCase() + raw.slice(1)} Fits`;
  }

  const cats = profile.preferences.categories;
  const catEntries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  if (catEntries.length > 0 && catEntries[0][1] >= 1) {
    const raw = catEntries[0][0];
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  return undefined;
}

/**
 * Generates the full configuration for the discovery rail.
 * Intelligently switches between personalized recommendations and neutral first-visit curation.
 */
export function getDiscoveryRailConfig(
  products: ProductItem[] = PRODUCTS_DATA,
  profile: DiscoveryProfile,
  wishlistIds: string[] = [],
  recentlyViewedIds: string[] = [],
  options: PersonalizationOptions = {}
): DiscoveryRailConfig {
  const limit = options.limit || 6;
  const scored = scoreProductsForProfile(
    products,
    profile,
    wishlistIds,
    recentlyViewedIds,
    options
  );

  const topScore = scored.length > 0 ? scored[0].score : 0;
  const hasStrongSignals = topScore > 3;

  if (hasStrongSignals) {
    const topAesthetic = detectTopAestheticSignal(profile);
    const selectedProducts = scored.slice(0, limit).map((s) => s.product);

    return {
      id: 'personalized-style-rail',
      title: 'PICKED FOR YOUR STYLE',
      eyebrow: 'BASED ON YOUR BROWSING',
      description: topAesthetic
        ? `Garments selected from our atelier collection matching your recent focus on ${topAesthetic}.`
        : 'Tailored menswear selections aligned with your session preferences and silhouette interests.',
      products: selectedProducts,
      isPersonalized: true,
      detectedAesthetic: topAesthetic,
    };
  }

  // FIRST VISIT / NEUTRAL FALLBACK: Curated Wardrobe Anchors
  // Select top featured items across distinct categories (tees, trousers, footwear, outerwear)
  const neutralSelection: ProductItem[] = [];
  const seenCategories = new Set<string>();

  // First pass: distinct featured items across categories
  for (const item of products) {
    if (
      item.featured &&
      item.availability !== 'out-of-stock' &&
      !seenCategories.has(item.category)
    ) {
      neutralSelection.push(item);
      seenCategories.add(item.category);
    }
  }

  // Second pass: fill up to limit with top rated items
  for (const item of products) {
    if (neutralSelection.length >= limit) break;
    if (
      item.availability !== 'out-of-stock' &&
      !neutralSelection.some((p) => p.id === item.id)
    ) {
      neutralSelection.push(item);
    }
  }

  return {
    id: 'first-visit-curation-rail',
    title: 'CURATED MENSWEAR ESSENTIALS',
    eyebrow: 'FOUNDATION DISCOVERY',
    description:
      'Signature oversized silhouettes, structured knits, and clean court footwear to anchor your daily rotation.',
    products: neutralSelection.slice(0, limit),
    isPersonalized: false,
  };
}
