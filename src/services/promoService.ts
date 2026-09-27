// Centralized Promotion & Discount Utility for The Outfit Club

export interface PromoValidationResult {
  valid: boolean;
  code?: string;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  message: string;
}

interface PromoRule {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSubtotal?: number;
  description: string;
}

const PROMO_REGISTRY: Record<string, PromoRule> = {
  OUTFIT10: {
    code: 'OUTFIT10',
    type: 'percentage',
    value: 0.10, // 10%
    description: '10% off your entire streetwear order',
  },
  STREET15: {
    code: 'STREET15',
    type: 'percentage',
    value: 0.15, // 15%
    minSubtotal: 50,
    description: '15% off orders over $50',
  },
  MEN20: {
    code: 'MEN20',
    type: 'percentage',
    value: 0.20, // 20%
    minSubtotal: 80,
    description: 'VIP 20% off orders over $80',
  },
  OUTFITCLUB: {
    code: 'OUTFITCLUB',
    type: 'fixed',
    value: 15, // $15 off
    minSubtotal: 60,
    description: '$15 introductory credit on orders over $60',
  },
};

/**
 * Validates a promo code against current cart subtotal.
 */
export function validatePromoCode(rawCode: string, subtotal: number): PromoValidationResult {
  const code = (rawCode || '').trim().toUpperCase();

  if (!code) {
    return {
      valid: false,
      discountAmount: 0,
      discountType: 'fixed',
      message: 'Please enter a promotion code.',
    };
  }

  const rule = PROMO_REGISTRY[code];
  if (!rule) {
    return {
      valid: false,
      discountAmount: 0,
      discountType: 'fixed',
      message: `Code "${code}" is invalid or expired. Try "OUTFIT10" or "MEN20".`,
    };
  }

  if (rule.minSubtotal && subtotal < rule.minSubtotal) {
    return {
      valid: false,
      discountAmount: 0,
      discountType: rule.type,
      message: `Code "${code}" requires a minimum order of $${rule.minSubtotal}. Current subtotal: $${subtotal.toFixed(2)}.`,
    };
  }

  let discountAmount = 0;
  if (rule.type === 'percentage') {
    discountAmount = Math.round(subtotal * rule.value * 100) / 100;
  } else {
    discountAmount = Math.min(subtotal, rule.value);
  }

  return {
    valid: true,
    code: rule.code,
    discountAmount,
    discountType: rule.type,
    message: `${rule.description} (-$${discountAmount.toFixed(2)})`,
  };
}
