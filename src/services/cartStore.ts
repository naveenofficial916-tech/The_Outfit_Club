import { useState, useEffect } from 'react';
import type { ProductItem } from '../types';

export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  name: string;
  productName?: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  product: ProductItem;
}

export const FREE_SHIPPING_THRESHOLD = 75;
export const STANDARD_SHIPPING_FEE = 12;

export function calculateShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

const CART_STORAGE_KEY = 'the_outfit_club_cart_v1';
const CART_CHANGE_EVENT = 'the_outfit_club_cart_updated';
const DRAWER_CHANGE_EVENT = 'the_outfit_club_cart_drawer_toggled';

// In-memory fallback if localStorage is unavailable
let inMemoryCart: CartItem[] = [];
let isDrawerOpen = false;

function loadStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Validate each item to avoid corruptions
        return parsed.filter(
          (item) =>
            item &&
            typeof item.id === 'string' &&
            typeof item.price === 'number' &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
        );
      }
    }
  } catch (e) {
    console.warn('[CartStore] Failed to read from localStorage:', e);
  }
  return inMemoryCart;
}

function saveCart(cart: CartItem[]): void {
  inMemoryCart = cart;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('[CartStore] Failed to write to localStorage:', e);
    }
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  }
}

function dispatchDrawerEvent(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DRAWER_CHANGE_EVENT));
  }
}

export const cartStore = {
  getCart(): CartItem[] {
    return loadStoredCart();
  },

  getCartCount(): number {
    return loadStoredCart().reduce((sum, item) => sum + item.quantity, 0);
  },

  getCartSubtotal(): number {
    return loadStoredCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  addToCart(
    product: ProductItem,
    size: string,
    color: string,
    quantity: number = 1,
    shouldOpenDrawer: boolean = true
  ): CartItem[] {
    const current = loadStoredCart();
    const itemKey = `${product.id}__${size}__${color}`;
    const existingIndex = current.findIndex((item) => item.id === itemKey);

    // Pick image from color variant or product images
    const variantColor = product.colors?.find((c) => c.name === color);
    const chosenImage =
      variantColor?.image || product.thumbnail || product.images?.[0] || '';

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = current.map((item, idx) => {
        if (idx === existingIndex) {
          return {
            ...item,
            quantity: item.quantity + quantity,
          };
        }
        return item;
      });
    } else {
      const newItem: CartItem = {
        id: itemKey,
        productId: product.id,
        productSlug: product.slug,
        name: product.name,
        productName: product.name,
        image: chosenImage,
        size,
        color,
        quantity,
        price: product.price,
        originalPrice: product.originalPrice,
        discountPercentage: product.discountPercentage,
        product,
      };
      updated = [newItem, ...current];
    }

    saveCart(updated);

    if (shouldOpenDrawer) {
      this.openDrawer();
    }

    return updated;
  },

  removeFromCart(cartItemId: string): CartItem[] {
    const current = loadStoredCart();
    const updated = current.filter((item) => item.id !== cartItemId);
    saveCart(updated);
    return updated;
  },

  removeItem(cartItemId: string): CartItem[] {
    return this.removeFromCart(cartItemId);
  },

  updateQuantity(cartItemId: string, quantity: number): CartItem[] {
    if (quantity <= 0) {
      return this.removeFromCart(cartItemId);
    }
    const current = loadStoredCart();
    const updated = current.map((item) =>
      item.id === cartItemId ? { ...item, quantity: Math.min(10, quantity) } : item
    );
    saveCart(updated);
    return updated;
  },

  clearCart(): void {
    saveCart([]);
  },

  // Mini-cart drawer controls
  isDrawerOpen(): boolean {
    return isDrawerOpen;
  },

  openDrawer(): void {
    isDrawerOpen = true;
    dispatchDrawerEvent();
  },

  closeDrawer(): void {
    isDrawerOpen = false;
    dispatchDrawerEvent();
  },

  toggleDrawer(): void {
    isDrawerOpen = !isDrawerOpen;
    dispatchDrawerEvent();
  },

  subscribe(listener: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(CART_CHANGE_EVENT, listener);
    return () => window.removeEventListener(CART_CHANGE_EVENT, listener);
  },

  subscribeDrawer(listener: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(DRAWER_CHANGE_EVENT, listener);
    return () => window.removeEventListener(DRAWER_CHANGE_EVENT, listener);
  },
};

/**
 * React hook to reactively track cart items, subtotal, and drawer state
 */
export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => cartStore.getCart());
  const [drawerOpen, setDrawerOpen] = useState<boolean>(() => cartStore.isDrawerOpen());

  useEffect(() => {
    const handleCartUpdate = () => {
      setCart(cartStore.getCart());
    };
    const handleDrawerUpdate = () => {
      setDrawerOpen(cartStore.isDrawerOpen());
    };

    const unsubCart = cartStore.subscribe(handleCartUpdate);
    const unsubDrawer = cartStore.subscribeDrawer(handleDrawerUpdate);

    return () => {
      unsubCart();
      unsubDrawer();
    };
  }, []);

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return {
    cart,
    items: cart,
    count,
    subtotal,
    shipping,
    total,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    isFreeShipping,
    drawerOpen,
    openDrawer: cartStore.openDrawer.bind(cartStore),
    closeDrawer: cartStore.closeDrawer.bind(cartStore),
    toggleDrawer: cartStore.toggleDrawer.bind(cartStore),
    addToCart: cartStore.addToCart.bind(cartStore),
    removeFromCart: cartStore.removeFromCart.bind(cartStore),
    removeItem: cartStore.removeFromCart.bind(cartStore),
    updateQuantity: cartStore.updateQuantity.bind(cartStore),
    clearCart: cartStore.clearCart.bind(cartStore),
  };
}
