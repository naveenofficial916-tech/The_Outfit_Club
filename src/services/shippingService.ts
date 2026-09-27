// Configurable Delivery / Shipping Utility for The Outfit Club

export interface DeliveryMethod {
  id: string;
  name: string;
  estimate: string;
  description: string;
  basePrice: number;
  qualifiesForFreeShipping: boolean;
}

export const FREE_SHIPPING_THRESHOLD = 75;

export const DELIVERY_METHODS: DeliveryMethod[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    estimate: '3–5 Business Days',
    description: 'Tracked ground transit with eco-friendly protective packaging.',
    basePrice: 12,
    qualifiesForFreeShipping: true,
  },
  {
    id: 'express',
    name: 'Express Streetwear Priority',
    estimate: '1–2 Business Days',
    description: 'Priority courier dispatch for urgent wardrobe drops.',
    basePrice: 22,
    qualifiesForFreeShipping: false,
  },
  {
    id: 'next_day',
    name: 'Next-Day Signature Delivery',
    estimate: 'Next Business Day',
    description: 'Direct courier arrival with recipient signature required.',
    basePrice: 35,
    qualifiesForFreeShipping: false,
  },
];

/**
 * Calculates shipping cost based on delivery method and subtotal.
 * Standard shipping is complimentary when order subtotal meets or exceeds $75.
 */
export function calculateDeliveryCost(methodId: string, subtotal: number): number {
  if (subtotal <= 0) return 0;
  const method = DELIVERY_METHODS.find((m) => m.id === methodId) || DELIVERY_METHODS[0];

  if (method.qualifiesForFreeShipping && subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  return method.basePrice;
}

export function getDeliveryMethod(methodId: string): DeliveryMethod {
  return DELIVERY_METHODS.find((m) => m.id === methodId) || DELIVERY_METHODS[0];
}
