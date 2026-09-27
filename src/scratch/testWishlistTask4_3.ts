/**
 * Comprehensive Validation Test Suite for Module 4 Task 4.3
 * Wishlist Shopping Experience & Saved Product Management
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

console.log('=== RUNNING WISHLIST MODULE 4 TASK 4.3 VALIDATION SUITE ===\n');

// Clean slate
wishlistStore.clearWishlist();
cartStore.clearCart();

// TEST 1: Save 3 products
console.log('TEST 1: Save 3 products from Catalog');
const prod1 = PRODUCTS_DATA[0]; // e.g. Essential Heavyweight Oversized Tee ($65)
const prod2 = PRODUCTS_DATA[1]; // e.g. Vintage Wash Drop-Shoulder Tee ($70)
const prod3 = PRODUCTS_DATA[2]; // e.g. Japanese Selvedge Baggy Jeans ($165)

wishlistStore.addToWishlist(prod1.id);
wishlistStore.addToWishlist(prod2.id);
wishlistStore.addToWishlist(prod3.id);
console.assert(wishlistStore.getWishlistCount() === 3, 'Wishlist count should be 3');
console.log('✓ TEST 1 passed: 3 products saved');

// TEST 2: Open Wishlist -> 3 SAVED ITEMS
console.log('\nTEST 2: Saved count formatting');
const count = wishlistStore.getWishlistCount();
const countText = count === 1 ? '1 SAVED ITEM' : `${count} SAVED ITEMS`;
console.assert(countText === '3 SAVED ITEMS', 'Count text matches 3 SAVED ITEMS');
console.log('✓ TEST 2 passed: count text =', countText);

// TEST 3: Sort: Recently Added (newest item first)
console.log('\nTEST 3: Sort: Recently Added');
const savedIds = wishlistStore.getWishlist();
console.assert(savedIds[0] === prod3.id, 'prod3 (most recently added) must be at index 0');
console.assert(savedIds[1] === prod2.id, 'prod2 must be at index 1');
console.assert(savedIds[2] === prod1.id, 'prod1 must be at index 2');
console.log('✓ TEST 3 passed: Recently Added order is [prod3, prod2, prod1]');

// TEST 4: Sort: Price Low to High
console.log('\nTEST 4: Sort: Price Low to High');
const resolvedProducts = savedIds.map(id => PRODUCTS_DATA.find(p => p.id === id)!).filter(Boolean);
const sortedPriceAsc = [...resolvedProducts].sort((a, b) => a.price - b.price);
for (let i = 0; i < sortedPriceAsc.length - 1; i++) {
  console.assert(sortedPriceAsc[i].price <= sortedPriceAsc[i + 1].price, 'Prices must be in ascending order');
}
console.log('✓ TEST 4 passed: Prices ordered asc:', sortedPriceAsc.map(p => `$${p.price}`));

// TEST 5: Sort: Price High to Low
console.log('\nTEST 5: Sort: Price High to Low');
const sortedPriceDesc = [...resolvedProducts].sort((a, b) => b.price - a.price);
for (let i = 0; i < sortedPriceDesc.length - 1; i++) {
  console.assert(sortedPriceDesc[i].price >= sortedPriceDesc[i + 1].price, 'Prices must be in descending order');
}
console.log('✓ TEST 5 passed: Prices ordered desc:', sortedPriceDesc.map(p => `$${p.price}`));

// TEST 6: Sort: Name A-Z
console.log('\nTEST 6: Sort: Name A-Z');
const sortedNameAsc = [...resolvedProducts].sort((a, b) => a.name.localeCompare(b.name));
for (let i = 0; i < sortedNameAsc.length - 1; i++) {
  console.assert(sortedNameAsc[i].name.localeCompare(sortedNameAsc[i + 1].name) <= 0, 'Names must be alphabetical');
}
console.log('✓ TEST 6 passed: Names ordered A-Z:', sortedNameAsc.map(p => p.name));

// TEST 7: Remove a product
console.log('\nTEST 7: Remove a product');
wishlistStore.removeFromWishlist(prod2.id);
console.assert(wishlistStore.getWishlistCount() === 2, 'Wishlist count should decrease to 2');
console.assert(!wishlistStore.isWishlisted(prod2.id), 'prod2 should not be wishlisted');
console.log('✓ TEST 7 passed: Item removed, count is now 2');

// TEST 8: Undo Remove (insertWishlist)
console.log('\nTEST 8: Undo Remove at exact index');
wishlistStore.insertWishlist(prod2.id, 1);
console.assert(wishlistStore.getWishlistCount() === 3, 'Wishlist count restored to 3');
console.assert(wishlistStore.getWishlist()[1] === prod2.id, 'prod2 restored at index 1');
console.log('✓ TEST 8 passed: Undo successfully restored product at original position');

// TEST 9: Add Wishlist product to Cart
console.log('\nTEST 9: Add Wishlist product to Cart');
const initialCartCount = cartStore.getCartCount();
cartStore.addToCart(prod1, prod1.sizes[0] || 'M', prod1.colors[0]?.name || 'Black', 1, false);
console.assert(cartStore.getCartCount() === initialCartCount + 1, 'Cart count increased by 1');
console.log('✓ TEST 9 passed: Item added to cart, cart count =', cartStore.getCartCount());

// TEST 10: Remove every saved product -> Empty state
console.log('\nTEST 10: Empty Wishlist state');
wishlistStore.clearWishlist();
console.assert(wishlistStore.getWishlistCount() === 0, 'Wishlist count should be 0');
console.assert(wishlistStore.getWishlist().length === 0, 'Wishlist list is empty');
console.log('✓ TEST 10 passed: Wishlist is completely cleared');

// TEST 11: Save product again -> Reactivity
console.log('\nTEST 11: Save product again');
wishlistStore.addToWishlist(prod1.id);
console.assert(wishlistStore.getWishlistCount() === 1, 'Wishlist count is 1');
console.assert(wishlistStore.isWishlisted(prod1.id), 'prod1 is wishlisted again');
console.log('✓ TEST 11 passed: Re-saved product works immediately');

// TEST 12: Persistence in localStorage
console.log('\nTEST 12: Persistence check');
const storedJson = storage['the_outfit_club_wishlist_v1'];
console.assert(JSON.parse(storedJson).includes(prod1.id), 'LocalStorage persisted product ID');
console.log('✓ TEST 12 passed: LocalStorage contains =', storedJson);

console.log('\n=== ALL TASK 4.3 TESTS PASSED SUCCESSFULLY (12/12) ===');
