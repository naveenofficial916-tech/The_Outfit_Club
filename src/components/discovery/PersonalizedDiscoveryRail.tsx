import React, { useMemo } from 'react';
import { useDiscoveryProfile } from '../../services/discoveryProfileStore';
import { useWishlist } from '../../services/wishlistStore';
import { useRecentlyViewed } from '../../services/recentlyViewedStore';
import { getDiscoveryRailConfig } from '../../utils/personalizationEngine';
import { ProductRail } from '../products/ProductRail';
import { cartStore } from '../../services/cartStore';
import { useQuickView } from '../../services/quickViewStore';
import { PRODUCTS_DATA } from '../../data/products';
import type { ProductItem } from '../../types';
import './PersonalizedDiscoveryRail.css';

export interface PersonalizedDiscoveryRailProps {
  currentCategory?: string;
  currentCollectionSlug?: string;
  currentSearchQuery?: string;
  excludeIds?: string[];
  limit?: number;
  className?: string;
}

export const PersonalizedDiscoveryRail: React.FC<PersonalizedDiscoveryRailProps> = ({
  currentCategory,
  currentCollectionSlug,
  currentSearchQuery,
  excludeIds,
  limit = 6,
  className = '',
}) => {
  const { profile, clearProfile } = useDiscoveryProfile();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { products: recentlyViewed } = useRecentlyViewed();
  const { open: openQuickView } = useQuickView();

  const recentIds = useMemo(() => recentlyViewed.map((p) => p.id), [recentlyViewed]);

  const config = useMemo(() => {
    return getDiscoveryRailConfig(
      PRODUCTS_DATA,
      profile,
      wishlistIds,
      recentIds,
      {
        limit,
        excludeIds,
        currentCategory,
        currentCollectionSlug,
        currentSearchQuery,
      }
    );
  }, [
    profile,
    wishlistIds,
    recentIds,
    limit,
    excludeIds,
    currentCategory,
    currentCollectionSlug,
    currentSearchQuery,
  ]);

  const handleQuickAdd = (product: ProductItem, size: string) => {
    const chosenColor = product.colors[0]?.name || 'Standard';
    cartStore.addToCart(product, size, chosenColor, 1);
  };

  if (!config.products || config.products.length === 0) {
    return null;
  }

  return (
    <div className={`personalized-discovery-wrapper ${className}`}>
      <ProductRail
        id={config.id || 'discovery-rail'}
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        products={config.products}
        onWishlistToggle={toggleWishlist}
        onQuickAdd={handleQuickAdd}
        onQuickView={openQuickView}
        onClear={config.isPersonalized ? clearProfile : undefined}
        clearLabel={config.isPersonalized ? 'Reset Style Picks' : undefined}
      />
    </div>
  );
};
