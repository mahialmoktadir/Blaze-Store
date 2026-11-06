'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  DollarSign,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Key,
  Settings,
  MessageSquare,
  Users,
  RefreshCw,
  Copy,
  Check,
  Send,
  AlertTriangle,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '@/src/context/StoreContext.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';

export function AdminDashboard() {
  const { settings, refreshSettings, updateLocalSettings, setActiveView } = useStore();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'verifications' | 'orders' | 'products' | 'keys' | 'coupons' | 'settings' | 'support' | 'logs'
  >('overview');

  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [activityLogsList, setActivityLogsList] = useState<any[]>([]);

  // Action states
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Deliver modal state
  const [deliveringOrderId, setDeliveringOrderId] = useState<number | null>(null);
  const [manualDeliveryText, setManualDeliveryText] = useState('');

  // Support reply state
  const [replyTicketId, setReplyTicketId] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Add Product Modal state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<number>(1);
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdRegular, setNewProdRegular] = useState('');
  const [newProdDuration, setNewProdDuration] = useState('1 Month');
  const [newProdThumbnail, setNewProdThumbnail] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Add Key Modal state
  const [showAddKey, setShowAddKey] = useState(false);
  const [keyProdId, setKeyProdId] = useState<number>(1);
  const [keyValue, setKeyValue] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({ ...settings });
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const fetchAllAdminData = async () => {
    setLoadingStats(true);
    try {
      const [sRes, oRes, pRes, cRes, supRes] = await Promise.all([
        fetch('/api/admin/stats').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/support?userId=all').then((r) => r.json()),
      ]);

      if (sRes.success) {
        setStats(sRes.stats);
        if (sRes.stats.recentLogs) {
          setActivityLogsList(sRes.stats.recentLogs);
        }
      }
      if (oRes.success) setOrdersList(oRes.orders || []);
      if (pRes.success) setProductsList(pRes.products || []);
      if (cRes.success) setCategoriesList(cRes.categories || []);
      if (supRes.success) setTicketsList(supRes.tickets || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleVerifyPayment = async (
    submissionId: number,
    action: 'verify' | 'reject',
    rejectionReason?: string
  ) => {
    setVerifyingId(submissionId);
    try {
      const res = await fetch('/api/admin/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          action,
          adminName: user?.displayName || 'MaHi Al-Moktadir',
          notes: action === 'verify' ? 'Payment confirmed by MaHi' : 'Payment rejected',
          rejectionReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Payment successfully ${action === 'verify' ? 'approved' : 'rejected'}`);
        fetchAllAdminData();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleManualDeliver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveringOrderId || !manualDeliveryText.trim()) return;

    try {
      const res = await fetch('/api/admin/orders/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: deliveringOrderId,
          deliveryInfo: manualDeliveryText.trim(),
          adminName: user?.displayName || 'MaHi Al-Moktadir',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess('Digital credentials dispatched to order!');
        setDeliveringOrderId(null);
        setManualDeliveryText('');
        fetchAllAdminData();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Delivery fulfillment error:', err);
    }
  };

  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTicketId || !replyMessage.trim()) return;

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: replyTicketId,
          senderType: 'admin',
          senderName: user?.displayName || 'MaHi (Support Admin)',
          message: replyMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyTicketId(null);
        setReplyMessage('');
        fetchAllAdminData();
      }
    } catch (err) {
      console.error('Error replying ticket:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: settingsForm,
          adminName: user?.displayName || 'MaHi Al-Moktadir',
        }),
      });
      const data = await res.json();
      if (data.success) {
        updateLocalSettings(settingsForm);
        setActionSuccess('Website & Payment Settings saved to database!');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          categoryId: newProdCategory,
          regularPrice: parseFloat(newProdRegular || newProdPrice),
          discountPrice: parseFloat(newProdPrice),
          subscriptionDuration: newProdDuration,
          thumbnail:
            newProdThumbnail ||
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
          description: newProdDesc,
          isFeatured: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddProduct(false);
        setNewProdName('');
        setNewProdPrice('');
        setNewProdRegular('');
        setNewProdDesc('');
        fetchAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Pending submissions for verification queue
  const pendingSubmissions = ordersList.flatMap((o) =>
    (o.submissions || []).filter((s: any) => s.status === 'under_verification').map((s: any) => ({
      ...s,
      order: o,
    }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#12151B] via-[#171b23] to-[#12151B] border border-[#242832] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6A00] to-[#FF4500] flex items-center justify-center text-white shadow-lg shadow-[#FF6A00]/25">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">BLAZE STORE Control Hub</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/40">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-[#9298A3]">
              Cloud SQL PostgreSQL Connected • Admin: {user?.email || 'MaHi Al-Moktadir'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllAdminData}
            className="p-2.5 rounded-xl bg-[#0B0D10] border border-[#242832] hover:border-[#FF6A00] text-[#9298A3] hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveView('store')}
            className="px-4 py-2.5 rounded-xl bg-[#242832] hover:bg-[#FF6A00] text-white text-xs font-semibold transition-colors"
          >
            Return to Store
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-xs font-semibold text-emerald-400 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#242832] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-[#FF6A00] text-white'
              : 'text-[#9298A3] hover:text-white hover:bg-[#12151B]'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-3.5 py-2 rounded-xl transition-all relative ${
            activeTab === 'verifications'
              ? 'bg-[#FF6A00] text-white'
              : 'text-[#9298A3] hover:text-white hover:bg-[#12151B]'
          }`}
        >
          Payment Verification
          {pendingSubmissions.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {pendingSubmissions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'orders'
              ? 'bg-[#FF6A00] text-white'
              : 'text-[#9298A3] hover:text-white hover:bg-[#12151B]'
          }`}
        >
          All Orders ({ordersList.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'products'
              ? 'bg-[#FF6A00] text-white'
              : 'text-[#9298A3] hover:text-white hover:bg-[#12151B]'
          }`}
        >
          Products ({productsList.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'settings'
              ? 'bg-[#FF6A00] text-white'
              : 'text-[#9298A3] hover:text-white hover:bg-[#12151B]'
          }`}
        >
          Website & Payments Config
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'support'
              ? 'bg-[#FF6A00] text-white'
              : 'text-[#9298A3] hover:text-white hover:bg-[#12151B]'
          }`}
        >
          Support Tickets ({ticketsList.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'logs'
              ? 'bg-[#FF6A00] text-white'
              : 'text-[#9298A3] hover:text-white hover:bg-[#12151B]'
          }`}
        >
          Activity Logs
        </button>
      </div>

      {/* 1. OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#12151B] border border-[#242832] space-y-1">
              <span className="text-[11px] text-[#9298A3] uppercase font-bold tracking-wider">
                Total Revenue
              </span>
              <p className="text-2xl font-black text-white">
                ৳{(stats?.totalRevenue || 0).toLocaleString('en-US')}
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold">
                Verified MFS Collections
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#12151B] border border-[#242832] space-y-1">
              <span className="text-[11px] text-[#9298A3] uppercase font-bold tracking-wider">
                Total Orders
              </span>
              <p className="text-2xl font-black text-white">
                {ordersList.length}
              </p>
              <p className="text-[11px] text-[#9298A3]">
                {stats?.deliveredOrders || 0} Delivered
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#12151B] border border-[#242832] space-y-1">
              <span className="text-[11px] text-[#9298A3] uppercase font-bold tracking-wider">
                Pending Verifications
              </span>
              <p className="text-2xl font-black text-amber-400">
                {pendingSubmissions.length}
              </p>
              <p className="text-[11px] text-amber-300">
                Awaiting TrxID Check
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#12151B] border border-[#242832] space-y-1">
              <span className="text-[11px] text-[#9298A3] uppercase font-bold tracking-wider">
                Active Catalog
              </span>
              <p className="text-2xl font-black text-white">
                {productsList.length}
              </p>
              <p className="text-[11px] text-[#9298A3]">
                {categoriesList.length} Categories
              </p>
            </div>
          </div>

          {/* Quick Verification Widget */}
          <div className="p-6 rounded-3xl bg-[#12151B] border border-[#242832] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF6A00]" />
                Recent Payment Submissions Awaiting Approval
              </h3>
              <button
                onClick={() => setActiveTab('verifications')}
                className="text-xs text-[#FF6A00] font-semibold hover:underline"
              >
                View All
              </button>
            </div>

            {pendingSubmissions.length === 0 ? (
              <p className="text-xs text-[#9298A3] py-4 text-center">
                All submitted payments are up to date! No pending transactions.
              </p>
            ) : (
              <div className="space-y-2">
                {pendingSubmissions.slice(0, 3).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl bg-[#0B0D10] border border-[#242832] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">
                          {sub.orderNumber}
                        </span>
                        <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FF6A00]/20 text-[#FF6A00]">
                          {sub.paymentMethod}
                        </span>
                      </div>
                      <p className="text-[#9298A3] mt-0.5">
                        Sender: <strong className="text-white font-mono">{sub.senderPhone}</strong> • TrxID:{' '}
                        <strong className="text-amber-400 font-mono font-bold">{sub.transactionId}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white mr-2">৳{parseFloat(sub.amount).toLocaleString('en-US')}</span>
                      <button
                        onClick={() => handleVerifyPayment(sub.id, 'verify')}
                        disabled={verifyingId === sub.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerifyPayment(sub.id, 'reject', 'TrxID does not match statement')}
                        disabled={verifyingId === sub.id}
                        className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600 text-red-300 font-semibold transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PAYMENT VERIFICATION QUEUE */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[#12151B] border border-[#242832] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">
                  Payment Verification Queue (TrxID)
                </h2>
                <p className="text-xs text-[#9298A3]">
                  Verify bKash, Nagad, and Rocket mobile transactions. Approving automatically attaches digital licenses if in stock.
                </p>
              </div>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9298A3] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-white">No pending payments</p>
                <p>All submitted payments have been verified or addressed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-[#0B0D10] border border-[#242832] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#242832] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">
                            {sub.orderNumber}
                          </span>
                          <span className="uppercase text-xs font-bold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300">
                            {sub.paymentMethod}
                          </span>
                          <span className="text-xs font-bold text-[#FF6A00]">
                            ৳{parseFloat(sub.amount).toLocaleString('en-US')}
                          </span>
                        </div>
                        <p className="text-xs text-[#9298A3] mt-1">
                          Customer: <span className="text-white font-medium">{sub.order?.customerName}</span> • WhatsApp:{' '}
                          <a
                            href={`https://wa.me/88${sub.order?.customerWhatsapp?.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#25D366] hover:underline"
                          >
                            {sub.order?.customerWhatsapp}
                          </a>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#9298A3] block">Submitted At</span>
                        <span className="text-xs text-white">
                          {new Date(sub.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#12151B] p-3 rounded-xl border border-[#242832]">
                      <div>
                        <span className="text-[10px] text-[#9298A3] uppercase font-bold block">
                          Transaction ID (TrxID)
                        </span>
                        <span className="font-mono font-black text-base text-amber-400 select-all">
                          {sub.transactionId}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#9298A3] uppercase font-bold block">
                          Sender Mobile Number
                        </span>
                        <span className="font-mono font-bold text-white select-all">
                          {sub.senderPhone}
                        </span>
                      </div>
                    </div>

                    {/* Verification Action Bar */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleVerifyPayment(sub.id, 'reject', 'Invalid TrxID / Amount Mismatch')}
                        disabled={verifyingId === sub.id}
                        className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
                      >
                        Reject Payment
                      </button>
                      <button
                        onClick={() => handleVerifyPayment(sub.id, 'verify')}
                        disabled={verifyingId === sub.id}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Release Product</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ALL ORDERS */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-3xl bg-[#12151B] border border-[#242832] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white">All Store Orders</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0D10] text-[#9298A3] uppercase text-[10px] font-bold border-b border-[#242832]">
                <tr>
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Fulfillment</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242832]">
                {ordersList.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#181d26]">
                    <td className="p-3 font-mono font-bold text-white">
                      {ord.orderNumber}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-white">{ord.customerName}</p>
                      <span className="text-[#9298A3] text-[11px]">{ord.customerWhatsapp}</span>
                    </td>
                    <td className="p-3 uppercase font-bold text-[#FF6A00]">
                      {ord.paymentMethod}
                    </td>
                    <td className="p-3 font-bold text-white">
                      ৳{parseFloat(ord.totalAmount).toLocaleString('en-US')}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ord.paymentStatus === 'payment_verified'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : ord.paymentStatus === 'under_verification'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-zinc-500/20 text-zinc-400'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ord.fulfillmentStatus === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {ord.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setDeliveringOrderId(ord.id);
                          setManualDeliveryText(ord.deliveryInfo || '');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#0B0D10] border border-[#242832] hover:border-[#FF6A00] text-white font-semibold transition-colors"
                      >
                        {ord.fulfillmentStatus === 'delivered' ? 'Edit Delivery' : 'Deliver Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="p-6 rounded-3xl bg-[#12151B] border border-[#242832] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white">Products Catalog</h2>
              <p className="text-xs text-[#9298A3]">Manage prices, subscriptions, and stock</p>
            </div>
            <button
              onClick={() => setShowAddProduct(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {productsList.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-[#0B0D10] border border-[#242832] flex gap-3 items-start"
              >
                <img
                  src={p.thumbnail}
                  alt={p.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                  <p className="text-[11px] text-[#FF6A00] font-semibold">
                    ৳{parseFloat(p.discountPrice || p.regularPrice).toLocaleString('en-US')}
                  </p>
                  <span className="text-[10px] text-[#9298A3]">{p.subscriptionDuration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. WEBSITE & PAYMENT SETTINGS (Customization) */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="p-6 rounded-3xl bg-[#12151B] border border-[#242832] space-y-6"
        >
          <div>
            <h2 className="text-base font-extrabold text-white">
              Website & Payment Customization
            </h2>
            <p className="text-xs text-[#9298A3]">
              Edit branding, payment numbers, and social links without changing code.
            </p>
          </div>

          {/* Brand Identity */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF6A00]">
              Brand Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">Website Name</label>
                <input
                  type="text"
                  value={settingsForm.site_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, site_name: e.target.value })}
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white mb-1">Creator Name</label>
                <input
                  type="text"
                  value={settingsForm.creator_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, creator_name: e.target.value })}
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Bangladesh Mobile Banking Settings */}
          <div className="space-y-3 pt-4 border-t border-[#242832]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF6A00]">
              Bangladesh Mobile Banking Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* bKash */}
              <div className="p-3.5 rounded-2xl bg-[#0B0D10] border border-pink-500/30 space-y-2">
                <p className="text-xs font-bold text-pink-400">bKash Configuration</p>
                <div>
                  <label className="block text-[11px] text-[#9298A3]">Payment Number</label>
                  <input
                    type="text"
                    value={settingsForm.bkash_number}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bkash_number: e.target.value })}
                    className="w-full bg-[#12151B] border border-[#242832] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9298A3]">Account Type</label>
                  <select
                    value={settingsForm.bkash_type}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bkash_type: e.target.value })}
                    className="w-full bg-[#12151B] border border-[#242832] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="Personal">Personal (Send Money)</option>
                    <option value="Merchant">Merchant (Payment)</option>
                  </select>
                </div>
              </div>

              {/* Nagad */}
              <div className="p-3.5 rounded-2xl bg-[#0B0D10] border border-orange-500/30 space-y-2">
                <p className="text-xs font-bold text-orange-400">Nagad Configuration</p>
                <div>
                  <label className="block text-[11px] text-[#9298A3]">Payment Number</label>
                  <input
                    type="text"
                    value={settingsForm.nagad_number}
                    onChange={(e) => setSettingsForm({ ...settingsForm, nagad_number: e.target.value })}
                    className="w-full bg-[#12151B] border border-[#242832] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9298A3]">Account Type</label>
                  <select
                    value={settingsForm.nagad_type}
                    onChange={(e) => setSettingsForm({ ...settingsForm, nagad_type: e.target.value })}
                    className="w-full bg-[#12151B] border border-[#242832] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="Personal">Personal (Send Money)</option>
                    <option value="Merchant">Merchant (Payment)</option>
                  </select>
                </div>
              </div>

              {/* Rocket */}
              <div className="p-3.5 rounded-2xl bg-[#0B0D10] border border-purple-500/30 space-y-2">
                <p className="text-xs font-bold text-purple-400">Rocket Configuration</p>
                <div>
                  <label className="block text-[11px] text-[#9298A3]">Payment Number</label>
                  <input
                    type="text"
                    value={settingsForm.rocket_number}
                    onChange={(e) => setSettingsForm({ ...settingsForm, rocket_number: e.target.value })}
                    className="w-full bg-[#12151B] border border-[#242832] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9298A3]">Account Type</label>
                  <select
                    value={settingsForm.rocket_type}
                    onChange={(e) => setSettingsForm({ ...settingsForm, rocket_type: e.target.value })}
                    className="w-full bg-[#12151B] border border-[#242832] rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="Personal">Personal (Send Money)</option>
                    <option value="Merchant">Merchant (Payment)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links & Support */}
          <div className="space-y-3 pt-4 border-t border-[#242832]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF6A00]">
              Social Media & Contact Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">WhatsApp URL</label>
                <input
                  type="text"
                  value={settingsForm.whatsapp_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_url: e.target.value })}
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={settingsForm.facebook_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={settingsForm.instagram_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={settingsForm.github_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, github_url: e.target.value })}
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={settingsSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#FF6A00]/25 transition-all disabled:opacity-50"
            >
              {settingsSaving ? 'Saving Changes...' : 'Save All Settings'}
            </button>
          </div>
        </form>
      )}

      {/* 6. SUPPORT TICKETS */}
      {activeTab === 'support' && (
        <div className="p-6 rounded-3xl bg-[#12151B] border border-[#242832] space-y-4">
          <h2 className="text-base font-extrabold text-white">Customer Support Inquiries</h2>
          {ticketsList.length === 0 ? (
            <p className="text-xs text-[#9298A3]">No active tickets found.</p>
          ) : (
            <div className="space-y-3">
              {ticketsList.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-[#0B0D10] border border-[#242832] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs text-[#FF6A00] font-bold">{t.ticketNumber}</span>
                      <h4 className="font-bold text-white text-sm">{t.subject}</h4>
                      <p className="text-[#9298A3] text-[11px]">
                        From: {t.customerName} ({t.customerEmail})
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold uppercase text-[10px]">
                      {t.status}
                    </span>
                  </div>
                  <p className="p-3 rounded-xl bg-[#12151B] text-[#9298A3]">{t.message}</p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setReplyTicketId(t.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#242832] hover:bg-[#FF6A00] text-white text-xs font-semibold transition-colors"
                    >
                      Reply to Customer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. ACTIVITY LOGS */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-3xl bg-[#12151B] border border-[#242832] space-y-4">
          <h2 className="text-base font-extrabold text-white">Admin Activity & Audit Logs</h2>
          <div className="space-y-2 text-xs">
            {activityLogsList.map((log: any) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#0B0D10] border border-[#242832] flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-[#FF6A00] mr-2">[{log.action}]</span>
                  <span className="text-white">{log.details}</span>
                  <span className="text-[#9298A3] text-[11px] block mt-0.5">By {log.adminName}</span>
                </div>
                <span className="text-[#9298A3] text-[11px]">
                  {new Date(log.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Delivery Modal */}
      {deliveringOrderId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#12151B] border border-[#242832] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Deliver Digital Product</h3>
              <button
                onClick={() => setDeliveringOrderId(null)}
                className="text-[#9298A3] hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleManualDeliver} className="space-y-3">
              <p className="text-xs text-[#9298A3]">
                Enter the license key, login email:password, or activation link. The customer will see this instantly in their dashboard and tracking view.
              </p>
              <textarea
                required
                rows={5}
                value={manualDeliveryText}
                onChange={(e) => setManualDeliveryText(e.target.value)}
                placeholder="e.g.&#10;Netflix Email: user@blazestore.com&#10;Password: ********&#10;Profile PIN: 8291&#10;Warranty: 30 days replacement"
                className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl p-3 text-xs text-emerald-300 font-mono focus:outline-none focus:border-[#FF6A00]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeliveringOrderId(null)}
                  className="px-4 py-2 rounded-xl bg-[#242832] text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white text-xs font-bold shadow-md"
                >
                  Fulfill & Deliver Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reply Ticket Modal */}
      {replyTicketId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12151B] border border-[#242832] rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white">Reply to Customer Ticket</h3>
            <form onSubmit={handleReplyTicket} className="space-y-3">
              <textarea
                required
                rows={4}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your response to the customer..."
                className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyTicketId(null)}
                  className="px-3 py-1.5 rounded-xl bg-[#242832] text-xs text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#FF6A00] text-xs font-bold text-white"
                >
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#12151B] border border-[#242832] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Add New Product</h3>
              <button
                onClick={() => setShowAddProduct(false)}
                className="text-[#9298A3] hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-white font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Disney+ Hotstar VIP"
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white font-semibold mb-1">Discount Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="250"
                    className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-1">Regular Price (৳)</label>
                  <input
                    type="number"
                    value={newProdRegular}
                    onChange={(e) => setNewProdRegular(e.target.value)}
                    placeholder="350"
                    className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={newProdDuration}
                    onChange={(e) => setNewProdDuration(e.target.value)}
                    placeholder="1 Month"
                    className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(parseInt(e.target.value))}
                    className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3 py-2 text-white"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-white font-semibold mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  value={newProdThumbnail}
                  onChange={(e) => setNewProdThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Product features, delivery time, and instructions..."
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2 rounded-xl bg-[#242832] text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF6A00] font-bold text-white"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
