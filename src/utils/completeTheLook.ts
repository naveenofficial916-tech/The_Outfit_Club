import type { ProductItem } from '../types';
import { PRODUCTS_DATA } from '../data/products';

/**
 * THE OUTFIT CLUB — "COMPLETE THE LOOK" DISCOVERY ENGINE
 * Deterministically curates a cohesive men's fashion ensemble (Head-to-Toe)
 * matching the user's selected hero garment with complementary pieces:
 *
 * Topwear    -> Bottomwear + Footwear + Accessory / Outerwear
 * Bottomwear -> Topwear + Footwear + Accessory
 * Footwear   -> Bottomwear + Topwear + Accessory
 * Outerwear  -> Topwear + Bottomwear + Footwear
 * Tailoring  -> Dress Shirt + Tailored Trousers + Formal Footwear
 */

export interface CompleteTheLookResult {
  items: ProductItem[];
  outfitRoleMap: Record<string, string>; // productId -> role ('Top', 'Bottom', 'Footwear', 'Layer', 'Accessory')
}

// Categorization helpers
const TOPWEAR_SUBCATS = new Set(['T-Shirts', 'Shirts', 'Hoodies', 'Sweaters', 'Knit Tops', 'Cardigans']);
const BOTTOMWEAR_SUBCATS = new Set(['Trousers', 'Jeans', 'Chinos']);
const FOOTWEAR_CATS = new Set(['footwear']);
const ACCESSORY_CATS = new Set(['accessories']);
const OUTERWEAR_SUBCATS = new Set(['Jackets', 'Blazers', 'Suits']);

