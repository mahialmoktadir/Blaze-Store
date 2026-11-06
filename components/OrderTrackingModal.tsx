'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Search,
  Package,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Key,
  Copy,
  Check,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/src/context/StoreContext.tsx';

export function OrderTrackingModal() {
  const {
    settings,
    trackingModalOpen,
    setTrackingModalOpen,
    activeOrderToTrack,
    setActiveOrderToTrack,
  } = useStore();

  const [orderIdInput, setOrderIdInput] = useState(activeOrderToTrack || '');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchOrder = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrderData(data.order);
      } else {
        setError(data.error || 'Order not found. Please verify your Order ID.');
        setOrderData(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search order.');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeOrderToTrack) {
      setOrderIdInput(activeOrderToTrack);
      fetchOrder(activeOrderToTrack);
    }
  }, [activeOrderToTrack, fetchOrder]);

  if (!trackingModalOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderIdInput);
  };

  const copyDeliveryInfo = () => {
    if (orderData?.deliveryInfo) {
      navigator.clipboard.writeText(orderData.deliveryInfo);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  // Status mapping
  const getStatusBadge = (paymentStatus: string, fulfillmentStatus: string) => {
    if (fulfillmentStatus === 'delivered') {
      return {
        label: 'Delivered',
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        step: 4,
      };
    }
    if (paymentStatus === 'payment_verified') {
      return {
        label: 'Payment Verified (Preparing Delivery)',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        step: 3,
      };
    }
    if (paymentStatus === 'under_verification' || paymentStatus === 'payment_submitted') {
      return {
        label: 'Under Verification',
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        step: 2,
      };
    }
    if (paymentStatus === 'payment_rejected') {
      return {
        label: 'Payment Rejected',
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        step: 0,
      };
    }
    return {
      label: 'Awaiting Payment',
      color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
      step: 1,
    };
  };

  const currentBadge = orderData
    ? getStatusBadge(orderData.paymentStatus, orderData.fulfillmentStatus)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#12151B] border border-[#242832] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#242832] flex items-center justify-between bg-[#0B0D10]/60">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#FF6A00]" />
            <h3 className="text-base font-bold text-white">Track Your Order</h3>
          </div>
          <button
            onClick={() => {
              setTrackingModalOpen(false);
              setActiveOrderToTrack('');
            }}
            className="p-1.5 rounded-lg text-[#9298A3] hover:text-white hover:bg-[#242832] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input form */}
        <div className="p-4 sm:p-6 border-b border-[#242832] bg-[#12151B]">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Enter Order Number (e.g. BLZ-2026-1001)"
                className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-[#9298A3] uppercase font-mono focus:outline-none focus:border-[#FF6A00]"
              />
              <Search className="w-4 h-4 text-[#9298A3] absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              disabled={loading || !orderIdInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Details Body */}
        {orderData && (
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[70vh]">
            {/* Order Overview Header */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B0D10] border border-[#242832]">
              <div>
                <span className="text-[10px] text-[#9298A3] uppercase font-bold tracking-wider">
                  Order Number
                </span>
                <p className="text-sm font-mono font-black text-white">
                  {orderData.orderNumber}
                </p>
                <span className="text-[11px] text-[#9298A3]">
                  {new Date(orderData.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold border ${currentBadge?.color}`}
                >
                  {currentBadge?.label}
                </span>
                <p className="text-xs text-white font-extrabold mt-1">
                  ৳{parseFloat(orderData.totalAmount).toLocaleString('en-US')}
                </p>
              </div>
            </div>

            {/* Timeline Progress */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Fulfillment Timeline
              </p>
              <div className="grid grid-cols-4 gap-1 text-center">
                <div
                  className={`p-2 rounded-xl border text-[10px] font-semibold ${
                    currentBadge && currentBadge.step >= 1
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-[#0B0D10] border-[#242832] text-[#9298A3]'
                  }`}
                >
                  1. Placed
                </div>
                <div
                  className={`p-2 rounded-xl border text-[10px] font-semibold ${
                    currentBadge && currentBadge.step >= 2
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-[#0B0D10] border-[#242832] text-[#9298A3]'
                  }`}
                >
                  2. Trx Submitted
                </div>
                <div
                  className={`p-2 rounded-xl border text-[10px] font-semibold ${
                    currentBadge && currentBadge.step >= 3
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-[#0B0D10] border-[#242832] text-[#9298A3]'
                  }`}
                >
                  3. Verified
                </div>
                <div
                  className={`p-2 rounded-xl border text-[10px] font-semibold ${
                    currentBadge && currentBadge.step >= 4
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md'
                      : 'bg-[#0B0D10] border-[#242832] text-[#9298A3]'
                  }`}
                >
                  4. Delivered
                </div>
              </div>
            </div>

            {/* DIGITAL PRODUCT DELIVERY VAULT (If Delivered) */}
            {orderData.fulfillmentStatus === 'delivered' && orderData.deliveryInfo && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#12151B] to-emerald-950/30 border border-emerald-500/40 shadow-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Key className="w-4 h-4" />
                    <span>Your Digital Credentials & Access</span>
                  </div>
                  <button
                    onClick={copyDeliveryInfo}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#242832] font-mono text-xs text-emerald-300 whitespace-pre-wrap select-all">
                  {orderData.deliveryInfo}
                </div>

                <p className="text-[11px] text-[#9298A3]">
                  Delivered on {new Date(orderData.deliveredAt || orderData.createdAt).toLocaleDateString('en-US')}. For any replacement, contact WhatsApp with this Order ID.
                </p>
              </div>
            )}

            {/* Items in this Order */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Purchased Items
              </p>
              <div className="space-y-1.5">
                {orderData.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#0B0D10] border border-[#242832] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{item.productName}</p>
                      {item.variationName && (
                        <p className="text-[11px] text-[#FF6A00]">{item.variationName}</p>
                      )}
                      <span className="text-[10px] text-[#9298A3]">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-mono font-bold text-white">
                      ৳{parseFloat(item.total).toLocaleString('en-US')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Support CTA */}
            <div className="pt-2 flex items-center justify-between border-t border-[#242832]">
              <span className="text-xs text-[#9298A3]">Need assistance with this order?</span>
              <a
                href={`${settings.whatsapp_url || 'https://wa.me/8801842728840'}?text=${encodeURIComponent(
                  `Assalamu Alaikum! Inquiry regarding Blaze Store order ${orderData.orderNumber}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#25D366]/20 text-[#25D366] text-xs font-bold flex items-center gap-1.5 hover:bg-[#25D366]/30 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Support</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
