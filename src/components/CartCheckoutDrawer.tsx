import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { placeCustomerOrder } from '../lib/storeService';
import type {
  CartItem,
  DeliveryZone,
  Order,
  PaymentMethod,
  SiteSettings,
} from '../types/store';
import { SmartImage } from './SmartImage';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  settings: SiteSettings;
  customerUid: string;
  customerDefaultName?: string;
  customerDefaultEmail?: string;
  onUpdateQty: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearCart: () => void;
}

export function CartCheckoutDrawer({
  isOpen,
  onClose,
  items,
  settings,
  customerUid,
  customerDefaultName = '',
  customerDefaultEmail = '',
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartCheckoutDrawerProps) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'receipt'>('cart');
  const [customerName, setCustomerName] = useState(customerDefaultName);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(customerDefaultEmail);
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryZone, setDeliveryZone] =
    useState<DeliveryZone>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    settings.codEnabled ? 'cod' : 'bkash'
  );
  const [paymentSenderNumber, setPaymentSenderNumber] = useState('');
  const [paymentTrxId, setPaymentTrxId] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const currency = settings.currencySymbol || '৳';
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const isFreeDelivery =
    settings.freeDeliveryMinAmount > 0 &&
    subtotal >= settings.freeDeliveryMinAmount;
  const baseDelivery =
    deliveryZone === 'inside_dhaka'
      ? settings.deliveryInsideDhaka
      : settings.deliveryOutsideDhaka;
  const deliveryCharge = items.length === 0 || isFreeDelivery ? 0 : baseDelivery;
  const discountAmount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const totalAmount = Math.max(0, subtotal + deliveryCharge - discountAmount);

  const handleApplyPromo = () => {
    setPromoError('');
    const configured = settings.offerDiscountCode.trim().toUpperCase();
    const entered = promoCodeInput.trim().toUpperCase();
    if (!entered) return;
    if (configured && entered === configured) {
      setPromoApplied(true);
    } else {
      setPromoApplied(false);
      setPromoError('প্রোমো কোডটি সঠিক নয় বা মেয়াদ শেষ হয়েছে।');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setSubmitError('অনুগ্রহ করে নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা লিখুন।');
      return;
    }
    if (customerPhone.trim().length < 6) {
      setSubmitError('সঠিক মোবাইল নম্বর প্রদান করুন।');
      return;
    }
    if (
      paymentMethod !== 'cod' &&
      (!paymentSenderNumber.trim() || !paymentTrxId.trim())
    ) {
      setSubmitError(
        'বিকাশ/নগদ/রকেট পেমেন্টের ক্ষেত্রে প্রেরিত নম্বর ও Transaction ID দিন।'
      );
      return;
    }

    setSubmitting(true);
    try {
      const created = await placeCustomerOrder({
        customerUid,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        shippingAddress: shippingAddress.trim(),
        deliveryZone,
        paymentMethod,
        paymentSenderNumber: paymentSenderNumber.trim(),
        paymentTrxId: paymentTrxId.trim(),
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          sku: i.sku,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          imageUrl: i.imageUrl,
        })),
        subtotal,
        deliveryCharge,
        discountAmount,
        totalAmount,
        customerNote: customerNote.trim(),
      });
      setCompletedOrder(created);
      onClearCart();
      setStep('receipt');
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'অর্ডার জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDrawer = () => {
    if (step === 'receipt') {
      setStep('cart');
      setCompletedOrder(null);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-[2px]">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-full flex flex-col border-l border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5" style={{ color: settings.primaryColor }} />
            <h2 className="text-base font-semibold">
              {step === 'cart' && `শপিং ব্যাগ (${items.length})`}
              {step === 'checkout' && 'অর্ডার ও ডেলিভারি তথ্য'}
              {step === 'receipt' && 'অর্ডার কনফার্মেশন'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCloseDrawer}
            aria-label="বন্ধ করুন"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    আপনার শপিং ব্যাগে এখনো কোনো পণ্য নেই।
                  </p>
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    পণ্য দেখুন
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.key}
                      className="flex gap-4 pb-4 border-b border-slate-100 dark:border-slate-800"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <SmartImage
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold truncate">
                            {item.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.key)}
                            aria-label="মুছুন"
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {[item.size, item.color].filter(Boolean).join(' · ') ||
                            'স্ট্যান্ডার্ড'}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="inline-flex items-center border border-slate-200 dark:border-slate-700 rounded-lg">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.key, -1)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-medium tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.key, 1)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold tabular-nums">
                            {currency}
                            {(item.price * item.quantity).toLocaleString('en-US')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-5">
              {submitError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  {submitError}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  ১. ক্রেতার তথ্য
                </h3>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    আপনার পূর্ণ নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="যেমন: রাফি আহমেদ"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      মোবাইল নম্বর *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      ইমেইল (ঐচ্ছিক)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    ডেলিভারি ঠিকানা *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="বাড়ি নং, রোড, এলাকা ও জেলার নাম লিখুন"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold">২. ডেলিভারি এলাকা</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryZone('inside_dhaka')}
                    className={`p-3 text-left rounded-lg border text-xs transition-colors ${
                      deliveryZone === 'inside_dhaka'
                        ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800 font-semibold'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>ঢাকার ভেতরে</div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                      {currency}
                      {settings.deliveryInsideDhaka}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryZone('outside_dhaka')}
                    className={`p-3 text-left rounded-lg border text-xs transition-colors ${
                      deliveryZone === 'outside_dhaka'
                        ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800 font-semibold'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>ঢাকার বাইরে</div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                      {currency}
                      {settings.deliveryOutsideDhaka}
                    </div>
                  </button>
                </div>
              </div>

              {settings.offerEnabled && settings.offerDiscountCode && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    প্রোমো কোড ({settings.offerDiscountCode} ব্যবহারে ১০% ছাড়)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder="কোড লিখুন"
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 whitespace-nowrap"
                    >
                      প্রয়োগ করুন
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      প্রোমো কোড সফলভাবে যুক্ত হয়েছে।
                    </p>
                  )}
                  {promoError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">
                      {promoError}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold">৩. পেমেন্ট মাধ্যম</h3>
                <div className="grid grid-cols-2 gap-2">
                  {settings.codEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-left ${
                        paymentMethod === 'cod'
                          ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      ক্যাশ অন ডেলিভারি
                    </button>
                  )}
                  {settings.bkashNumber && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bkash')}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-left ${
                        paymentMethod === 'bkash'
                          ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      বিকাশ (bKash)
                    </button>
                  )}
                  {settings.nagadNumber && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('nagad')}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-left ${
                        paymentMethod === 'nagad'
                          ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      নগদ (Nagad)
                    </button>
                  )}
                  {settings.rocketNumber && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('rocket')}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-left ${
                        paymentMethod === 'rocket'
                          ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      রকেট (Rocket)
                    </button>
                  )}
                </div>

                {paymentMethod !== 'cod' && (
                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-3">
                    <div className="text-xs space-y-1">
                      <p className="font-semibold">
                        {paymentMethod === 'bkash' &&
                          `বিকাশ নম্বর: ${settings.bkashNumber}`}
                        {paymentMethod === 'nagad' &&
                          `নগদ নম্বর: ${settings.nagadNumber}`}
                        {paymentMethod === 'rocket' &&
                          `রকেট নম্বর: ${settings.rocketNumber}`}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">
                        {settings.paymentInstructions}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={paymentSenderNumber}
                        onChange={(e) => setPaymentSenderNumber(e.target.value)}
                        placeholder="আপনার প্রেরিত নম্বর"
                        className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                      />
                      <input
                        type="text"
                        value={paymentTrxId}
                        onChange={(e) => setPaymentTrxId(e.target.value)}
                        placeholder="Transaction ID (TrxID)"
                        className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="যেমন: বিকাল ৫টার পর ডেলিভারি দিলে ভালো হয়"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
              </div>
            </form>
          )}

          {step === 'receipt' && completedOrder && (
            <div className="space-y-5 py-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-emerald-950 dark:text-emerald-100">
                    আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                    অর্ডার নম্বর:{' '}
                    <span className="font-mono-num font-semibold">
                      {completedOrder.orderNumber}
                    </span>{' '}
                    · স্ট্যাটাস: অপেক্ষমাণ (Pending)
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">ক্রেতা</span>
                  <span className="font-medium">{completedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ফোন</span>
                  <span className="font-mono-num">{completedOrder.customerPhone}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500 shrink-0">ঠিকানা</span>
                  <span className="text-right">{completedOrder.shippingAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">পেমেন্ট</span>
                  <span className="uppercase font-medium">
                    {completedOrder.paymentMethod}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  {completedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="tabular-nums font-medium">
                        {currency}
                        {(item.price * item.quantity).toLocaleString('en-US')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between font-semibold text-base">
                  <span>সর্বমোট</span>
                  <span className="tabular-nums">
                    {currency}
                    {completedOrder.totalAmount.toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDrawer}
                className="w-full py-2.5 text-sm font-medium text-white rounded-lg"
                style={{ backgroundColor: settings.primaryColor }}
              >
                কেনাকাটা চালিয়ে যান
              </button>
            </div>
          )}
        </div>

        {/* Footer Totals */}
        {items.length > 0 && step !== 'receipt' && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>পণ্যের মূল্য</span>
                <span className="tabular-nums">
                  {currency}
                  {subtotal.toLocaleString('en-US')}
                </span>
              </div>
              {step === 'checkout' && (
                <>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>
                      ডেলিভারি চার্জ
                      {isFreeDelivery && ' (ফ্রি ডেলিভারি প্রযোজ্য)'}
                    </span>
                    <span className="tabular-nums">
                      {currency}
                      {deliveryCharge.toLocaleString('en-US')}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>প্রোমো ডিসকাউন্ট</span>
                      <span className="tabular-nums">
                        -{currency}
                        {discountAmount.toLocaleString('en-US')}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>সর্বমোট</span>
                <span className="tabular-nums">
                  {currency}
                  {(step === 'cart' ? subtotal : totalAmount).toLocaleString('en-US')}
                </span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3 text-sm font-semibold text-white rounded-lg hover:opacity-95 transition-opacity"
                style={{ backgroundColor: settings.primaryColor }}
              >
                অর্ডার সম্পন্ন করুন
              </button>
            ) : (
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  পিছনে
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="flex-1 py-3 text-sm font-semibold text-white rounded-lg hover:opacity-95 transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  {submitting ? 'অর্ডার পাঠানো হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
