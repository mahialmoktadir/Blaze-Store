export interface CartItem {
  productId: number;
  variationId?: number;
  productName: string;
  variationName?: string;
  price: number;
  quantity: number;
}

export interface CouponDiscount {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
}

export interface CartCalculationResult {
  subtotal: number;
  discountAmount: number;
  total: number;
  formattedSubtotal: string;
  formattedDiscount: string;
  formattedTotal: string;
  couponApplied?: string;
  error?: string;
}

/**
 * Calculates cart subtotal, coupon discounts, and final total.
 */
export function calculateCartTotals(
  items: CartItem[],
  coupon?: CouponDiscount | null
): CartCalculationResult {
  const subtotal = items.reduce((acc, item) => acc + item.price * Math.max(1, item.quantity), 0);

  let discountAmount = 0;
  let couponApplied: string | undefined = undefined;
  let error: string | undefined = undefined;

  if (coupon && coupon.discountValue > 0) {
    if (subtotal < coupon.minSpend) {
      error = `Minimum spend of ৳${coupon.minSpend} required for coupon ${coupon.code}`;
    } else {
      if (coupon.discountType === 'percentage') {
        discountAmount = (subtotal * coupon.discountValue) / 100;
      } else {
        discountAmount = coupon.discountValue;
      }
      // Discount cannot exceed subtotal
      discountAmount = Math.min(discountAmount, subtotal);
      couponApplied = coupon.code;
    }
  }

  const total = Math.max(0, subtotal - discountAmount);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    formattedSubtotal: `৳${(Math.round(subtotal * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    formattedDiscount: `৳${(Math.round(discountAmount * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    formattedTotal: `৳${(Math.round(total * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    couponApplied,
    error,
  };
}

/**
 * Validates and standardizes a Bangladesh mobile phone number (013 - 019).
 */
export function normalizeBdPhone(phone: string): { isValid: boolean; normalized: string; error?: string } {
  if (!phone) {
    return { isValid: false, normalized: '', error: 'Phone number is required' };
  }

  // Remove spaces, hyphens, and parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Strip international prefix if present
  if (cleaned.startsWith('+880')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('880')) {
    cleaned = '0' + cleaned.slice(3);
  }

  // Must match standard 11-digit BD mobile format: 01[3-9]XXXXXXXX
  const bdPhoneRegex = /^01[3-9]\d{8}$/;
  if (!bdPhoneRegex.test(cleaned)) {
    return {
      isValid: false,
      normalized: cleaned,
      error: 'Invalid Bangladesh mobile number. Must be 11 digits starting with 013-019',
    };
  }

  return { isValid: true, normalized: cleaned };
}

/**
 * Validates Bangladesh mobile banking Transaction ID (bKash / Nagad / Rocket).
 */
export function validateTransactionId(
  trxId: string,
  method: 'bkash' | 'nagad' | 'rocket'
): { isValid: boolean; formattedTrxId: string; error?: string } {
  if (!trxId || typeof trxId !== 'string') {
    return { isValid: false, formattedTrxId: '', error: 'Transaction ID is required' };
  }

  const cleaned = trxId.trim().toUpperCase();

  // Basic alphanumeric check (no punctuation)
  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    return {
      isValid: false,
      formattedTrxId: cleaned,
      error: 'Transaction ID must contain only alphanumeric characters',
    };
  }

  // Minimum length check (usually 8-12 characters in Bangladesh MFS)
  if (cleaned.length < 7 || cleaned.length > 16) {
    return {
      isValid: false,
      formattedTrxId: cleaned,
      error: `Invalid ${method.toUpperCase()} Transaction ID length (${cleaned.length} chars). Expected 8-12 characters.`,
    };
  }

  return { isValid: true, formattedTrxId: cleaned };
}

/**
 * State machine transition for order and payment statuses.
 */
export function transitionOrderStatus(
  currentPaymentStatus: string,
  currentFulfillmentStatus: string,
  action: 'submit_payment' | 'verify_payment' | 'reject_payment' | 'fulfill_order' | 'cancel_order' | 'refund_order'
): { nextPaymentStatus: string; nextFulfillmentStatus: string; isAllowed: boolean; error?: string } {
  switch (action) {
    case 'submit_payment':
      if (currentPaymentStatus === 'payment_verified') {
        return {
          nextPaymentStatus: currentPaymentStatus,
          nextFulfillmentStatus: currentFulfillmentStatus,
          isAllowed: false,
          error: 'Payment is already verified',
        };
      }
      return {
        nextPaymentStatus: 'under_verification',
        nextFulfillmentStatus: 'processing',
        isAllowed: true,
      };

    case 'verify_payment':
      return {
        nextPaymentStatus: 'payment_verified',
        nextFulfillmentStatus: currentFulfillmentStatus === 'pending' ? 'confirmed' : currentFulfillmentStatus,
        isAllowed: true,
      };

    case 'reject_payment':
      return {
        nextPaymentStatus: 'payment_rejected',
        nextFulfillmentStatus: 'cancelled',
        isAllowed: true,
      };

    case 'fulfill_order':
      if (currentPaymentStatus !== 'payment_verified') {
        return {
          nextPaymentStatus: currentPaymentStatus,
          nextFulfillmentStatus: currentFulfillmentStatus,
          isAllowed: false,
          error: 'Cannot fulfill order before payment is verified by admin',
        };
      }
      return {
        nextPaymentStatus: currentPaymentStatus,
        nextFulfillmentStatus: 'delivered',
        isAllowed: true,
      };

    case 'cancel_order':
      return {
        nextPaymentStatus: currentPaymentStatus === 'payment_verified' ? 'refunded' : 'cancelled',
        nextFulfillmentStatus: 'cancelled',
        isAllowed: true,
      };

    case 'refund_order':
      return {
        nextPaymentStatus: 'refunded',
        nextFulfillmentStatus: 'refunded',
        isAllowed: true,
      };

    default:
      return {
        nextPaymentStatus: currentPaymentStatus,
        nextFulfillmentStatus: currentFulfillmentStatus,
        isAllowed: false,
        error: 'Unknown action',
      };
  }
}
