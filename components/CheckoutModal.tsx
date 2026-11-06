'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/src/context/CartContext.tsx';
import { useStore } from '@/src/context/StoreContext.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { normalizeBdPhone, validateTransactionId } from '@/lib/ecommerce-logic.ts';

export function CheckoutModal() {
  const { items, totals, clearCart } = useCart();
  const {
    settings,
    checkoutModalOpen,
    setCheckoutModalOpen,
    setTrackingModalOpen,
    setActiveOrderToTrack,
  } = useStore();
  const { user } = useAuth();

  // Steps: 1: Customer Details, 2: Payment Method & Mobile Banking Instructions, 3: Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Customer Form state
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment Selection state
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'cod'>('bkash');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');

  // Operational state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  if (!checkoutModalOpen) return null;

  // Active payment details based on selection
  const getPaymentDetails = () => {
    switch (paymentMethod) {
      case 'bkash':
        return {
          name: 'bKash',
          number: settings.bkash_number || '01842728840',
          type: settings.bkash_type || 'Personal',
          action: 'Send Money',
          color: 'from-pink-600 to-pink-700',
          textColor: 'text-pink-400',
          bgColor: 'bg-pink-500/10 border-pink-500/30',
        };
      case 'nagad':
        return {
          name: 'Nagad',
          number: settings.nagad_number || '01842728840',
          type: settings.nagad_type || 'Personal',
          action: 'Send Money',
          color: 'from-orange-600 to-orange-700',
          textColor: 'text-orange-400',
          bgColor: 'bg-orange-500/10 border-orange-500/30',
        };
      case 'rocket':
        return {
          name: 'Rocket (DBBL)',
          number: settings.rocket_number || '01842728840',
          type: settings.rocket_type || 'Personal',
          action: 'Send Money',
          color: 'from-purple-600 to-purple-700',
          textColor: 'text-purple-400',
          bgColor: 'bg-purple-500/10 border-purple-500/30',
        };
      default:
        return {
          name: 'Cash on Delivery',
          number: 'N/A',
          type: 'Manual',
          action: 'Cash',
          color: 'from-zinc-600 to-zinc-700',
          textColor: 'text-zinc-400',
          bgColor: 'bg-zinc-500/10 border-zinc-500/30',
        };
    }
  };

  const copyPaymentNumber = () => {
    const details = getPaymentDetails();
    navigator.clipboard.writeText(details.number);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !customerEmail.trim() || !customerWhatsapp.trim()) {
      setError('Please fill in your name, email, and WhatsApp number.');
      return;
    }

    const phoneCheck = normalizeBdPhone(customerWhatsapp);
    if (!phoneCheck.isValid) {
      setError(phoneCheck.error || 'Invalid WhatsApp number.');
      return;
    }

    // Default sender phone to whatsapp number for convenience
    if (!senderPhone) {
      setSenderPhone(phoneCheck.normalized);
    }

    setStep(2);
  };

  const handleSubmitOrderAndPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate sender phone
      const phoneCheck = normalizeBdPhone(senderPhone);
      if (!phoneCheck.isValid) {
        throw new Error(phoneCheck.error || 'Please provide a valid 11-digit sender phone number.');
      }

      // Validate TrxID
      const trxCheck = validateTransactionId(transactionId, paymentMethod as any);
      if (!trxCheck.isValid) {
        throw new Error(trxCheck.error || 'Please enter a valid Transaction ID.');
      }

      // 1. Create the order in database
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest',
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerWhatsapp: customerWhatsapp.trim(),
          customerPhone: senderPhone.trim(),
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          totalAmount: totals.total,
          paymentMethod,
          orderNotes,
          items: items.map((i) => ({
            productId: i.productId,
            variationId: i.variationId,
            productName: i.productName,
            variationName: i.variationName,
            price: i.price,
            quantity: i.quantity,
            total: i.price * i.quantity,
          })),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success || !orderData.order) {
        throw new Error(orderData.error || 'Failed to initialize order.');
      }

      const order = orderData.order;

      // 2. Submit payment submission record for admin verification
      const payRes = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          paymentMethod,
          senderPhone: phoneCheck.normalized,
          transactionId: trxCheck.formattedTrxId,
          amount: totals.total,
          screenshotUrl: screenshotUrl.trim() || undefined,
        }),
      });

      const payData = await payRes.json();
      if (!payData.success) {
        throw new Error(payData.error || 'Failed to submit payment details.');
      }

      setCreatedOrder(order);
      clearCart();
      setStep(3);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'An unexpected error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackCreatedOrder = () => {
    if (createdOrder) {
      setActiveOrderToTrack(createdOrder.orderNumber);
      setCheckoutModalOpen(false);
      setTrackingModalOpen(true);
    }
  };

  const currentPay = getPaymentDetails();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#12151B] border border-[#242832] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#242832] flex items-center justify-between bg-[#0B0D10]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6A00]/20 flex items-center justify-center text-[#FF6A00]">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {step === 1 && 'Step 1: Customer Delivery Details'}
                {step === 2 && 'Step 2: Mobile Banking Payment'}
                {step === 3 && 'Order Confirmed!'}
              </h3>
              <p className="text-[11px] text-[#9298A3]">
                Total Payable: <span className="text-[#FF6A00] font-bold">{totals.formattedTotal}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setCheckoutModalOpen(false)}
            className="p-1.5 rounded-lg text-[#9298A3] hover:text-white hover:bg-[#242832] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CUSTOMER DETAILS */}
        {step === 1 && (
          <form onSubmit={handleNextToPayment} className="p-5 sm:p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Full Name <span className="text-[#FF6A00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#9298A3] focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Email Address (For Product & Invoice Delivery) <span className="text-[#FF6A00]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. tanvir@gmail.com"
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#9298A3] focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  WhatsApp Number (Primary Digital Delivery Channel) <span className="text-[#FF6A00]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  placeholder="01842728840 or +8801..."
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#9298A3] focus:outline-none focus:border-[#FF6A00]"
                />
                <p className="text-[11px] text-[#9298A3] mt-1">
                  We will send your login credentials, family invite, or license key to this WhatsApp number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Order Notes / Custom Requirements (Optional)
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g., My Spotify email is ..., please upgrade existing account."
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#9298A3] focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            </div>

            {/* Cart Preview summary */}
            <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#242832] space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold text-white">
                <span>Items ({items.length})</span>
                <span>{totals.formattedSubtotal}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>-{totals.formattedDiscount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-white pt-1 border-t border-[#242832]">
                <span>Total Amount to Pay</span>
                <span className="text-[#FF6A00]">{totals.formattedTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#FF6A00]/25 hover:shadow-[#FF6A00]/40 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Mobile Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: BANGLADESH MOBILE BANKING & TrxID SUBMISSION */}
        {step === 2 && (
          <form onSubmit={handleSubmitOrderAndPayment} className="p-5 sm:p-6 space-y-4">
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-white mb-2">
                Select Mobile Banking Provider:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'bkash'
                      ? 'bg-pink-500/20 border-pink-500 text-pink-300 shadow-md shadow-pink-500/20'
                      : 'bg-[#0B0D10] border-[#242832] text-[#9298A3] hover:text-white'
                  }`}
                >
                  <p className="font-extrabold text-sm tracking-tight text-white">bKash</p>
                  <span className="text-[10px] text-pink-400 font-semibold block mt-0.5">
                    {settings.bkash_type || 'Personal'}
                  </span>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'nagad'
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-md shadow-orange-500/20'
                      : 'bg-[#0B0D10] border-[#242832] text-[#9298A3] hover:text-white'
                  }`}
                >
                  <p className="font-extrabold text-sm tracking-tight text-white">Nagad</p>
                  <span className="text-[10px] text-orange-400 font-semibold block mt-0.5">
                    {settings.nagad_type || 'Personal'}
                  </span>
                </button>

                {/* Rocket */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('rocket')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'rocket'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/20'
                      : 'bg-[#0B0D10] border-[#242832] text-[#9298A3] hover:text-white'
                  }`}
                >
                  <p className="font-extrabold text-sm tracking-tight text-white">Rocket</p>
                  <span className="text-[10px] text-purple-400 font-semibold block mt-0.5">
                    {settings.rocket_type || 'Personal'}
                  </span>
                </button>
              </div>

              {settings.cod_enabled === 'true' && (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`text-xs underline ${
                      paymentMethod === 'cod' ? 'text-[#FF6A00]' : 'text-[#9298A3]'
                    }`}
                  >
                    Select Cash on Delivery
                  </button>
                </div>
              )}
            </div>

            {/* Provider Instructions Box */}
            <div className={`p-4 rounded-2xl border ${currentPay.bgColor} space-y-3`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#9298A3] tracking-wider">
                    {currentPay.name} Payment Number ({currentPay.type})
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg font-mono font-black text-white">
                      {currentPay.number}
                    </span>
                    <button
                      type="button"
                      onClick={copyPaymentNumber}
                      className="px-2 py-1 rounded-lg bg-[#242832] hover:bg-[#FF6A00] text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      title="Copy Number"
                    >
                      {copiedNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedNumber ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#9298A3] tracking-wider">
                    Exact Amount
                  </span>
                  <p className="text-base font-black text-[#FF6A00]">
                    {totals.formattedTotal}
                  </p>
                </div>
              </div>

              {/* Step by Step instructions */}
              <div className="text-xs text-[#9298A3] space-y-1 pt-2 border-t border-[#242832]/60">
                <p className="font-bold text-white text-[11px] uppercase tracking-wide">
                  Payment Instructions:
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                  <li>Open your {currentPay.name} mobile app.</li>
                  <li>Select <strong className="text-white">{currentPay.action}</strong> option.</li>
                  <li>Enter displayed number: <strong className="text-white font-mono">{currentPay.number}</strong></li>
                  <li>Enter exact payable amount: <strong className="text-[#FF6A00]">{totals.formattedTotal}</strong></li>
                  <li>Complete transaction and copy your <strong className="text-white">Transaction ID (TrxID)</strong>.</li>
                </ol>
              </div>
            </div>

            {/* Submission Form */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Your Sender Mobile Number <span className="text-[#FF6A00]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#9298A3] focus:outline-none focus:border-[#FF6A00] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Transaction ID (TrxID) <span className="text-[#FF6A00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                  placeholder="e.g. BK89XTY12Z or 9H77AB..."
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#9298A3] focus:outline-none focus:border-[#FF6A00] font-mono uppercase font-bold"
                />
                <p className="text-[10px] text-[#9298A3] mt-1">
                  Copy from your SMS or statement. Submitting TrxID initiates instant verification.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Payment Screenshot / Note (Optional)
                </label>
                <input
                  type="text"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  placeholder="Image URL or reference note"
                  className="w-full bg-[#0B0D10] border border-[#242832] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#9298A3] focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-[#0B0D10] border border-[#242832] text-xs font-semibold text-white hover:bg-[#181d26] transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#FF6A00]/25 hover:shadow-[#FF6A00]/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Submitting Verification...</span>
                ) : (
                  <>
                    <span>Submit Payment</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ORDER & PAYMENT CONFIRMATION (EXACT TEXT SPECIFICATION) */}
        {step === 3 && createdOrder && (
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10 animate-bounce">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">
                Thank you for your order!
              </h3>
              <div className="p-4 rounded-2xl bg-[#0B0D10] border border-[#242832] text-xs text-[#9298A3] space-y-2 text-left">
                <p className="text-white font-medium text-center">
                  Your payment information has been submitted successfully.
                </p>
                <p className="text-center">
                  Please wait while our team verifies your payment.
                </p>
                <p className="text-emerald-400 font-semibold text-center">
                  Your digital product will be delivered through WhatsApp or Email.
                </p>
                <p className="text-center text-[#9298A3]">
                  Please keep checking your WhatsApp and Email.
                </p>
              </div>
            </div>

            {/* Order Identifiers Box */}
            <div className="p-3.5 rounded-2xl bg-[#12151B] border border-[#242832] flex items-center justify-between text-left">
              <div>
                <span className="text-[10px] text-[#9298A3] font-bold uppercase tracking-wider">
                  Order Number
                </span>
                <p className="text-sm font-mono font-extrabold text-white">
                  {createdOrder.orderNumber}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#9298A3] font-bold uppercase tracking-wider">
                  Status
                </span>
                <span className="block text-xs font-bold text-amber-400">
                  Under Verification
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleTrackCreatedOrder}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4500] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#FF6A00]/25 transition-all"
              >
                Track This Order
              </button>

              <a
                href={`${settings.whatsapp_url || 'https://wa.me/8801842728840'}?text=${encodeURIComponent(
                  `Assalamu Alaikum Blaze Store! I placed order ${createdOrder.orderNumber} (TrxID: ${transactionId}). Please verify and deliver.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 hover:border-[#25D366] text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Notify via WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
