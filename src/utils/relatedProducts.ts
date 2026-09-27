import type { ProductItem } from '../types';
import { PRODUCTS_DATA } from '../data/products';

/**
 * THE OUTFIT CLUB — DETERMINISTIC RELATED PRODUCTS ENGINE
 * Scores and recommends complementary or similar men's fashion garments
 * based exclusively on authentic product attributes (category, subcategory,
 * fit, aesthetic, shared tags, price proximity, and color overlap).
 */

export interface RelatedProductScore {
  product: ProductItem;
  score: number;
}

export function getRelatedProducts(
  currentProduct: ProductItem,
  catalog: ProductItem[] = PRODUCTS_DATA,
  limit: number = 6
): ProductItem[] {
  if (!currentProduct || !catalog || catalog.length === 0) return [];

  const currentColorNames = new Set(
    (currentProduct.colors || []).map((c) => c.name.toLowerCase())
  );
  const currentTags = new Set(
    (currentProduct.tags || []).map((t) => t.toLowerCase())
  );

  const candidates = catalog.filter((p) => p.id !== currentProduct.id);

  const scored: RelatedProductScore[] = candidates.map((candidate) => {
    let score = 0;

    // 1. Same Subcategory (Strongest signal of direct style affinity)
    if (
      candidate.subcategory &&
      candidate.subcategory.toLowerCase() === currentProduct.subcategory?.toLowerCase()
    ) {
      score += 5;
    }

    // 2. Same Category (Broad departmental match)
    if (
      candidate.category &&
      candidate.category.toLowerCase() === currentProduct.category?.toLowerCase()
    ) {
      score += 3;
    }

    // 3. Same Fit (Oversized, Relaxed, Tailored, etc.)
    if (
      candidate.fit &&
      currentProduct.fit &&
      candidate.fit.toLowerCase() === currentProduct.fit.toLowerCase()
    ) {
      score += 2;
    }

    // 4. Same Aesthetic (Minimal, Streetwear, Smart-casual, etc.)
    if (
      candidate.aesthetic &&
      currentProduct.aesthetic &&
      candidate.aesthetic.toLowerCase() === currentProduct.aesthetic.toLowerCase()
    ) {
      score += 3;
    }

    // 5. Shared Tags
    if (candidate.tags && candidate.tags.length > 0) {
      let sharedTagCount = 0;
      for (const t of candidate.tags) {
        if (currentTags.has(t.toLowerCase())) {
          sharedTagCount++;
        }
      }
      score += Math.min(sharedTagCount * 1.5, 4.5);
    }

    // 6. Color Overlap (Cohesive styling palette)
    if (candidate.colors && candidate.colors.length > 0) {
      const hasSharedColor = candidate.colors.some((c) =>
        currentColorNames.has(c.name.toLowerCase())
      );
      if (hasSharedColor) {
        score += 1.5;
      }
    }

    // 7. Price Proximity (Similar budget tier within $35)
    const priceDiff = Math.abs(candidate.price - currentProduct.price);
    if (priceDiff <= 25) {
      score += 2;
    } else if (priceDiff <= 50) {
      score += 1;
    }

    return { product: candidate, score };
  });

  // Sort descending by score; tie-break deterministically by product id
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.product.id.localeCompare(b.product.id);
  });

  return scored.slice(0, limit).map((entry) => entry.product);
}
