'use client';

import React from 'react';
import {
  Sparkles,
  Film,
  Music,
  Gamepad2,
  ShieldCheck,
  KeyRound,
  Gift,
  Layers,
} from 'lucide-react';

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
}) {
  const getIcon = (slug: string) => {
    switch (slug) {
      case 'entertainment':
        return <Film className="w-3.5 h-3.5" />;
      case 'music':
        return <Music className="w-3.5 h-3.5" />;
      case 'gaming':
        return <Gamepad2 className="w-3.5 h-3.5" />;
      case 'productivity':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'security-vpn':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'software':
        return <KeyRound className="w-3.5 h-3.5" />;
      case 'gift-cards':
        return <Gift className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all ${
          selectedCategory === null
            ? 'bg-[#FF6A00] text-white shadow-md shadow-[#FF6A00]/25'
            : 'bg-[#12151B] border border-[#242832] text-[#9298A3] hover:text-white hover:border-[#3a4150]'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>All Products</span>
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all ${
              isSelected
                ? 'bg-[#FF6A00] text-white shadow-md shadow-[#FF6A00]/25'
                : 'bg-[#12151B] border border-[#242832] text-[#9298A3] hover:text-white hover:border-[#3a4150]'
            }`}
          >
            {getIcon(cat.slug)}
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
