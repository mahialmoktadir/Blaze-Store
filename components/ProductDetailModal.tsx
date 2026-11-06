'use client';

import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Check,
  Star,
  Clock,
  Send,
  MessageCircle,
} from 'lucide-react';
import { useStore } from '@/src/context/StoreContext.tsx';
import { useCart } from '@/src/context/CartContext.tsx';
import { Product, ProductVariation } from './ProductCard.tsx';

export function ProductDetailModal() {
  const {
    selectedProductForDetail,
    setSelectedProductForDetail,
    setCheckoutModalOpen,
  } = useStore();
  const { addItem, setIsCartOpen } = useCart();

  const product = selectedProductForDetail as Product | null;

  // Selected variation
  const defaultVar =
    product?.variations?.find((v) => v.isDefault) ||
    product?.variations?.[0];

  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(
    defaultVar
  );

  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState<any[]>(
    (selectedProductForDetail as any)?.reviews || [
      {
        id: 1,
        customerName: 'Tanvir Ahmed',
        rating: 5,
        comment: 'Super fast delivery via WhatsApp! Verified and working perfectly.',
        createdAt: new Date().toISOString(),
      },
    ]
  );
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!product) return null;

  const currentPrice = selectedVariation
    ? parseFloat(selectedVariation.price)
    : product.discountPrice
    ? parseFloat(product.discountPrice)
    : parseFloat(product.regularPrice);

  const regularPrice = selectedVariation?.regularPrice
    ? parseFloat(selectedVariation.regularPrice)
    : parseFloat(product.regularPrice);

  const discountPercent =
    regularPrice > currentPrice
      ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
      : null;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variationId: selectedVariation?.id,
      productName: product.name,
      variationName: selectedVariation?.name,
      price: currentPrice,
      quantity: 1,
    });
    setSelectedProductForDetail(null);
  };

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      variationId: selectedVariation?.id,
      productName: product.name,
      variationName: selectedVariation?.name,
      price: currentPrice,
      quantity: 1,
    });
    setSelectedProductForDetail(null);
    setIsCartOpen(false);
    setCheckoutModalOpen(true);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const newRev = {
      id: Date.now(),
      customerName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      createdAt: new Date().toISOString(),
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewName('');
    setReviewComment('');
    setReviewSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#12151B] border border-[#242832] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#242832] flex items-center justify-between bg-[#0B0D10]/60">
          <span className="text-xs font-semibold text-[#9298A3] uppercase tracking-wider">
            {product.categoryName || 'Digital Product'} Details
          </span>
          <button
            onClick={() => setSelectedProductForDetail(null)}
            className="p-1.5 rounded-lg text-[#9298A3] hover:text-white hover:bg-[#242832] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[78vh]">
          {/* Top section: Thumbnail + Title & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            <div className="relative aspect-video sm:aspect-square w-full rounded-2xl overflow-hidden bg-[#0B0D10] border border-[#242832]">
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80';
                }}
              />
              {discountPercent && discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-[#FF6A00] text-white text-xs font-extrabold px-2.5 py-1 rounded-xl shadow-md">
                  -{discountPercent}% OFF
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-white leading-tight">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-black text-white">
                    ৳{currentPrice.toLocaleString('en-US')}
                  </span>
                  {regularPrice > currentPrice && (
                    <span className="text-sm text-[#9298A3] line-through">
                      ৳{regularPrice.toLocaleString('en-US')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  100% Replacement Warranty & Support
                </p>
              </div>

              {/* Variations selector */}
              {product.variations && product.variations.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white uppercase tracking-wider">
                    Select Plan / Duration:
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {product.variations.map((v) => {
                      const isSelected =
                        selectedVariation?.id === v.id ||
                        (!selectedVariation && v.isDefault);
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariation(v)}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                            isSelected
                              ? 'bg-[#FF6A00]/20 border-[#FF6A00] text-white'
                              : 'bg-[#0B0D10] border-[#242832] text-[#9298A3] hover:text-white'
                          }`}
                        >
                          <div>
                            <p className="font-bold">{v.name}</p>
                            <span className="text-[10px] text-[#9298A3]">
                              Validity: {v.duration}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-[#FF6A00]">
                            ৳{parseFloat(v.price).toLocaleString('en-US')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="py-3 px-3 rounded-xl bg-[#0B0D10] border border-[#242832] hover:border-[#FF6A00] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 text-[#FF6A00]" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-3 px-3 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white font-bold text-xs shadow-lg shadow-[#FF6A00]/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description & Delivery Info */}
          <div className="space-y-4 pt-3 border-t border-[#242832]">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                Product Description
              </h3>
              <p className="text-xs text-[#9298A3] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {product.deliveryInstructions && (
              <div className="p-3.5 rounded-2xl bg-[#0B0D10] border border-[#242832] text-xs space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF6A00]" />
                  Delivery Details:
                </p>
                <p className="text-[#9298A3]">{product.deliveryInstructions}</p>
              </div>
            )}
          </div>

          {/* Customer Reviews Section */}
          <div className="space-y-4 pt-4 border-t border-[#242832]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                Customer Reviews ({reviewsList.length})
              </h3>
            </div>

            {/* Existing Reviews */}
            <div className="space-y-2">
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-xl bg-[#0B0D10] border border-[#242832] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{rev.customerName}</span>
                    <div className="flex text-yellow-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[#9298A3]">{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Leave a review */}
            <form onSubmit={handleReviewSubmit} className="p-3.5 rounded-2xl bg-[#0B0D10] border border-[#242832] space-y-2.5">
              <p className="text-xs font-bold text-white">Leave a Verified Review</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="bg-[#12151B] border border-[#242832] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(parseInt(e.target.value))}
                  className="bg-[#12151B] border border-[#242832] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Great</option>
                  <option value={3}>3 Stars - Good</option>
                </select>
              </div>
              <textarea
                required
                rows={2}
                placeholder="Share your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-[#12151B] border border-[#242832] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#242832] hover:bg-[#FF6A00] text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Submit Review</span>
              </button>
              {reviewSubmitted && (
                <p className="text-[11px] text-emerald-400 font-medium">
                  Thank you! Your review has been added.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
