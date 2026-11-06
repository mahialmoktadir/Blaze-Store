'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CartItem,
  CouponDiscount,
  calculateCartTotals,
  CartCalculationResult,
} from '@/lib/ecommerce-logic.ts';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variationId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variationId?: number) => void;
  clearCart: () => void;
  coupon: CouponDiscount | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  totals: CartCalculationResult;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  coupon: null,
  applyCoupon: async () => ({ success: false }),
  removeCoupon: () => {},
  totals: calculateCartTotals([]),
  isCartOpen: false,
  setIsCartOpen: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<CouponDiscount | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('blaze_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    setMounted(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('blaze_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [items, mounted]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === newItem.productId &&
          i.variationId === newItem.variationId
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity || 1;
        return updated;
      } else {
        return [...prev, { ...newItem, quantity: newItem.quantity || 1 }];
      }
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: number, variationId?: number) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && i.variationId === variationId)
      )
    );
  };

  const updateQuantity = (
    productId: number,
    quantity: number,
    variationId?: number
  ) => {
    if (quantity <= 0) {
      removeItem(productId, variationId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId && i.variationId === variationId) {
          return { ...i, quantity };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    try {
      const currentSubtotal = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: currentSubtotal }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setCoupon(data.coupon);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Invalid coupon' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to apply coupon' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const totals = calculateCartTotals(items, coupon);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        totals,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
