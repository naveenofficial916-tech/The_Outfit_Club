import type { ProductItem, ProductCategory, ProductFit, ProductAesthetic } from '../types';

/**
 * THE OUTFIT CLUB — SEARCH UTILITIES & RELEVANCE ENGINE
 * Deterministic multi-word search normalization, tokenization,
 * relevance scoring, and suggestions.
 */

export interface SearchSuggestion {
  id: string;
  label: string;
  type: 'category' | 'fit' | 'style' | 'product' | 'tag';
  category?: ProductCategory;
  fit?: ProductFit;
  productSlug?: string;
}

const RECENT_SEARCHES_KEY = 'the_outfit_club_recent_searches_v1';
const MAX_RECENT_SEARCHES = 8;

/**
 * Normalizes user queries:
 * - Lowercases text
 * - Strips punctuation and extraneous symbols
 * - Collapses repeated whitespace
 * - Standardizes hyphenated fashion terms (e.g. t-shirt vs t shirt)
 */
export function normalizeSearchQuery(query: string): string {
  if (!query) return '';
  return query
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // replace symbols with spaces except hyphens
    .replace(/\s+/g, ' ') // collapse multi-spaces
    .trim();
}

/**
 * Splits normalized query into distinct search tokens
 */
export function tokenizeQuery(query: string): string[] {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return [];

  const rawTokens = normalized.split(/\s+/).filter(Boolean);
  const tokenSet = new Set<string>();

  for (const token of rawTokens) {
    tokenSet.add(token);
    // Expand common fashion term aliases
    if (token === 'tee' || token === 'tees') {
      tokenSet.add('t-shirt');
      tokenSet.add('tshirt');
    } else if (token === 't-shirt' || token === 'tshirt' || token === 'shirt') {
      tokenSet.add('tee');
    } else if (token === 'pant' || token === 'pants' || token === 'trousers') {
      tokenSet.add('trouser');
      tokenSet.add('jeans');
      tokenSet.add('chinos');
    } else if (token === 'baggy' || token === 'oversize') {
      tokenSet.add('oversized');
      tokenSet.add('relaxed');
    }
  }

  return Array.from(tokenSet);
}

/**
 * Calculates deterministic relevance score for a product given search tokens
 */
export function calculateProductRelevance(
  product: ProductItem,
  rawQuery: string,
  tokens: string[]
): number {
  if (!product) return 0;
  if (tokens.length === 0) return 0;

  const normalizedQuery = normalizeSearchQuery(rawQuery);
  const nameNorm = (product.name || '').toLowerCase();
  const brandNorm = (product.brand || '').toLowerCase();
  const catNorm = (product.category || '').toLowerCase();
  const subNorm = (product.subcategory || '').toLowerCase();
  const fitNorm = (product.fit || '').toLowerCase();
  const styleNorm = (product.style || '').toLowerCase();
  const aestheticNorm = (product.aesthetic || '').toLowerCase();
  const descNorm = (product.description || '').toLowerCase();
  const materialNorm = (product.material || '').toLowerCase();
  const tagsNorm = Array.isArray(product.tags)
    ? product.tags.map((t) => (t || '').toLowerCase()).join(' ')
    : '';
  const colorsNorm = Array.isArray(product.colors)
    ? product.colors.map((c) => (c?.name || '').toLowerCase()).join(' ')
    : '';
  const sizesNorm = Array.isArray(product.sizes)
    ? product.sizes.map((s) => (s || '').toLowerCase()).join(' ')
    : '';

  let score = 0;

  // 1. Exact phrase match in Product Name (+120 pts)
  if (nameNorm === normalizedQuery) {
    score += 120;
  } else if (nameNorm.includes(normalizedQuery)) {
    score += 70;
  }

  // 2. Exact phrase match in Category / Subcategory (+50 pts)
  if (subNorm.includes(normalizedQuery) || catNorm.includes(normalizedQuery)) {
    score += 50;
  }

  // 3. Exact phrase match in Fit or Style (+45 pts)
  if (fitNorm.includes(normalizedQuery) || styleNorm.includes(normalizedQuery)) {
    score += 45;
  }

  // Multi-word concept coherence check
  const rawWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 1);
  let matchedConceptsCount = 0;

  for (const word of rawWords) {
    const wordTokens = tokenizeQuery(word);
    const conceptMatched = wordTokens.some(
      (t) =>
        nameNorm.includes(t) ||
        subNorm.includes(t) ||
        fitNorm.includes(t) ||
        colorsNorm.includes(t) ||
        catNorm.includes(t) ||
        tagsNorm.includes(t) ||
        styleNorm.includes(t) ||
        aestheticNorm.includes(t) ||
        brandNorm.includes(t) ||
        descNorm.includes(t)
    );
    if (conceptMatched) {
      matchedConceptsCount++;
    }
  }

  // If user typed 2+ words, require at least 2 concepts to match unless exact phrase matched
  if (
    rawWords.length >= 2 &&
    !nameNorm.includes(normalizedQuery) &&
    matchedConceptsCount < Math.min(2, rawWords.length)
  ) {
    return 0;
  }

  // 4. Token-level matching across fields
  let matchedTokensCount = 0;

  for (const token of tokens) {
    let tokenMatched = false;

    if (nameNorm.includes(token)) {
      score += 30;
      tokenMatched = true;
    }
    if (subNorm.includes(token)) {
      score += 24;
      tokenMatched = true;
    }
    if (fitNorm.includes(token)) {
      score += 22;
      tokenMatched = true;
    }
    if (colorsNorm.includes(token)) {
      score += 20;
      tokenMatched = true;
    }
    if (catNorm.includes(token)) {
      score += 18;
      tokenMatched = true;
    }
    if (tagsNorm.includes(token)) {
      score += 15;
      tokenMatched = true;
    }
    if (styleNorm.includes(token)) {
      score += 15;
      tokenMatched = true;
    }
    if (aestheticNorm.includes(token)) {
      score += 12;
      tokenMatched = true;
    }
    if (brandNorm.includes(token)) {
      score += 10;
      tokenMatched = true;
    }
    if (materialNorm.includes(token)) {
      score += 10;
      tokenMatched = true;
    }
    if (descNorm.includes(token)) {
      score += 8;
      tokenMatched = true;
    }
    if (sizesNorm.split(' ').includes(token)) {
      score += 12;
      tokenMatched = true;
    }

    if (tokenMatched) {
      matchedTokensCount++;
    }
  }

  // Bonus: If all search tokens were found somewhere in the product (+40 pts)
  if (matchedTokensCount === tokens.length && tokens.length > 1) {
    score += 40;
  }

  return score;
}

