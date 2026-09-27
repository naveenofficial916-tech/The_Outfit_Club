import { useState, useEffect, useCallback } from 'react';
import type { ProductItem } from '../types';

/**
 * THE OUTFIT CLUB — QUICK VIEW STATE STORE
 * Provides a lightweight reactive singleton for managing product quick-preview modals
 * across Catalog, Collections, Recommendations, and Homepage.
 */

let activeProduct: ProductItem | null = null;
let activeTriggerEl: HTMLElement | null = null;
const subscribers = new Set<() => void>();

function notify(): void {
  subscribers.forEach((fn) => fn());
}

export const quickViewStore = {
  open(product: ProductItem, triggerEl?: HTMLElement | null): void {
    activeProduct = product;
    activeTriggerEl =
      triggerEl ||
      (typeof document !== 'undefined' ? (document.activeElement as HTMLElement) : null);
    notify();
  },

  close(): void {
    activeProduct = null;
    notify();
  },

  getProduct(): ProductItem | null {
    return activeProduct;
  },

  getTriggerElement(): HTMLElement | null {
    return activeTriggerEl;
  },

  subscribe(callback: () => void): () => void {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  },
};

export function useQuickView() {
  const [product, setProduct] = useState<ProductItem | null>(() => quickViewStore.getProduct());
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(() =>
    quickViewStore.getTriggerElement()
  );

  useEffect(() => {
    return quickViewStore.subscribe(() => {
      setProduct(quickViewStore.getProduct());
      setTriggerEl(quickViewStore.getTriggerElement());
    });
  }, []);

  const open = useCallback((p: ProductItem, el?: HTMLElement | null) => {
    quickViewStore.open(p, el);
  }, []);

  const close = useCallback(() => {
    quickViewStore.close();
  }, []);

  return {
    isOpen: Boolean(product),
    product,
    triggerElement: triggerEl,
    open,
    close,
  };
}
