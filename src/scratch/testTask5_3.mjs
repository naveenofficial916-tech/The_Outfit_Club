/**
 * testTask5_3.mjs
 * Comprehensive automated verification for MODULE 5 / TASK 5.3 — CUSTOMER ORDER HISTORY FOUNDATION
 */

// Mock browser globals for Node.js
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] ?? null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
  CustomEvent: class CustomEvent {
    constructor(type, init) {
      this.type = type;
      this.detail = init?.detail;
    }
  },
};

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failCount++;
    throw new Error(message);
  } else {
    console.log(`✅ PASSED: ${message}`);
    passCount++;
  }
}

async function runTests() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING TASK 5.3 VERIFICATION SUITE');
  console.log('==================================================\n');

  const { orderService, normalizeOrderItem, normalizeShippingAddress, generateOrderReference } =
    await import('../services/orderService.js');
  const { authStore } = await import('../services/authStore.js');

  // Test 1: Order Reference Generation
  const ref1 = generateOrderReference();
  assert(ref1.startsWith('TOC-'), `Order reference should start with 'TOC-': ${ref1}`);

  // Test 2: Item Normalization
  const rawItem = {
    productId: 'top-01',
    productName: 'Heavyweight Boxy Tee',
    image: 'https://example.com/tee.jpg',
    selectedSize: 'L',
    selectedColor: 'Vintage Black',
    quantity: 2,
    unitPrice: 48,
    totalPrice: 96,
  };
  const norm1 = normalizeOrderItem(rawItem);
  assert(norm1.productId === 'top-01', 'Normalized item maintains productId');
  assert(norm1.productName === 'Heavyweight Boxy Tee', 'Normalized item maintains productName');
  assert(norm1.unitPrice === 48 && norm1.totalPrice === 96, 'Normalized item preserves historical pricing');
  assert(norm1.selectedSize === 'L', 'Normalized item preserves size selection');
  assert(norm1.selectedColor === 'Vintage Black', 'Normalized item preserves color selection');

  // Legacy CartItem format normalization
  const legacyItem = {
    id: 'cart-1',
    product: {
      id: 'bot-02',
      name: 'Wide-Leg Cargo Pant',
      price: 85,
      images: ['https://example.com/cargo.jpg'],
    },
    size: 'XL',
    color: 'Olive Drab',
    quantity: 1,
    price: 85,
  };
  const normLegacy = normalizeOrderItem(legacyItem);
  assert(normLegacy.productId === 'bot-02', 'Legacy item converts to productId');
  assert(normLegacy.productName === 'Wide-Leg Cargo Pant', 'Legacy item converts to productName');
  assert(normLegacy.selectedSize === 'XL', 'Legacy item converts size to selectedSize');
  assert(normLegacy.selectedColor === 'Olive Drab', 'Legacy item converts color to selectedColor');

  // Test 3: Shipping Address Normalization
  const rawShipping = {
    name: 'Devin Cole',
    phone: '+91 9876543210',
    address: 'Flat 204, Royal Palms',
    city: 'Mumbai',
    state: 'Maharashtra',
    pin: '400001',
    country: 'India',
  };
  const normShip = normalizeShippingAddress(rawShipping);
  assert(normShip.name === 'Devin Cole', 'Normalized shipping has name');
  assert(normShip.phone === '+91 9876543210', 'Normalized shipping has phone');
  assert(normShip.address === 'Flat 204, Royal Palms', 'Normalized shipping has address');
  assert(normShip.pin === '400001', 'Normalized shipping has pin');

  // Test 4: Logged-out order retrieval returns empty (Requirement 8)
  authStore.logout();
  const loggedOutOrders = orderService.getOrdersForCustomer();
  assert(Array.isArray(loggedOutOrders) && loggedOutOrders.length === 0, 'Logged-out user cannot see customer orders');

  // Test 5: Register & Login Customer
  const regResult = authStore.register('Liam Wright', 'liam@theoutfitclub.com', 'SecurePass123');
  assert(regResult.success, 'Registration succeeded');
  const session = authStore.getSession();
  assert(session.isLoggedIn && session.customerId, `Customer logged in with ID: ${session.customerId}`);

  // Test 6: Create Order for logged-in Customer
  const order1 = orderService.createOrder({
    customer: {
      firstName: 'Liam',
      lastName: 'Wright',
      email: 'liam@theoutfitclub.com',
      phone: '+1 555-0199',
    },
    shippingAddress: rawShipping,
    items: [rawItem],
    subtotal: 96,
    shipping: 0,
    discount: 0,
    total: 96,
    status: 'Processing',
  });

  assert(order1.orderNumber.startsWith('TOC-'), `Order created with orderNumber: ${order1.orderNumber}`);
  assert(order1.customerId === session.customerId, `Order correctly associated with customerId: ${order1.customerId}`);
  assert(order1.status === 'Processing', 'Order status is Processing');
  assert(order1.items.length === 1, 'Order has 1 item');
  assert(order1.total === 96, 'Order total is 96');

  // Test 7: Customer Order Retrieval
  const customerOrders = orderService.getOrdersForCustomer();
  assert(customerOrders.length === 1, `Customer orders retrieved successfully: count=${customerOrders.length}`);
  assert(customerOrders[0].orderNumber === order1.orderNumber, 'Retrieved order matches orderNumber');

  // Test 8: Get Order by ID / OrderNumber
  const foundOrder = orderService.getOrderById(order1.orderNumber);
  assert(foundOrder !== null && foundOrder.orderNumber === order1.orderNumber, 'Order successfully found by orderNumber');

  // Test 9: Isolation between customers (customer B cannot see customer A's orders)
  authStore.logout();
  authStore.register('Noah Vance', 'noah@theoutfitclub.com', 'NoahPass123');
  const noahOrders = orderService.getOrdersForCustomer();
  assert(noahOrders.length === 0, 'New customer has 0 orders (isolated from previous customer)');

  // Test 10: Re-login as customer A and verify orders persist
  authStore.logout();
  authStore.login('liam@theoutfitclub.com', 'SecurePass123');
  const liamOrders = orderService.getOrdersForCustomer();
  assert(liamOrders.length === 1, 'Customer A orders persist across sessions and logins');

  console.log(`\n==================================================`);
  console.log(`🎉 ALL ${passCount} TESTS PASSED WITH 0 FAILURES!`);
  console.log(`==================================================\n`);
}

runTests().catch((err) => {
  console.error('\n❌ TEST RUN ABORTED:', err);
  process.exit(1);
});
