import React from 'react';
import type { CatalogFilterState, ProductCategory } from '../../types';
import './CatalogCategoryNav.css';

export interface CategoryNavItem {
  id: string;
  label: string;
  count: number;
  category?: ProductCategory;
  subcategories?: string[];
  fits?: string[];
}

export interface CatalogCategoryNavProps {
  filterState: CatalogFilterState;
  onSelectNav: (category?: ProductCategory, subcategories?: string[]) => void;
  className?: string;
}

const CATEGORY_NAV_ITEMS: CategoryNavItem[] = [
  {
    id: 'all',
    label: 'All Pieces',
    count: 36,
  },
  {
    id: 'oversized-tees',
    label: 'Oversized Tees',
    count: 1,
    category: 'clothing',
    subcategories: ['T-Shirts'],
  },
  {
    id: 'baggy-pants',
    label: 'Baggy & Relaxed Pants',
    count: 4,
    category: 'clothing',
    subcategories: ['Trousers', 'Jeans', 'Chinos'],
  },
  {
    id: 'hoodies-knits',
    label: 'Hoodies & Knits',
    count: 7,
    subcategories: ['Hoodies', 'Sweaters', 'Cardigans', 'Knit Tops'],
  },
  {
    id: 'jackets',
    label: 'Jackets & Outerwear',
    count: 1,
    subcategories: ['Jackets'],
  },
  {
    id: 'tailoring',
    label: 'Tailoring & Suits',
    count: 6,
    category: 'tailoring',
  },
  {
    id: 'footwear',
    label: 'Footwear',
    count: 8,
    category: 'footwear',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    count: 7,
    category: 'accessories',
  },
];

export const CatalogCategoryNav: React.FC<CatalogCategoryNavProps> = ({
  filterState,
  onSelectNav,
  className = '',
}) => {
  const isNavActive = (item: CategoryNavItem): boolean => {
    if (item.id === 'all') {
      return (
        filterState.categories.length === 0 &&
        filterState.subcategories.length === 0
      );
    }

    if (item.category && !item.subcategories) {
      return (
        filterState.categories.length === 1 &&
        filterState.categories[0] === item.category &&
        filterState.subcategories.length === 0
      );
    }

    if (item.subcategories && item.subcategories.length > 0) {
      return item.subcategories.some((sub) => filterState.subcategories.includes(sub));
    }

    return false;
  };

  const handleClick = (item: CategoryNavItem) => {
    if (item.id === 'all') {
      onSelectNav(undefined, []);
      return;
    }

    const currentlyActive = isNavActive(item);
    if (currentlyActive) {
      onSelectNav(undefined, []);
    } else {
      onSelectNav(item.category, item.subcategories || []);
    }
  };

  return (
    <nav className={`catalog-category-nav ${className}`} aria-label="Men's fashion categories">
      <div className="catalog-category-nav-scroll">
        {CATEGORY_NAV_ITEMS.map((item) => {
          const active = isNavActive(item);
          return (
            <button
              key={item.id}
              type="button"
              className={`category-nav-pill ${active ? 'active' : ''}`}
              onClick={() => handleClick(item)}
              aria-pressed={active}
            >
              <span className="category-nav-label">{item.label}</span>
              <span className="category-nav-badge">{item.count}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
