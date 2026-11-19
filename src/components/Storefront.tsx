import type { User } from 'firebase/auth';
import {
  ArrowRight,
  Check,
  Copy,
  Home,
  LayoutGrid,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Search,
  Settings2,
  Shirt,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  CartItem,
  Category,
  CustomPage,
  Order,
  Product,
  SiteSettings,
} from '../types/store';
import { ProductDetailModal } from './ProductDetailModal';
import { SmartImage } from './SmartImage';

interface StorefrontProps {
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  pages: CustomPage[];
  cart: CartItem[];
  user: User | null;
  isAdmin: boolean;
  myOrders: Order[];
  onAddToCart: (
    product: Product,
    quantity: number,
    size: string,
    color: string,
    openCart: boolean
  ) => void;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

const PASTEL_BOX_TINTS = [
  {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    iconBg: 'bg-amber-100/80 dark:bg-amber-900/40',
    iconColor: 'text-amber-700 dark:text-amber-300',
    headerGrad:
      'from-pink-50 via-white to-sky-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800',
  },
  {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    iconBg: 'bg-rose-100/80 dark:bg-rose-900/40',
    iconColor: 'text-rose-700 dark:text-rose-300',
    headerGrad:
      'from-rose-50 via-white to-indigo-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800',
  },
  {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    iconBg: 'bg-sky-100/80 dark:bg-sky-900/40',
    iconColor: 'text-sky-700 dark:text-sky-300',
    headerGrad:
      'from-sky-50 via-white to-emerald-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800',
  },
  {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconBg: 'bg-emerald-100/80 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    headerGrad:
      'from-emerald-50 via-white to-amber-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800',
  },
];

const CARD_SWATCH_TINTS = [
  'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
  'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  'bg-lime-50 dark:bg-lime-950/30 text-lime-700 dark:text-lime-300',
  'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
];

const STATUS_LABELS_BN: Record<string, string> = {
  pending: 'অপেক্ষমাণ',
  confirmed: 'নিশ্চিত',
  processing: 'প্রস্তুত হচ্ছে',
  shipped: 'ডেলিভারিতে',
  delivered: 'সম্পন্ন',
  cancelled: 'বাতিল',
};

export function Storefront({
  settings,
  categories,
  products,
  pages,
  cart,
  user,
  isAdmin,
  myOrders,
  onAddToCart,
  onOpenCart,
  onOpenAdmin,
  onSignIn,
  onSignOut,
}: StorefrontProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePageSlug, setActivePageSlug] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'home' | 'products' | 'pages'>(
    'home'
  );

