'use client';

import React, { useState } from 'react';
import {
  Flame,
  ShoppingCart,
  Search,
  User,
  Shield,
  HelpCircle,
  Menu,
  X,
  LogOut,
  Package,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { useCart } from '@/src/context/CartContext.tsx';
import { useStore } from '@/src/context/StoreContext.tsx';

export function Navbar({ onSearchChange }: { onSearchChange?: (q: string) => void }) {
  const { user, appUser, signInWithGoogle, signOut, isAdmin } = useAuth();
  const { items, setIsCartOpen } = useCart();
  const { settings, setTrackingModalOpen, activeView, setActiveView } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchInput);
    }
    setActiveView('store');
    const catalogEl = document.getElementById('product-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#242832] bg-[#0B0D10]/90 backdrop-blur-md">
      {/* Top Banner Notice */}
      {settings.notice_text && (
        <div className="bg-gradient-to-r from-[#12151B] via-[#1a1f28] to-[#12151B] border-b border-[#242832]/60 py-1.5 px-4 text-center text-xs text-[#9298A3] flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#FF6A00] animate-pulse"></span>
          <span>{settings.notice_text}</span>
          <span className="hidden sm:inline text-[#FF6A00] font-semibold ml-1">Instant BDT Delivery</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('store')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF4500] flex items-center justify-center shadow-lg shadow-[#FF6A00]/20 group-hover:shadow-[#FF6A00]/40 transition-all">
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>{settings.site_name || 'BLAZE STORE'}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FF6A00]/20 text-[#FF6A00] px-1.5 py-0.5 rounded border border-[#FF6A00]/40">
                  BD
                </span>
              </div>
              <p className="text-[11px] text-[#9298A3] font-medium leading-none">
                by {settings.creator_name || 'MaHi Al-Moktadir'}
              </p>
            </div>
          </button>
        </div>

        {/* Search Bar (Desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md relative items-center"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              if (onSearchChange) onSearchChange(e.target.value);
            }}
            placeholder="Search Netflix, Spotify, Discord Nitro, VPN, Canva..."
            className="w-full bg-[#12151B] border border-[#242832] rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-[#9298A3] focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-colors"
          />
          <Search className="w-4 h-4 text-[#9298A3] absolute left-3.5 pointer-events-none" />
        </form>

        {/* Desktop Navigation Links & Action Buttons */}
        <div className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-[#9298A3]">
          <button
            onClick={() => setActiveView('store')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeView === 'store'
                ? 'text-white bg-[#12151B] border border-[#242832]'
                : 'hover:text-white hover:bg-[#12151B]/50'
            }`}
          >
            Storefront
          </button>
          <button
            onClick={() => setTrackingModalOpen(true)}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-[#12151B]/50 transition-colors flex items-center gap-1.5"
          >
            <Package className="w-4 h-4 text-[#FF6A00]" />
            Track Order
          </button>
          <button
            onClick={() => setActiveView('support')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeView === 'support'
                ? 'text-white bg-[#12151B] border border-[#242832]'
                : 'hover:text-white hover:bg-[#12151B]/50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Support
          </button>
        </div>

        {/* Right Section: Admin Toggle, Cart, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Dashboard shortcut (always accessible for store administrator) */}
          <button
            onClick={() => setActiveView(activeView === 'admin' ? 'store' : 'admin')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              activeView === 'admin'
                ? 'bg-[#FF6A00] text-white border-[#FF6A00] shadow-md shadow-[#FF6A00]/30'
                : 'bg-[#12151B] text-[#9298A3] hover:text-white border-[#242832] hover:border-[#FF6A00]/50'
            }`}
            title="Switch to Admin Dashboard"
          >
            <Shield className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span className="hidden sm:inline">
              {activeView === 'admin' ? 'Exit Admin' : 'Admin Panel'}
            </span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-[#12151B] border border-[#242832] hover:border-[#FF6A00]/60 text-white transition-all hover:scale-105"
            aria-label="View Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF6A00] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-[#FF6A00]/50 animate-bounce">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* User Account / Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-[#12151B] border border-[#242832] hover:border-[#FF6A00]/50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FF6A00]/20 border border-[#FF6A00]/40 flex items-center justify-center text-[#FF6A00] font-bold text-xs uppercase">
                  {user.displayName?.[0] || user.email?.[0] || 'U'}
                </div>
                <span className="hidden md:inline text-xs font-medium text-white max-w-[100px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#12151B] border border-[#242832] rounded-2xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-[#242832] mb-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {user.displayName || 'Customer'}
                    </p>
                    <p className="text-[11px] text-[#9298A3] truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FF6A00]/20 text-[#FF6A00]">
                      {isAdmin ? 'Admin' : 'Customer'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveView('dashboard');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-[#1c222c] rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4 text-[#FF6A00]" />
                    My Orders & Keys
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setActiveView('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#FF6A00] hover:bg-[#1c222c] rounded-xl transition-colors font-medium"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Control Hub
                    </button>
                  )}

                  <button
                    onClick={() => {
                      signOut();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white text-xs font-semibold shadow-md shadow-[#FF6A00]/25 hover:shadow-[#FF6A00]/40 transition-all hover:scale-[1.02]"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#12151B] border border-[#242832] text-[#9298A3] hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#242832] bg-[#0B0D10] px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              placeholder="Search products..."
              className="w-full bg-[#12151B] border border-[#242832] rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-[#9298A3]"
            />
            <Search className="w-4 h-4 text-[#9298A3] absolute left-3.5 top-3" />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                setActiveView('store');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-[#12151B] border border-[#242832] text-xs font-medium text-white text-left flex items-center justify-between"
            >
              <span>Storefront</span>
              <ChevronRight className="w-4 h-4 text-[#9298A3]" />
            </button>
            <button
              onClick={() => {
                setTrackingModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-[#12151B] border border-[#242832] text-xs font-medium text-white text-left flex items-center justify-between"
            >
              <span>Track Order</span>
              <Package className="w-4 h-4 text-[#FF6A00]" />
            </button>
            <button
              onClick={() => {
                setActiveView('dashboard');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-[#12151B] border border-[#242832] text-xs font-medium text-white text-left flex items-center justify-between"
            >
              <span>My Orders</span>
              <User className="w-4 h-4 text-[#9298A3]" />
            </button>
            <button
              onClick={() => {
                setActiveView('admin');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-[#12151B] border border-[#242832] text-xs font-semibold text-[#FF6A00] text-left flex items-center justify-between"
            >
              <span>Admin Panel</span>
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