export function getCompleteTheLook(
  product: ProductItem,
  catalog: ProductItem[] = PRODUCTS_DATA
): CompleteTheLookResult {
  if (!product || !catalog || catalog.length === 0) {
    return { items: [], outfitRoleMap: {} };
  }

  const roleMap: Record<string, string> = {};
  const selectedItems: ProductItem[] = [];
  const chosenIds = new Set<string>([product.id]);

  // Scoring function for a candidate piece in a specific target role
  const scoreCandidate = (candidate: ProductItem): number => {
    let score = 0;

    // Aesthetic alignment (Streetwear with Streetwear, Minimal with Minimal, etc.)
    if (candidate.aesthetic && product.aesthetic && candidate.aesthetic === product.aesthetic) {
      score += 4;
    }

    // Fit coherence (Oversized tops pair well with relaxed/baggy pants or minimal accessories)
    if (candidate.fit && product.fit) {
      if (candidate.fit === product.fit) {
        score += 3;
      } else if (
        (product.fit === 'oversized' || product.fit === 'relaxed') &&
        (candidate.fit === 'relaxed' || candidate.fit === 'straight' || candidate.fit === 'regular')
      ) {
        score += 2;
      }
    }

    // Shared tags (e.g., 'minimal', 'essential', 'wool', 'linen', 'selvedge', 'streetwear')
    const currentTags = new Set((product.tags || []).map((t) => t.toLowerCase()));
    if (candidate.tags) {
      for (const t of candidate.tags) {
        if (currentTags.has(t.toLowerCase())) {
          score += 1.5;
        }
      }
    }

    // Neutral / cohesive palette compatibility
    const currentColorNames = new Set((product.colors || []).map((c) => c.name.toLowerCase()));
    if (candidate.colors) {
      if (candidate.colors.some((c) => currentColorNames.has(c.name.toLowerCase()))) {
        score += 1;
      }
    }

    return score;
  };

  const pickBestCandidate = (
    predicate: (p: ProductItem) => boolean,
    roleName: string
  ): ProductItem | null => {
    const pool = catalog.filter((p) => !chosenIds.has(p.id) && predicate(p));
    if (pool.length === 0) return null;

    pool.sort((a, b) => {
      const scoreDiff = scoreCandidate(b) - scoreCandidate(a);
      if (scoreDiff !== 0) return scoreDiff;
      return a.id.localeCompare(b.id);
    });

    const best = pool[0];
    chosenIds.add(best.id);
    roleMap[best.id] = roleName;
    return best;
  };

  const isTailoring = product.category === 'tailoring' || OUTERWEAR_SUBCATS.has(product.subcategory);
  const isTopwear = TOPWEAR_SUBCATS.has(product.subcategory);
  const isBottomwear = BOTTOMWEAR_SUBCATS.has(product.subcategory);
  const isFootwear = FOOTWEAR_CATS.has(product.category);
  const isAccessory = ACCESSORY_CATS.has(product.category);

  if (isTailoring) {
    // 1. Formal Shirt / Fine Knit
    const inner = pickBestCandidate(
      (p) => p.subcategory === 'Formal Shirts' || p.subcategory === 'Shirts' || p.subcategory === 'T-Shirts',
      'Base Layer'
    );
    if (inner) selectedItems.push(inner);

    // 2. Tailored Trousers
    const trousers = pickBestCandidate(
      (p) => p.category === 'tailoring' || p.subcategory === 'Trousers' || p.subcategory === 'Chinos',
      'Trousers'
    );
    if (trousers) selectedItems.push(trousers);

    // 3. Loafers or Dress Shoes
    const footwear = pickBestCandidate(
      (p) => p.category === 'footwear',
      'Footwear'
    );
    if (footwear) selectedItems.push(footwear);
  } else if (isTopwear) {
    // 1. Complementary Bottoms
    const bottoms = pickBestCandidate(
      (p) => BOTTOMWEAR_SUBCATS.has(p.subcategory),
      'Bottomwear'
    );
    if (bottoms) selectedItems.push(bottoms);

    // 2. Complementary Footwear
    const footwear = pickBestCandidate(
      (p) => p.category === 'footwear',
      'Footwear'
    );
    if (footwear) selectedItems.push(footwear);

    // 3. Layering / Outerwear or Accessory
    const layerOrAcc = pickBestCandidate(
      (p) => p.category === 'accessories' || OUTERWEAR_SUBCATS.has(p.subcategory),
      'Accent'
    );
    if (layerOrAcc) selectedItems.push(layerOrAcc);
  } else if (isBottomwear) {
    // 1. Complementary Tops
    const tops = pickBestCandidate(
      (p) => TOPWEAR_SUBCATS.has(p.subcategory),
      'Topwear'
    );
    if (tops) selectedItems.push(tops);

    // 2. Complementary Footwear
    const footwear = pickBestCandidate(
      (p) => p.category === 'footwear',
      'Footwear'
    );
    if (footwear) selectedItems.push(footwear);

    // 3. Accessory / Outerwear
    const accent = pickBestCandidate(
      (p) => p.category === 'accessories' || OUTERWEAR_SUBCATS.has(p.subcategory),
      'Accent'
    );
    if (accent) selectedItems.push(accent);
  } else if (isFootwear) {
    // 1. Complementary Bottoms
    const bottoms = pickBestCandidate(
      (p) => BOTTOMWEAR_SUBCATS.has(p.subcategory),
      'Bottomwear'
    );
    if (bottoms) selectedItems.push(bottoms);

    // 2. Complementary Tops
    const tops = pickBestCandidate(
      (p) => TOPWEAR_SUBCATS.has(p.subcategory),
      'Topwear'
    );
    if (tops) selectedItems.push(tops);

    // 3. Accessory
    const acc = pickBestCandidate(
      (p) => p.category === 'accessories',
      'Accessory'
    );
    if (acc) selectedItems.push(acc);
  } else if (isAccessory) {
    // 1. Topwear
    const tops = pickBestCandidate(
      (p) => TOPWEAR_SUBCATS.has(p.subcategory),
      'Topwear'
    );
    if (tops) selectedItems.push(tops);

    // 2. Bottomwear
    const bottoms = pickBestCandidate(
      (p) => BOTTOMWEAR_SUBCATS.has(p.subcategory),
      'Bottomwear'
    );
    if (bottoms) selectedItems.push(bottoms);
  }

  return {
    items: selectedItems,
    outfitRoleMap: roleMap,
  };
}
