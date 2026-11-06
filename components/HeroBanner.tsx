'use client';

import React from 'react';
import {
  Flame,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageCircle,
  Package,
} from 'lucide-react';
import { useStore } from '@/src/context/StoreContext.tsx';

export function HeroBanner({
  onBrowseClick,
}: {
  onBrowseClick?: () => void;
}) {
  const { settings, setTrackingModalOpen } = useStore();

  return (
    <section className="relative overflow-hidden pt-8 pb-12 md:pt-14 md:pb-18 border-b border-[#242832]/80 bg-gradient-to-b from-[#0B0D10] via-[#0f1217] to-[#0B0D10]">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#FF6A00]/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12151B] border border-[#FF6A00]/30 shadow-lg shadow-[#FF6A00]/5 text-xs font-semibold text-white">
            <span className="flex h-2 w-2 rounded-full bg-[#FF6A00] animate-ping" />
            <span className="text-[#FF6A00]">Bangladesh #1 Verified</span>
            <span className="text-[#9298A3]">Digital Subscriptions & Licenses</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Instant Digital Access.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] via-[#FFA040] to-[#FF4500]">
              Zero Hassle.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-[#9298A3] leading-relaxed max-w-2xl mx-auto font-normal">
            {settings.hero_subtitle ||
              'Get Netflix 4K, Spotify, YouTube Premium, Discord Nitro, Canva Pro, and VPNs with instant bKash, Nagad, and Rocket mobile banking verification.'}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onBrowseClick}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white font-bold text-sm shadow-xl shadow-[#FF6A00]/25 hover:shadow-[#FF6A00]/40 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setTrackingModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-[#12151B] border border-[#242832] hover:border-[#FF6A00]/50 text-white font-medium text-sm transition-all hover:bg-[#181d26] flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-[#FF6A00]" />
              <span>Track My Order</span>
            </button>

            <a
              href={settings.whatsapp_url || 'https://wa.me/8801842728840'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 hover:border-[#25D366] text-[#25D366] font-medium text-sm transition-all hover:bg-[#25D366]/20 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp Help</span>
            </a>
          </div>

          {/* Features Strip */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div className="p-3 rounded-2xl bg-[#12151B]/80 border border-[#242832] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/15 flex items-center justify-center text-[#FF6A00] shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">5-15 Min Delivery</p>
                <p className="text-[11px] text-[#9298A3]">Via WhatsApp & Email</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#12151B]/80 border border-[#242832] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center text-green-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">100% Replacement</p>
                <p className="text-[11px] text-[#9298A3]">Full-term warranty</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#12151B]/80 border border-[#242832] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/15 flex items-center justify-center text-[#FF6A00] shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">bKash / Nagad / Rocket</p>
                <p className="text-[11px] text-[#9298A3]">Personal MFS Send Money</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#12151B]/80 border border-[#242832] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Verified Authentic</p>
                <p className="text-[11px] text-[#9298A3]">Created by MaHi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
