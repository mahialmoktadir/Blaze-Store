'use client';

import React, { useState } from 'react';
import {
  ShoppingCart,
  Eye,
  Check,
  Zap,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '@/src/context/CartContext.tsx';
import { useStore } from '@/src/context/StoreContext.tsx';

export interface ProductVariation {
  id: number;
  productId: number;
  name: string;
  duration: string;
  price: string;
  regularPrice?: string | null;
  isDefault: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  thumbnail: string;
  categoryId?: number | null;
  regularPrice: string;
  discountPrice?: string | null;
  subscriptionDuration?: string | null;
  productType?: string | null;
  stockQuantity?: number | null;
  deliveryMethod?: string | null;
  deliveryInstructions?: string | null;
  isFeatured?: boolean | null;
  isTrending?: boolean | null;
  categoryName?: string | null;
  variations?: ProductVariation[];
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { setSelectedProductForDetail } = useStore();
  const [addedAnim, setAddedAnim] = useState(false);

  // Default variation selection
  const defaultVar =
    product.variations?.find((v) => v.isDefault) ||
    product.variations?.[0];

  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(
    defaultVar
  );

  // Active prices (use selected variation if available, else product base)
  const currentPrice = selectedVariation
    ? parseFloat(selectedVariation.price)
    : product.discountPrice
    ? parseFloat(product.discountPrice)
    : parseFloat(product.regularPrice);

  const regularPrice = selectedVariation?.regularPrice
    ? parseFloat(selectedVariation.regularPrice)
    : parseFloat(product.regularPrice);

  // Calculate discount percentage
  const discountPercent =
    regularPrice > currentPrice
      ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      productId: product.id,
      variationId: selectedVariation?.id,
      productName: product.name,
      variationName: selectedVariation?.name,
      price: currentPrice,
      quantity: 1,
    });

    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  return (
    <div
      onClick={() => setSelectedProductForDetail(product)}
      className="group relative flex flex-col justify-between rounded-2xl bg-[#12151B] border border-[#242832] hover:border-[#FF6A00]/60 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF6A00]/10 hover:-translate-y-1 cursor-pointer overflow-hidden"
    >
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
        {discountPercent && discountPercent > 0 && (
          <span className="px-2 py-0.5 rounded-lg bg-[#FF6A00] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
            -{discountPercent}%
          </span>
        )}
        {product.isFeatured && (
          <span className="px-2 py-0.5 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px] font-bold flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            Featured
          </span>
        )}
      </div>

      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0B0D10]/80 backdrop-blur-sm border border-[#242832] text-[10px] font-semibold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          In Stock
        </span>
      </div>

      {/* Card Media Header */}
      <div>
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#0B0D10] border border-[#242832]/60 mb-3 group-hover:border-[#FF6A00]/30 transition-colors">
          <img
            src={product.thumbnail}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Fallback placeholder image if image fails
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12151B] via-transparent to-transparent opacity-80" />

          {/* Category Tag pill */}
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-0.5 rounded-md bg-[#0B0D10]/90 text-[10px] font-medium text-[#9298A3] border border-[#242832]">
              {product.categoryName || 'Subscription'}
            </span>
          </div>

          <div className="absolute bottom-2 right-2">
            <span className="px-2 py-0.5 rounded-md bg-[#0B0D10]/90 text-[10px] font-medium text-white flex items-center gap-1 border border-[#242832]">
              <Clock className="w-2.5 h-2.5 text-[#FF6A00]" />
              {selectedVariation?.duration || product.subscriptionDuration || '1 Month'}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-white group-hover:text-[#FF6A00] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-[#9298A3] line-clamp-2 min-h-[32px] leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Duration / Variation Selector Chips (if multiple variations) */}
        {product.variations && product.variations.length > 1 && (
          <div
            className="mt-3 flex flex-wrap gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {product.variations.map((v) => {
              const isSelected = selectedVariation?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariation(v)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    isSelected
                      ? 'bg-[#FF6A00]/20 border-[#FF6A00] text-[#FF6A00]'
                      : 'bg-[#0B0D10] border-[#242832] text-[#9298A3] hover:text-white hover:border-[#383e4d]'
                  }`}
                >
                  {v.duration}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Footer: Pricing & Action Buttons */}
      <div className="pt-4 mt-3 border-t border-[#242832]/80 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-white tracking-tight">
                ৳{currentPrice.toLocaleString('en-US')}
              </span>
              {regularPrice > currentPrice && (
                <span className="text-xs text-[#9298A3] line-through">
                  ৳{regularPrice.toLocaleString('en-US')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#9298A3]">
              {selectedVariation?.name || 'Standard Tier'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-0.5 justify-end">
              <Zap className="w-3 h-3 text-[#FF6A00]" />
              Fast Delivery
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          <button
            onClick={handleAddToCart}
            className={`col-span-3 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
              addedAnim
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white shadow-[#FF6A00]/20 hover:shadow-[#FF6A00]/40 hover:scale-[1.02]'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {addedAnim ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProductForDetail(product);
            }}
            className="col-span-2 py-2 px-2 rounded-xl bg-[#0B0D10] border border-[#242832] hover:border-[#FF6A00]/60 text-white font-medium text-xs flex items-center justify-center gap-1 hover:bg-[#181d26] transition-colors"
            aria-label={`View details for ${product.name}`}
          >
            <Eye className="w-3 h-3 text-[#9298A3]" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
