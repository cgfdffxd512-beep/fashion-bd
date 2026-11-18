import {
  Check,
  Eye,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  deleteCustomerAdmin,
  deleteOrderAdmin,
  saveCustomerAdmin,
  updateOrderStatusAdmin,
} from '../../lib/storeService';
import type { CustomerRecord, Order, OrderStatus } from '../../types/store';

interface OrdersCustomersManagerProps {
  mode: 'orders' | 'customers';
  orders: Order[];
  customers: CustomerRecord[];
  currency: string;
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'অপেক্ষমাণ (Pending)' },
  { value: 'confirmed', label: 'গৃহীত (Confirmed)' },
  { value: 'processing', label: 'প্রস্তুত হচ্ছে (Processing)' },
  { value: 'shipped', label: 'ডেলিভারিতে (Shipped)' },
  { value: 'delivered', label: 'সম্পন্ন (Delivered)' },
  { value: 'cancelled', label: 'বাতিল (Cancelled)' },
];

export function OrdersCustomersManager({
  mode,
  orders,
  customers,
  currency,
}: OrdersCustomersManagerProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Customer CRM modal
  const [custModalOpen, setCustModalOpen] = useState(false);
  const [editingCustId, setEditingCustId] = useState<string | undefined>();
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes, setCustNotes] = useState('');

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q)
      );
    });
  }, [orders, statusFilter, search]);

  // Aggregate unique customers from orders + saved CRM customer records
  const aggregatedCustomers = useMemo(() => {
    const map = new Map<
      string,
      {
        phone: string;
        name: string;
        email: string;
        address: string;
        orderCount: number;
        totalSpent: number;
        crmId?: string;
        notes?: string;
      }
    >();

    for (const o of orders) {
      const key = o.customerPhone.trim();
      const existing = map.get(key);
      if (existing) {
        existing.orderCount += 1;
        if (o.status !== 'cancelled') {
          existing.totalSpent += o.totalAmount;
        }
      } else {
        map.set(key, {
          phone: key,
          name: o.customerName,
          email: o.customerEmail || '',
          address: o.shippingAddress,
          orderCount: 1,
          totalSpent: o.status !== 'cancelled' ? o.totalAmount : 0,
        });
      }
    }

    for (const c of customers) {
      const key = c.phone.trim();
      const existing = map.get(key);
      if (existing) {
        existing.crmId = c.id;
        existing.notes = c.notes;
        if (c.email) existing.email = c.email;
        if (c.address) existing.address = c.address;
      } else {
        map.set(key, {
          phone: key,
          name: c.name,
          email: c.email,
          address: c.address,
          orderCount: 0,
          totalSpent: 0,
          crmId: c.id,
          notes: c.notes,
        });
      }
    }

    const q = search.trim().toLowerCase();
    return Array.from(map.values()).filter((c) => {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    });
  }, [orders, customers, search]);

  const handleStatusChange = async (
    orderId: string,
    status: OrderStatus,
    note?: string
  ) => {
    setSaving(true);
    try {
      await updateOrderStatusAdmin(orderId, status, note);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status,
          adminNote: note !== undefined ? note : selectedOrder.adminNote,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) return;
    setSaving(true);
    try {
      await saveCustomerAdmin(
        {
          name: custName.trim(),
          phone: custPhone.trim(),
          email: custEmail.trim(),
          address: custAddress.trim(),
          notes: custNotes.trim(),
        },
        editingCustId
      );
      setCustModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (mode === 'customers') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">কাস্টমার তালিকা</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              অর্ডারকারী ও সংরক্ষিত সকল ক্রেতার তথ্য, মোট ক্রয় ও ঠিকানা দেখুন
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingCustId(undefined);
              setCustName('');
              setCustPhone('');
              setCustEmail('');
              setCustAddress('');
              setCustNotes('');
              setCustModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 whitespace-nowrap shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            কাস্টমার যোগ করুন
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, ফোন বা ঠিকানা দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-medium">ক্রেতার নাম</th>
                <th className="py-3 px-4 font-medium">মোবাইল</th>
                <th className="py-3 px-4 font-medium">ঠিকানা</th>
                <th className="py-3 px-4 font-medium text-right">মোট অর্ডার</th>
                <th className="py-3 px-4 font-medium text-right">মোট ক্রয়</th>
                <th className="py-3 px-4 font-medium text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {aggregatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    এখনো কোনো কাস্টমারের তথ্য নেই।
                  </td>
                </tr>
              ) : (
                aggregatedCustomers.map((c) => (
                  <tr
                    key={c.phone}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{c.name}</div>
                      {c.email && (
                        <div className="text-xs text-slate-500">{c.email}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono-num text-xs">
                      {c.phone}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {c.address || '—'}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      {c.orderCount}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">
                      {currency}
                      {c.totalSpent.toLocaleString('en-US')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCustId(c.crmId);
                            setCustName(c.name);
                            setCustPhone(c.phone);
                            setCustEmail(c.email);
                            setCustAddress(c.address);
                            setCustNotes(c.notes || '');
                            setCustModalOpen(true);
                          }}
                          className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:underline"
                        >
                          নোট/সম্পাদনা
                        </button>
                        {c.crmId && (
                          <button
                            type="button"
                            onClick={() => deleteCustomerAdmin(c.crmId!)}
                            className="p-1 text-rose-600 dark:text-rose-400"
                            title="মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {custModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-semibold">কাস্টমার তথ্য</h3>
                <button
                  type="button"
                  onClick={() => setCustModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1">নাম *</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">ইমেইল</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">ঠিকানা</label>
                  <input
                    type="text"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    ক্রেতা সম্পর্কে নোট
                  </label>
                  <textarea
                    rows={2}
                    value={custNotes}
                    onChange={(e) => setCustNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCustModalOpen(false)}
                    className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 text-sm font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">অর্ডার ব্যবস্থাপনা</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          অর্ডার গ্রহণ, বাতিল, পেমেন্ট যাচাই এবং ডেলিভারি স্ট্যাটাস পরিবর্তন করুন
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="অর্ডার নম্বর, ক্রেতার নাম বা ফোন..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'all' | OrderStatus)
          }
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="all">সব স্ট্যাটাস ({orders.length})</option>
          {STATUS_OPTIONS.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-3 px-4 font-medium">অর্ডার নং</th>
              <th className="py-3 px-4 font-medium">ক্রেতা ও ফোন</th>
              <th className="py-3 px-4 font-medium">পেমেন্ট</th>
              <th className="py-3 px-4 font-medium text-right">মোট টাকা</th>
              <th className="py-3 px-4 font-medium">স্ট্যাটাস</th>
              <th className="py-3 px-4 font-medium text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  এই ফিল্টারে কোনো অর্ডার নেই।
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr
                  key={ord.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-3 px-4 font-mono-num font-semibold text-xs">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{ord.customerName}</div>
                    <div className="text-xs text-slate-500 font-mono-num">
                      {ord.customerPhone}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <div className="uppercase font-medium">
                      {ord.paymentMethod}
                    </div>
                    {ord.paymentTrxId && (
                      <div className="text-slate-500 font-mono-num">
                        Trx: {ord.paymentTrxId}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-semibold">
                    {currency}
                    {ord.totalAmount.toLocaleString('en-US')}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      disabled={saving}
                      value={ord.status}
                      onChange={(e) =>
                        handleStatusChange(ord.id, e.target.value as OrderStatus)
                      }
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {ord.status === 'pending' && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleStatusChange(ord.id, 'confirmed')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                          title="অর্ডার গ্রহণ করুন"
                        >
                          <Check className="w-3.5 h-3.5" />
                          গ্রহণ
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(ord);
                          setAdminNoteInput(ord.adminNote || '');
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="বিস্তারিত"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => deleteOrderAdmin(ord.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                        title="ডিলিট"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold">
                অর্ডার বিস্তারিত —{' '}
                <span className="font-mono-num">{selectedOrder.orderNumber}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div>
                  <div className="text-xs text-slate-500">ক্রেতার নাম</div>
                  <div className="font-semibold">{selectedOrder.customerName}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">মোবাইল</div>
                  <div className="font-mono-num font-semibold">
                    {selectedOrder.customerPhone}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-slate-500">ডেলিভারি ঠিকানা</div>
                  <div>{selectedOrder.shippingAddress}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">পেমেন্ট মাধ্যম</div>
                  <div className="uppercase font-medium">
                    {selectedOrder.paymentMethod}
                    {selectedOrder.paymentSenderNumber &&
                      ` (${selectedOrder.paymentSenderNumber})`}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">TrxID</div>
                  <div className="font-mono-num">
                    {selectedOrder.paymentTrxId || '—'}
                  </div>
                </div>
                {selectedOrder.customerNote && (
                  <div className="sm:col-span-2">
                    <div className="text-xs text-slate-500">ক্রেতার নোট</div>
                    <div>{selectedOrder.customerNote}</div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">অর্ডারকৃত পণ্যসমূহ</h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-slate-500">
                          {[item.size, item.color].filter(Boolean).join(' · ') ||
                            'স্ট্যান্ডার্ড'}{' '}
                          × {item.quantity}
                        </div>
                      </div>
                      <div className="tabular-nums font-semibold">
                        {currency}
                        {(item.price * item.quantity).toLocaleString('en-US')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-800 pt-3">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>পণ্যের মূল্য</span>
                  <span className="tabular-nums">
                    {currency}
                    {selectedOrder.subtotal.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="tabular-nums">
                    {currency}
                    {selectedOrder.deliveryCharge.toLocaleString('en-US')}
                  </span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>ডিসকাউন্ট</span>
                    <span className="tabular-nums">
                      -{currency}
                      {selectedOrder.discountAmount.toLocaleString('en-US')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>সর্বমোট</span>
                  <span className="tabular-nums">
                    {currency}
                    {selectedOrder.totalAmount.toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-medium">
                  অ্যাডমিন নোট (ঐচ্ছিক)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="যেমন: কুরিয়ার বুকিং আইডি #8821"
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      handleStatusChange(
                        selectedOrder.id,
                        selectedOrder.status,
                        adminNoteInput
                      )
                    }
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 whitespace-nowrap"
                  >
                    নোট সেভ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
