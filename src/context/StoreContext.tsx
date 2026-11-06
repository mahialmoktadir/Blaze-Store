'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface StoreSettings {
  site_name: string;
  creator_name: string;
  contact_number: string;
  whatsapp_url: string;
  facebook_url: string;
  instagram_url: string;
  github_url: string;
  bkash_number: string;
  bkash_type: string;
  bkash_enabled: string;
  nagad_number: string;
  nagad_type: string;
  nagad_enabled: string;
  rocket_number: string;
  rocket_type: string;
  rocket_enabled: string;
  cod_enabled: string;
  hero_title: string;
  hero_subtitle: string;
  notice_text: string;
}

const defaultSettings: StoreSettings = {
  site_name: 'BLAZE STORE',
  creator_name: 'MaHi Al-Moktadir',
  contact_number: '01842728840',
  whatsapp_url: 'https://wa.me/8801842728840',
  facebook_url: 'https://www.facebook.com/mahialmoktadir',
  instagram_url: 'https://www.instagram.com/mahialmoktadir/',
  github_url: 'https://github.com/mahialmoktadir',
  bkash_number: '01842728840',
  bkash_type: 'Personal',
  bkash_enabled: 'true',
  nagad_number: '01842728840',
  nagad_type: 'Personal',
  nagad_enabled: 'true',
  rocket_number: '01842728840',
  rocket_type: 'Personal',
  rocket_enabled: 'true',
  cod_enabled: 'false',
  hero_title: 'Premium Digital Subscriptions at Bangladesh Best Rates',
  hero_subtitle:
    'Instant delivery via WhatsApp & Email. 100% verified accounts, authentic licenses, and rapid replacement guarantee.',
  notice_text:
    '🔥 Special Promo: Get 10% instant discount using code BLAZE10 at checkout!',
};

interface StoreContextType {
  settings: StoreSettings;
  updateLocalSettings: (newSettings: Partial<StoreSettings>) => void;
  refreshSettings: () => Promise<void>;
  trackingModalOpen: boolean;
  setTrackingModalOpen: (open: boolean) => void;
  activeOrderToTrack: string;
  setActiveOrderToTrack: (id: string) => void;
  checkoutModalOpen: boolean;
  setCheckoutModalOpen: (open: boolean) => void;
  selectedProductForDetail: any | null;
  setSelectedProductForDetail: (p: any | null) => void;
  activeView: 'store' | 'admin' | 'dashboard' | 'support' | 'policy';
  setActiveView: (view: 'store' | 'admin' | 'dashboard' | 'support' | 'policy') => void;
  activePolicy: string | null;
  setActivePolicy: (p: string | null) => void;
}

const StoreContext = createContext<StoreContextType>({
  settings: defaultSettings,
  updateLocalSettings: () => {},
  refreshSettings: async () => {},
  trackingModalOpen: false,
  setTrackingModalOpen: () => {},
  activeOrderToTrack: '',
  setActiveOrderToTrack: () => {},
  checkoutModalOpen: false,
  setCheckoutModalOpen: () => {},
  selectedProductForDetail: null,
  setSelectedProductForDetail: () => {},
  activeView: 'store',
  setActiveView: () => {},
  activePolicy: null,
  setActivePolicy: () => {},
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [activeOrderToTrack, setActiveOrderToTrack] = useState('');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<'store' | 'admin' | 'dashboard' | 'support' | 'policy'>('store');
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const updateLocalSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        updateLocalSettings,
        refreshSettings,
        trackingModalOpen,
        setTrackingModalOpen,
        activeOrderToTrack,
        setActiveOrderToTrack,
        checkoutModalOpen,
        setCheckoutModalOpen,
        selectedProductForDetail,
        setSelectedProductForDetail,
        activeView,
        setActiveView,
        activePolicy,
        setActivePolicy,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
