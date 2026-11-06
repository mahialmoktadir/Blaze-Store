'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider } from '@/src/context/AuthContext.tsx';
import { CartProvider } from '@/src/context/CartContext.tsx';
import { StoreProvider, useStore } from '@/src/context/StoreContext.tsx';
import { Navbar } from '@/components/Navbar.tsx';
import { HeroBanner } from '@/components/HeroBanner.tsx';
import { ProductCard, Product } from '@/components/ProductCard.tsx';
import { CategoryFilter, Category } from '@/components/CategoryFilter.tsx';
import { CartDrawer } from '@/components/CartDrawer.tsx';
import { CheckoutModal } from '@/components/CheckoutModal.tsx';
import { OrderTrackingModal } from '@/components/OrderTrackingModal.tsx';
import { ProductDetailModal } from '@/components/ProductDetailModal.tsx';
import { CustomerDashboard } from '@/components/CustomerDashboard.tsx';
import { AdminDashboard } from '@/components/AdminDashboard.tsx';
import { SupportView } from '@/components/SupportView.tsx';
import { PolicyView } from '@/components/PolicyView.tsx';
import { Footer } from '@/components/Footer.tsx';
import {
  Sparkles,
  TrendingUp,
  Layers,
  Search,
  MessageCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';

function StorefrontContent() {
  const { activeView, setActiveView } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);

      if (prodRes.success && prodRes.products) {
        setProducts(prodRes.products);
      }
      if (catRes.success && catRes.categories) {
        setCategories(catRes.categories);
      }
    } catch (err) {
      console.error('Error fetching initial marketplace catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by selected category and search query
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === null || p.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredProducts = products.filter((p) => p.isFeatured);
  const trendingProducts = products.filter((p) => p.isTrending);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D10] text-white">
      {/* Navigation */}
      <Navbar onSearchChange={(q) => setSearchQuery(q)} />

      {/* Main Dynamic View Area */}
      <main className="flex-1">
        {activeView === 'admin' ? (
          <AdminDashboard />
        ) : activeView === 'dashboard' ? (
          <CustomerDashboard />
        ) : activeView === 'support' ? (
          <SupportView />
        ) : activeView === 'policy' ? (
          <PolicyView />
        ) : (
          /* STANDARD STOREFRONT */
          <>
            <HeroBanner
              onBrowseClick={() => {
                const el = document.getElementById('product-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Featured & Trending Carousel Highlight */}
            {featuredProducts.length > 0 && !searchQuery && selectedCategory === null && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-[#242832]/60">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FF6A00]" />
                    <h2 className="text-lg sm:text-xl font-extrabold text-white">
                      Featured Subscriptions
                    </h2>
                  </div>
                  <span className="text-xs text-[#9298A3]">Hand-picked bestselling plans</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Main Product Catalog Section */}
            <section id="product-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
              {/* Category & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#FF6A00]" />
                    <span>Digital Marketplace Catalog</span>
                  </h2>
                  <p className="text-xs text-[#9298A3] mt-0.5">
                    Showing {filteredProducts.length} authorized digital subscriptions & keys in Bangladesh
                  </p>
                </div>

                {/* Filter info or search reset */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-[#FF6A00] font-semibold hover:underline self-start sm:self-auto"
                  >
                    Clear search &quot;{searchQuery}&quot;
                  </button>
                )}
              </div>

              {/* Category Pills Filter */}
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(id) => setSelectedCategory(id)}
              />

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-80 rounded-2xl bg-[#12151B] border border-[#242832] animate-pulse p-4 space-y-3"
                    >
                      <div className="aspect-[16/10] bg-[#1a1f28] rounded-xl" />
                      <div className="h-4 bg-[#1a1f28] rounded w-3/4" />
                      <div className="h-3 bg-[#1a1f28] rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[#12151B] border border-[#242832] space-y-3">
                  <Search className="w-10 h-10 text-[#FF6A00] mx-auto opacity-50" />
                  <h3 className="text-base font-bold text-white">No products found</h3>
                  <p className="text-xs text-[#9298A3] max-w-sm mx-auto">
                    We could not find any products matching your search criteria. Try browsing all categories.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery('');
                    }}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-[#FF6A00] text-white text-xs font-bold shadow-md hover:scale-105 transition-all"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              )}
            </section>

            {/* Why Choose Us Banner */}
            <section className="border-t border-[#242832] bg-[#0E1015] py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
                  <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">
                    Why Bangladesh Trust BLAZE STORE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Premium Digital Delivery Experience
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl bg-[#12151B] border border-[#242832] space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/20 flex items-center justify-center text-[#FF6A00]">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white">Swift TrxID Verification</h3>
                    <p className="text-xs text-[#9298A3] leading-relaxed">
                      Simply submit your bKash, Nagad, or Rocket Transaction ID. Our team rapidly verifies the payment record and dispatches your credentials via WhatsApp.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-[#12151B] border border-[#242832] space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white">100% Replacement Warranty</h3>
                    <p className="text-xs text-[#9298A3] leading-relaxed">
                      Full warranty for the entirety of your subscription period. If any credentials fail or need renewal, get instant replacements directly on WhatsApp.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-[#12151B] border border-[#242832] space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white">Direct Creator Support</h3>
                    <p className="text-xs text-[#9298A3] leading-relaxed">
                      Platform created and maintained by MaHi Al-Moktadir. Direct WhatsApp contact at 01842728840 ensures dedicated personal care and authentic service.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />
      <ProductDetailModal />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <StorefrontContent />
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
