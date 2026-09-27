// Order Service Abstraction for The Outfit Club
// MODULE 5 / TASK 5.3 — CUSTOMER ORDER HISTORY FOUNDATION

import type { CartItem } from './cartStore';
import { cartStore } from './cartStore';
import { authStore } from './authStore';

export type OrderStatus =
  | 'Processing'
  | 'Confirmed'
  | 'Order Confirmed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BillingAddress extends Address {
  sameAsShipping: boolean;
}

export interface DeliveryMethodInfo {
  id: string;
  name: string;
  estimate: string;
  price: number;
}

/**
 * Task 5.3 Order Item Model:
 * Stores essential historical product purchase data without bloating the object.
 */
export interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;

  // Backward-compatibility properties with previous CartItem structure
  id?: string;
  product?: any;
  size?: string;
  color?: string;
  price?: number;
  productSlug?: string;
}

/**
 * Task 5.3 Shipping Address Model
 */
export interface ShippingAddressInfo {
  name: string;
  phone: string;
  address: string;
  addressLine2?: string;
  city: string;
  state: string;
  pin: string;
  country: string;

  // Backward compatibility with Address interface
  addressLine1?: string;
  postalCode?: string;
}

/**
 * Task 5.3 Order Data Model
 */
export interface OrderPayload {
  id: string;
  orderId: string;
  customerId?: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  promoCode?: string;
  total: number;
  shippingAddress: ShippingAddressInfo & Address;
  billingAddress?: BillingAddress;
  deliveryMethod?: DeliveryMethodInfo;
  customer: CustomerInfo;
}

const LATEST_ORDER_KEY = 'the_outfit_club_latest_order_v1';
const ORDERS_HISTORY_KEY = 'the_outfit_club_orders_history_v1';
const ORDER_COUNTER_KEY = 'the_outfit_club_order_counter_v1';

/**
 * Normalizes any order item (new or legacy CartItem) to the Task 5.3 OrderItem model.
 */
export function normalizeOrderItem(item: any): OrderItem {
  const productId = item.productId || item.product?.id || item.id || '';
  const productName = item.productName || item.product?.name || item.name || 'Men\'s Garment';
  const image =
    item.image ||
    (Array.isArray(item.product?.images) ? item.product.images[0] : item.product?.image) ||
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80';
  const selectedSize = item.selectedSize || item.size || 'M';
  const selectedColor = item.selectedColor || item.color || 'Standard';
  const quantity = item.quantity || 1;
  const unitPrice =
    typeof item.unitPrice === 'number'
      ? item.unitPrice
      : typeof item.price === 'number'
      ? item.price
      : typeof item.product?.price === 'number'
      ? item.product.price
      : 0;
  const totalPrice = typeof item.totalPrice === 'number' ? item.totalPrice : unitPrice * quantity;
  const productSlug = item.productSlug || item.product?.slug || (item.productId ? String(item.productId).toLowerCase() : '');

  return {
    productId,
    productName,
    image,
    selectedSize,
    selectedColor,
    quantity,
    unitPrice,
    totalPrice,
    // Backward compatibility
    id: item.id || `${productId}-${selectedSize}-${selectedColor}`,
    product: item.product,
    size: selectedSize,
    color: selectedColor,
    price: unitPrice,
    productSlug,
  };
}

/**
 * Normalizes shipping address to provide both Task 5.3 fields and legacy Address fields.
 */
export function normalizeShippingAddress(addr: any, customer?: CustomerInfo): ShippingAddressInfo & Address {
  const fullName =
    addr?.name ||
    (customer ? `${customer.firstName} ${customer.lastName}`.trim() : '') ||
    'Valued Customer';
  const phone = addr?.phone || customer?.phone || '';
  const line1 = addr?.address || addr?.addressLine1 || '';
  const line2 = addr?.addressLine2 || '';
  const city = addr?.city || '';
  const state = addr?.state || '';
  const pin = addr?.pin || addr?.postalCode || '';
  const country = addr?.country || 'India';

  return {
    name: fullName,
    phone,
    address: line1,
    addressLine1: line1,
    addressLine2: line2,
    city,
    state,
    pin,
    postalCode: pin,
    country,
  };
}

/**
 * Normalizes an entire order payload from storage
 */
export function normalizeOrder(raw: any): OrderPayload {
  const orderId = raw.orderId || raw.id || generateOrderReference();
  const orderNumber = raw.orderNumber || orderId;
  const id = raw.id || orderId;
  const items = Array.isArray(raw.items) ? raw.items.map(normalizeOrderItem) : [];
  const customer: CustomerInfo = raw.customer || {
    firstName: 'Customer',
    lastName: '',
    email: '',
    phone: '',
  };
  const shippingAddress = normalizeShippingAddress(raw.shippingAddress, customer);
  const status: OrderStatus = raw.status || 'Processing';
  const paymentStatus = raw.paymentStatus || 'Paid';

  return {
    ...raw,
    id,
    orderId,
    orderNumber,
    customerId: raw.customerId || undefined,
    status,
    paymentStatus,
    items,
    customer,
    shippingAddress,
    subtotal: raw.subtotal || 0,
    shipping: raw.shipping || 0,
    discount: raw.discount || 0,
    total: raw.total || 0,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

/**
 * Generates an order reference code (e.g., TOC-10001)
 */
export function generateOrderReference(): string {
  let counter = 10001;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(ORDER_COUNTER_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0) {
          counter = parsed + 1;
        }
      }
      localStorage.setItem(ORDER_COUNTER_KEY, counter.toString());
    } catch {
      counter = Math.floor(10000 + Math.random() * 90000);
    }
  } else {
    counter = Math.floor(10000 + Math.random() * 90000);
  }

  return `TOC-${counter}`;
}