  const currency = settings.currencySymbol || '৳';
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive),
    [categories]
  );

  const headerPages = useMemo(
    () => pages.filter((p) => p.isActive && p.showInHeader),
    [pages]
  );

  const footerPages = useMemo(
    () => pages.filter((p) => p.isActive && p.showInFooter),
    [pages]
  );

  const activePage = useMemo(
    () => pages.find((p) => p.slug === activePageSlug && p.isActive) || null,
    [pages, activePageSlug]
  );

  const activeProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (!p.isActive) return false;
      if (q) {
        return (
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, searchQuery]);

  const categoriesToDisplay = useMemo(() => {
    if (selectedCategoryId === 'all') return activeCategories;
    return activeCategories.filter((c) => c.id === selectedCategoryId);
  }, [activeCategories, selectedCategoryId]);

  const surfaceBgClass =
    settings.themeMode === 'dark'
      ? 'bg-slate-950 text-slate-100'
      : settings.surfaceStyle === 'warm'
        ? 'bg-[#FAF8F5] text-slate-900'
        : 'bg-[#F8F9FB] text-slate-900';

  const cardSurfaceClass =
    settings.themeMode === 'dark'
      ? 'bg-slate-900 border-slate-800'
      : 'bg-white border-slate-200/80';

  const displayFontStyle =
    settings.fontStyle === 'editorial'
      ? { fontFamily: "'Cormorant Garamond', 'Hind Siliguri', serif" }
      : undefined;

  const whatsappClean = settings.whatsappNumber.replace(/[^0-9]/g, '');

  const handleCopyCode = () => {
    if (!settings.offerDiscountCode) return;
    navigator.clipboard?.writeText(settings.offerDiscountCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const brandInitials = settings.siteName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`min-h-screen flex flex-col pb-36 md:pb-24 ${surfaceBgClass}`}>
      {/* Slim Dismissible Announcement Bar */}
      {settings.announcementEnabled &&
        settings.announcementText &&
        !announcementDismissed && (
          <div className="h-8 px-4 flex items-center justify-center relative text-[11px] font-medium text-white bg-slate-900">
            <span className="truncate max-w-2xl text-center">
              {settings.announcementText}
            </span>
            <button
              type="button"
              onClick={() => setAnnouncementDismissed(true)}
              aria-label="ঘোষণা বন্ধ করুন"
              className="absolute right-2.5 p-1 opacity-80 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      {/* Vibrant Orange/Brand Gradient Top App Header matching Reference Screenshot */}
      <header
        className="sticky top-0 z-30 rounded-b-2xl shadow-md text-white"
        style={{
          background: `linear-gradient(135deg, ${settings.primaryColor} 0%, #EA580C 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Brand Logo Badge + Store Name & Subtitle */}
          <button
            type="button"
            onClick={() => {
              setActivePageSlug(null);
              setSelectedCategoryId('all');
              setMobileTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 min-w-0 text-left shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm overflow-hidden flex items-center justify-center shrink-0 border border-white/60">
              {settings.logoUrl ? (
                <SmartImage
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="font-bold text-sm"
                  style={{ color: settings.primaryColor }}
                >
                  {brandInitials || 'FB'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div
                className="text-base sm:text-lg font-bold leading-tight truncate text-white"
                style={displayFontStyle}
              >
                {settings.siteName}
              </div>
              <div className="text-[11px] text-white/90 truncate max-w-[140px] sm:max-w-[240px]">
                {settings.tagline}
              </div>
            </div>
          </button>

          {/* Desktop Center Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-white/95">
            <button
              type="button"
              onClick={() => {
                setActivePageSlug(null);
                setSelectedCategoryId('all');
              }}
              className="hover:underline underline-offset-4 whitespace-nowrap"
            >
              হোম
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePageSlug(null);
                document
                  .getElementById('category-boxes')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:underline underline-offset-4 whitespace-nowrap"
            >
              ক্যাটাগরি
            </button>
            {headerPages.slice(0, 3).map((pg) => (
              <button
                key={pg.id}
                type="button"
                onClick={() => {
                  setActivePageSlug(pg.slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:underline underline-offset-4 whitespace-nowrap"
              >
                {pg.title}
              </button>
            ))}
          </nav>

          {/* Right: Yellow Checkout Button + Bag Counter + Search/Admin */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="খুঁজুন"
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-300 hover:bg-amber-200 text-slate-900 text-xs font-bold shadow-sm transition-colors whitespace-nowrap"
            >
              <span>অর্ডার চেকআউট</span>
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-xs transition-colors whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>ব্যাগ</span>
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-slate-900 text-white text-[11px] font-bold tabular-nums">
                {totalCartCount}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenAdmin}
              aria-label="অ্যাডমিন প্যানেল"
              title="অ্যাডমিন প্যানেল"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>অ্যাডমিন</span>
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="px-4 pb-3">
            <div className="max-w-2xl mx-auto flex items-center gap-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2 shadow-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activePageSlug) setActivePageSlug(null);
                }}
                placeholder="পণ্যের নাম বা ক্যাটাগরি লিখে খুঁজুন..."
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  মুছুন
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-5 space-y-6">
        {activePage ? (
          /* Dynamic Custom Page View */
          <section className="max-w-4xl mx-auto py-4 space-y-6">
            <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <button
                type="button"
                onClick={() => {
                  setActivePageSlug(null);
                  setMobileTab('home');
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                ← হোমে ফিরে যান
              </button>
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={displayFontStyle}
              >
                {activePage.title}
              </h1>
            </div>

            <div
              className={`border ${cardSurfaceClass} rounded-2xl p-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line shadow-sm`}
            >
              {activePage.content}
            </div>

            {/* Store Profile & Contact Card */}
            <div
              className={`border ${cardSurfaceClass} rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm`}
            >
              {settings.profileImageUrl && (
                <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                  <SmartImage
                    src={settings.profileImageUrl}
                    alt={settings.ownerName || settings.siteName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1.5 flex-1 text-sm">
                <div className="font-semibold">
                  {settings.siteName} · {settings.ownerName || 'স্বত্বাধিকারী'}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {settings.phoneNumber && (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {settings.phoneNumber}
                    </span>
                  )}
                  {settings.contactEmail && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {settings.contactEmail}
                    </span>
                  )}
                  {settings.storeAddress && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {settings.storeAddress}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Section 1: বড় ক্যাটাগরি বক্সসমূহ (2x2 Grid on Mobile, 4-col on Desktop) */}
            <section id="category-boxes" className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h1 className="text-base sm:text-lg font-bold tracking-tight">
                  বড় ক্যাটাগরি বক্সসমূহ
                </h1>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId('all')}
                  className="text-xs sm:text-sm font-semibold hover:underline"
                  style={{ color: settings.accentColor }}
                >
                  {selectedCategoryId === 'all' ? 'সব দেখুন' : 'সব ক্যাটাগরি দেখুন'}
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {activeCategories.map((cat, idx) => {
                  const tint = PASTEL_BOX_TINTS[idx % PASTEL_BOX_TINTS.length];
                  const catProdCount = activeProducts.filter(
                    (p) => p.categoryId === cat.id
                  ).length;
                  const isSelected = selectedCategoryId === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setSelectedCategoryId((prev) =>
                          prev === cat.id ? 'all' : cat.id
                        )
                      }
                      className={`group text-left border ${cardSurfaceClass} rounded-2xl p-2.5 sm:p-3.5 flex items-center gap-2.5 sm:gap-3.5 shadow-sm transition-all hover:shadow-md ${
                        isSelected
                          ? 'ring-2 ring-offset-1'
                          : 'hover:-translate-y-0.5'
                      }`}
                      style={
                        isSelected
                          ? { outlineColor: settings.accentColor }
                          : undefined
                      }
                    >
                      {/* Square pastel thumbnail */}
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative ${tint.iconBg}`}
                      >
                        {cat.imageUrl ? (
                          <SmartImage
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Shirt className={`w-6 h-6 ${tint.iconColor}`} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-bold leading-snug truncate">
                          {cat.name}
                        </div>
                        <div
                          className="text-[11px] sm:text-xs font-medium truncate mt-0.5"
                          style={{ color: settings.accentColor }}
                        >
                          {catProdCount}টি আইটেম
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Section 2: Category-by-Category Showcase Strips (matching reference screenshot) */}
            {categoriesToDisplay.map((cat, catIdx) => {
              const catProducts = activeProducts.filter(
                (p) => p.categoryId === cat.id
              );
              if (catProducts.length === 0) return null;
              const tint = PASTEL_BOX_TINTS[catIdx % PASTEL_BOX_TINTS.length];
              const totalStock = catProducts.reduce(
                (sum, item) => sum + item.stock,
                0
              );

              return (
                <section key={cat.id} className="space-y-3.5">
                  {/* Centered Soft Pastel Category Header Strip */}
                  <div
                    className={`w-full rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-gradient-to-r ${tint.headerGrad} py-2.5 px-4 flex items-center justify-center gap-2.5 shadow-xs`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <h2
                      className="text-sm sm:text-base font-bold text-center"
                      style={{
                        color:
                          settings.themeMode === 'dark'
                            ? '#F8FAFC'
                            : settings.accentColor,
                        ...displayFontStyle,
                      }}
                    >
                      {cat.name} ({totalStock > 0 ? totalStock : catProducts.length})
                    </h2>
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  </div>

                  {/* 4-Column Product Grid on Mobile & Desktop matching Reference */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                    {catProducts.map((product, pIdx) => {
                      const swatch =
                        CARD_SWATCH_TINTS[pIdx % CARD_SWATCH_TINTS.length];
                      const hasDiscount =
                        product.discountPrice > 0 &&
                        product.discountPrice < product.price;
                      const effectivePrice = hasDiscount
                        ? product.discountPrice
                        : product.price;
                      const outOfStock = product.stock <= 0;

                      return (
                        <article
                          key={product.id}
                          className={`group border ${cardSurfaceClass} rounded-2xl p-2 sm:p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all`}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(product)}
                            className="text-left w-full block"
                          >
                            {/* Pastel Image Box with top-right stock count chip */}
                            <div
                              className={`relative aspect-square rounded-xl overflow-hidden ${swatch}`}
                            >
                              <SmartImage
                                src={product.imageUrl}
                                alt={product.name}
                                fallbackLabel={product.name}
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                              />
                              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 text-[10px] font-semibold tabular-nums shadow-xs">
                                {outOfStock ? '০' : product.stock}
                              </span>
                            </div>

                            {/* Centered Product Name */}
                            <div className="mt-2.5 text-center space-y-1 px-0.5">
                              <h3 className="text-xs sm:text-sm font-bold leading-snug line-clamp-2">
                                {product.name}
                              </h3>
                              <div className="flex items-center justify-center gap-1.5 text-xs tabular-nums">
                                <span
                                  className="font-bold"
                                  style={{ color: settings.primaryColor }}
                                >
                                  {currency}
                                  {effectivePrice.toLocaleString('en-US')}
                                </span>
                                {hasDiscount && (
                                  <span className="text-[11px] text-slate-400 line-through">
                                    {currency}
                                    {product.price.toLocaleString('en-US')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>

                          <button
                            type="button"
                            disabled={outOfStock}
                            onClick={() =>
                              onAddToCart(
                                product,
                                1,
                                product.sizes[0] || '',
                                product.colors[0] || '',
                                false
                              )
                            }
                            className="mt-2.5 w-full py-1.5 px-2 text-[11px] sm:text-xs font-semibold rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-45"
                            style={{ backgroundColor: settings.primaryColor }}
                          >
                            {outOfStock ? 'স্টক নেই' : 'ব্যাগে যোগ করুন'}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {/* Uncategorized / Other Active Products if any */}
            {(() => {
              const catIds = new Set(activeCategories.map((c) => c.id));
              const others = activeProducts.filter(
                (p) => !catIds.has(p.categoryId)
              );
              if (others.length === 0 || selectedCategoryId !== 'all') {
                return null;
              }
              return (
                <section className="space-y-3.5">
                  <div className="w-full rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-4 flex items-center justify-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold">
                      অন্যান্য কালেকশন ({others.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                    {others.map((product) => {
                      const hasDiscount =
                        product.discountPrice > 0 &&
                        product.discountPrice < product.price;
                      const effectivePrice = hasDiscount
                        ? product.discountPrice
                        : product.price;
                      return (
                        <article
                          key={product.id}
                          className={`border ${cardSurfaceClass} rounded-2xl p-2 sm:p-3 flex flex-col justify-between shadow-sm`}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(product)}
                            className="text-left w-full"
                          >
                            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                              <SmartImage
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="mt-2 text-center space-y-0.5">
                              <h3 className="text-xs sm:text-sm font-bold line-clamp-2">
                                {product.name}
                              </h3>
                              <div
                                className="text-xs font-bold tabular-nums"
                                style={{ color: settings.primaryColor }}
                              >
                                {currency}
                                {effectivePrice.toLocaleString('en-US')}
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            disabled={product.stock <= 0}
                            onClick={() =>
                              onAddToCart(
                                product,
                                1,
                                product.sizes[0] || '',
                                product.colors[0] || '',
                                false
                              )
                            }
                            className="mt-2 w-full py-1.5 text-[11px] font-semibold rounded-xl text-white"
                            style={{ backgroundColor: settings.primaryColor }}
                          >
                            {product.stock <= 0 ? 'স্টক নেই' : 'ব্যাগে যোগ করুন'}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })()}

            {/* Empty State when Search has no results */}
            {activeProducts.length === 0 && (
              <div
                className={`border ${cardSurfaceClass} rounded-2xl p-10 text-center space-y-3`}
              >
                <p className="text-sm text-slate-500">
                  কোনো পণ্য পাওয়া যায়নি।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryId('all');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-white"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  সব পণ্য দেখুন
                </button>
              </div>
            )}

            {/* Offer Campaign Strip (when enabled in Admin) */}
            {settings.offerEnabled && settings.offerTitle && (
              <section
                className={`border ${cardSurfaceClass} rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-sm`}
              >
                <div className="md:col-span-7 p-5 sm:p-7 flex flex-col justify-center space-y-3">
                  {settings.offerBadgeText && (
                    <span
                      className="text-xs font-bold"
                      style={{ color: settings.accentColor }}
                    >
                      {settings.offerBadgeText}
                    </span>
                  )}
                  <h2
                    className="text-lg sm:text-2xl font-bold"
                    style={displayFontStyle}
                  >
                    {settings.offerTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {settings.offerSubtitle}
                  </p>
                  {settings.offerDiscountCode && (
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <span className="px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 font-mono-num text-xs font-bold">
                        {settings.offerDiscountCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            কপি হয়েছে
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            কোড কপি করুন
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <div className="md:col-span-5 min-h-[160px] bg-slate-100 dark:bg-slate-800">
                  <SmartImage
                    src={settings.offerImageUrl}
                    alt={settings.offerTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 mt-10 pt-8 pb-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {settings.siteName}
            </div>
            <p className="leading-relaxed">{settings.footerAbout}</p>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              তথ্য ও পেজসমূহ
            </div>
            <div className="flex flex-wrap gap-3">
              {footerPages.map((pg) => (
                <button
                  key={pg.id}
                  type="button"
                  onClick={() => {
                    setActivePageSlug(pg.slug);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:underline"
                >
                  {pg.title}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              পেমেন্ট ও যোগাযোগ
            </div>
            <div className="space-y-1">
              {settings.bkashNumber && <div>বিকাশ: {settings.bkashNumber}</div>}
              {settings.nagadNumber && <div>নগদ: {settings.nagadNumber}</div>}
              {whatsappClean && (
                <a
                  href={`https://wa.me/${whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp সাপোর্ট
                </a>
              )}
            </div>
            <div className="pt-1 flex flex-wrap gap-2">
              {user ? (
                <>
                  {!isAdmin && (
                    <button
                      type="button"
                      onClick={() => setOrdersModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700"
                    >
                      <Package className="w-3 h-3" />
                      আমার অর্ডার
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700"
                  >
                    <LogOut className="w-3 h-3" />
                    লগআউট
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700"
                >
                  <LogIn className="w-3 h-3" />
                  লগইন
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-200/70 dark:border-slate-800 text-center">
          {settings.footerCopyright}
        </div>
      </footer>

      {/* Floating Dark Cart Summary Bar (matching Reference Screenshot) */}
      <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-30 px-3 sm:px-6 pointer-events-none">
        <div className="max-w-xl mx-auto pointer-events-auto bg-slate-900 text-white rounded-2xl px-4 py-2.5 shadow-xl flex items-center justify-between gap-3 border border-slate-800">
          <div className="text-xs sm:text-sm font-medium tabular-nums truncate">
            ব্যাগে <span className="font-bold">{totalCartCount}টি</span> পণ্য ·
            মোট:{' '}
            <span className="font-bold text-pink-400">
              {currency}
              {cartTotalAmount.toLocaleString('en-US')}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
            style={{ backgroundColor: settings.accentColor || '#DB2777' }}
          >
            <span>ব্যাগ ও অর্ডার দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar (4 Tabs matching Reference) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 items-center">
        <button
          type="button"
          onClick={() => {
            setActivePageSlug(null);
            setSelectedCategoryId('all');
            setMobileTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center h-full text-[11px] font-medium ${
            mobileTab === 'home' && !activePageSlug
              ? 'font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
          style={
            mobileTab === 'home' && !activePageSlug
              ? { color: settings.primaryColor }
              : undefined
          }
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>হোম</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActivePageSlug(null);
            setMobileTab('products');
            document
              .getElementById('category-boxes')
              ?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center h-full text-[11px] font-medium ${
            mobileTab === 'products'
              ? 'font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
          style={
            mobileTab === 'products'
              ? { color: settings.primaryColor }
              : undefined
          }
        >
          <LayoutGrid className="w-4 h-4 mb-0.5" />
          <span>ক্যাটাগরি</span>
        </button>

        <button
          type="button"
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center h-full text-[11px] font-medium text-slate-500 dark:text-slate-400"
        >
          <ShoppingBag className="w-4 h-4 mb-0.5" />
          <span>ব্যাগ ({totalCartCount})</span>
        </button>

        <button
          type="button"
          onClick={onOpenAdmin}
          className="flex flex-col items-center justify-center h-full text-[11px] font-medium text-slate-500 dark:text-slate-400"
        >
          <Settings2 className="w-4 h-4 mb-0.5" />
          <span>অ্যাডমিন</span>
        </button>
      </nav>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          settings={settings}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={onAddToCart}
        />
      )}

      {/* Signed-in Customer Order History Modal */}
      {ordersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold">আমার অর্ডার তালিকা</h3>
              <button
                type="button"
                onClick={() => setOrdersModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {myOrders.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  আপনার অ্যাকাউন্ট থেকে এখনো কোনো অর্ডার করা হয়নি।
                </p>
              ) : (
                myOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-num font-semibold">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        স্ট্যাটাস: {STATUS_LABELS_BN[ord.status] || ord.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {ord.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800 font-semibold">
                      <span>সর্বমোট</span>
                      <span className="tabular-nums">
                        {currency}
                        {ord.totalAmount.toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
