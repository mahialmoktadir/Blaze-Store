'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { useStore } from '@/src/context/StoreContext.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';

export function SupportView() {
  const { settings, setActiveView } = useStore();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !subject || !message) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest',
          customerName,
          customerEmail,
          customerWhatsapp: customerWhatsapp || settings.contact_number,
          subject,
          message,
        }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTicketNumber(data.ticket.ticketNumber);
        setSubmitted(true);
        setSubject('');
        setMessage('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <button
        onClick={() => setActiveView('store')}
        className="px-4 py-2 rounded-xl bg-[#12151B] border border-[#242832] text-xs font-semibold text-white hover:border-[#FF6A00] flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Storefront</span>
      </button>

      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#12151B] border border-[#242832] space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Customer Support & Help Center</h1>
          <p className="text-xs sm:text-sm text-[#9298A3] mt-1">
            Need help with your subscription, account credentials, or payment verification? Reach out below.
          </p>
        </div>

        {/* Quick Contact Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href={settings.whatsapp_url || 'https://wa.me/8801842728840'}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-[#0B0D10] border border-[#25D366]/30 hover:border-[#25D366] text-white flex flex-col justify-between space-y-2 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">WhatsApp Helpline</p>
              <p className="text-xs text-[#25D366] font-mono font-bold mt-0.5">
                {settings.contact_number || '01842728840'}
              </p>
              <span className="text-[10px] text-[#9298A3]">Fastest reply (5-15 mins)</span>
            </div>
          </a>

          <a
            href={`tel:${settings.contact_number || '01842728840'}`}
            className="p-4 rounded-2xl bg-[#0B0D10] border border-[#242832] hover:border-[#FF6A00] text-white flex flex-col justify-between space-y-2 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FF6A00]/20 flex items-center justify-center text-[#FF6A00]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Direct Phone Call</p>
              <p className="text-xs text-white font-mono font-bold mt-0.5">
                {settings.contact_number || '01842728840'}
              </p>
              <span className="text-[10px] text-[#9298A3]">10:00 AM - 11:00 PM</span>
            </div>
          </a>

          <div className="p-4 rounded-2xl bg-[#0B0D10] border border-[#242832] text-white flex flex-col justify-between space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Email Inquiries</p>
              <p className="text-xs text-blue-400 font-semibold mt-0.5">
                support@blazestore.com
              </p>
              <span className="text-[10px] text-[#9298A3]">Invoices & Warranty</span>
            </div>
          </div>
        </div>

        {/* Support Ticket Submission */}
        <div className="pt-4 border-t border-[#242832]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Submit a Web Support Ticket
          </h2>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">Ticket Submitted Successfully!</p>
              <p className="text-xs text-[#9298A3]">
                Your Ticket Reference:{' '}
                <span className="font-mono font-bold text-emerald-400">{ticketNumber}</span>
              </p>
              <p className="text-xs text-[#9298A3]">
                Our team will reply directly to your email or WhatsApp number shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs text-[#FF6A00] underline font-semibold"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-white font-semibold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Farhan Kabir"
                    className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3.5 py-2.5 text-white placeholder-[#9298A3] focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. farhan@gmail.com"
                    className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3.5 py-2.5 text-white placeholder-[#9298A3] focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3.5 py-2.5 text-white placeholder-[#9298A3] focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-1">Subject / Order ID</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Order BLZ-2026-1001 renewal or activation question"
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3.5 py-2.5 text-white placeholder-[#9298A3] focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-1">Detailed Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what you need assistance with..."
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3.5 py-2.5 text-white placeholder-[#9298A3] focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#FF6A00]/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Send Support Ticket'}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
