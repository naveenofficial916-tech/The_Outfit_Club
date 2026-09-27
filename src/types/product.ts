/**
 * THE OUTFIT CLUB — PRODUCT DATA LAYER CONTRACTS
 * Comprehensive product catalog, discovery attributes, and domain interfaces.
 */

export type ProductCategory = 
  | 'clothing'
  | 'tailoring'
  | 'knitwear'
  | 'footwear'
  | 'accessories'
  | 'outerwear';

export type GenderCategory = 'men';

export type ProductFit = 
  | 'slim'
  | 'regular'
  | 'relaxed'
  | 'oversized'
  | 'tailored'
  | 'straight';

export type ProductAesthetic = 
  | 'minimal'
  | 'streetwear'
  | 'smart-casual'
  | 'formal'
  | 'vintage'
  | 'luxury'
  | 'casual'
  | 'contemporary'
  | 'athleisure';

export type ProductAvailability = 
  | 'in-stock'
  | 'low-stock'
  | 'out-of-stock'
  | 'pre-order';

export interface ColorVariant {
  name: string;
  hex: string;
  inStock?: boolean;
  image?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  subcategory: string;
  description: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  currency: string;
  sizes: string[];
  colors: ColorVariant[];
  colorVariants?: ColorVariant[];
  images: string[];
  thumbnail: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  material: string;
  fit: ProductFit;
  style: string;
  aesthetic: ProductAesthetic;
  gender: GenderCategory;
  availability: ProductAvailability;
  inStock: boolean;
  featured: boolean;
  newest: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  details?: string[];
  createdAt: string;
}

export interface ProductFilterOptions {
  category?: ProductCategory;
  subcategory?: string;
  gender?: GenderCategory;
  aesthetic?: ProductAesthetic;
  fit?: ProductFit;
  availability?: ProductAvailability;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  sizes?: string[];
  colors?: string[];
  featuredOnly?: boolean;
  newestOnly?: boolean;
}

export type ProductSortOption = 
  | 'featured'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc';

export interface CatalogFilterState {
  categories: ProductCategory[];
  subcategories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  sizes: string[];
  colors: string[];
  fits: ProductFit[];
  aesthetics: ProductAesthetic[];
  availability: ProductAvailability[];
  searchQuery: string;
}

export const DEFAULT_FILTER_STATE: CatalogFilterState = {
  categories: [],
  subcategories: [],
  priceRange: {
    min: 0,
    max: 1000,
  },
  sizes: [],
  colors: [],
  fits: [],
  aesthetics: [],
  availability: [],
  searchQuery: '',
};
