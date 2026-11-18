import type { User } from 'firebase/auth';
import {
  Check,
  Copy,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Phone,
  Search,
  Settings2,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  BorderRadiusStyle,
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

function getRadiusClass(radius: BorderRadiusStyle): string {
  if (radius === 'sharp') return 'rounded-sm';
  if (radius === 'soft') return 'rounded-2xl';
  return 'rounded-xl';
}

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);

  const currency = settings.currencySymbol || '৳';
  const radiusClass = getRadiusClass(settings.borderRadius);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive),
    [categories]
  );

  const headerPages = useMemo(
    () => pages.filter((p) => p.isActive && p.showInHeader).slice(0, 3),
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

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (!p.isActive) return false;
      if (selectedCategoryId !== 'all' && p.categoryId !== selectedCategoryId) {
        return false;
      }
      if (q) {
        return (
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, selectedCategoryId, searchQuery]);

  const surfaceBgClass =
    settings.themeMode === 'dark'
      ? 'bg-slate-950 text-slate-100'
      : settings.surfaceStyle === 'warm'
        ? 'bg-[#FAF8F5] text-slate-900'
        : settings.surfaceStyle === 'slate'
          ? 'bg-slate-50 text-slate-900'
          : 'bg-white text-slate-900';

  const cardSurfaceClass =
    settings.themeMode === 'dark'
      ? 'bg-slate-900 border-slate-800'
      : 'bg-white border-slate-200';

  const productGridClass =
    settings.layoutStyle === 'compact'
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'
      : settings.layoutStyle === 'editorial'
        ? 'grid-cols-1 md:grid-cols-2 gap-8'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7';

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

  const scrollToCatalog = () => {
    setActivePageSlug(null);
    setTimeout(() => {
      document
        .getElementById('catalog-section')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className={`min-h-screen flex flex-col ${surfaceBgClass}`}>
      {/* Slim Dismissible Top Announcement Bar (<= 40px) */}
      {settings.announcementEnabled &&
        settings.announcementText &&
        !announcementDismissed && (
          <div
            className="h-9 px-4 flex items-center justify-center relative text-xs font-medium text-white"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <span className="truncate max-w-2xl text-center">
              {settings.announcementText}
            </span>
            <button
              type="button"
              onClick={() => setAnnouncementDismissed(true)}
              aria-label="ঘোষণা বন্ধ করুন"
              className="absolute right-3 p-1 opacity-80 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      {/* 3-Zone Top Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              setActivePageSlug(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0"
          >
            {settings.logoUrl && (
              <div className="w-8 h-8 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 bg-white">
                <SmartImage
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <span
              className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0"
              style={displayFontStyle}
            >
              {settings.siteName}
            </span>
          </button>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setActivePageSlug(null)}
              className={`hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activePageSlug === null
                  ? 'text-slate-950 dark:text-white underline underline-offset-4'
                  : ''
              }`}
            >
              হোম
            </button>
            <button
              type="button"
              onClick={scrollToCatalog}
              className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              সব পণ্য
            </button>
            {headerPages.map((pg) => (
              <button
                key={pg.id}
                type="button"
                onClick={() => {
                  setActivePageSlug(pg.slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                  activePageSlug === pg.slug
                    ? 'text-slate-950 dark:text-white underline underline-offset-4'
                    : ''
                }`}
              >
                {pg.title}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Action Group */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="পণ্য খুঁজুন"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label="শপিং ব্যাগ"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="tabular-nums">ব্যাগ ({totalCartCount})</span>
            </button>

            {user && !isAdmin && (
              <button
                type="button"
                onClick={() => setOrdersModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                <Package className="w-3.5 h-3.5" />
                আমার অর্ডার
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAdmin}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
              style={{ backgroundColor: settings.primaryColor }}
            >
              <Settings2 className="w-3.5 h-3.5" />
              {isAdmin ? 'অ্যাডমিন প্যানেল' : 'অ্যাডমিন'}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((m) => !m)}
              aria-label="মেনু"
              className="md:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
            <div className="max-w-2xl mx-auto flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activePageSlug) setActivePageSlug(null);
                }}
                placeholder="পণ্যের নাম, ক্যাটাগরি বা বিবরণ লিখে খুঁজুন..."
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

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2">
            <button
              type="button"
              onClick={() => {
                setActivePageSlug(null);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium"
            >
              হোম
            </button>
            <button
              type="button"
              onClick={() => {
                scrollToCatalog();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium"
            >
              সব পণ্য
            </button>
            {headerPages.map((pg) => (
              <button
                key={pg.id}
                type="button"
                onClick={() => {
                  setActivePageSlug(pg.slug);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium"
              >
                {pg.title}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="px-4 py-2 text-xs font-semibold text-white rounded-lg"
                style={{ backgroundColor: settings.primaryColor }}
              >
                অ্যাডমিন প্যানেল
              </button>
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setOrdersModalOpen(true);
                    }}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700"
                  >
                    আমার অর্ডার
                  </button>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700"
                  >
                    লগআউট
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700"
                >
                  গুগল লগইন
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {activePage ? (
          /* Dynamic Custom Page View */
          <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
              <button
                type="button"
                onClick={() => setActivePageSlug(null)}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                ← হোমে ফিরে যান
              </button>
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                style={displayFontStyle}
              >
                {activePage.title}
              </h1>
            </div>

            <div className="text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {activePage.content}
            </div>

            {/* Store Profile & Contact Card */}
            <div
              className={`border ${cardSurfaceClass} ${radiusClass} p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center`}
            >
              {settings.profileImageUrl && (
                <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                  <SmartImage
                    src={settings.profileImageUrl}
                    alt={settings.ownerName || settings.siteName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-2 flex-1">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {settings.siteName} · {settings.ownerName || 'স্টোর স্বত্বাধিকারী'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                  {settings.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="font-mono-num">{settings.phoneNumber}</span>
                    </div>
                  )}
                  {settings.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{settings.contactEmail}</span>
                    </div>
                  )}
                  {settings.storeAddress && (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{settings.storeAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Section 1: Hero Split Showcase */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-6 flex flex-col justify-center space-y-6 py-4 lg:py-10">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{settings.siteName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{settings.tagline}</span>
                  </div>

                  <h1
                    className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.18]"
                    style={displayFontStyle}
                  >
                    {settings.heroTitle}
                  </h1>

                  <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                    {settings.heroSubtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={scrollToCatalog}
                      className={`px-6 py-3 text-sm font-semibold text-white hover:opacity-95 transition-opacity ${radiusClass}`}
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      {settings.heroCtaText}
                    </button>
                    {whatsappClean && (
                      <a
                        href={`https://wa.me/${whatsappClean}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${radiusClass}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp অর্ডার
                      </a>
                    )}
                  </div>

                  {/* Clean Unboxed Trust Strip */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                    {settings.codEnabled && <span>ক্যাশ অন ডেলিভারি</span>}
                    {settings.bkashNumber && <span>বিকাশ ও নগদ পেমেন্ট</span>}
                    <span className="tabular-nums">
                      ঢাকার ভেতরে ডেলিভারি {currency}
                      {settings.deliveryInsideDhaka}
                    </span>
                  </div>
                </div>

                <div
                  className={`lg:col-span-6 overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 min-h-[280px] sm:min-h-[380px] ${radiusClass}`}
                >
                  <SmartImage
                    src={settings.heroImageUrl}
                    alt={settings.heroTitle}
                    fallbackLabel={settings.siteName}
                    className="w-full h-full lg:h-full object-cover"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Category Filter & Product Catalog */}
            <section
              id="catalog-section"
              className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 border-t border-slate-200/70 dark:border-slate-800/80"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                  <h2
                    className="text-2xl sm:text-3xl font-bold tracking-tight"
                    style={displayFontStyle}
                  >
                    নির্বাচিত কালেকশন
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    পছন্দের পণ্য নির্বাচন করে সরাসরি অনলাইনে অর্ডার করুন
                  </p>
                </div>

                {/* Interactive Category Filter Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId('all')}
                    className={`px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 border ${radiusClass} ${
                      selectedCategoryId === 'all'
                        ? 'text-white border-transparent'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                    }`}
                    style={
                      selectedCategoryId === 'all'
                        ? { backgroundColor: settings.primaryColor }
                        : undefined
                    }
                  >
                    সব পণ্য ({products.filter((p) => p.isActive).length})
                  </button>
                  {activeCategories.map((cat) => {
                    const active = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 border ${radiusClass} ${
                          active
                            ? 'text-white border-transparent'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                        }`}
                        style={
                          active
                            ? { backgroundColor: settings.primaryColor }
                            : undefined
                        }
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div
                  className={`border ${cardSurfaceClass} ${radiusClass} p-12 text-center space-y-3`}
                >
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    এই ক্যাটাগরি বা অনুসন্ধানে কোনো পণ্য পাওয়া যায়নি।
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700"
                  >
                    সব পণ্য দেখুন
                  </button>
                </div>
              ) : (
                <div className={`grid ${productGridClass}`}>
                  {filteredProducts.map((product) => {
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
                        className={`group border ${cardSurfaceClass} ${radiusClass} overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 text-left block"
                        >
                          <SmartImage
                            src={product.imageUrl}
                            alt={product.name}
                            fallbackLabel={product.name}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          />
                        </button>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                              <span>{product.categoryName}</span>
                              <span>
                                {outOfStock
                                  ? 'স্টক শেষ'
                                  : hasDiscount
                                    ? 'অফার মূল্য'
                                    : 'স্টকে আছে'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedProduct(product)}
                              className="text-left block w-full"
                            >
                              <h3 className="text-base font-semibold leading-snug group-hover:underline underline-offset-4">
                                {product.name}
                              </h3>
                            </button>
                            {product.sizes.length > 0 && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                সাইজ: {product.sizes.join(' · ')}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-baseline gap-2">
                              <span
                                className="text-base font-bold tabular-nums"
                                style={{ color: settings.primaryColor }}
                              >
                                {currency}
                                {effectivePrice.toLocaleString('en-US')}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-slate-400 line-through tabular-nums">
                                  {currency}
                                  {product.price.toLocaleString('en-US')}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              disabled={outOfStock}
                              onClick={() =>
                                onAddToCart(
                                  product,
                                  1,
                                  product.sizes[0] || '',
                                  product.colors[0] || '',
                                  true
                                )
                              }
                              className={`px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-45 whitespace-nowrap shrink-0 ${radiusClass}`}
                              style={{ backgroundColor: settings.primaryColor }}
                            >
                              {outOfStock ? 'স্টক নেই' : 'অর্ডার করুন'}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Section 3: Promotional Offer / Editorial Spotlight */}
            {settings.offerEnabled && settings.offerTitle && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <div
                  className={`border ${cardSurfaceClass} ${radiusClass} overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch`}
                >
                  <div className="lg:col-span-6 p-7 sm:p-10 flex flex-col justify-center space-y-5">
                    {settings.offerBadgeText && (
                      <div
                        className="text-xs font-semibold"
                        style={{ color: settings.accentColor }}
                      >
                        {settings.offerBadgeText}
                      </div>
                    )}
                    <h2
                      className="text-2xl sm:text-3xl font-bold leading-snug"
                      style={displayFontStyle}
                    >
                      {settings.offerTitle}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {settings.offerSubtitle}
                    </p>
                    {settings.offerDiscountCode && (
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <div className="px-4 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 font-mono-num text-sm font-semibold">
                          {settings.offerDiscountCode}
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                  <div className="lg:col-span-6 min-h-[240px] bg-slate-100 dark:bg-slate-800">
                    <SmartImage
                      src={settings.offerImageUrl}
                      alt={settings.offerTitle}
                      fallbackLabel={settings.offerTitle}
                      className="w-full h-full lg:h-full object-cover"
                    />
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              {settings.logoUrl && (
                <div className="w-8 h-8 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
                  <SmartImage
                    src={settings.logoUrl}
                    alt={settings.siteName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <span className="text-lg font-bold">{settings.siteName}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              {settings.footerAbout}
            </p>
            {settings.profileImageUrl && (
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                  <SmartImage
                    src={settings.profileImageUrl}
                    alt={settings.ownerName || settings.siteName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {settings.ownerName || settings.siteName}
                  </div>
                  <div>{settings.storeAddress}</div>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-semibold">গুরুত্বপূর্ণ পেজ</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {footerPages.map((pg) => (
                <li key={pg.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePageSlug(pg.slug);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-slate-950 dark:hover:text-white transition-colors"
                  >
                    {pg.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-semibold">যোগাযোগ ও পেমেন্ট</h4>
            <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              {settings.phoneNumber && (
                <div>
                  হটলাইন:{' '}
                  <span className="font-mono-num text-slate-900 dark:text-slate-200">
                    {settings.phoneNumber}
                  </span>
                </div>
              )}
              {settings.bkashNumber && (
                <div>
                  বিকাশ:{' '}
                  <span className="font-mono-num text-slate-900 dark:text-slate-200">
                    {settings.bkashNumber}
                  </span>
                </div>
              )}
              {settings.nagadNumber && (
                <div>
                  নগদ:{' '}
                  <span className="font-mono-num text-slate-900 dark:text-slate-200">
                    {settings.nagadNumber}
                  </span>
                </div>
              )}
              {settings.contactEmail && <div>ইমেইল: {settings.contactEmail}</div>}
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              {user ? (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  লগআউট ({user.displayName || user.email})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  ক্রেতা / অ্যাডমিন লগইন
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {settings.footerCopyright}
        </div>
      </footer>

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
