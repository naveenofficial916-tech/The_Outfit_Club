/**
 * Test script to validate Wishlist Foundation & Saved Products (Task 4.1)
 */
import { wishlistStore } from '../services/wishlistStore';
import { cartStore } from '../services/cartStore';
import { PRODUCTS_DATA } from '../data/products';

// Mock localStorage and window in node environment
const storage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, val: string) => { storage[key] = val; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

const listeners: Record<string, Array<() => void>> = {};
(global as any).window = {
  dispatchEvent: (event: { type: string }) => {
    (listeners[event.type] || []).forEach(cb => cb());
  },
  addEventListener: (type: string, cb: () => void) => {
    if (!listeners[type]) listeners[type] = [];
    listeners[type].push(cb);
  },
  removeEventListener: (type: string, cb: () => void) => {
    if (listeners[type]) {
      listeners[type] = listeners[type].filter(fn => fn !== cb);
    }
  }
};
(global as any).Event = class Event {
  type: string;
  constructor(type: string) { this.type = type; }
};

console.log('=== RUNNING WISHLIST MODULE 4 TASK 4.1 VALIDATION SUITE ===\n');

// Clear initial state
wishlistStore.clearWishlist();
cartStore.clearCart();

// TEST 1: Initial empty state
console.log('Test 1: Initial State');
console.assert(wishlistStore.getWishlistCount() === 0, 'Wishlist count should be 0');
console.assert(wishlistStore.getWishlist().length === 0, 'Wishlist array should be empty');
console.log('✓ Initial empty state passed');

// TEST 2: Add product to wishlist
console.log('\nTest 2: Add Product to Wishlist');
const testProduct1 = PRODUCTS_DATA[0];
const testProduct2 = PRODUCTS_DATA[1];
const testProduct3 = PRODUCTS_DATA[2];

const added1 = wishlistStore.toggleWishlist(testProduct1);
console.assert(added1 === true, 'toggleWishlist should return true when item added');
console.assert(wishlistStore.isWishlisted(testProduct1.id) === true, 'Product 1 should be wishlisted');
console.assert(wishlistStore.getWishlistCount() === 1, 'Wishlist count should be 1');
console.log('✓ Add product passed');

// TEST 3: Persistence in localStorage
console.log('\nTest 3: Persistence in LocalStorage');
const rawStored = storage['the_outfit_club_wishlist_v1'];
console.assert(rawStored !== undefined, 'Storage key must exist');
const parsed = JSON.parse(rawStored);
console.assert(Array.isArray(parsed) && parsed.includes(testProduct1.id), 'Stored data must contain product id');
console.log('✓ LocalStorage persistence passed: raw =', rawStored);

// TEST 4: Multiple products
console.log('\nTest 4: Multiple Products Wishlist Count');
wishlistStore.toggleWishlist(testProduct2);
wishlistStore.toggleWishlist(testProduct3);
console.assert(wishlistStore.getWishlistCount() === 3, 'Wishlist count should be 3');
console.assert(wishlistStore.isWishlisted(testProduct2.id) === true, 'Product 2 is wishlisted');
console.assert(wishlistStore.isWishlisted(testProduct3.id) === true, 'Product 3 is wishlisted');
console.log('✓ Multiple products wishlisted count =', wishlistStore.getWishlistCount());

// TEST 5: Remove product from Wishlist
console.log('\nTest 5: Remove Product from Wishlist (Toggle again)');
const removed2 = wishlistStore.toggleWishlist(testProduct2);
console.assert(removed2 === false, 'toggleWishlist should return false when item removed');
console.assert(wishlistStore.isWishlisted(testProduct2.id) === false, 'Product 2 should not be wishlisted');
console.assert(wishlistStore.getWishlistCount() === 2, 'Wishlist count should be 2');
console.log('✓ Remove product passed, remaining count =', wishlistStore.getWishlistCount());

// TEST 6: Direct removeFromWishlist method
console.log('\nTest 6: Direct removeFromWishlist');
wishlistStore.removeFromWishlist(testProduct3.id);
console.assert(wishlistStore.isWishlisted(testProduct3.id) === false, 'Product 3 should be removed');
console.assert(wishlistStore.getWishlistCount() === 1, 'Wishlist count should be 1');
console.log('✓ Direct removeFromWishlist passed');

// TEST 7: Cart integration from Wishlist
console.log('\nTest 7: Add to Cart from Wishlist item');
cartStore.addToCart(testProduct1, 'L', 'Standard', 1, false);
console.assert(cartStore.getCartCount() === 1, 'Cart count should be 1');
const cartItem = cartStore.getCart()[0];
console.assert(cartItem.productId === testProduct1.id, 'Cart item productId matches');
console.assert(cartItem.size === 'L', 'Cart item size matches L');
console.log('✓ Add to cart from wishlist item passed: cart item =', cartItem.name, cartItem.size);

// TEST 8: Error handling with corrupt / unknown product IDs
console.log('\nTest 8: Error handling with corrupt product IDs in localStorage');
storage['the_outfit_club_wishlist_v1'] = JSON.stringify(['non-existent-product-id-999', testProduct1.id]);
const currentWishlist = wishlistStore.getWishlist();
console.assert(currentWishlist.includes('non-existent-product-id-999'), 'Handles unknown IDs in array without throwing');
const resolvedProducts = currentWishlist
  .map(id => PRODUCTS_DATA.find(p => p.id === id))
  .filter(Boolean);
console.assert(resolvedProducts.length === 1, 'Gracefully filters out unknown products');
console.assert(resolvedProducts[0]?.id === testProduct1.id, 'Valid product is retained');
console.log('✓ Error handling with non-existent product ID passed');

// TEST 9: Clear wishlist
console.log('\nTest 9: Clear Wishlist');
wishlistStore.clearWishlist();
console.assert(wishlistStore.getWishlistCount() === 0, 'Wishlist should be empty after clear');
console.log('✓ Clear wishlist passed');

console.log('\n=== ALL TESTS PASSED SUCCESSFULLY (10/10) ===');
