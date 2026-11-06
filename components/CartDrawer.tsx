'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShoppingBag,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '@/src/context/CartContext.tsx';
import { useStore } from '@/src/context/StoreContext.tsx';

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    coupon,
    applyCoupon,
    removeCoupon,
    totals,
    isCartOpen,
    setIsCartOpen,
  } = useCart();
  const { setCheckoutModalOpen } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);

    const res = await applyCoupon(couponInput.trim());
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.error || 'Failed to apply coupon');
    } else {
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0B0D10] border-l border-[#242832] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#242832] flex items-center justify-between bg-[#12151B]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FF6A00]" />
              <h2 className="text-base font-bold text-white">Your Shopping Cart</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#FF6A00]/20 text-[#FF6A00] text-xs font-bold">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-[#9298A3] hover:text-white hover:bg-[#242832] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-[#9298A3]">
                <div className="w-16 h-16 rounded-2xl bg-[#12151B] border border-[#242832] flex items-center justify-center text-[#FF6A00]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="text-base font-bold text-white">Your cart is empty</h3>
                <p className="text-xs max-w-xs text-[#9298A3]">
                  Looks like you haven&apos;t added any digital subscriptions or keys yet.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-[#12151B] border border-[#242832] hover:border-[#FF6A00] text-white text-xs font-semibold transition-colors"
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.variationId || idx}`}
                  className="p-3 rounded-2xl bg-[#12151B] border border-[#242832] flex gap-3 relative group"
                >
                  <div className="w-16 h-16 rounded-xl bg-[#0B0D10] border border-[#242832] flex items-center justify-center text-[#FF6A00] shrink-0 font-bold text-xs uppercase overflow-hidden">
                    <span className="text-[11px] font-black text-center px-1">
                      {item.productName.substring(0, 3)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeItem(item.productId, item.variationId)}
                          className="text-[#9298A3] hover:text-red-400 p-1 transition-colors"
                          aria-label={`Remove ${item.productName}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.variationName && (
                        <p className="text-[11px] text-[#FF6A00] font-medium">
                          {item.variationName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 bg-[#0B0D10] border border-[#242832] rounded-lg p-0.5">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1, item.variationId)
                          }
                          className="p-1 rounded text-[#9298A3] hover:text-white hover:bg-[#242832]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold text-white px-1">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1, item.variationId)
                          }
                          className="p-1 rounded text-[#9298A3] hover:text-white hover:bg-[#242832]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-white">
                        ৳{(item.price * item.quantity).toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Calculations */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#242832] bg-[#12151B] space-y-4">
              {/* Coupon Code Section */}
              <div>
                {coupon ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-bold text-white">{coupon.code}</span>
                        <span className="text-emerald-400 ml-1.5 font-medium">
                          ({coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `৳${coupon.discountValue} off`})
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[#9298A3] hover:text-white text-[11px] underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Coupon code (e.g. BLAZE10)"
                          className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-[#9298A3] uppercase font-mono focus:outline-none focus:border-[#FF6A00]"
                        />
                        <Tag className="w-3.5 h-3.5 text-[#9298A3] absolute left-2.5 top-2.5" />
                      </div>
                      <button
                        type="submit"
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2 rounded-xl bg-[#242832] hover:bg-[#FF6A00] text-white text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-red-400">{couponError}</p>
                    )}
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#9298A3] pt-1 border-t border-[#242832]/60">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{totals.formattedSubtotal}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount</span>
                    <span className="font-medium">-{totals.formattedDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-[#242832]">
                  <span>Total Payable</span>
                  <span className="text-[#FF6A00] text-base">{totals.formattedTotal}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#FF6A00]/25 hover:shadow-[#FF6A00]/40 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#9298A3]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant bKash, Nagad & Rocket verification</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
