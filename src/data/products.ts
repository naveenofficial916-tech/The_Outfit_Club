import type {
  ProductItem,
  ProductCategory,
  ProductFilterOptions,
  ProductSortOption,
  ProductAesthetic,
  ProductFit,
  CatalogFilterState,
} from '../types';
import { calculateProductRelevance, tokenizeQuery } from '../utils/searchUtils';

/**
 * THE OUTFIT CLUB — FOUNDATIONAL PRODUCT CATALOG DATASET
 * 36 meticulously curated products covering:
 * - Clothing (T-Shirts, Shirts, Polos, Jeans, Trousers, Chinos, Shorts, Jackets, Hoodies, Sweatshirts)
 * - Tailoring (Blazers, Suits, Formal Shirts, Trousers)
 * - Knitwear (Sweaters, Cardigans, Knit Tops)
 * - Footwear (Sneakers, Boots, Loafers, Formal Shoes, Sandals)
 * - Accessories (Bags, Belts, Watches, Caps, Sunglasses)
 */

export const PRODUCTS_DATA: ProductItem[] = [
  // ==========================================
  // CLOTHING (9 Products)
  // ==========================================
  {
    id: 'toc-prod-001',
    name: 'Essential Heavyweight Oversized Tee',
    slug: 'essential-heavyweight-oversized-tee',
    category: 'clothing',
    subcategory: 'T-Shirts',
    brand: 'The Outfit Club Atelier',
    price: 68,
    currency: 'USD',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Obsidian Black', hex: '#121316', inStock: true },
      { name: 'Chalk White', hex: '#F4F3EF', inStock: true },
      { name: 'Heather Fog', hex: '#9D9FA6', inStock: true },
    ],
    colorVariants: [
      { name: 'Obsidian Black', hex: '#121316', inStock: true },
      { name: 'Chalk White', hex: '#F4F3EF', inStock: true },
      { name: 'Heather Fog', hex: '#9D9FA6', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
    description: 'Constructed from combed 280 GSM organic cotton with dropped shoulders, a tight crew neckline, and a relaxed boxy drape.',
    details: [
      '280 GSM heavyweight organic cotton',
      'Pre-shrunk jersey fabric',
      'Reinforced ribbed collar with twin-needle stitch',
      'Cut for a relaxed, architectural drape',
    ],
    rating: 4.85,
    reviewCount: 94,
    tags: ['essential', 'heavyweight', 'oversized', 'minimal', 'basics'],
    material: '100% GOTS Organic Cotton',
    fit: 'oversized',
    style: 'Scandinavian Minimalist Boxy Cut',
    aesthetic: 'minimal',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: true,
    isNewArrival: true,
    isBestseller: true,
    createdAt: '2026-02-10T08:00:00Z',
  },
  {
    id: 'toc-prod-002',
    name: 'Minimal Relaxed Poplin Shirt',
    slug: 'minimal-relaxed-poplin-shirt',
    category: 'clothing',
    subcategory: 'Shirts',
    brand: 'The Outfit Club Atelier',
    price: 135,
    originalPrice: 160,
    discountPercentage: 16,
    currency: 'USD',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Sky Celeste', hex: '#D2E0EB', inStock: true },
      { name: 'Optic White', hex: '#FFFFFF', inStock: true },
      { name: 'Washed Slate', hex: '#4A505C', inStock: true },
    ],
    colorVariants: [
      { name: 'Sky Celeste', hex: '#D2E0EB', inStock: true },
      { name: 'Optic White', hex: '#FFFFFF', inStock: true },
      { name: 'Washed Slate', hex: '#4A505C', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=85',
    description: 'A crisp long-staple cotton poplin shirt featuring a clean spread collar, curved hem, and mother-of-pearl buttons.',
    details: [
      '100% Long-Staple Egyptian Cotton Poplin',
      'Mother-of-pearl buttons with shank reinforcement',
      'Rear box pleat for fluid motion',
      'Garment washed for a soft hand-feel',
    ],
    rating: 4.78,
    reviewCount: 62,
    tags: ['shirt', 'poplin', 'smart-casual', 'contemporary', 'workwear'],
    material: '100% Long-Staple Egyptian Cotton',
    fit: 'relaxed',
    style: 'Modern Parisian Relaxed Tailoring',
    aesthetic: 'smart-casual',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: true,
    isNewArrival: true,
    isBestseller: false,
    createdAt: '2026-02-14T09:30:00Z',
  },
  {
    id: 'toc-prod-003',
    name: 'Pleated Wide-Leg Trousers',
    slug: 'pleated-wide-leg-trousers',
    category: 'clothing',
    subcategory: 'Trousers',
    brand: 'The Outfit Club Atelier',
    price: 175,
    currency: 'USD',
    sizes: ['28', '30', '31', '32', '34', '36'],
    colors: [
      { name: 'Charcoal Mélange', hex: '#2E3038', inStock: true },
      { name: 'Dark Olive', hex: '#3B4136', inStock: true },
      { name: 'Sand Camel', hex: '#C4B296', inStock: true },
    ],
    colorVariants: [
      { name: 'Charcoal Mélange', hex: '#2E3038', inStock: true },
      { name: 'Dark Olive', hex: '#3B4136', inStock: true },
      { name: 'Sand Camel', hex: '#C4B296', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=85',
    description: 'Double front pleats create an elegant, expansive silhouette in a fluid wool-twill blend that pools over footwear.',
    details: [
      'Fine Italian wool and tencel blend',
      'Deep double front pleats',
      'Concealed zip fly with extended tab closure',
      'Unfinished hem for personalized length tailoring',
    ],
    rating: 4.92,
    reviewCount: 47,
    tags: ['trousers', 'pleated', 'wide-leg', 'contemporary', 'tailoring'],
    material: '60% Wool, 38% Tencel, 2% Elastane',
    fit: 'relaxed',
    style: 'Contemporary Tailored Wide-Leg',
    aesthetic: 'contemporary',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: true,
    isNewArrival: true,
    isBestseller: true,
    createdAt: '2026-02-18T11:00:00Z',
  },
  {
    id: 'toc-prod-004',
    name: 'Raw Japanese Selvedge Denim',
    slug: 'raw-japanese-selvedge-denim',
    category: 'clothing',
    subcategory: 'Jeans',
    brand: 'Kurabo x The Outfit Club',
    price: 195,
    currency: 'USD',
    sizes: ['28', '30', '31', '32', '34', '36'],
    colors: [
      { name: 'Deep Indigo', hex: '#1C273C', inStock: true },
      { name: 'Solid Black', hex: '#0B0C0E', inStock: true },
    ],
    colorVariants: [
      { name: 'Deep Indigo', hex: '#1C273C', inStock: true },
      { name: 'Solid Black', hex: '#0B0C0E', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=85',
    description: 'Woven on vintage shuttle looms in Okayama, Japan. 13.5 oz unwashed red-line selvedge denim that breaks in uniquely with wear.',
    details: [
      '13.5 oz Okayama selvedge denim',
      'Classic red-line ticker along outseam',
      'Custom gunmetal donut buttons',
      'Vegetable-tanned leather back patch',
    ],
    rating: 4.88,
    reviewCount: 38,
    tags: ['denim', 'selvedge', 'vintage', 'raw-denim', 'streetwear'],
    material: '100% Kurabo Mills Japanese Cotton',
    fit: 'straight',
    style: 'Vintage Straight-Leg Heritage',
    aesthetic: 'vintage',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: false,
    isNewArrival: false,
    isBestseller: true,
    createdAt: '2026-01-12T14:15:00Z',
  },
  {
    id: 'toc-prod-005',
    name: 'Cropped Minimal Utility Bomber',
    slug: 'cropped-minimal-utility-bomber',
    category: 'clothing',
    subcategory: 'Jackets',
    brand: 'The Outfit Club Atelier',
    price: 260,
    originalPrice: 310,
    discountPercentage: 16,
    currency: 'USD',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Carbon Ash', hex: '#1E2024', inStock: true },
      { name: 'Sage Drab', hex: '#586053', inStock: true },
    ],
    colorVariants: [
      { name: 'Carbon Ash', hex: '#1E2024', inStock: true },
      { name: 'Sage Drab', hex: '#586053', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85',
    description: 'A cropped technical silhouette featuring a two-way Swiss Riri zip, articulated sleeve darts, and a water-repellent matte shell.',
    details: [
      'High-density water-resistant nylon shell',
      'Custom Swiss two-way metal zipper',
      'Interior storm flap and zip chest pocket',
      'Ribbed wool-blend collar and cuffs',
    ],
    rating: 4.91,
    reviewCount: 51,
    tags: ['bomber', 'jacket', 'outerwear', 'streetwear', 'utility'],
    material: '100% Recycled Technical Matte Nylon',
    fit: 'relaxed',
    style: 'Tokyo Technical Streetwear',
    aesthetic: 'streetwear',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: true,
    isNewArrival: true,
    isBestseller: true,
    createdAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'toc-prod-006',
    name: 'Luxury Pima Cotton Piqué Polo',
    slug: 'luxury-pima-cotton-pique-polo',
    category: 'clothing',
    subcategory: 'Polos',
    brand: 'The Outfit Club Atelier',
    price: 115,
    currency: 'USD',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Obsidian Navy', hex: '#1B2432', inStock: true },
      { name: 'Chalk White', hex: '#F4F3EF', inStock: true },
      { name: 'Slate Grey', hex: '#63666A', inStock: true },
    ],
    colorVariants: [
      { name: 'Obsidian Navy', hex: '#1B2432', inStock: true },
      { name: 'Chalk White', hex: '#F4F3EF', inStock: true },
      { name: 'Slate Grey', hex: '#63666A', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=1000&q=85',
    description: 'Knit from long-staple Peruvian Pima cotton with a structured spread collar, genuine mother-of-pearl buttons, and ribbed sleeve cuffs.',
    details: [
      '100% Long-Staple Peruvian Pima Cotton',
      'Reinforced split hem for clean untucked drape',
      'Australian mother-of-pearl 3-button placket',
      'Pre-washed for a silky hand feel that resists fading',
    ],
    rating: 4.91,
    reviewCount: 42,
    tags: ['polo', 'pima-cotton', 'smart-casual', 'luxury', 'men'],
    material: '100% Pima Cotton Piqué',
    fit: 'regular',
    style: 'Refined Menswear Smart Casual',
    aesthetic: 'luxury',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: false,
    isNewArrival: false,
    isBestseller: true,
    createdAt: '2026-01-28T16:00:00Z',
  },
  {
    id: 'toc-prod-007',
    name: 'Structured French Terry Hoodie',
    slug: 'structured-french-terry-hoodie',
    category: 'clothing',
    subcategory: 'Hoodies',
    brand: 'The Outfit Club Atelier',
    price: 145,
    currency: 'USD',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Washed Oat', hex: '#DDD8CE', inStock: true },
      { name: 'Faded Black', hex: '#26272B', inStock: true },
      { name: 'Deep Moss', hex: '#2F362C', inStock: false },
    ],
    colorVariants: [
      { name: 'Washed Oat', hex: '#DDD8CE', inStock: true },
      { name: 'Faded Black', hex: '#26272B', inStock: true },
      { name: 'Deep Moss', hex: '#2F362C', inStock: false },
    ],
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85',
    description: 'Crafted from 450 GSM diagonal-loop French terry with double-layered hood, seamless kangaroo pocket, and no drawstrings for a pure silhouette.',
    details: [
      '450 GSM unbrushed organic cotton terry',
      'Clean drawstring-free double layered hood',
      'Reinforced rib cuffs and bottom hem',
      'Pre-washed to preserve fit and structure',
    ],
    rating: 4.82,
    reviewCount: 79,
    tags: ['hoodie', 'sweatshirt', 'athleisure', 'casual', 'streetwear'],
    material: '100% Organic French Terry Cotton',
    fit: 'relaxed',
    style: 'Contemporary Clean Streetwear',
    aesthetic: 'athleisure',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: true,
    isNewArrival: true,
    isBestseller: false,
    createdAt: '2026-02-12T13:40:00Z',
  },
  {
    id: 'toc-prod-008',
    name: 'Pleated Relaxed-Fit Chinos',
    slug: 'pleated-relaxed-fit-chinos',
    category: 'clothing',
    subcategory: 'Chinos',
    brand: 'The Outfit Club Atelier',
    price: 165,
    originalPrice: 195,
    discountPercentage: 15,
    currency: 'USD',
    sizes: ['30', '32', '34', '36', '38'],
    colors: [
      { name: 'British Khaki', hex: '#C3B091', inStock: true },
      { name: 'Dark Olive', hex: '#404537', inStock: true },
      { name: 'Charcoal Grey', hex: '#36383E', inStock: true },
    ],
    colorVariants: [
      { name: 'British Khaki', hex: '#C3B091', inStock: true },
      { name: 'Dark Olive', hex: '#404537', inStock: true },
      { name: 'Charcoal Grey', hex: '#36383E', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=85',
    description: 'Tailored with double front pleats and a relaxed tapered leg from dense Japanese cotton twill with an interior curtain waistband.',
    details: [
      '100% Heavyweight Japanese Cotton Twill',
      'Double forward pleats with pressed center crease',
      'Horn button closure and side waist adjuster tabs',
      'Deep slash pockets and dual rear buttoned welt pockets',
    ],
    rating: 4.88,
    reviewCount: 36,
    tags: ['chinos', 'trousers', 'pleated', 'smart-casual', 'men'],
    material: '100% Japanese Cotton Twill',
    fit: 'relaxed',
    style: 'Modern Tailored Menswear Casual',
    aesthetic: 'smart-casual',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: true,
    isNewArrival: true,
    isBestseller: false,
    createdAt: '2026-02-22T14:00:00Z',
  },
  {
    id: 'toc-prod-009',
    name: 'Washed Organic Corduroy Overshirt',
    slug: 'washed-organic-corduroy-overshirt',
    category: 'clothing',
    subcategory: 'Shirts',
    brand: 'The Outfit Club Atelier',
    price: 165,
    currency: 'USD',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Warm Camel', hex: '#AF8B62', inStock: true },
      { name: 'Forest Moss', hex: '#314234', inStock: true },
    ],
    colorVariants: [
      { name: 'Warm Camel', hex: '#AF8B62', inStock: true },
      { name: 'Forest Moss', hex: '#314234', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=85',
    description: 'Tailored from 8-wale organic cotton corduroy, enzyme-washed for an authentic velvety drape with dual chest flap pockets.',
    details: [
      '8-wale heavyweight cotton corduroy',
      'Twin button-down chest flap pockets',
      'Corozo nut button closures',
      'Straight hem with side vents for layering',
    ],
    rating: 4.79,
    reviewCount: 41,
    tags: ['overshirt', 'corduroy', 'casual', 'vintage', 'layering'],
    material: '100% Organic Cotton Corduroy',
    fit: 'regular',
    style: 'Modern Heritage Workshirt',
    aesthetic: 'casual',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: false,
    isNewArrival: false,
    isBestseller: false,
    createdAt: '2026-01-19T09:10:00Z',
  },

  // ==========================================
  // TAILORING (6 Products)
  // ==========================================
  {
    id: 'toc-prod-010',
    name: 'Tailored Midnight Double-Breasted Blazer',
    slug: 'tailored-midnight-double-breasted-blazer',
    category: 'tailoring',
    subcategory: 'Blazers',
    brand: 'The Outfit Club Sartoriale',
    price: 340,
    originalPrice: 400,
    discountPercentage: 15,
    currency: 'USD',
    sizes: ['36R', '38R', '40R', '42R', '44R'],
    colors: [
      { name: 'Midnight Navy', hex: '#151926', inStock: true },
      { name: 'Caviar Black', hex: '#0B0B0D', inStock: true },
    ],
    colorVariants: [
      { name: 'Midnight Navy', hex: '#151926', inStock: true },
      { name: 'Caviar Black', hex: '#0B0B0D', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85',
    description: 'An architectural 6-on-2 double-breasted jacket with wide peak lapels, half-canvas chest construction, and kissing horn buttons.',
    details: [
      'Super 130s Italian virgin wool worsted',
      'Half-canvas internal chest piece for shape longevity',
      'Generous 10.5cm peak lapels with boutonnière loop',
      'Double back vents and interior pen pocket',
    ],
    rating: 4.96,
    reviewCount: 68,
    tags: ['blazer', 'tailoring', 'formal', 'luxury', 'suit-jacket'],
    material: 'Super 130s Italian Wool (Vitale Barberis Canonico)',
    fit: 'tailored',
    style: 'Classic Milanese Sartorial Architecture',
    aesthetic: 'formal',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: true,
    isNewArrival: true,
    isBestseller: true,
    createdAt: '2026-02-15T15:00:00Z',
  },
  {
    id: 'toc-prod-011',
    name: 'Atelier Virgin Wool Two-Piece Suit',
    slug: 'atelier-virgin-wool-two-piece-suit',
    category: 'tailoring',
    subcategory: 'Suits',
    brand: 'The Outfit Club Sartoriale',
    price: 580,
    currency: 'USD',
    sizes: ['36R', '38R', '40R', '42R', '44R'],
    colors: [
      { name: 'Charcoal Pinstripe', hex: '#2A2D33', inStock: true },
      { name: 'Deep Obsidian', hex: '#111215', inStock: true },
    ],
    colorVariants: [
      { name: 'Charcoal Pinstripe', hex: '#2A2D33', inStock: true },
      { name: 'Deep Obsidian', hex: '#111215', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85',
    description: 'A contemporary two-piece suit comprising a single-breasted two-button jacket and matching flat-front tailored trousers with side adjusters.',
    details: [
      '100% Italian Virgin Wool (300 GSM)',
      'Bemberg cupro lining with contrast piping',
      'Trouser features side buckle tab waist adjusters (belt-free)',
      'Constructed with pick-stitching along lapel edges',
    ],
    rating: 4.97,
    reviewCount: 39,
    tags: ['suit', 'tailoring', 'luxury', 'formal', 'executive'],
    material: '100% Virgin Wool, 100% Cupro Lining',
    fit: 'tailored',
    style: 'Modern Executive Sartorial Suit',
    aesthetic: 'luxury',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: false,
    isNewArrival: false,
    isBestseller: true,
    createdAt: '2026-01-20T12:00:00Z',
  },
  {
    id: 'toc-prod-012',
    name: 'Egyptian Cotton Formal Dress Shirt',
    slug: 'egyptian-cotton-formal-dress-shirt',
    category: 'tailoring',
    subcategory: 'Formal Shirts',
    brand: 'The Outfit Club Sartoriale',
    price: 150,
    currency: 'USD',
    sizes: ['14.5', '15.0', '15.5', '16.0', '16.5'],
    colors: [
      { name: 'Crisp Alabaster', hex: '#FFFFFF', inStock: true },
      { name: 'Pale Lavender', hex: '#E6E4EE', inStock: true },
    ],
    colorVariants: [
      { name: 'Crisp Alabaster', hex: '#FFFFFF', inStock: true },
      { name: 'Pale Lavender', hex: '#E6E4EE', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1620012253295-c15c429fccf8?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1620012253295-c15c429fccf8?auto=format&fit=crop&w=1000&q=85',
    description: '120/2 two-ply Giza Egyptian cotton woven in a delicate twill with removable brass collar stays and French convertible cuffs.',
    details: [
      '120/2 two-ply long-staple Giza cotton',
      'Semi-spread collar with genuine brass stays included',
      'French cuff option compatible with cufflinks',
      'Single-needle tailoring with 21 stitches per inch',
    ],
    rating: 4.89,
    reviewCount: 44,
    tags: ['formal-shirt', 'tailoring', 'formal', 'luxury', 'dress-shirt'],
    material: '100% Giza Egyptian Cotton (120/2 Twill)',
    fit: 'slim',
    style: 'Savile Row Precision Formalwear',
    aesthetic: 'formal',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: true,
    isNewArrival: true,
    isBestseller: false,
    createdAt: '2026-02-17T09:00:00Z',
  },
  {
    id: 'toc-prod-013',
    name: 'Tailored High-Waist Formal Trousers',
    slug: 'tailored-high-waist-formal-trousers',
    category: 'tailoring',
    subcategory: 'Trousers',
    brand: 'The Outfit Club Sartoriale',
    price: 195,
    currency: 'USD',
    sizes: ['28', '30', '31', '32', '34', '36'],
    colors: [
      { name: 'Flannel Grey', hex: '#53565F', inStock: true },
      { name: 'Dark Navy', hex: '#131B2A', inStock: true },
    ],
    colorVariants: [
      { name: 'Flannel Grey', hex: '#53565F', inStock: true },
      { name: 'Dark Navy', hex: '#131B2A', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=85',
    description: 'High-rise silhouette with Hollywood waistband, single forward pleat, and clean taper through the calf.',
    details: [
      'High-rise 11.5" Hollywood waistband',
      'Forward pleats for classic drape',
      'Curved rear split waistband for ergonomic seating comfort',
      'Interior curtain waistband in striped shirting fabric',
    ],
    rating: 4.87,
    reviewCount: 31,
    tags: ['trousers', 'formal', 'tailoring', 'high-waist', 'wool'],
    material: '100% Wool Flannel',
    fit: 'tailored',
    style: 'Mid-Century Sartorial High-Rise',
    aesthetic: 'smart-casual',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: false,
    isNewArrival: false,
    isBestseller: false,
    createdAt: '2026-01-25T11:30:00Z',
  },
  {
    id: 'toc-prod-014',
    name: 'Unstructured Italian Linen Blazer',
    slug: 'unstructured-italian-linen-blazer',
    category: 'tailoring',
    subcategory: 'Blazers',
    brand: 'The Outfit Club Sartoriale',
    price: 290,
    originalPrice: 340,
    discountPercentage: 15,
    currency: 'USD',
    sizes: ['36R', '38R', '40R', '42R'],
    colors: [
      { name: 'Sand Dune', hex: '#D2C4B1', inStock: true },
      { name: 'Terracotta Rust', hex: '#B25D42', inStock: true },
    ],
    colorVariants: [
      { name: 'Sand Dune', hex: '#D2C4B1', inStock: true },
      { name: 'Terracotta Rust', hex: '#B25D42', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1000&q=85',
    description: 'Completely unlined and unpadded for effortless warm-weather drape. Cut from breathable Delave Italian linen.',
    details: [
      '100% Pure Italian Delave Linen',
      'Neapolitan spalla camicia shirt-style shoulder construction',
      'Curved barchetta chest pocket',
      'Patch waist pockets with unlined interior',
    ],
    rating: 4.84,
    reviewCount: 29,
    tags: ['blazer', 'linen', 'smart-casual', 'summer', 'tailoring'],
    material: '100% Pure Italian Delave Linen',
    fit: 'relaxed',
    style: 'Neapolitan Unstructured Resort Tailoring',
    aesthetic: 'smart-casual',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: true,
    isNewArrival: true,
    isBestseller: false,
    createdAt: '2026-02-23T14:10:00Z',
  },
  {
    id: 'toc-prod-015',
    name: 'Contemporary Charcoal Slim Suit',
    slug: 'contemporary-charcoal-slim-suit',
    category: 'tailoring',
    subcategory: 'Suits',
    brand: 'The Outfit Club Sartoriale',
    price: 520,
    originalPrice: 620,
    discountPercentage: 16,
    currency: 'USD',
    sizes: ['36R', '38R', '40R', '42R', '44R'],
    colors: [
      { name: 'Charcoal Heather', hex: '#34373F', inStock: true },
      { name: 'Deep Navy', hex: '#161F2E', inStock: true },
    ],
    colorVariants: [
      { name: 'Charcoal Heather', hex: '#34373F', inStock: true },
      { name: 'Deep Navy', hex: '#161F2E', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1000&q=85',
    description: 'Precision cut two-piece suit with notch lapels, structured shoulder padding, and tapered slim-cut flat front trousers.',
    details: [
      'Super 110s Wool with natural two-way mechanical stretch',
      'Notch lapel with milanese keyhole buttonhole',
      'Flat front trousers with hidden coin pocket inside right front pocket',
      'Fully canvassed lapels and chest',
    ],
    rating: 4.93,
    reviewCount: 52,
    tags: ['suit', 'slim-fit', 'tailoring', 'formal', 'charcoal'],
    material: '98% Super 110s Wool, 2% Elastane',
    fit: 'slim',
    style: 'Streamlined Modern Slim Fit',
    aesthetic: 'formal',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: false,
    isNewArrival: false,
    isBestseller: true,
    createdAt: '2026-01-14T08:20:00Z',
  },

  // ==========================================
  // KNITWEAR (6 Products)
  // ==========================================
  {
    id: 'toc-prod-016',
    name: 'Pure Mongolian Cashmere Crewneck',
    slug: 'pure-mongolian-cashmere-crewneck',
    category: 'knitwear',
    subcategory: 'Sweaters',
    brand: 'The Outfit Club Atelier',
    price: 250,
    currency: 'USD',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Almond Melange', hex: '#D6C8B4', inStock: true },
      { name: 'Carbon Black', hex: '#131417', inStock: true },
      { name: 'Navy Frost', hex: '#2C3545', inStock: true },
    ],
    colorVariants: [
      { name: 'Almond Melange', hex: '#D6C8B4', inStock: true },
      { name: 'Carbon Black', hex: '#131417', inStock: true },
      { name: 'Navy Frost', hex: '#2C3545', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85',
    description: 'Knit from grade-A two-ply cashmere sourced sustainably from Inner Mongolia. Featherlight warmth with exceptionally low pilling tendency.',
    details: [
      '100% Grade-A Mongolian Cashmere (15.5 micron fiber)',
      '12-gauge 2-ply plain jersey knit',
      'Tubular rib collar, cuffs, and hem with lycra thread recovery',
      'Fully fashioned raglan armholes',
    ],
    rating: 4.94,
    reviewCount: 88,
    tags: ['cashmere', 'knitwear', 'crewneck', 'luxury', 'essential'],
    material: '100% Grade-A Mongolian Cashmere',
    fit: 'regular',
    style: 'Timeless Understated Luxury Knitwear',
    aesthetic: 'luxury',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: true,
    isNewArrival: true,
    isBestseller: true,
    createdAt: '2026-02-11T12:00:00Z',
  },
  {
    id: 'toc-prod-017',
    name: 'Relaxed Chunky Rib Knit Cardigan',
    slug: 'relaxed-chunky-rib-knit-cardigan',
    category: 'knitwear',
    subcategory: 'Cardigans',
    brand: 'The Outfit Club Atelier',
    price: 210,
    originalPrice: 250,
    discountPercentage: 16,
    currency: 'USD',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Oatmeal Tweed', hex: '#D1C7BA', inStock: true },
      { name: 'Dark Moss', hex: '#373F33', inStock: true },
    ],
    colorVariants: [
      { name: 'Oatmeal Tweed', hex: '#D1C7BA', inStock: true },
      { name: 'Dark Moss', hex: '#373F33', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=85',
    description: 'A 5-gauge fisherman rib cardigan featuring a deep V-neckline, substantial genuine horn buttons, and front patch pockets.',
    details: [
      '100% British Lambswool 5-gauge knit',
      'Genuine matte horn button closure',
      'Saddle shoulder construction for easy shoulder drape',
      'Reinforced front pocket openings',
    ],
    rating: 4.88,
    reviewCount: 46,
    tags: ['cardigan', 'knitwear', 'wool', 'relaxed', 'smart-casual'],
    material: '100% Pure British Lambswool',
    fit: 'relaxed',
    style: 'Artisanal Heritage Fisherman Rib',
    aesthetic: 'smart-casual',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: false,
    isNewArrival: false,
    isBestseller: true,
    createdAt: '2026-01-18T10:30:00Z',
  },
  {
    id: 'toc-prod-018',
    name: 'Extra-Fine Merino Wool Turtleneck',
    slug: 'extra-fine-merino-wool-turtleneck',
    category: 'knitwear',
    subcategory: 'Sweaters',
    brand: 'The Outfit Club Sartoriale',
    price: 160,
    currency: 'USD',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Bordeaux Plum', hex: '#4C2433', inStock: true },
      { name: 'Jet Black', hex: '#0C0D0F', inStock: true },
      { name: 'Camel Tan', hex: '#B8966E', inStock: true },
    ],
    colorVariants: [
      { name: 'Bordeaux Plum', hex: '#4C2433', inStock: true },
      { name: 'Jet Black', hex: '#0C0D0F', inStock: true },
      { name: 'Camel Tan', hex: '#B8966E', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85',
    description: 'Spun from 19.5-micron Australian merino wool into a smooth 16-gauge micro-jersey ideal for layering under tailored blazers.',
    details: [
      '100% Extrafine Australian Merino Wool',
      'Anti-shrinkage total easy care treatment',
      'Ribbed rollneck collar that stays upright',
      'Seamless flatlock shoulder seams',
    ],
    rating: 4.87,
    reviewCount: 35,
    tags: ['turtleneck', 'merino', 'tailoring-layer', 'minimal', 'formal'],
    material: '100% Extrafine Australian Merino Wool',
    fit: 'slim',
    style: 'High-Fashion Tailoring Base Layer',
    aesthetic: 'minimal',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: true,
    isNewArrival: true,
    isBestseller: false,
    createdAt: '2026-02-19T13:15:00Z',
  },
  {
    id: 'toc-prod-019',
    name: 'Fine Merino Wool Knit Polo',
    slug: 'fine-merino-wool-knit-polo',
    category: 'knitwear',
    subcategory: 'Sweaters',
    brand: 'The Outfit Club Atelier',
    price: 185,
    currency: 'USD',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Charcoal Melange', hex: '#373A40', inStock: true },
      { name: 'Dark Camel', hex: '#8E735B', inStock: true },
      { name: 'Obsidian Navy', hex: '#1C2333', inStock: true },
    ],
    colorVariants: [
      { name: 'Charcoal Melange', hex: '#373A40', inStock: true },
      { name: 'Dark Camel', hex: '#8E735B', inStock: true },
      { name: 'Obsidian Navy', hex: '#1C2333', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=85',
    description: 'Spun from 19.5 micron ultra-fine Australian Merino wool in a 14-gauge fully-fashioned knit with a retro Johnny open collar.',
    details: [
      '100% Extra-Fine Australian Merino Wool',
      '14-gauge fully-fashioned jersey stitch',
      'Ribbed polo collar with open neck placket',
      'Naturally odor-resistant and temperature-regulating',
    ],
    rating: 4.89,
    reviewCount: 38,
    tags: ['knitwear', 'merino', 'polo', 'luxury', 'men'],
    material: '100% Extra-Fine Merino Wool (14-Gauge)',
    fit: 'regular',
    style: 'Contemporary Menswear Knitwear',
    aesthetic: 'luxury',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: true,
    isNewArrival: true,
    isBestseller: false,
    createdAt: '2026-02-21T15:30:00Z',
  },
  {
    id: 'toc-prod-020',
    name: 'Brushed Alpaca V-Neck Sweater',
    slug: 'brushed-alpaca-v-neck-sweater',
    category: 'knitwear',
    subcategory: 'Sweaters',
    brand: 'The Outfit Club Atelier',
    price: 185,
    originalPrice: 220,
    discountPercentage: 16,
    currency: 'USD',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Warm Cognac', hex: '#A36841', inStock: true },
      { name: 'Misty Blue', hex: '#6D8299', inStock: true },
    ],
    colorVariants: [
      { name: 'Warm Cognac', hex: '#A36841', inStock: true },
      { name: 'Misty Blue', hex: '#6D8299', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85',
    description: 'Peruvian baby alpaca brushed gently with natural teasels for a halo texture, deep V-neckline, and relaxed dropped shoulders.',
    details: [
      '68% Peruvian Baby Alpaca, 22% Wool, 10% Recycled Polyamide',
      'Brushed halo fleece surface finish',
      'Deep ribbed V-neckline',
      'Soft ribbed cuffs designed to roll up',
    ],
    rating: 4.89,
    reviewCount: 40,
    tags: ['alpaca', 'sweater', 'v-neck', 'cozy', 'luxury'],
    material: '68% Baby Alpaca, 22% Wool, 10% Polyamide',
    fit: 'relaxed',
    style: 'Textural Bohemian Luxury',
    aesthetic: 'luxury',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: false,
    isNewArrival: false,
    isBestseller: false,
    createdAt: '2026-01-15T11:00:00Z',
  },
  {
    id: 'toc-prod-021',
    name: 'Milano Stitch Zip Polo Knit',
    slug: 'milano-stitch-zip-polo-knit',
    category: 'knitwear',
    subcategory: 'Knit Tops',
    brand: 'The Outfit Club Sartoriale',
    price: 145,
    currency: 'USD',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Dark Slate', hex: '#2A303A', inStock: true },
      { name: 'Ecru Cream', hex: '#ECE7DD', inStock: true },
    ],
    colorVariants: [
      { name: 'Dark Slate', hex: '#2A303A', inStock: true },
      { name: 'Ecru Cream', hex: '#ECE7DD', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=85',
    description: 'High-density Milano stitch structure gives this half-zip knit polo jacket-like crispness while retaining supreme cotton breathability.',
    details: [
      '100% Combed Compact Cotton Milano Rib',
      'Gunmetal Raccagni half-zip closure with engraved pull',
      'Structured polo collar that retains form without sagging',
      'Straight cut hem with side splits',
    ],
    rating: 4.86,
    reviewCount: 37,
    tags: ['polo-knit', 'zip-polo', 'smart-casual', 'contemporary', 'spring'],
    material: '100% Compact Combed Cotton',
    fit: 'regular',
    style: 'Modern Riviera Smart-Casual',
    aesthetic: 'smart-casual',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: true,
    isNewArrival: true,
    isBestseller: false,
    createdAt: '2026-02-16T14:45:00Z',
  },

  // ==========================================
  // FOOTWEAR (8 Products)
  // ==========================================
  {
    id: 'toc-prod-022',
    name: 'Urban Minimalist Calfskin Runner',
    slug: 'urban-minimalist-calfskin-runner',
    category: 'footwear',
    subcategory: 'Sneakers',
    brand: 'The Outfit Club Calzature',
    price: 210,
    currency: 'USD',
    sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    colors: [
      { name: 'Monochrome Chalk', hex: '#EDECE8', inStock: true },
      { name: 'All Black', hex: '#111214', inStock: true },
      { name: 'Shadow Suede', hex: '#63656C', inStock: true },
    ],
    colorVariants: [
      { name: 'Monochrome Chalk', hex: '#EDECE8', inStock: true },
      { name: 'All Black', hex: '#111214', inStock: true },
      { name: 'Shadow Suede', hex: '#63656C', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=85',
    description: 'Handcrafted in Civitanova Marche, Italy. Full-grain calfskin upper paired with a lightweight dual-density EVA midsole and Vibram outsole.',
    details: [
      'Full-grain Italian nappa and suede calfskin',
      'Custom lightweight Vibram rubber tread outsole',
      'Vegetable-tanned leather footbed with memory foam cushioning',
      'Subtle blind-embossed serial stamp at heel counter',
    ],
    rating: 4.93,
    reviewCount: 114,
    tags: ['sneakers', 'footwear', 'runner', 'streetwear', 'minimal'],
    material: '100% Full-Grain Italian Calfskin, Vibram Outsole',
    fit: 'regular',
    style: 'Modern Italian Luxury Runner',
    aesthetic: 'minimal',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: true,
    isNewArrival: true,
    isBestseller: true,
    createdAt: '2026-02-08T09:00:00Z',
  },
  {
    id: 'toc-prod-023',
    name: 'Modern Commando Chelsea Boots',
    slug: 'modern-commando-chelsea-boots',
    category: 'footwear',
    subcategory: 'Boots',
    brand: 'The Outfit Club Calzature',
    price: 295,
    originalPrice: 350,
    discountPercentage: 16,
    currency: 'USD',
    sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    colors: [
      { name: 'Matte Onyx', hex: '#141416', inStock: true },
      { name: 'Dark Cigar Suede', hex: '#443228', inStock: true },
    ],
    colorVariants: [
      { name: 'Matte Onyx', hex: '#141416', inStock: true },
      { name: 'Dark Cigar Suede', hex: '#443228', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=85',
    description: 'Goodyear welted Chelsea boot with custom high-grip lug sole, elasticated side gussets, and dual woven pull tabs.',
    details: [
      'Goodyear welt construction (resoleable)',
      'Oiled pull-up calfskin that repels water and stains',
      'Chunky commando rubber lug tread with 38mm heel',
      'High-grade dual elastic gore webbing',
    ],
    rating: 4.91,
    reviewCount: 82,
    tags: ['chelsea-boots', 'boots', 'leather', 'contemporary', 'footwear'],
    material: 'Oiled Italian Full-Grain Leather, Rubber Lug Sole',
    fit: 'regular',
    style: 'Contemporary Rugged Chelsea',
    aesthetic: 'contemporary',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: false,
    isNewArrival: false,
    isBestseller: true,
    createdAt: '2026-01-10T14:00:00Z',
  },
  {
    id: 'toc-prod-024',
    name: 'Lug-Sole Calfskin Penny Loafers',
    slug: 'lug-sole-calfskin-penny-loafers',
    category: 'footwear',
    subcategory: 'Loafers',
    brand: 'The Outfit Club Calzature',
    price: 240,
    currency: 'USD',
    sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    colors: [
      { name: 'Glazed Burgundy', hex: '#4A1D24', inStock: true },
      { name: 'Polished Black', hex: '#111214', inStock: true },
    ],
    colorVariants: [
      { name: 'Glazed Burgundy', hex: '#4A1D24', inStock: true },
      { name: 'Polished Black', hex: '#111214', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=85',
    description: 'A contemporary spin on the classic Ivy League penny loafer, balanced by an assertive lightweight lug sole and hand-stitched apron.',
    details: [
      'Semi-aniline polished box calfskin',
      'Hand-stitched beefroll moc toe apron',
      'Extralight rubber cleated lug sole',
      'Soft calfskin interior lining',
    ],
    rating: 4.88,
    reviewCount: 49,
    tags: ['loafers', 'penny-loafers', 'smart-casual', 'lug-sole', 'footwear'],
    material: 'Polished Box Calfskin Leather',
    fit: 'regular',
    style: 'Subversive Sartorial Penny Loafer',
    aesthetic: 'smart-casual',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: true,
    isNewArrival: true,
    isBestseller: true,
    createdAt: '2026-02-18T16:20:00Z',
  },
  {
    id: 'toc-prod-025',
    name: 'Wholecut Italian Leather Oxfords',
    slug: 'wholecut-italian-leather-oxfords',
    category: 'footwear',
    subcategory: 'Formal Shoes',
    brand: 'The Outfit Club Calzature',
    price: 320,
    currency: 'USD',
    sizes: ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    colors: [
      { name: 'Dark Museum Calf', hex: '#261F1A', inStock: true },
      { name: 'Piano Black', hex: '#0B0B0C', inStock: true },
    ],
    colorVariants: [
      { name: 'Dark Museum Calf', hex: '#261F1A', inStock: true },
      { name: 'Piano Black', hex: '#0B0B0C', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=85',
    description: 'Sculpted from a single flawless piece of full-grain French calfskin with closed 5-eyelet lacing and channeled leather soles.',
    details: [
      'Genuine wholecut pattern (single piece of leather upper)',
      'Hand-painted museum patina finish',
      'Oak-bark tanned closed-channel leather sole with brass toe plates',
      'Blake-Rapid stitch construction',
    ],
    rating: 4.96,
    reviewCount: 31,
    tags: ['oxfords', 'formal-shoes', 'wholecut', 'luxury', 'formal'],
    material: 'French Box Calfskin, Oak-Bark Tanned Leather Sole',
    fit: 'tailored',
    style: 'Ultra-Refined Formal Black Tie',
    aesthetic: 'formal',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: false,
    isNewArrival: false,
    isBestseller: false,
    createdAt: '2026-01-08T10:00:00Z',
  },
  {
    id: 'toc-prod-026',
    name: 'Low-Top Nappa Court Sneakers',
    slug: 'low-top-nappa-court-sneakers',
    category: 'footwear',
    subcategory: 'Sneakers',
    brand: 'The Outfit Club Calzature',
    price: 185,
    currency: 'USD',
    sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    colors: [
      { name: 'Pure White', hex: '#FAFAFA', inStock: true },
      { name: 'White / Suede Gum', hex: '#EBE6DE', inStock: true },
    ],
    colorVariants: [
      { name: 'Pure White', hex: '#FAFAFA', inStock: true },
      { name: 'White / Suede Gum', hex: '#EBE6DE', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=85',
    description: 'Clean minimalist court sneaker with zero external branding, Margom-stitched rubber cupsole, and waxed cotton laces.',
    details: [
      'Ultra-supple Italian Nappa leather upper',
      'Italian Margom rubber cupsole stitched 360-degrees',
      'Removable molded insole lined in calfskin',
      'Waxed tone-on-tone cotton laces',
    ],
    rating: 4.89,
    reviewCount: 96,
    tags: ['court-sneakers', 'minimal-sneakers', 'white-shoes', 'streetwear', 'basics'],
    material: '100% Italian Nappa Leather, Margom Rubber Sole',
    fit: 'regular',
    style: 'Iconic Minimalist Court Shoe',
    aesthetic: 'minimal',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: false,
    isNewArrival: false,
    isBestseller: true,
    createdAt: '2026-01-05T08:30:00Z',
  },
  {
    id: 'toc-prod-027',
    name: 'Architectural Leather Slide Sandals',
    slug: 'architectural-leather-slide-sandals',
    category: 'footwear',
    subcategory: 'Sandals',
    brand: 'The Outfit Club Calzature',
    price: 140,
    originalPrice: 170,
    discountPercentage: 18,
    currency: 'USD',
    sizes: ['US 6', 'US 7', 'US 8', 'US 9', 'US 10'],
    colors: [
      { name: 'Warm Saddle', hex: '#9E6747', inStock: true },
      { name: 'Ebony', hex: '#151515', inStock: true },
    ],
    colorVariants: [
      { name: 'Warm Saddle', hex: '#9E6747', inStock: true },
      { name: 'Ebony', hex: '#151515', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=1000&q=85',
    description: 'A wide asymmetrical crossover band cut from vegetable-tanned bridle leather over an anatomically molded suede footbed.',
    details: [
      'Vegetable-tanned full-grain bridle leather strap',
      'Anatomically molded cork and latex footbed wrapped in suede',
      'Gripped EVA bottom sole',
      'Burnished edges polished with beeswax',
    ],
    rating: 4.77,
    reviewCount: 26,
    tags: ['sandals', 'slides', 'summer', 'casual', 'minimal'],
    material: 'Vegetable-Tanned Bridle Leather, Cork & Suede Footbed',
    fit: 'regular',
    style: 'Modern Brutalist Summer Slide',
    aesthetic: 'casual',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: true,
    isNewArrival: true,
    isBestseller: false,
    createdAt: '2026-02-24T12:00:00Z',
  },
  {
    id: 'toc-prod-028',
    name: 'Handcrafted Chelsea Leather Boots',
    slug: 'handcrafted-chelsea-leather-boots',
    category: 'footwear',
    subcategory: 'Boots',
    brand: 'The Outfit Club Calzature',
    price: 360,
    currency: 'USD',
    sizes: ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    colors: [
      { name: 'Saddle Brown', hex: '#634832', inStock: true },
      { name: 'Onyx Black', hex: '#0B0B0C', inStock: true },
    ],
    colorVariants: [
      { name: 'Saddle Brown', hex: '#634832', inStock: true },
      { name: 'Onyx Black', hex: '#0B0B0C', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=85',
    description: 'Crafted from full-grain Tuscan calfskin with a Goodyear welt, tonal elastic side gussets, and Vibram rubber-injected leather soles.',
    details: [
      'Full-grain vegetable-tanned Tuscan calfskin',
      'Goodyear welt construction, fully recraftable',
      'Reinforced pull tabs and tonal elastic side gores',
      'Calfskin lining with ergonomic arched footbed',
    ],
    rating: 4.93,
    reviewCount: 41,
    tags: ['boots', 'chelsea-boots', 'leather', 'footwear', 'men'],
    material: '100% Tuscan Calfskin, Leather & Vibram Outsole',
    fit: 'regular',
    style: 'Heritage Menswear Chelsea Boot',
    aesthetic: 'luxury',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: true,
    isNewArrival: true,
    isBestseller: false,
    createdAt: '2026-02-17T11:20:00Z',
  },
  {
    id: 'toc-prod-029',
    name: 'Hand-Stitched Suede Tassel Loafers',
    slug: 'hand-stitched-suede-tassel-loafers',
    category: 'footwear',
    subcategory: 'Loafers',
    brand: 'The Outfit Club Calzature',
    price: 230,
    originalPrice: 270,
    discountPercentage: 15,
    currency: 'USD',
    sizes: ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    colors: [
      { name: 'Snuff Suede', hex: '#77573E', inStock: true },
      { name: 'Navy Suede', hex: '#232D3F', inStock: true },
    ],
    colorVariants: [
      { name: 'Snuff Suede', hex: '#77573E', inStock: true },
      { name: 'Navy Suede', hex: '#232D3F', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=85',
    description: 'Charles F. Stead water-resistant suede shaped around a low-profile last with braided apron lace and hand-turned tassels.',
    details: [
      'Repello water-resistant English suede from C.F. Stead',
      'Hand-crafted leather tassels and interlaced leather collar cord',
      'Goodyear welted single leather sole with rubber heel insert',
      'Natural calf lining throughout',
    ],
    rating: 4.85,
    reviewCount: 43,
    tags: ['loafers', 'suede', 'tassel-loafers', 'smart-casual', 'summer'],
    material: 'English C.F. Stead Calf Suede, Leather Sole',
    fit: 'regular',
    style: 'Riviera Sartorial Suede Loafer',
    aesthetic: 'smart-casual',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: false,
    isNewArrival: false,
    isBestseller: false,
    createdAt: '2026-01-22T13:00:00Z',
  },

  // ==========================================
  // ACCESSORIES (7 Products)
  // ==========================================
  {
    id: 'toc-prod-030',
    name: 'Structured Box Leather Crossbody',
    slug: 'structured-box-leather-crossbody',
    category: 'accessories',
    subcategory: 'Bags',
    brand: 'The Outfit Club Atelier',
    price: 260,
    currency: 'USD',
    sizes: ['One Size'],
    colors: [
      { name: 'Noir Matte', hex: '#111214', inStock: true },
      { name: 'Warm Cognac', hex: '#8C5638', inStock: true },
      { name: 'Forest Deep', hex: '#213326', inStock: true },
    ],
    colorVariants: [
      { name: 'Noir Matte', hex: '#111214', inStock: true },
      { name: 'Warm Cognac', hex: '#8C5638', inStock: true },
      { name: 'Forest Deep', hex: '#213326', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',
    description: 'An architectural structured crossbody bag made from smooth semi-vegetable tanned leather with magnetic flap and adjustable strap.',
    details: [
      'Semi-vegetable tanned Italian smooth cowhide',
      'Concealed double magnetic closure',
      'Interior zip compartment and dual slip card slots',
      'Adjustable 110cm–130cm shoulder strap with solid brass buckle',
    ],
    rating: 4.95,
    reviewCount: 73,
    tags: ['bag', 'crossbody', 'leather-bag', 'luxury', 'accessories'],
    material: '100% Italian Semi-Vegetable Tanned Leather',
    fit: 'regular',
    style: 'Sculptural Minimalist Bag',
    aesthetic: 'luxury',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: true,
    isNewArrival: true,
    isBestseller: true,
    createdAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'toc-prod-031',
    name: 'Pebbled Calfskin Day Tote',
    slug: 'pebbled-calfskin-day-tote',
    category: 'accessories',
    subcategory: 'Bags',
    brand: 'The Outfit Club Atelier',
    price: 310,
    originalPrice: 370,
    discountPercentage: 16,
    currency: 'USD',
    sizes: ['One Size'],
    colors: [
      { name: 'Obsidian Grain', hex: '#151619', inStock: true },
      { name: 'Warm Sand', hex: '#C2B199', inStock: true },
    ],
    colorVariants: [
      { name: 'Obsidian Grain', hex: '#151619', inStock: true },
      { name: 'Warm Sand', hex: '#C2B199', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
    description: 'Generously proportioned tote accommodating a 16-inch laptop. Crafted from scratch-resistant pebbled leather with raw suede interior.',
    details: [
      'Full-grain tumbled pebbled calfskin',
      'Spacious main compartment fits up to 16" MacBook Pro',
      'Reinforced rolled leather handles with 24cm shoulder drop',
      'Removable zipped internal pouch with lanyard clip',
    ],
    rating: 4.91,
    reviewCount: 58,
    tags: ['tote-bag', 'laptop-bag', 'leather', 'contemporary', 'workwear'],
    material: '100% Full-Grain Pebbled Calfskin Leather',
    fit: 'regular',
    style: 'Modern Executive Everyday Carry',
    aesthetic: 'contemporary',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: false,
    isNewArrival: false,
    isBestseller: true,
    createdAt: '2026-01-16T15:00:00Z',
  },
  {
    id: 'toc-prod-032',
    name: 'Beveled Edge Bridle Leather Belt',
    slug: 'beveled-edge-bridle-leather-belt',
    category: 'accessories',
    subcategory: 'Belts',
    brand: 'The Outfit Club Atelier',
    price: 85,
    currency: 'USD',
    sizes: ['85cm', '90cm', '95cm', '100cm'],
    colors: [
      { name: 'Black Silver', hex: '#111214', inStock: true },
      { name: 'Dark Havannah Brass', hex: '#3B2A1E', inStock: true },
    ],
    colorVariants: [
      { name: 'Black Silver', hex: '#111214', inStock: true },
      { name: 'Dark Havannah Brass', hex: '#3B2A1E', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=85',
    description: '30mm wide dress belt made from English vegetable-tanned bridle leather with hand-beveled edges and a brushed solid brass buckle.',
    details: [
      'Vegetable-tanned English bridle leather (3.5mm thickness)',
      '30mm width suited for both tailored trousers and raw denim',
      'Brushed palladium or brass rectangular buckle',
      'Hand-burnished waxed edges with natural creasing line',
    ],
    rating: 4.84,
    reviewCount: 46,
    tags: ['belt', 'leather-belt', 'accessories', 'formal', 'smart-casual'],
    material: 'English Full-Grain Bridle Leather, Solid Brass Hardware',
    fit: 'regular',
    style: 'Artisanal Bridle Belt',
    aesthetic: 'smart-casual',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: false,
    isNewArrival: false,
    isBestseller: false,
    createdAt: '2026-01-11T12:00:00Z',
  },
  {
    id: 'toc-prod-033',
    name: 'Atelier 38mm Sapphire Watch',
    slug: 'atelier-38mm-sapphire-watch',
    category: 'accessories',
    subcategory: 'Watches',
    brand: 'The Outfit Club Horlogerie',
    price: 380,
    currency: 'USD',
    sizes: ['One Size'],
    colors: [
      { name: 'Brushed Steel / White Dial', hex: '#D8D8DC', inStock: true },
      { name: 'DLC Midnight Black', hex: '#1A1B1E', inStock: true },
    ],
    colorVariants: [
      { name: 'Brushed Steel / White Dial', hex: '#D8D8DC', inStock: true },
      { name: 'DLC Midnight Black', hex: '#1A1B1E', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85',
    description: 'A 38mm bauhaus-inspired timepiece with ultra-flat 7.2mm 316L stainless steel case, sapphire crystal, and Swiss Ronda movement.',
    details: [
      '316L surgical-grade stainless steel case (38mm diameter, 7.2mm depth)',
      'Double-domed scratch-resistant sapphire crystal with anti-reflective coating',
      'Swiss quartz Ronda caliber movement',
      '5 ATM water resistance (50 meters)',
      'Quick-release Italian calfskin leather strap',
    ],
    rating: 4.96,
    reviewCount: 65,
    tags: ['watch', 'timepiece', 'sapphire', 'minimal', 'luxury'],
    material: '316L Stainless Steel, Sapphire Crystal, Italian Leather',
    fit: 'regular',
    style: 'Bauhaus Minimalist Precision Horology',
    aesthetic: 'minimal',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: true,
    isNewArrival: true,
    isBestseller: true,
    createdAt: '2026-02-13T17:00:00Z',
  },
  {
    id: 'toc-prod-034',
    name: 'Unstructured Washed Twill Cap',
    slug: 'unstructured-washed-twill-cap',
    category: 'accessories',
    subcategory: 'Caps',
    brand: 'The Outfit Club Atelier',
    price: 50,
    currency: 'USD',
    sizes: ['Adjustable'],
    colors: [
      { name: 'Washed Charcoal', hex: '#3C3E45', inStock: true },
      { name: 'Desert Dune', hex: '#BEB29E', inStock: true },
      { name: 'Faded Navy', hex: '#263445', inStock: true },
    ],
    colorVariants: [
      { name: 'Washed Charcoal', hex: '#3C3E45', inStock: true },
      { name: 'Desert Dune', hex: '#BEB29E', inStock: true },
      { name: 'Faded Navy', hex: '#263445', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=85',
    description: 'Six-panel low-crown dad cap in pigment-dyed organic cotton twill with an adjustable self-fabric strap and matte silver slider.',
    details: [
      '100% Organic Cotton Chino Twill (pigment garment dyed)',
      'Unstructured 6-panel low profile crown',
      'Curved visor with reinforced row stitch',
      'Adjustable fabric backstrap with embossed silver buckle closure',
    ],
    rating: 4.81,
    reviewCount: 38,
    tags: ['cap', 'hat', 'streetwear', 'casual', 'accessories'],
    material: '100% Organic Pigment-Dyed Cotton Twill',
    fit: 'regular',
    style: 'Modern Low-Profile Streetwear Cap',
    aesthetic: 'streetwear',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: false,
    isNewArrival: false,
    isBestseller: false,
    createdAt: '2026-01-24T11:00:00Z',
  },
  {
    id: 'toc-prod-035',
    name: 'Handmade Acetate Rectangular Sunglasses',
    slug: 'handmade-acetate-rectangular-sunglasses',
    category: 'accessories',
    subcategory: 'Sunglasses',
    brand: 'The Outfit Club Ottica',
    price: 165,
    originalPrice: 195,
    discountPercentage: 15,
    currency: 'USD',
    sizes: ['One Size'],
    colors: [
      { name: 'Havana Tortoise', hex: '#52341C', inStock: true },
      { name: 'Jet Crystal', hex: '#161719', inStock: true },
    ],
    colorVariants: [
      { name: 'Havana Tortoise', hex: '#52341C', inStock: true },
      { name: 'Jet Crystal', hex: '#161719', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85',
    description: 'Handcrafted from 8mm bio-acetate blocks with sharp bevel edges, 7-barrel hinges, and 100% UV400 protective CR-39 lenses.',
    details: [
      'Mazzucchelli bio-based Italian acetate (8mm gauge)',
      'German 7-barrel hinges pinned through the frame front',
      'Category 3 CR-39 lenses with 100% UVA/UVB protection',
      'Custom hard case and microfiber cleaning cloth included',
    ],
    rating: 4.92,
    reviewCount: 54,
    tags: ['sunglasses', 'eyewear', 'acetate', 'contemporary', 'accessories'],
    material: 'Mazzucchelli Bio-Acetate, CR-39 Lenses',
    fit: 'regular',
    style: 'Geometric 90s Minimalist Eyewear',
    aesthetic: 'contemporary',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: true,
    newest: true,
    isNewArrival: true,
    isBestseller: true,
    createdAt: '2026-02-15T13:30:00Z',
  },
  {
    id: 'toc-prod-036',
    name: 'Foldover Leather Cardholder Wallet',
    slug: 'foldover-leather-cardholder-wallet',
    category: 'accessories',
    subcategory: 'Bags',
    brand: 'The Outfit Club Atelier',
    price: 90,
    currency: 'USD',
    sizes: ['One Size'],
    colors: [
      { name: 'Obsidian Black', hex: '#111214', inStock: true },
      { name: 'British Racing Green', hex: '#1C3125', inStock: true },
    ],
    colorVariants: [
      { name: 'Obsidian Black', hex: '#111214', inStock: true },
      { name: 'British Racing Green', hex: '#1C3125', inStock: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=85',
    description: 'Slim bifold card wallet engineered with 6 interior card slots, central folded banknote compartment, and edge-creased finish.',
    details: [
      'Butter-soft Italian vegetable-tanned Badalassi Carlo leather',
      'Holds up to 8 cards plus folded cash banknotes',
      'Hand-skived edges for ultra-thin 4mm pocket profile',
      'Foil-stamped monogram emblem inside',
    ],
    rating: 4.88,
    reviewCount: 63,
    tags: ['cardholder', 'wallet', 'leather-accessories', 'minimal', 'lifestyle'],
    material: 'Badalassi Carlo Italian Vegetable-Tanned Cowhide',
    fit: 'slim',
    style: 'Ultra-Slim Pocket Everyday Carry',
    aesthetic: 'minimal',
    gender: 'men',
    availability: 'in-stock',
    inStock: true,
    featured: false,
    newest: false,
    isNewArrival: false,
    isBestseller: true,
    createdAt: '2026-01-20T16:00:00Z',
  },
];

// ==========================================
// CATALOG QUERY & UTILITY HELPERS
// ==========================================

export function getProductById(id: string): ProductItem | undefined {
  return PRODUCTS_DATA.find((product) => product.id === id);
}

export function getProductBySlug(slug: string): ProductItem | undefined {
  return PRODUCTS_DATA.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: ProductCategory): ProductItem[] {
  return PRODUCTS_DATA.filter((product) => product.category === category);
}

export function getFeaturedProducts(): ProductItem[] {
  return PRODUCTS_DATA.filter((product) => product.featured);
}

export function getNewArrivals(): ProductItem[] {
  return PRODUCTS_DATA.filter((product) => product.newest || product.isNewArrival);
}

export function getAllCategories(): ProductCategory[] {
  return ['clothing', 'tailoring', 'knitwear', 'footwear', 'accessories'];
}

export function getAllAesthetics(): ProductAesthetic[] {
  return [
    'minimal',
    'streetwear',
    'smart-casual',
    'formal',
    'vintage',
    'luxury',
    'casual',
    'contemporary',
    'athleisure',
  ];
}

export function getAllFits(): ProductFit[] {
  return ['slim', 'regular', 'relaxed', 'oversized', 'tailored', 'straight'];
}

export function filterProducts(options: ProductFilterOptions): ProductItem[] {
  return PRODUCTS_DATA.filter((product) => {
    if (options.category && product.category !== options.category) {
      return false;
    }
    if (options.subcategory && product.subcategory.toLowerCase() !== options.subcategory.toLowerCase()) {
      return false;
    }
    if (options.gender && product.gender !== options.gender && product.gender !== 'unisex') {
      return false;
    }
    if (options.aesthetic && product.aesthetic !== options.aesthetic) {
      return false;
    }
    if (options.fit && product.fit !== options.fit) {
      return false;
    }
    if (options.availability && product.availability !== options.availability) {
      return false;
    }
    if (options.minPrice !== undefined && product.price < options.minPrice) {
      return false;
    }
    if (options.maxPrice !== undefined && product.price > options.maxPrice) {
      return false;
    }
    if (options.featuredOnly && !product.featured) {
      return false;
    }
    if (options.newestOnly && !(product.newest || product.isNewArrival)) {
      return false;
    }
    if (options.sizes && options.sizes.length > 0) {
      const hasSize = options.sizes.some((s) => product.sizes.includes(s));
      if (!hasSize) return false;
    }
    if (options.colors && options.colors.length > 0) {
      const hasColor = options.colors.some((c) =>
        product.colors.some((col) => col.name.toLowerCase().includes(c.toLowerCase()))
      );
      if (!hasColor) return false;
    }
    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const query = options.searchQuery.toLowerCase();
      const inName = product.name.toLowerCase().includes(query);
      const inBrand = product.brand.toLowerCase().includes(query);
      const inSub = product.subcategory.toLowerCase().includes(query);
      const inTags = product.tags.some((tag) => tag.toLowerCase().includes(query));
      const inMaterial = product.material.toLowerCase().includes(query);
      if (!inName && !inBrand && !inSub && !inTags && !inMaterial) {
        return false;
      }
    }
    return true;
  });
}

export function sortProducts(
  products: ProductItem[],
  sortBy: ProductSortOption,
  searchQuery?: string
): ProductItem[] {
  const copy = [...products];
  const query = searchQuery ? searchQuery.trim() : '';

  if (query) {
    const tokens = tokenizeQuery(query);
    const scoreMap = new Map<string, number>();
    for (const p of products) {
      scoreMap.set(p.id, calculateProductRelevance(p, query, tokens));
    }

    switch (sortBy) {
      case 'featured':
        return copy.sort((a, b) => (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0));
      case 'newest':
        return copy.sort((a, b) => {
          const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          if (dateDiff !== 0) return dateDiff;
          return (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0);
        });
      case 'price-asc':
        return copy.sort((a, b) => {
          const priceDiff = a.price - b.price;
          if (priceDiff !== 0) return priceDiff;
          return (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0);
        });
      case 'price-desc':
        return copy.sort((a, b) => {
          const priceDiff = b.price - a.price;
          if (priceDiff !== 0) return priceDiff;
          return (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0);
        });
      case 'rating-desc':
        return copy.sort((a, b) => {
          const ratingDiff = b.rating - a.rating;
          if (ratingDiff !== 0) return ratingDiff;
          return (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0);
        });
      default:
        return copy.sort((a, b) => (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0));
    }
  }

  switch (sortBy) {
    case 'featured':
      return copy.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    case 'newest':
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'rating-desc':
      return copy.sort((a, b) => b.rating - a.rating);
    default:
      return copy;
  }
}

export function filterProductsByState(
  products: ProductItem[],
  state: CatalogFilterState
): ProductItem[] {
  return products.filter((product) => {
    if (!product) return false;

    // 1. Search Query with multi-word token matching and relevance filtering
    if (state.searchQuery && state.searchQuery.trim() !== '') {
      const tokens = tokenizeQuery(state.searchQuery);
      const score = calculateProductRelevance(product, state.searchQuery, tokens);
      if (score <= 0) {
        return false;
      }
    }

    // 2. Categories (OR logic within categories)
    if (state.categories.length > 0 && !state.categories.includes(product.category)) {
      return false;
    }

    // 3. Subcategories (OR logic within subcategories)
    if (
      state.subcategories.length > 0 &&
      !state.subcategories.some(
        (sub) => sub.toLowerCase() === (product.subcategory || '').toLowerCase()
      )
    ) {
      return false;
    }

    // 4. Price range (min and max)
    const price = typeof product.price === 'number' ? product.price : 0;
    if (price < state.priceRange.min || price > state.priceRange.max) {
      return false;
    }

    // 5. Sizes (OR logic within sizes)
    if (
      state.sizes.length > 0 &&
      (!Array.isArray(product.sizes) || !state.sizes.some((size) => product.sizes.includes(size)))
    ) {
      return false;
    }

    // 6. Colors (OR logic within colors)
    if (
      state.colors.length > 0 &&
      (!Array.isArray(product.colors) ||
        !state.colors.some((col) =>
          product.colors.some((c) => (c?.name || '').toLowerCase().includes(col.toLowerCase()))
        ))
    ) {
      return false;
    }

    // 7. Fits (OR logic within fits)
    if (state.fits.length > 0 && !state.fits.includes(product.fit)) {
      return false;
    }

    // 8. Aesthetics (OR logic within aesthetics)
    if (state.aesthetics.length > 0 && !state.aesthetics.includes(product.aesthetic)) {
      return false;
    }

    // 9. Availability (OR logic within availability)
    if (
      state.availability.length > 0 &&
      !state.availability.includes(product.availability)
    ) {
      return false;
    }

    return true;
  });
}

export function getAvailableSubcategories(
  products: ProductItem[],
  selectedCategories?: ProductCategory[]
): string[] {
  const targetProducts =
    selectedCategories && selectedCategories.length > 0
      ? products.filter((p) => selectedCategories.includes(p.category))
      : products;

  const set = new Set<string>();
  targetProducts.forEach((p) => set.add(p.subcategory));
  return Array.from(set).sort();
}

export function getAvailableSizes(
  products: ProductItem[],
  selectedCategories?: ProductCategory[]
): string[] {
  const targetProducts =
    selectedCategories && selectedCategories.length > 0
      ? products.filter((p) => selectedCategories.includes(p.category))
      : products;

  const set = new Set<string>();
  targetProducts.forEach((p) => p.sizes.forEach((s) => set.add(s)));
  return Array.from(set);
}

export function getAvailableColors(products: ProductItem[]): { name: string; hex: string }[] {
  const map = new Map<string, string>();
  products.forEach((p) => {
    p.colors.forEach((c) => {
      if (!map.has(c.name)) {
        map.set(c.name, c.hex);
      }
    });
  });
  return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
}

export function getMinMaxPrice(products: ProductItem[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 1000 };
  let min = products[0].price;
  let max = products[0].price;
  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }
  return { min, max };
}