export const orderService = {
  createOrder(data: {
    customer: CustomerInfo;
    shippingAddress: Address | ShippingAddressInfo;
    billingAddress?: BillingAddress;
    deliveryMethod?: DeliveryMethodInfo;
    items: (OrderItem | CartItem)[];
    subtotal: number;
    shipping: number;
    discount: number;
    promoCode?: string;
    total: number;
    customerId?: string;
    status?: OrderStatus;
    paymentStatus?: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  }): OrderPayload {
    const orderNumber = generateOrderReference();
    const orderId = orderNumber;
    const session = authStore.getSession();
    const customerId = data.customerId || (session.isLoggedIn ? session.customerId : undefined);

    const normalizedItems = (data.items || []).map(normalizeOrderItem);
    const normalizedShipping = normalizeShippingAddress(data.shippingAddress, data.customer);

    const order: OrderPayload = {
      id: orderId,
      orderId,
      orderNumber,
      customerId,
      createdAt: new Date().toISOString(),
      status: data.status || 'Processing',
      paymentStatus: data.paymentStatus || 'Paid',
      items: normalizedItems,
      customer: data.customer,
      shippingAddress: normalizedShipping,
      billingAddress: data.billingAddress,
      deliveryMethod: data.deliveryMethod || {
        id: 'standard',
        name: 'Standard Dispatch',
        estimate: '3-5 business days',
        price: data.shipping || 0,
      },
      subtotal: data.subtotal,
      shipping: data.shipping,
      discount: data.discount,
      promoCode: data.promoCode,
      total: data.total,
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LATEST_ORDER_KEY, JSON.stringify(order));
        const rawHistory = localStorage.getItem(ORDERS_HISTORY_KEY);
        const history: OrderPayload[] = rawHistory ? JSON.parse(rawHistory) : [];
        const cleanHistory = Array.isArray(history) ? history : [];
        localStorage.setItem(ORDERS_HISTORY_KEY, JSON.stringify([order, ...cleanHistory]));
        // Dispatch custom event for real-time reactivity across components
        window.dispatchEvent(new CustomEvent('the_outfit_club_order_placed', { detail: order }));
      } catch (e) {
        console.warn('Unable to persist order to localStorage:', e);
      }
    }

    return order;
  },

  getLatestOrder(): OrderPayload | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(LATEST_ORDER_KEY);
      return raw ? normalizeOrder(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },

  getAllOrders(): OrderPayload[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(ORDERS_HISTORY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map(normalizeOrder)
        .sort((a: OrderPayload, b: OrderPayload) => {
          const timeA = new Date(a.createdAt).getTime() || 0;
          const timeB = new Date(b.createdAt).getTime() || 0;
          return timeB - timeA;
        });
    } catch {
      return [];
    }
  },

  /**
   * Retrieves orders belonging to the specified customer (by customerId or customer email).
   * If arguments omitted, uses the currently logged-in customer session.
   */
  getOrdersForCustomer(customerId?: string, email?: string): OrderPayload[] {
    const all = this.getAllOrders();
    const session = authStore.getSession();
    const targetCustId = customerId || (session.isLoggedIn ? session.customerId : undefined);
    const targetEmail = (email || (session.isLoggedIn ? session.email : '')).trim().toLowerCase();

    if (!targetCustId && !targetEmail) {
      return [];
    }

    return all.filter((order) => {
      if (targetCustId && order.customerId === targetCustId) {
        return true;
      }
      if (targetEmail && order.customer?.email?.trim().toLowerCase() === targetEmail) {
        return true;
      }
      return false;
    });
  },

  getOrderById(orderId: string): OrderPayload | null {
    if (!orderId || typeof window === 'undefined') return null;
    try {
      const cleanTarget = orderId.trim().toUpperCase();
      const latest = this.getLatestOrder();
      if (
        latest &&
        (latest.orderId.toUpperCase() === cleanTarget ||
          latest.orderNumber.toUpperCase() === cleanTarget ||
          latest.id.toUpperCase() === cleanTarget)
      ) {
        return latest;
      }
      const allOrders = this.getAllOrders();
      return (
        allOrders.find(
          (o) =>
            o.orderId.toUpperCase() === cleanTarget ||
            o.orderNumber.toUpperCase() === cleanTarget ||
            o.id.toUpperCase() === cleanTarget
        ) || null
      );
    } catch {
      return null;
    }
  },

  /**
   * Safely adds all items from a past order back into current cart
   */
  reorder(order: OrderPayload): number {
    let addedCount = 0;
    if (!order?.items || !Array.isArray(order.items)) return addedCount;

    for (const item of order.items) {
      const normalized = normalizeOrderItem(item);
      const productObj = item.product || {
        id: normalized.productId,
        name: normalized.productName,
        price: normalized.unitPrice,
        images: [normalized.image],
        category: 'clothing',
        colors: [{ name: normalized.selectedColor, hex: '#171717' }],
        sizes: [normalized.selectedSize],
        inStock: true,
        slug: normalized.productSlug || normalized.productId,
      };

      cartStore.addToCart(
        productObj,
        normalized.selectedSize || 'M',
        normalized.selectedColor || 'Standard',
        normalized.quantity,
        false
      );
      addedCount += normalized.quantity;
    }

    return addedCount;
  },
};
