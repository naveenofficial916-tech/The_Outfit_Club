import type { CuratedOutfit, OutfitPiece } from '../types/outfit';
import type { ProductItem } from '../types/product';
import { PRODUCTS_DATA } from './products';
import { getCompleteTheLook } from '../utils/completeTheLook';

/**
 * THE OUTFIT CLUB — CURATED MEN'S FASHION ENSEMBLES & VISUAL MERCHANDISING
 * Declarative, deterministic head-to-toe outfits built strictly from authentic
 * men's fashion products in the existing catalog.
 */

function findProduct(id: string): ProductItem | undefined {
  return PRODUCTS_DATA.find((p) => p.id === id);
}

/**
 * Computes combined outfit pricing and discount percentage where available.
 */
function calculateOutfitPricing(pieces: OutfitPiece[]) {
  const totalPrice = pieces.reduce((sum, piece) => sum + piece.product.price, 0);
  const originalTotalPrice = pieces.reduce(
    (sum, piece) => sum + (piece.product.originalPrice || piece.product.price),
    0
  );

  const hasDiscount = originalTotalPrice > totalPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalTotalPrice - totalPrice) / originalTotalPrice) * 100)
    : undefined;

  return {
    totalPrice,
    originalTotalPrice: hasDiscount ? originalTotalPrice : undefined,
    discountPercentage,
  };
}

/**
 * Generates a normalized signature key for an outfit combination.
 * Prevents identical product sets from appearing multiple times in different orders.
 */
export function normalizeOutfitKey(pieces: { product: { id: string } }[]): string {
  return pieces
    .map((p) => p.product.id)
    .sort()
    .join('|');
}

/**
 * 6 Curated Fashion Edits matching THE OUTFIT CLUB's men's identity
 */