/**
 * Filter and sort products based on smart relevance scoring
 */
export function searchProductsWithRelevance(
  products: ProductItem[],
  query: string
): { product: ProductItem; score: number }[] {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) {
    return products.map((product) => ({ product, score: 0 }));
  }

  const tokens = tokenizeQuery(query);

  const scored = products
    .map((product) => ({
      product,
      score: calculateProductRelevance(product, query, tokens),
    }))
    .filter((item) => item.score > 0);

  // Sort descending by relevance score
  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Generates dynamic, catalog-backed suggestions matching a prefix or query
 */
export function getSearchSuggestions(
  products: ProductItem[],
  query: string
): SearchSuggestion[] {
  const normalized = normalizeSearchQuery(query);
  if (!normalized || normalized.length < 2) return [];

  const suggestions: SearchSuggestion[] = [];
  const seenLabels = new Set<string>();

  // 1. Check Subcategories & Categories
  for (const p of products) {
    if (
      p.subcategory &&
      p.subcategory.toLowerCase().includes(normalized) &&
      !seenLabels.has(p.subcategory)
    ) {
      seenLabels.add(p.subcategory);
      suggestions.push({
        id: `sub-${p.subcategory}`,
        label: p.subcategory,
        type: 'category',
        category: p.category,
      });
    }
  }

  // 2. Check Fits (e.g. "oversized", "relaxed", "baggy")
  const fits: ProductFit[] = ['oversized', 'relaxed', 'straight', 'regular', 'tailored', 'slim'];
  for (const fit of fits) {
    if (fit.includes(normalized) && !seenLabels.has(fit)) {
      seenLabels.add(fit);
      suggestions.push({
        id: `fit-${fit}`,
        label: `${fit.charAt(0).toUpperCase() + fit.slice(1)} Fit`,
        type: 'fit',
        fit,
      });
    }
  }

  // 3. Check Aesthetics (e.g. "streetwear", "minimal")
  const aesthetics: ProductAesthetic[] = ['streetwear', 'minimal', 'smart-casual', 'vintage'];
  for (const aes of aesthetics) {
    if (aes.includes(normalized) && !seenLabels.has(aes)) {
      seenLabels.add(aes);
      suggestions.push({
        id: `aes-${aes}`,
        label: `${aes.charAt(0).toUpperCase() + aes.slice(1)} Aesthetic`,
        type: 'style',
      });
    }
  }

  // 4. Product Name Matches
  for (const p of products) {
    if (p.name.toLowerCase().includes(normalized) && !seenLabels.has(p.name)) {
      seenLabels.add(p.name);
      suggestions.push({
        id: `prod-${p.id}`,
        label: p.name,
        type: 'product',
        productSlug: p.slug,
      });
      if (suggestions.length >= 7) break;
    }
  }

  return suggestions.slice(0, 6);
}

/**
 * Local storage persistence service for Recent Searches
 */
export const recentSearchesService = {
  getRecentSearches(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
      return [];
    } catch {
      return [];
    }
  },

  addRecentSearch(query: string): string[] {
    const trimmed = query.trim();
    if (!trimmed) return this.getRecentSearches();

    try {
      const existing = this.getRecentSearches();
      // Remove query if it already exists (to move it to top)
      const filtered = existing.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  removeRecentSearch(queryToRemove: string): string[] {
    try {
      const existing = this.getRecentSearches();
      const updated = existing.filter((item) => item.toLowerCase() !== queryToRemove.toLowerCase());
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  clearRecentSearches(): void {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  },
};

/**
 * Curated men's discovery tags based on available product catalog
 */
export const CURATED_MEN_EXPLORE_TAGS = [
  'Oversized Tees',
  'Baggy Pants',
  'Relaxed Fit Denim',
  'Streetwear',
  'Heavyweight Essentials',
  'Italian Leather Shoes',
  'Wool Tailoring',
];
