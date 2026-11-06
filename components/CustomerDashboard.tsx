'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Key,
  HelpCircle,
  User,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { useStore } from '@/src/context/StoreContext.tsx';

export function CustomerDashboard() {
  const { user, appUser, signInWithGoogle } = useAuth();
  const { settings, setActiveOrderToTrack, setTrackingModalOpen, setActiveView } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'licenses' | 'support'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);

  // Support ticket form
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketsList, setTicketsList] = useState<any[]>([]);

  const fetchCustomerOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const url = user?.uid ? `/api/orders?userId=${user.uid}` : `/api/orders`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error('Error fetching customer orders', e);
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  const fetchSupportTickets = useCallback(async () => {
    try {
      const url = user?.uid ? `/api/support?userId=${user.uid}` : `/api/support`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.tickets) {
        setTicketsList(data.tickets);
      }
    } catch (e) {
      console.error('Error fetching support tickets', e);
    }
  }, [user]);

  useEffect(() => {
    fetchCustomerOrders();
    fetchSupportTickets();
  }, [fetchCustomerOrders, fetchSupportTickets]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;
    setTicketSubmitting(true);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest',
          customerName: user?.displayName || appUser?.name || 'Customer',
          customerEmail: user?.email || 'customer@blazestore.com',
          customerWhatsapp: appUser?.whatsapp || settings.contact_number,
          subject: newTicketSubject.trim(),
          message: newTicketMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTicketSuccess(true);
        setNewTicketSubject('');
        setNewTicketMessage('');
        fetchSupportTickets();
        setTimeout(() => setTicketSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error submitting ticket', e);
    } finally {
      setTicketSubmitting(false);
    }
  };

  const copyKeyText = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Filter delivered orders that have deliveryInfo
  const deliveredLicenses = orders.filter(
    (o) => o.fulfillmentStatus === 'delivered' && o.deliveryInfo
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Dashboard Top Header */}
      <div className="p-6 rounded-3xl bg-[#12151B] border border-[#242832] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6A00] to-[#FF4500] flex items-center justify-center text-white text-xl font-black shadow-lg shadow-[#FF6A00]/25">
            {user?.displayName?.[0] || user?.email?.[0] || 'C'}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">
              {user?.displayName || 'Customer Dashboard'}
            </h1>
            <p className="text-xs text-[#9298A3]">
              {user?.email || 'Track your digital orders, license keys, and warranty.'}
            </p>
          </div>
        </div>

        {!user && (
          <button
            onClick={() => signInWithGoogle()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all"
          >
            Sign In with Google to Sync Orders
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#242832] gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-[#FF6A00] text-[#FF6A00]'
              : 'border-transparent text-[#9298A3] hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('licenses')}
          className={`py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'licenses'
              ? 'border-[#FF6A00] text-[#FF6A00]'
              : 'border-transparent text-[#9298A3] hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Active Subscriptions & Keys ({deliveredLicenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'support'
              ? 'border-[#FF6A00] text-[#FF6A00]'
              : 'border-transparent text-[#9298A3] hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Support & Tickets ({ticketsList.length})</span>
        </button>
      </div>

      {/* TAB 1: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {loadingOrders ? (
            <div className="p-8 text-center text-xs text-[#9298A3]">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#12151B] border border-[#242832] text-center space-y-3">
              <Package className="w-10 h-10 text-[#FF6A00] mx-auto opacity-50" />
              <p className="text-sm font-bold text-white">No orders found</p>
              <p className="text-xs text-[#9298A3]">
                You have not placed any orders yet.
              </p>
              <button
                onClick={() => setActiveView('store')}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#FF6A00] text-white text-xs font-bold shadow-md hover:scale-105 transition-all"
              >
                Browse Products
              </button>
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="p-5 rounded-2xl bg-[#12151B] border border-[#242832] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-white">
                      {o.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        o.fulfillmentStatus === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : o.paymentStatus === 'payment_verified'
                          ? 'bg-blue-500/20 text-blue-400'
                          : o.paymentStatus === 'under_verification'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-zinc-500/20 text-zinc-400'
                      }`}
                    >
                      {o.fulfillmentStatus === 'delivered'
                        ? 'Delivered'
                        : o.paymentStatus === 'payment_verified'
                        ? 'Verified'
                        : o.paymentStatus === 'under_verification'
                        ? 'Under Verification'
                        : 'Awaiting Payment'}
                    </span>
                  </div>

                  <p className="text-xs text-[#9298A3]">
                    {o.items?.map((it: any) => `${it.productName} (x${it.quantity})`).join(', ')}
                  </p>
                  <p className="text-[11px] text-[#9298A3]">
                    Payment: <span className="uppercase font-bold text-white">{o.paymentMethod}</span> | Total: <span className="font-bold text-[#FF6A00]">৳{parseFloat(o.totalAmount).toLocaleString('en-US')}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveOrderToTrack(o.orderNumber);
                      setTrackingModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0B0D10] border border-[#242832] hover:border-[#FF6A00] text-xs font-bold text-white transition-colors"
                  >
                    View Status & Keys
                  </button>
                  <a
                    href={`${settings.whatsapp_url || 'https://wa.me/8801842728840'}?text=${encodeURIComponent(
                      `Assalamu Alaikum! Inquiry regarding order ${o.orderNumber}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors"
                    title="WhatsApp Support for this Order"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE LICENSES & SUBSCRIPTIONS */}
      {activeTab === 'licenses' && (
        <div className="space-y-3">
          {deliveredLicenses.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#12151B] border border-[#242832] text-center space-y-2">
              <Key className="w-10 h-10 text-[#FF6A00] mx-auto opacity-50" />
              <p className="text-sm font-bold text-white">No active licenses found</p>
              <p className="text-xs text-[#9298A3]">
                Delivered license keys and login credentials will appear here once your payment is verified.
              </p>
            </div>
          ) : (
            deliveredLicenses.map((lic) => (
              <div
                key={lic.id}
                className="p-5 rounded-2xl bg-[#12151B] border border-emerald-500/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {lic.items?.map((it: any) => it.productName).join(' & ')}
                    </h3>
                    <p className="text-xs text-[#9298A3]">
                      Order #{lic.orderNumber} • Delivered on{' '}
                      {new Date(lic.deliveredAt || lic.createdAt).toLocaleDateString('en-US')}
                    </p>
                  </div>
                  <button
                    onClick={() => copyKeyText(lic.deliveryInfo, lic.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500/30 transition-colors"
                  >
                    {copiedKeyId === lic.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKeyId === lic.id ? 'Copied!' : 'Copy Access'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#242832] font-mono text-xs text-emerald-300 whitespace-pre-wrap select-all">
                  {lic.deliveryInfo}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: SUPPORT & TICKETS */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          {/* Create new ticket */}
          <form
            onSubmit={handleCreateTicket}
            className="p-5 rounded-3xl bg-[#12151B] border border-[#242832] space-y-3"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#FF6A00]" />
              Open a Support Ticket
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Subject / Issue (e.g. Netflix profile PIN help)"
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              />
              <div className="flex items-center text-xs text-[#9298A3]">
                We reply within 15-30 minutes during active hours.
              </div>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Describe your issue or order reference number..."
              value={newTicketMessage}
              onChange={(e) => setNewTicketMessage(e.target.value)}
              className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
            />
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={ticketSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {ticketSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
              {ticketSuccess && (
                <span className="text-xs text-emerald-400 font-semibold">
                  Ticket submitted! Admin team notified.
                </span>
              )}
            </div>
          </form>

          {/* Tickets List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#9298A3] uppercase tracking-wider">
              Your Inquiries ({ticketsList.length})
            </h4>
            {ticketsList.length === 0 ? (
              <p className="text-xs text-[#9298A3]">No active tickets.</p>
            ) : (
              ticketsList.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-[#12151B] border border-[#242832] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-[#FF6A00] font-bold">
                        {t.ticketNumber}
                      </span>
                      <h4 className="font-bold text-white text-sm">{t.subject}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] uppercase font-bold">
                      {t.status}
                    </span>
                  </div>
                  <p className="text-[#9298A3] bg-[#0B0D10] p-2.5 rounded-xl border border-[#242832]">
                    {t.message}
                  </p>
                  {t.messages && t.messages.length > 1 && (
                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] text-[#FF6A00] font-bold uppercase">Replies:</p>
                      {t.messages.slice(1).map((m: any) => (
                        <div
                          key={m.id}
                          className={`p-2 rounded-lg text-xs ${
                            m.senderType === 'admin'
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                              : 'bg-[#242832] text-white'
                          }`}
                        >
                          <span className="font-bold mr-1">[{m.senderName}]:</span>
                          {m.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
