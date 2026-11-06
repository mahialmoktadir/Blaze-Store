import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  normalizeBdPhone,
  validateTransactionId,
  transitionOrderStatus,
} from './ecommerce-logic.ts';

test('Cart calculations correctly sum items without coupon', () => {
  const items = [
    { productId: 1, productName: 'Netflix Premium', price: 260, quantity: 2 },
    { productId: 2, productName: 'Spotify Premium', price: 140, quantity: 1 },
  ];
  const res = calculateCartTotals(items);
  assert.equal(res.subtotal, 660);
  assert.equal(res.discountAmount, 0);
  assert.equal(res.total, 660);
  assert.equal(res.formattedTotal, '৳660.00');
});

test('Cart calculations apply percentage discount when minSpend is met', () => {
  const items = [
    { productId: 1, productName: 'Netflix Premium', price: 500, quantity: 1 },
  ];
  const coupon = {
    code: 'BLAZE10',
    discountType: 'percentage' as const,
    discountValue: 10,
    minSpend: 200,
  };
  const res = calculateCartTotals(items, coupon);
  assert.equal(res.subtotal, 500);
  assert.equal(res.discountAmount, 50);
  assert.equal(res.total, 450);
  assert.equal(res.couponApplied, 'BLAZE10');
});

test('Cart calculations reject coupon when below minSpend', () => {
  const items = [
    { productId: 1, productName: 'Spotify 1M', price: 140, quantity: 1 },
  ];
  const coupon = {
    code: 'BLAZE10',
    discountType: 'percentage' as const,
    discountValue: 10,
    minSpend: 200,
  };
  const res = calculateCartTotals(items, coupon);
  assert.equal(res.discountAmount, 0);
  assert.equal(res.total, 140);
  assert.ok(res.error?.includes('Minimum spend'));
});

test('Bangladesh phone number normalization handles various formats', () => {
  // Local 11 digits
  assert.equal(normalizeBdPhone('01842728840').isValid, true);
  assert.equal(normalizeBdPhone('01842728840').normalized, '01842728840');

  // With +88 prefix
  assert.equal(normalizeBdPhone('+8801842728840').isValid, true);
  assert.equal(normalizeBdPhone('+8801842728840').normalized, '01842728840');

  // With spaces and hyphens
  assert.equal(normalizeBdPhone('01842-728 840').isValid, true);
  assert.equal(normalizeBdPhone('01842-728 840').normalized, '01842728840');

  // Invalid numbers
  assert.equal(normalizeBdPhone('01234567890').isValid, false); // invalid operator 012
  assert.equal(normalizeBdPhone('018427288').isValid, false); // too short
});

test('Transaction ID validation checks formats', () => {
  // Valid bKash TrxID
  const bk = validateTransactionId('BK8923XYZ1', 'bkash');
  assert.equal(bk.isValid, true);
  assert.equal(bk.formattedTrxId, 'BK8923XYZ1');

  // Valid lowercase trimmed
  const ng = validateTransactionId('  ng771239ab  ', 'nagad');
  assert.equal(ng.isValid, true);
  assert.equal(ng.formattedTrxId, 'NG771239AB');

  // Invalid characters
  const bad = validateTransactionId('TRX-1234#@!', 'bkash');
  assert.equal(bad.isValid, false);

  // Empty
  assert.equal(validateTransactionId('', 'rocket').isValid, false);
});

test('Order state machine enforces payment verification before fulfillment', () => {
  // Attempt to deliver without verified payment -> blocked
  const res = transitionOrderStatus('awaiting_payment', 'pending', 'fulfill_order');
  assert.equal(res.isAllowed, false);
  assert.ok(res.error?.includes('Cannot fulfill'));

  // Approve payment -> succeeds
  const verified = transitionOrderStatus('under_verification', 'processing', 'verify_payment');
  assert.equal(verified.isAllowed, true);
  assert.equal(verified.nextPaymentStatus, 'payment_verified');

  // Once verified, fulfillment succeeds
  const fulfilled = transitionOrderStatus('payment_verified', 'confirmed', 'fulfill_order');
  assert.equal(fulfilled.isAllowed, true);
  assert.equal(fulfilled.nextFulfillmentStatus, 'delivered');
});