const RAW_CURATED_OUTFITS_CONFIG = [
  {
    id: 'look-oversized-street',
    slug: 'oversized-streetwear-look',
    name: 'The Oversized Streetwear Edit',
    tagline: 'Heavyweight organic cotton, architectural volume & court sneakers',
    description:
      'A masterclass in modern street proportion. Anchored by the 280 GSM dropped-shoulder tee, pooled over double-pleated wide trousers, and grounded with minimalist Italian court sneakers.',
    aesthetic: 'streetwear' as const,
    collectionSlug: 'oversized-edit',
    heroImage:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
    featured: true,
    order: 1,
    piecesConfig: [
      { id: 'toc-prod-001', role: 'top' as const, roleLabel: 'Oversized Top' },
      { id: 'toc-prod-003', role: 'bottom' as const, roleLabel: 'Wide Trousers' },
      { id: 'toc-prod-010', role: 'footwear' as const, roleLabel: 'Court Sneaker' },
      { id: 'toc-prod-017', role: 'accessory' as const, roleLabel: 'Sapphire Watch' },
    ],
  },
  {
    id: 'look-modern-tailoring',
    slug: 'modern-atelier-tailoring-look',
    name: 'Architectural Atelier Tailoring',
    tagline: 'Double-breasted virgin wool, Egyptian poplin & wholecut oxfords',
    description:
      'Sharp midnight tailoring crafted for evening elegance and high-profile occasions. Structured shoulders paired with fluid trousers and handcrafted wholecut Italian leather footwear.',
    aesthetic: 'formal' as const,
    collectionSlug: 'architectural-tailoring',
    heroImage:
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85',
    featured: true,
    order: 2,
    piecesConfig: [
      { id: 'toc-prod-020', role: 'layer' as const, roleLabel: 'Tailored Blazer' },
      { id: 'toc-prod-022', role: 'top' as const, roleLabel: 'Dress Shirt' },
      { id: 'toc-prod-021', role: 'bottom' as const, roleLabel: 'Wool Trousers' },
      { id: 'toc-prod-024', role: 'footwear' as const, roleLabel: 'Wholecut Oxfords' },
    ],
  },
  {
    id: 'look-baggy-minimal',
    slug: 'baggy-fit-minimal-look',
    name: 'The Baggy Fit Minimalist Edit',
    tagline: 'Crisp poplin drape, relaxed pleated chinos & calfskin runners',
    description:
      'An effortless balance of Parisian relaxed styling and relaxed mobility. Fluid long-staple poplin paired with generous front-pleat chinos and supple calfskin runners.',
    aesthetic: 'minimal' as const,
    collectionSlug: 'baggy-fit',
    heroImage:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85',
    featured: true,
    order: 3,
    piecesConfig: [
      { id: 'toc-prod-002', role: 'top' as const, roleLabel: 'Relaxed Poplin' },
      { id: 'toc-prod-006', role: 'bottom' as const, roleLabel: 'Pleated Chinos' },
      { id: 'toc-prod-013', role: 'footwear' as const, roleLabel: 'Calfskin Runners' },
      { id: 'toc-prod-016', role: 'accessory' as const, roleLabel: 'Leather Belt' },
    ],
  },
  {
    id: 'look-scandinavian-knit',
    slug: 'scandinavian-winter-knit-look',
    name: 'Scandinavian Chunky Knitwear Look',
    tagline: 'Heavy rib cardigan, raw Japanese selvedge & commando boots',
    description:
      'Nordic warmth meets rugged denim craftsmanship. Chunky British wool knit layered over heavyweight jersey, raw 14.5oz selvedge denim, and lug-sole Chelsea boots.',
    aesthetic: 'contemporary' as const,
    collectionSlug: 'streetwear-essentials',
    heroImage:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85',
    featured: true,
    order: 4,
    piecesConfig: [
      { id: 'toc-prod-026', role: 'layer' as const, roleLabel: 'Rib Cardigan' },
      { id: 'toc-prod-001', role: 'top' as const, roleLabel: 'Heavy Tee' },
      { id: 'toc-prod-004', role: 'bottom' as const, roleLabel: 'Selvedge Denim' },
      { id: 'toc-prod-011', role: 'footwear' as const, roleLabel: 'Commando Boots' },
    ],
  },
  {
    id: 'look-utilitarian-street',
    slug: 'utilitarian-street-look',
    name: 'Utilitarian Street Bomber Fit',
    tagline: 'Cropped utility bomber, French terry hoodie & retro court sneakers',
    description:
      'The definitive street layer. Water-resistant matte bomber jacket layered over a 450 GSM French terry hoodie, selvedge denim, and vintage-profile court sneakers.',
    aesthetic: 'streetwear' as const,
    collectionSlug: 'streetwear-essentials',
    heroImage:
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=85',
    featured: false,
    order: 5,
    piecesConfig: [
      { id: 'toc-prod-005', role: 'layer' as const, roleLabel: 'Utility Bomber' },
      { id: 'toc-prod-007', role: 'top' as const, roleLabel: 'Terry Hoodie' },
      { id: 'toc-prod-004', role: 'bottom' as const, roleLabel: 'Selvedge Denim' },
      { id: 'toc-prod-010', role: 'footwear' as const, roleLabel: 'Court Sneaker' },
    ],
  },
  {
    id: 'look-casual-weekend',
    slug: 'casual-weekend-fit',
    name: 'Everyday Casual Weekend Fit',
    tagline: 'Slub cotton polo, relaxed chinos & Belgian penny loafers',
    description:
      'Relaxed luxury for off-duty days and weekend getaways. Breathable slub cotton paired with garment-washed chinos, handmade Belgian loafers, and an artisan leather tote.',
    aesthetic: 'smart-casual' as const,
    collectionSlug: 'everyday-basics',
    heroImage:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
    featured: false,
    order: 6,
    piecesConfig: [
      { id: 'toc-prod-008', role: 'top' as const, roleLabel: 'Slub Polo' },
      { id: 'toc-prod-006', role: 'bottom' as const, roleLabel: 'Relaxed Chinos' },
      { id: 'toc-prod-012', role: 'footwear' as const, roleLabel: 'Penny Loafers' },
      { id: 'toc-prod-015', role: 'accessory' as const, roleLabel: 'Leather Tote' },
    ],
  },
];

/**
 * Resolved and validated curated outfits with duplicate combination protection.
 */
