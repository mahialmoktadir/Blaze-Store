'use client';

import React from 'react';
import {
  Flame,
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  ExternalLink,
  Github,
  Facebook,
  Instagram,
  Heart,
} from 'lucide-react';
import { useStore } from '@/src/context/StoreContext.tsx';

export function Footer() {
  const { settings, setActivePolicy, setActiveView } = useStore();

  const handleOpenPolicy = (type: string) => {
    setActivePolicy(type);
    setActiveView('policy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#242832] bg-[#08090C] text-[#9298A3] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF4500] flex items-center justify-center text-white shadow-md shadow-[#FF6A00]/20">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-tight">
                  {settings.site_name || 'BLAZE STORE'}
                </span>
                <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-[#FF6A00]/20 text-[#FF6A00] font-bold">
                  BD
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[#9298A3]">
              Bangladesh&apos;s leading digital subscription &amp; software license platform. Instant delivery via WhatsApp &amp; Email with 100% genuine replacement warranty.
            </p>

            <div className="text-xs text-white">
              <p className="text-[11px] text-[#9298A3]">Chief Architect & Creator:</p>
              <p className="font-extrabold text-[#FF6A00]">
                {settings.creator_name || 'MaHi Al-Moktadir'}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveView('store')}
                  className="hover:text-white transition-colors"
                >
                  All Subscriptions & Keys
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicy('about')}
                  className="hover:text-white transition-colors"
                >
                  About BLAZE STORE
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('support')}
                  className="hover:text-white transition-colors"
                >
                  Customer Support Tickets
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicy('refund')}
                  className="hover:text-white transition-colors"
                >
                  Warranty & Refund Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicy('privacy')}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicy('terms')}
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Direct Contact & Support
            </h4>
            <div className="space-y-2.5 text-xs">
              <a
                href={settings.whatsapp_url || 'https://wa.me/8801842728840'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#12151B] border border-[#242832] text-white hover:border-[#25D366] transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#9298A3]">WhatsApp 24/7 Helpline</p>
                  <p className="font-mono font-bold text-xs text-[#25D366]">
                    {settings.contact_number || '01842728840'}
                  </p>
                </div>
              </a>

              <a
                href={`tel:${settings.contact_number || '01842728840'}`}
                className="flex items-center gap-2 text-white hover:text-[#FF6A00] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span className="font-mono">{settings.contact_number || '01842728840'}</span>
              </a>

              <div className="flex items-center gap-2 text-[#9298A3]">
                <Mail className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>support@blazestore.com</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#12151B] border border-[#242832] hover:border-blue-500 text-[#9298A3] hover:text-blue-400 flex items-center justify-center transition-colors"
                  aria-label="Facebook Profile of MaHi Al-Moktadir"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#12151B] border border-[#242832] hover:border-pink-500 text-[#9298A3] hover:text-pink-400 flex items-center justify-center transition-colors"
                  aria-label="Instagram Profile of MaHi Al-Moktadir"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.github_url && (
                <a
                  href={settings.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#12151B] border border-[#242832] hover:border-white text-[#9298A3] hover:text-white flex items-center justify-center transition-colors"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Authorized Payment Methods
            </h4>
            <p className="text-[11px] text-[#9298A3] leading-relaxed">
              We accept manual Send Money via Bangladesh Mobile Financial Services (MFS) with zero surcharge:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-[#12151B] border border-pink-500/30 text-center">
                <span className="font-extrabold text-xs text-pink-400">bKash</span>
                <span className="block text-[9px] text-[#9298A3]">Personal</span>
              </div>
              <div className="p-2 rounded-xl bg-[#12151B] border border-orange-500/30 text-center">
                <span className="font-extrabold text-xs text-orange-400">Nagad</span>
                <span className="block text-[9px] text-[#9298A3]">Personal</span>
              </div>
              <div className="p-2 rounded-xl bg-[#12151B] border border-purple-500/30 text-center">
                <span className="font-extrabold text-xs text-purple-400">Rocket</span>
                <span className="block text-[9px] text-[#9298A3]">Personal</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#12151B] border border-[#242832] flex items-center gap-2 text-[10px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Manual TrxID verification ensures 100% order protection</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-[#242832] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9298A3]">
          <p>© 2026 {settings.site_name || 'BLAZE STORE'}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-[#FF6A00] fill-[#FF6A00]" /> by{' '}
            <strong className="text-white">{settings.creator_name || 'MaHi Al-Moktadir'}</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
