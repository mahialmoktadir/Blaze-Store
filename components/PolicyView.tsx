'use client';

import React from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Phone,
  MessageCircle,
  Mail,
  CheckCircle2,
  Lock,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { useStore } from '@/src/context/StoreContext.tsx';

export function PolicyView() {
  const { activePolicy, setActiveView, settings } = useStore();

  const getTitleAndContent = () => {
    switch (activePolicy) {
      case 'about':
        return {
          title: 'About BLAZE STORE',
          subtitle: 'The Premier Digital Subscription Marketplace in Bangladesh',
          body: (
            <div className="space-y-4 text-xs sm:text-sm text-[#9298A3] leading-relaxed">
              <p>
                <strong>BLAZE STORE</strong> was founded by{' '}
                <strong className="text-white">{settings.creator_name || 'MaHi Al-Moktadir'}</strong>{' '}
                to provide accessible, affordable, and 100% genuine digital subscriptions and software licenses to consumers and creators across Bangladesh.
              </p>
              <p>
                Traditional international subscriptions often require dual-currency credit cards or USD payments with high foreign exchange markups. BLAZE STORE bridges this gap by enabling frictionless purchases through local mobile financial services including <strong>bKash</strong>, <strong>Nagad</strong>, and <strong>Rocket</strong>.
              </p>
              <div className="p-4 rounded-2xl bg-[#0B0D10] border border-[#242832] space-y-2 text-white">
                <h4 className="font-bold text-sm text-[#FF6A00]">Our Core Guarantees:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#9298A3]">
                  <li>100% Genuine, legitimate subscriptions with zero risk of bans.</li>
                  <li>Rapid fulfillment within 5 to 15 minutes of payment verification.</li>
                  <li>Full replacement warranty throughout the active subscription term.</li>
                  <li>24/7 dedicated customer assistance directly on WhatsApp.</li>
                </ul>
              </div>
            </div>
          ),
        };

      case 'refund':
        return {
          title: 'Warranty & Refund Policy',
          subtitle: 'Complete peace of mind with 100% replacement protection',
          body: (
            <div className="space-y-4 text-xs sm:text-sm text-[#9298A3] leading-relaxed">
              <p>
                At BLAZE STORE, we stand firmly behind the quality of every subscription and license key we deliver.
              </p>
              <div className="p-4 rounded-2xl bg-[#0B0D10] border border-[#242832] space-y-2">
                <h4 className="font-bold text-sm text-emerald-400">Full Replacement Guarantee:</h4>
                <p className="text-xs">
                  If any shared account, profile, or license stops functioning before its expiration period, we provide an immediate free replacement upon verification.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-white">Refund Eligibility:</h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-[#9298A3]">
                  <li>If we are unable to deliver your ordered digital product within 24 hours of payment verification, you are entitled to a 100% refund to your original bKash/Nagad/Rocket number.</li>
                  <li>License keys that have already been activated or redeemed are non-refundable, but fully supported with warranty replacements if found defective.</li>
                  <li>Please contact WhatsApp helpline <strong>{settings.contact_number || '01842728840'}</strong> with your Order Number for rapid resolution.</li>
                </ol>
              </div>
            </div>
          ),
        };

      case 'privacy':
        return {
          title: 'Privacy Policy',
          subtitle: 'How we safeguard your contact details and order data',
          body: (
            <div className="space-y-4 text-xs sm:text-sm text-[#9298A3] leading-relaxed">
              <p>
                BLAZE STORE respects your privacy. We collect only the essential details required to deliver your digital orders: your name, email address, and WhatsApp mobile number.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs">
                <li>We never sell or disclose your email or phone number to any third-party marketing services.</li>
                <li>Your mobile banking Transaction IDs are utilized solely for anti-fraud reconciliation.</li>
                <li>Delivery information (such as login access or license keys) is securely encrypted and accessible only through your authenticated order tracking link.</li>
              </ul>
            </div>
          ),
        };

      default:
        return {
          title: 'Terms & Conditions',
          subtitle: 'Rules and guidelines for purchases on BLAZE STORE',
          body: (
            <div className="space-y-4 text-xs sm:text-sm text-[#9298A3] leading-relaxed">
              <p>
                By placing an order on BLAZE STORE, you agree to adhere to standard usage guidelines:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs">
                <li>For shared accounts (e.g. Netflix 1-Screen), users must only stream on their assigned profile and refrain from modifying the master account password or billing settings.</li>
                <li>Digital license keys are intended solely for the authorized device quantity stated in the product description.</li>
                <li>Submitting fraudulent or duplicate Transaction IDs will result in automatic cancellation and permanent blacklisting.</li>
              </ul>
            </div>
          ),
        };
    }
  };

  const { title, subtitle, body } = getTitleAndContent();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <button
        onClick={() => setActiveView('store')}
        className="px-4 py-2 rounded-xl bg-[#12151B] border border-[#242832] text-xs font-semibold text-white hover:border-[#FF6A00] flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Storefront</span>
      </button>

      <div className="p-6 sm:p-8 rounded-3xl bg-[#12151B] border border-[#242832] space-y-6 shadow-2xl">
        <div className="border-b border-[#242832] pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{title}</h1>
          <p className="text-xs sm:text-sm text-[#FF6A00] font-medium mt-1">{subtitle}</p>
        </div>

        <div className="pt-2">{body}</div>

        <div className="p-4 rounded-2xl bg-[#0B0D10] border border-[#242832] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#9298A3]">
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Have questions regarding these policies?</span>
          </div>
          <a
            href={settings.whatsapp_url || 'https://wa.me/8801842728840'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#25D366]/20 text-[#25D366] font-bold hover:bg-[#25D366]/30 transition-colors"
          >
            Chat with MaHi on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