export const CURATED_OUTFITS: CuratedOutfit[] = (() => {
  const seenSignatures = new Set<string>();
  const outfits: CuratedOutfit[] = [];

  for (const config of RAW_CURATED_OUTFITS_CONFIG) {
    const validPieces: OutfitPiece[] = [];

    for (const piece of config.piecesConfig) {
      const prod = findProduct(piece.id);
      if (prod && prod.availability !== 'out-of-stock') {
        validPieces.push({
          product: prod,
          role: piece.role,
          roleLabel: piece.roleLabel,
        });
      }
    }

    // Must have at least 2 valid pieces to form a legitimate outfit
    if (validPieces.length < 2) continue;

    // Check duplicate combination signature
    const signature = normalizeOutfitKey(validPieces);
    if (seenSignatures.has(signature)) continue;
    seenSignatures.add(signature);

    const pricing = calculateOutfitPricing(validPieces);

    outfits.push({
      id: config.id,
      slug: config.slug,
      name: config.name,
      tagline: config.tagline,
      description: config.description,
      aesthetic: config.aesthetic,
      collectionSlug: config.collectionSlug,
      heroImage: config.heroImage,
      featured: config.featured,
      order: config.order,
      pieces: validPieces,
      totalPrice: pricing.totalPrice,
      originalTotalPrice: pricing.originalTotalPrice,
      discountPercentage: pricing.discountPercentage,
    });
  }

  return outfits.sort((a, b) => (a.order || 99) - (b.order || 99));
})();

/**
 * Retrieves all curated outfits.
 */
export function getCuratedOutfits(): CuratedOutfit[] {
  return CURATED_OUTFITS;
}

/**
 * Retrieves an outfit by its URL slug.
 */
export function getOutfitBySlug(slug: string): CuratedOutfit | undefined {
  if (!slug) return undefined;
  const normalized = slug.trim().toLowerCase();
  return CURATED_OUTFITS.find((o) => o.slug.toLowerCase() === normalized || o.id === normalized);
}

/**
 * Retrieves outfits that feature a specific product.
 */
export function getOutfitsForProduct(productId: string): CuratedOutfit[] {
  if (!productId) return [];
  return CURATED_OUTFITS.filter((outfit) =>
    outfit.pieces.some((piece) => piece.product.id === productId || piece.product.slug === productId)
  );
}

/**
 * Retrieves outfits matching an active curated collection.
 */
export function getOutfitsForCollection(collectionSlug: string): CuratedOutfit[] {
  if (!collectionSlug) return [];
  const normalized = collectionSlug.trim().toLowerCase();
  return CURATED_OUTFITS.filter((o) => o.collectionSlug?.toLowerCase() === normalized);
}

/**
 * Retrieves featured outfits for visual merchandising showcases.
 */
export function getFeaturedOutfits(): CuratedOutfit[] {
  return CURATED_OUTFITS.filter((o) => o.featured);
}

/**
 * Dynamically generates a complete look for any product if no pre-curated outfit exists.
 */
export function generateOutfitForProduct(product: ProductItem): CuratedOutfit | null {
  if (!product) return null;

  // Check if product is already in a curated outfit
  const existing = getOutfitsForProduct(product.id);
  if (existing.length > 0) return existing[0];

  const look = getCompleteTheLook(product, PRODUCTS_DATA);
  if (look.items.length === 0) return null;

  const allItems = [product, ...look.items];
  const pieces: OutfitPiece[] = allItems.map((item, idx) => {
    let role: OutfitPiece['role'] = 'top';
    let roleLabel = 'Complementary Garment';

    if (idx === 0) {
      roleLabel = 'Hero Piece';
    } else if (look.outfitRoleMap[item.id]) {
      roleLabel = look.outfitRoleMap[item.id];
      const lower = roleLabel.toLowerCase();
      if (lower.includes('top')) role = 'top';
      else if (lower.includes('bottom') || lower.includes('trouser')) role = 'bottom';
      else if (lower.includes('footwear') || lower.includes('shoe')) role = 'footwear';
      else if (lower.includes('layer') || lower.includes('jacket') || lower.includes('blazer')) role = 'layer';
      else role = 'accessory';
    }

    return { product: item, role, roleLabel };
  });

  const pricing = calculateOutfitPricing(pieces);

  return {
    id: `dyn-look-${product.id}`,
    slug: `curated-look-${product.slug}`,
    name: `The ${product.name} Ensemble`,
    tagline: `Curated ${product.aesthetic || 'modern'} coordination`,
    description: `A complete, balanced men's outfit curated around the ${product.name}, pairing complementary silhouettes and tone.`,
    aesthetic: product.aesthetic || 'minimal',
    heroImage: product.images[0] || product.thumbnail,
    pieces,
    totalPrice: pricing.totalPrice,
    originalTotalPrice: pricing.originalTotalPrice,
    discountPercentage: pricing.discountPercentage,
  };
}
