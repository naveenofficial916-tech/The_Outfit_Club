import type { BrandInfo, NavItem } from '../types';

export const BRAND_CONFIG: BrandInfo = {
  name: 'THE OUTFIT CLUB',
  shortName: 'TOC',
  tagline: "The Sea of Men's Clothing — Premium Menswear, Tailoring & Footwear",
  description:
    "Exclusively dedicated to modern menswear. Discover an expansive sea of men's clothing, footwear, tailoring, and accessories engineered for the modern man.",
  establishedYear: 2026,
  contactEmail: 'concierge@theoutfitclub.com',
  socials: {
    instagram: 'https://instagram.com/theoutfitclub',
    tiktok: 'https://tiktok.com/@theoutfitclub',
    pinterest: 'https://pinterest.com/theoutfitclub',
    linkedin: 'https://linkedin.com/company/theoutfitclub',
  },
};

export const MAIN_NAVIGATION: NavItem[] = [
  {
    label: 'Shop',
    href: '/catalog',
  },
  {
    label: 'New Arrivals',
    href: '/catalog?sort=newest',
    badge: 'New',
    featured: true,
  },
  {
    label: 'Clothing',
    href: '/catalog?category=clothing',
  },
  {
    label: 'Footwear',
    href: '/catalog?category=footwear',
  },
  {
    label: 'Accessories',
    href: '/catalog?category=accessories',
  },
  {
    label: 'Collections',
    href: '/catalog#collections',
  },
  {
    label: 'Looks',
    href: '/looks',
    badge: 'Royal Edit',
  },
];

export const ANNOUNCEMENT_ITEMS = [
  "The Sea of Men's Clothing — SS/26 Atelier Collection Live",
  'Complimentary Global Express Delivery on Menswear Orders over $250',
  "Crafted Exclusively for the Modern Man — Modern Tailoring & Luxury Essentials",
];
