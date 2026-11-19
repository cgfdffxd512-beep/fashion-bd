import type { User } from 'firebase/auth';
import {
  ArrowLeft,
  Check,
  CreditCard,
  ExternalLink,
  FileText,
  FolderTree,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Palette,
  Save,
  Shield,
  ShoppingCart,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  applyFashionBdPreset,
  saveSiteSettings,
} from '../lib/storeService';
import type {
  AdminUser,
  BorderRadiusStyle,
  Category,
  CustomerRecord,
  CustomPage,
  FontStyle,
  LayoutStyle,
  Order,
  Product,
  SiteSettings,
  SurfaceStyle,
} from '../types/store';
import { ImagePickerField } from './ImagePickerField';
import { SmartImage } from './SmartImage';
import { CatalogManager } from './admin/CatalogManager';
import { OrdersCustomersManager } from './admin/OrdersCustomersManager';
import { PagesAndAccessManager } from './admin/PagesAndAccessManager';

type AdminTab =
  | 'overview'
  | 'branding'
  | 'theme'
  | 'homepage'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'payments'
  | 'pages'
  | 'seo'
  | 'access';

interface AdminDashboardProps {
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  orders: Order[];
  customers: CustomerRecord[];
  pages: CustomPage[];
  admins: AdminUser[];
  user: User;
  isPrimaryOwner: boolean;
  onExitAdmin: () => void;
  onSignOut: () => void;
}

const COLOR_PRESETS = [
  { name: 'Fashion BD অরেঞ্জ-পিংক', primary: '#F97316', accent: '#DB2777' },
  { name: 'বটল গ্রিন', primary: '#0D4F3C', accent: '#B45309' },
  { name: 'মিডনাইট নেভি', primary: '#1E293B', accent: '#2563EB' },
  { name: 'রয়্যাল ইন্ডিগো', primary: '#312E81', accent: '#D97706' },
  { name: 'ক্রিমসন ওয়াইন', primary: '#881337', accent: '#0F766E' },
  { name: 'চারকোল মিনিমাল', primary: '#18181B', accent: '#52525B' },
];

export function AdminDashboard({
  settings,
  categories,
  products,
  orders,
  customers,
  pages,
  admins,
  user,
  isPrimaryOwner,
  onExitAdmin,
  onSignOut,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const currency = settings.currencySymbol || '৳';

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSavedNotice(false);
    try {
      await saveSiteSettings(draft);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'সেটিংস সংরক্ষণ করা যায়নি।'
      );
    } finally {
      setSaving(false);
    }
  };

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'ওভারভিউ',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'orders',
      label: `অর্ডার (${orders.length})`,
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      id: 'products',
      label: `পণ্য (${products.length})`,
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'categories',
      label: `ক্যাটাগরি (${categories.length})`,
      icon: <FolderTree className="w-4 h-4" />,
    },
    {
      id: 'customers',
      label: 'কাস্টমার তালিকা',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'branding',
      label: 'নাম, লোগো ও প্রোফাইল',
      icon: <ImageIcon className="w-4 h-4" />,
    },
    {
      id: 'theme',
      label: 'থিম, রং ও লেআউট',
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: 'homepage',
      label: 'হোমপেজ ব্যানার ও অফার',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'payments',
      label: 'বিকাশ, নগদ ও ডেলিভারি',
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: 'pages',
      label: 'পেজ ও মেনু',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'seo',
      label: 'SEO ও সাইটের ঠিকানা',
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: 'access',
      label: 'মালিকানা ও অ্যাডমিন',
      icon: <Shield className="w-4 h-4" />,
    },
  ];

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockProducts = products.filter((p) => p.stock <= 5);

  const isSettingsTab = [
    'branding',
    'theme',
    'homepage',
    'payments',
    'seo',
  ].includes(activeTab);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar (260px) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[264px] shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {settings.logoUrl && (
              <div className="w-7 h-7 rounded overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                <SmartImage
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <span className="font-bold text-sm truncate">
              {settings.siteName} — অ্যাডমিন
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors text-left ${
                  active
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100">
              <SmartImage
                src={settings.profileImageUrl || user.photoURL || ''}
                alt={settings.ownerName || user.displayName || 'Admin'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">
                {settings.ownerName || user.displayName || 'অ্যাডমিন'}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {user.email}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            লগআউট
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Breadcrumb Bar */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
              অ্যাডমিন ড্যাশবোর্ড /{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {navItems.find((i) => i.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isSettingsTab && (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveSettings()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
              </button>
            )}
            <button
              type="button"
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              লাইভ ওয়েবসাইট
              <ExternalLink className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </header>

        {/* Workspace Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {savedNotice && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300">
              <Check className="w-4 h-4 shrink-0" />
              আপনার সব পরিবর্তন ডাটাবেজে সংরক্ষিত হয়েছে এবং লাইভ ওয়েবসাইটে যুক্ত হয়েছে।
            </div>
          )}
          {saveError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {saveError}
            </div>
          )}

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">স্বাগতম, {settings.ownerName || 'অ্যাডমিন'}</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    এখান থেকে কোডিং ছাড়াই আপনার সম্পূর্ণ ওয়েবসাইট, পণ্য, অর্ডার ও ডিজাইন পরিচালনা করুন।
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={async () => {
                    setSaving(true);
                    setSaveError('');
                    try {
                      await applyFashionBdPreset();
                      setSavedNotice(true);
                      setTimeout(() => setSavedNotice(false), 3000);
                    } catch (err) {
                      setSaveError(
                        err instanceof Error
                          ? err.message
                          : 'টেমপ্লেট লোড করা যায়নি।'
                      );
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-900/50 whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Fashion BD থিম ও ক্যাটাগরি লোড করুন
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <div className="text-xs text-slate-500">মোট বিক্রয় (বাতিল বাদে)</div>
                  <div className="text-2xl font-bold tabular-nums">
                    {currency}
                    {totalRevenue.toLocaleString('en-US')}
                  </div>
                </div>
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <div className="text-xs text-slate-500">মোট অর্ডার</div>
                  <div className="text-2xl font-bold tabular-nums">
                    {orders.length}
                  </div>
                </div>
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <div className="text-xs text-slate-500">অপেক্ষমাণ অর্ডার</div>
                  <div className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                    {pendingCount}
                  </div>
                </div>
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <div className="text-xs text-slate-500">মোট সক্রিয় পণ্য</div>
                  <div className="text-2xl font-bold tabular-nums">
                    {products.filter((p) => p.isActive).length}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold">সাম্প্রতিক অর্ডার</h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:underline"
                    >
                      সব দেখুন →
                    </button>
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">
                      এখনো কোনো অর্ডার আসেনি।
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {orders.slice(0, 5).map((o) => (
                        <div
                          key={o.id}
                          className="py-3 flex items-center justify-between gap-4"
                        >
                          <div>
                            <div className="font-medium">
                              {o.customerName} ·{' '}
                              <span className="font-mono-num text-xs text-slate-500">
                                {o.orderNumber}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              {o.customerPhone} · {o.status}
                            </div>
                          </div>
                          <div className="font-semibold tabular-nums">
                            {currency}
                            {o.totalAmount.toLocaleString('en-US')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold">কম স্টক সতর্কতা</h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:underline"
                    >
                      পণ্য ম্যানেজ করুন →
                    </button>
                  </div>
                  {lowStockProducts.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">
                      সব পণ্যের পর্যাপ্ত স্টক রয়েছে।
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {lowStockProducts.map((p) => (
                        <div
                          key={p.id}
                          className="py-2.5 flex items-center justify-between gap-3"
                        >
                          <span className="truncate">{p.name}</span>
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 tabular-nums shrink-0">
                            বাকি: {p.stock} টি
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: BRANDING & PROFILE */}
          {activeTab === 'branding' && (
            <form
              onSubmit={handleSaveSettings}
              className="space-y-6 max-w-3xl"
            >
              <div>
                <h2 className="text-xl font-bold">
                  ওয়েবসাইটের নাম, লোগো ও প্রোফাইল ছবি
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ব্র্যান্ডের নাম, ট্যাগলাইন, লোগো ও স্বত্বাধিকারীর প্রোফাইল ছবি পরিবর্তন করুন
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ওয়েবসাইট / স্টোরের নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={draft.siteName}
                      onChange={(e) =>
                        setDraft({ ...draft, siteName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      স্বত্বাধিকারী / অ্যাডমিনের নাম
                    </label>
                    <input
                      type="text"
                      value={draft.ownerName}
                      onChange={(e) =>
                        setDraft({ ...draft, ownerName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    ব্র্যান্ড ট্যাগলাইন (স্লোগান)
                  </label>
                  <input
                    type="text"
                    value={draft.tagline}
                    onChange={(e) =>
                      setDraft({ ...draft, tagline: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>

                <ImagePickerField
                  label="ওয়েবসাইটের লোগো"
                  value={draft.logoUrl}
                  onChange={(url) => setDraft({ ...draft, logoUrl: url })}
                  maxWidth={400}
                  aspectClass="w-20 h-20"
                  helperText="বর্গাকার (1:1) লোগো সবচেয়ে ভালো দেখায়।"
                />

                <ImagePickerField
                  label="মালিক / প্রোফাইল ছবি"
                  value={draft.profileImageUrl}
                  onChange={(url) =>
                    setDraft({ ...draft, profileImageUrl: url })
                  }
                  maxWidth={400}
                  aspectClass="w-20 h-20"
                  helperText="ফুটার, যোগাযোগ পেজ ও অ্যাডমিন প্রোফাইলে প্রদর্শিত হবে।"
                />
              </div>
            </form>
          )}

          {/* TAB: THEME, COLOR & LAYOUT */}
          {activeTab === 'theme' && (
            <form
              onSubmit={handleSaveSettings}
              className="space-y-6 max-w-4xl"
            >
              <div>
                <h2 className="text-xl font-bold">
                  রং, ডিজাইন, থিম ও লেআউট পরিবর্তন
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  কোনো কোডিং ছাড়াই সম্পূর্ণ ওয়েবসাইটের ভিজ্যুয়াল স্টাইল পরিবর্তন করুন
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 space-y-6">
                {/* Light / Dark Mode */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold">
                    থিম মোড (Light / Dark)
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, themeMode: 'light' })}
                      className={`p-3 text-sm rounded-lg border text-left ${
                        draft.themeMode === 'light'
                          ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800 font-semibold'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      লাইট থিম (Light)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, themeMode: 'dark' })}
                      className={`p-3 text-sm rounded-lg border text-left ${
                        draft.themeMode === 'dark'
                          ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800 font-semibold'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      ডার্ক থিম (Dark)
                    </button>
                  </div>
                </div>

                {/* Color Palette Presets + Custom Pickers */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-sm font-semibold">
                    ব্র্যান্ডের রং নির্বাচন করুন
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            primaryColor: preset.primary,
                            accentColor: preset.accent,
                          })
                        }
                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: preset.primary }}
                        />
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        প্রাইমারি রং (Primary Color)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={draft.primaryColor}
                          onChange={(e) =>
                            setDraft({ ...draft, primaryColor: e.target.value })
                          }
                          className="w-10 h-10 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={draft.primaryColor}
                          onChange={(e) =>
                            setDraft({ ...draft, primaryColor: e.target.value })
                          }
                          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono-num"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        অ্যাকসেন্ট রং (Accent Color)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={draft.accentColor}
                          onChange={(e) =>
                            setDraft({ ...draft, accentColor: e.target.value })
                          }
                          className="w-10 h-10 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={draft.accentColor}
                          onChange={(e) =>
                            setDraft({ ...draft, accentColor: e.target.value })
                          }
                          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono-num"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Layout, Surface, Font, Radius */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-medium mb-1.5">
                      প্রোডাক্ট গ্রিড লেআউট
                    </label>
                    <select
                      value={draft.layoutStyle}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          layoutStyle: e.target.value as LayoutStyle,
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    >
                      <option value="grid">ক্লাসিক ৩-কলাম গ্রিড</option>
                      <option value="editorial">বড় এডিটোরিয়াল ২-কলাম</option>
                      <option value="compact">কমপ্যাক্ট ৪-কলাম ক্যাটালগ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5">
                      ব্যাকগ্রাউন্ড সারফেস (লাইট মোড)
                    </label>
                    <select
                      value={draft.surfaceStyle}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          surfaceStyle: e.target.value as SurfaceStyle,
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    >
                      <option value="crisp">পিওর হোয়াইট (Crisp White)</option>
                      <option value="warm">ওয়ার্ম পেপার (Warm Ivory)</option>
                      <option value="slate">সফট স্লেট (Cool Slate)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5">
                      টাইপোগ্রাফি / ফন্ট স্টাইল
                    </label>
                    <select
                      value={draft.fontStyle}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          fontStyle: e.target.value as FontStyle,
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    >
                      <option value="modern">মডার্ন জ্যামিতিক স্যান্স</option>
                      <option value="editorial">লাক্সারি এডিটোরিয়াল সেরিফ</option>
                      <option value="minimal">মিনিমাল ক্লিন স্যান্স</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5">
                      বাটন ও কার্ডের কোণার আকৃতি
                    </label>
                    <select
                      value={draft.borderRadius}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          borderRadius: e.target.value as BorderRadiusStyle,
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    >
                      <option value="sharp">শার্প আর্কিটেকচারাল</option>
                      <option value="rounded">স্ট্যান্ডার্ড রাউন্ডেড</option>
                      <option value="soft">সফট কার্ড</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB: HOMEPAGE BANNER & OFFERS */}
          {activeTab === 'homepage' && (
            <form
              onSubmit={handleSaveSettings}
              className="space-y-6 max-w-4xl"
            >
              <div>
                <h2 className="text-xl font-bold">
                  হোমপেজ ব্যানার, ছবি, লেখা ও অফার
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  শীর্ষ নোটিশ বার, হিরো ব্যানার ও ডিসকাউন্ট অফার সেকশন কাস্টমাইজ করুন
                </p>
              </div>

              {/* Announcement Bar */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">
                    শীর্ষ ঘোষণা বার (Announcement Bar)
                  </h3>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.announcementEnabled}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          announcementEnabled: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    চালু রাখুন
                  </label>
                </div>
                <input
                  type="text"
                  value={draft.announcementText}
                  onChange={(e) =>
                    setDraft({ ...draft, announcementText: e.target.value })
                  }
                  placeholder="যেমন: ৩,০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি!"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              {/* Hero Banner */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 space-y-4">
                <h3 className="text-base font-semibold">হোমপেজ হিরো ব্যানার</h3>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    প্রধান শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={draft.heroTitle}
                    onChange={(e) =>
                      setDraft({ ...draft, heroTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    বিস্তারিত লেখা (Subtitle)
                  </label>
                  <textarea
                    rows={3}
                    value={draft.heroSubtitle}
                    onChange={(e) =>
                      setDraft({ ...draft, heroSubtitle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    বাটনের লেখা *
                  </label>
                  <input
                    type="text"
                    required
                    value={draft.heroCtaText}
                    onChange={(e) =>
                      setDraft({ ...draft, heroCtaText: e.target.value })
                    }
                    className="w-full sm:max-w-xs px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <ImagePickerField
                  label="হিরো ব্যানার ছবি (১৬:৯)"
                  value={draft.heroImageUrl}
                  onChange={(url) => setDraft({ ...draft, heroImageUrl: url })}
                />
              </div>

              {/* Special Offer Section */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">
                    বিশেষ অফার ও প্রোমো কোড সেকশন
                  </h3>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.offerEnabled}
                      onChange={(e) =>
                        setDraft({ ...draft, offerEnabled: e.target.checked })
                      }
                      className="rounded"
                    />
                    দেখান
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      অফার শিরোনাম
                    </label>
                    <input
                      type="text"
                      value={draft.offerTitle}
                      onChange={(e) =>
                        setDraft({ ...draft, offerTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      অফার কিকার টেক্সট
                    </label>
                    <input
                      type="text"
                      value={draft.offerBadgeText}
                      onChange={(e) =>
                        setDraft({ ...draft, offerBadgeText: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1">
                      অফারের বিবরণ
                    </label>
                    <input
                      type="text"
                      value={draft.offerSubtitle}
                      onChange={(e) =>
                        setDraft({ ...draft, offerSubtitle: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      প্রোমো কোড (১০% ছাড়)
                    </label>
                    <input
                      type="text"
                      value={draft.offerDiscountCode}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          offerDiscountCode: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="SAVE10"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono-num uppercase"
                    />
                  </div>
                </div>

                <ImagePickerField
                  label="অফার ব্যানার ছবি"
                  value={draft.offerImageUrl}
                  onChange={(url) => setDraft({ ...draft, offerImageUrl: url })}
                />
              </div>
            </form>
          )}

          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && (
            <CatalogManager
              mode="products"
              products={products}
              categories={categories}
              currency={currency}
            />
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === 'categories' && (
            <CatalogManager
              mode="categories"
              products={products}
              categories={categories}
              currency={currency}
            />
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <OrdersCustomersManager
              mode="orders"
              orders={orders}
              customers={customers}
              currency={currency}
            />
          )}

          {/* TAB: CUSTOMERS */}
          {activeTab === 'customers' && (
            <OrdersCustomersManager
              mode="customers"
              orders={orders}
              customers={customers}
              currency={currency}
            />
          )}

          {/* TAB: PAYMENTS, DELIVERY & CONTACT */}
          {activeTab === 'payments' && (
            <form
              onSubmit={handleSaveSettings}
              className="space-y-6 max-w-4xl"
            >
              <div>
                <h2 className="text-xl font-bold">
                  বিকাশ, নগদ, WhatsApp, ডেলিভারি চার্জ ও যোগাযোগ
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  সব পেমেন্ট নম্বর, যোগাযোগের তথ্য ও ডেলিভারি নিয়মাবলি এখান থেকে পরিবর্তন করুন
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 space-y-5">
                <h3 className="text-base font-semibold">
                  মোবাইল ব্যাংকিং ও যোগাযোগ নম্বর
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      বিকাশ (bKash) নম্বর
                    </label>
                    <input
                      type="text"
                      value={draft.bkashNumber}
                      onChange={(e) =>
                        setDraft({ ...draft, bkashNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      নগদ (Nagad) নম্বর
                    </label>
                    <input
                      type="text"
                      value={draft.nagadNumber}
                      onChange={(e) =>
                        setDraft({ ...draft, nagadNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      রকেট (Rocket) নম্বর (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={draft.rocketNumber}
                      onChange={(e) =>
                        setDraft({ ...draft, rocketNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono-num"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      WhatsApp নম্বর (দেশের কোডসহ, যেমন: 88017...)
                    </label>
                    <input
                      type="text"
                      value={draft.whatsappNumber}
                      onChange={(e) =>
                        setDraft({ ...draft, whatsappNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      হটলাইন / ফোন নম্বর
                    </label>
                    <input
                      type="text"
                      value={draft.phoneNumber}
                      onChange={(e) =>
                        setDraft({ ...draft, phoneNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      যোগাযোগের ইমেইল
                    </label>
                    <input
                      type="email"
                      value={draft.contactEmail}
                      onChange={(e) =>
                        setDraft({ ...draft, contactEmail: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    দোকান বা অফিসের ঠিকানা
                  </label>
                  <input
                    type="text"
                    value={draft.storeAddress}
                    onChange={(e) =>
                      setDraft({ ...draft, storeAddress: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 space-y-5">
                <h3 className="text-base font-semibold">
                  ডেলিভারি চার্জ ও পেমেন্ট সেটিংস
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      ঢাকার ভেতরে চার্জ
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={draft.deliveryInsideDhaka}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          deliveryInsideDhaka: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      ঢাকার বাইরে চার্জ
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={draft.deliveryOutsideDhaka}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          deliveryOutsideDhaka: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      ফ্রি ডেলিভারি ন্যূনতম অর্ডার (০ = বন্ধ)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={draft.freeDeliveryMinAmount}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          freeDeliveryMinAmount: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      মুদ্রার চিহ্ন (Currency)
                    </label>
                    <input
                      type="text"
                      value={draft.currencySymbol}
                      onChange={(e) =>
                        setDraft({ ...draft, currencySymbol: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.codEnabled}
                    onChange={(e) =>
                      setDraft({ ...draft, codEnabled: e.target.checked })
                    }
                    className="rounded"
                  />
                  ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা চালু রাখুন
                </label>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    চেকআউট পেমেন্ট নির্দেশনা
                  </label>
                  <textarea
                    rows={2}
                    value={draft.paymentInstructions}
                    onChange={(e) =>
                      setDraft({ ...draft, paymentInstructions: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
              </div>
            </form>
          )}

          {/* TAB: PAGES & MENUS */}
          {activeTab === 'pages' && (
            <PagesAndAccessManager
              mode="pages"
              pages={pages}
              admins={admins}
              currentUser={user}
              isPrimaryOwner={isPrimaryOwner}
            />
          )}

          {/* TAB: SEO & WEBSITE ADDRESS */}
          {activeTab === 'seo' && (
            <form
              onSubmit={handleSaveSettings}
              className="space-y-6 max-w-4xl"
            >
              <div>
                <h2 className="text-xl font-bold">
                  SEO, ওয়েবসাইটের ঠিকানা ও ফুটার সেটিংস
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  গুগল সার্চ র‍্যাঙ্কিং, সোশ্যাল মিডিয়া শেয়ারিং ও ডোমেইন/URL পরিচালনা করুন
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 space-y-5">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    ওয়েবসাইটের ঠিকানা (Canonical / Domain URL)
                  </label>
                  <input
                    type="url"
                    value={draft.websiteUrl}
                    onChange={(e) =>
                      setDraft({ ...draft, websiteUrl: e.target.value })
                    }
                    placeholder="https://yourstore.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono-num"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">SEO শিরোনাম (Title Tag)</span>
                    <span className="text-slate-500 tabular-nums">
                      {draft.seoTitle.length} / 100
                    </span>
                  </div>
                  <input
                    type="text"
                    value={draft.seoTitle}
                    onChange={(e) =>
                      setDraft({ ...draft, seoTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">
                      SEO বিবরণ (Meta Description)
                    </span>
                    <span className="text-slate-500 tabular-nums">
                      {draft.seoDescription.length} / 260
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={draft.seoDescription}
                    onChange={(e) =>
                      setDraft({ ...draft, seoDescription: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    SEO কীওয়ার্ড (Keywords, কমা দিয়ে আলাদা)
                  </label>
                  <input
                    type="text"
                    value={draft.seoKeywords}
                    onChange={(e) =>
                      setDraft({ ...draft, seoKeywords: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>

                <ImagePickerField
                  label="সোশ্যাল শেয়ারিং ছবি (OpenGraph Image)"
                  value={draft.ogImageUrl}
                  onChange={(url) => setDraft({ ...draft, ogImageUrl: url })}
                />

                {/* Google Snippet Live Preview */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
                  <div className="text-[11px] text-slate-500">
                    Google Search প্রিভিউ
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 truncate font-mono-num">
                    {draft.websiteUrl || 'https://yourstore.com'}
                  </div>
                  <div className="text-base font-medium text-blue-700 dark:text-blue-400">
                    {draft.seoTitle || draft.siteName}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {draft.seoDescription}
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 space-y-4">
                <h3 className="text-base font-semibold">ফুটার কনটেন্ট</h3>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    ফুটার সম্পর্কে লেখা
                  </label>
                  <textarea
                    rows={2}
                    value={draft.footerAbout}
                    onChange={(e) =>
                      setDraft({ ...draft, footerAbout: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    কপিরাইট টেক্সট
                  </label>
                  <input
                    type="text"
                    value={draft.footerCopyright}
                    onChange={(e) =>
                      setDraft({ ...draft, footerCopyright: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
              </div>
            </form>
          )}

          {/* TAB: OWNERSHIP & ADMIN ACCESS */}
          {activeTab === 'access' && (
            <PagesAndAccessManager
              mode="access"
              pages={pages}
              admins={admins}
              currentUser={user}
              isPrimaryOwner={isPrimaryOwner}
            />
          )}
        </main>
      </div>
    </div>
  );
}
