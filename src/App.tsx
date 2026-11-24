import { onAuthStateChanged, type User } from 'firebase/auth';
import { ArrowLeft, LogIn, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Storefront } from './components/Storefront';
import {
  auth,
  FIRESTORE_UPGRADE_URL,
  OWNER_EMAIL,
  signInWithGooglePopup,
  signOutUser,
  testConnection,
} from './lib/firebase';
import {
  checkIsAdminUser,
  ensureSeededStoreData,
  refreshCatalogFromServer,
  subscribeAdminsOwner,
  subscribeAllOrdersAdmin,
  subscribeCategories,
  subscribeCustomersAdmin,
  subscribeMyOrders,
  subscribePages,
  subscribeProducts,
  subscribeSiteSettings,
} from './lib/storeService';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PAGES,
  DEFAULT_PRODUCTS,
  DEFAULT_SETTINGS,
  type AdminUser,
  type CartItem,
  type Category,
  type CustomerRecord,
  type CustomPage,
  type Order,
  type Product,
  type SiteSettings,
} from './types/store';

function updateMetaTag(selector: string, attr: string, content: string) {
  if (!content) return;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    if (selector.includes('property=')) {
      const match = selector.match(/property="([^"]+)"/);
      if (match) el.setAttribute('property', match[1]);
    } else if (selector.includes('name=')) {
      const match = selector.match(/name="([^"]+)"/);
      if (match) el.setAttribute('name', match[1]);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attr, content);
}

function StoreApp() {
  const [viewMode, setViewMode] = useState<'store' | 'admin'>('store');
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDelegatedAdmin, setIsDelegatedAdmin] = useState(false);
  const [authError, setAuthError] = useState('');

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [pages, setPages] = useState<CustomPage[]>(DEFAULT_PAGES);

  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('store_cart_v1');
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [quotaBannerDismissed, setQuotaBannerDismissed] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'live' | 'quota'>('connecting');
  const [liveProductCount, setLiveProductCount] = useState<number | null>(null);
  const [syncingNow, setSyncingNow] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const isPrimaryOwner = Boolean(
    user && user.emailVerified && user.email === OWNER_EMAIL
  );
  const isAdmin = isPrimaryOwner || isDelegatedAdmin;

  const handleRetrySync = async () => {
    setSyncingNow(true);
    setSyncMessage('');
    const result = await refreshCatalogFromServer();
    if (result.ok) {
      setQuotaExceeded(false);
      setSyncStatus('live');
      setLiveProductCount(result.data.products.length);
      if (result.data.settings) setSettings(result.data.settings);
      if (result.data.categories.length > 0) setCategories(result.data.categories);
      if (result.data.products.length > 0) setProducts(result.data.products);
      if (result.data.pages.length > 0) setPages(result.data.pages);
      setSyncMessage(
        result.data.products.length > 0
          ? `Firestore থেকে ${result.data.products.length}টি পণ্য লোড হয়েছে।`
          : 'ডাটাবেস সংযুক্ত হয়েছে, তবে products কালেকশন খালি (০টি পণ্য)।'
      );
    } else {
      if (result.isQuota) {
        setQuotaExceeded(true);
        setSyncStatus('quota');
        setSyncMessage('Firestore দৈনিক রিড কোটা এখনো পূর্ণ আছে।');
      } else {
        setSyncMessage(`ডাটাবেস সিঙ্ক সমস্যা: ${result.message}`);
      }
    }
    setSyncingNow(false);
  };

  // Startup connection check & public storefront subscriptions
  useEffect(() => {
    testConnection();
    const markQuota = () => {
      setQuotaExceeded(true);
      setSyncStatus('quota');
    };
    const unsubSettings = subscribeSiteSettings(setSettings, markQuota);
    const unsubCategories = subscribeCategories(setCategories, markQuota);
    const unsubProducts = subscribeProducts(
      setProducts,
      markQuota,
      (count) => {
        setQuotaExceeded(false);
        setSyncStatus('live');
        setLiveProductCount(count);
      }
    );
    const unsubPages = subscribePages(setPages, markQuota);

    return () => {
      unsubSettings();
      unsubCategories();
      unsubProducts();
      unsubPages();
    };
  }, []);

  // Auth State & Role Resolution
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && u.emailVerified) {
        if (u.email === OWNER_EMAIL) {
          setIsDelegatedAdmin(true);
          ensureSeededStoreData().catch((err) =>
            console.warn('Seed skipped:', err)
          );
        } else {
          const delegated = await checkIsAdminUser(u.uid);
          setIsDelegatedAdmin(delegated);
          if (delegated) {
            ensureSeededStoreData().catch((err) =>
              console.warn('Seed skipped:', err)
            );
          }
        }
      } else {
        setIsDelegatedAdmin(false);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Authenticated PII Listeners (only attach Admin listeners inside Admin Dashboard to save reads!)
  useEffect(() => {
    if (!authReady || !user || !user.emailVerified) {
      setOrders([]);
      setMyOrders([]);
      setCustomers([]);
      setAdmins([]);
      return;
    }

    const markQuota = () => setQuotaExceeded(true);

    if (isAdmin && viewMode === 'admin') {
      const unsubOrders = subscribeAllOrdersAdmin(setOrders, markQuota);
      const unsubCustomers = subscribeCustomersAdmin(setCustomers, markQuota);
      const unsubAdmins = isPrimaryOwner
        ? subscribeAdminsOwner(setAdmins, markQuota)
        : () => {};
      return () => {
        unsubOrders();
        unsubCustomers();
        unsubAdmins();
      };
    }

    if (!isAdmin) {
      const unsubMyOrders = subscribeMyOrders(user.uid, setMyOrders, markQuota);
      return () => unsubMyOrders();
    }
    return undefined;
  }, [authReady, user, isAdmin, isPrimaryOwner, viewMode]);

  // Persist Cart Locally
  useEffect(() => {
    try {
      localStorage.setItem('store_cart_v1', JSON.stringify(cart));
    } catch {
      // Ignore storage quota issues
    }
  }, [cart]);

  // Apply Theme Mode & Dynamic SEO Tags to Document
  useEffect(() => {
    if (settings.themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const pageTitle = settings.seoTitle || settings.siteName;
    document.title = pageTitle;
    updateMetaTag('meta[name="description"]', 'content', settings.seoDescription);
    updateMetaTag('meta[name="keywords"]', 'content', settings.seoKeywords);
    updateMetaTag('meta[property="og:title"]', 'content', pageTitle);
    updateMetaTag(
      'meta[property="og:description"]',
      'content',
      settings.seoDescription
    );
    updateMetaTag('meta[property="og:site_name"]', 'content', settings.siteName);
    if (settings.ogImageUrl) {
      updateMetaTag('meta[property="og:image"]', 'content', settings.ogImageUrl);
    }
  }, [settings]);

  const handleAddToCart = (
    product: Product,
    quantity: number,
    size: string,
    color: string,
    openCart: boolean
  ) => {
    if (product.stock <= 0) return;
    const effectivePrice =
      product.discountPrice > 0 && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;
    const key = `${product.id}__${size}__${color}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key
            ? {
                ...i,
                quantity: Math.min(product.stock, i.quantity + quantity),
              }
            : i
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: effectivePrice,
          quantity: Math.min(product.stock, quantity),
          size,
          color,
          imageUrl: product.imageUrl,
          maxStock: product.stock,
        },
      ];
    });

    if (openCart) {
      setCartOpen(true);
    }
  };

  const handleUpdateQty = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key
            ? {
                ...item,
                quantity: Math.min(item.maxStock, item.quantity + delta),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const handleSignIn = async () => {
    setAuthError('');
    try {
      await signInWithGooglePopup();
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'গুগল লগইন সম্পন্ন করা যায়নি।'
      );
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setViewMode('store');
  };

  if (viewMode === 'admin') {
    if (!authReady) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-sm text-slate-500">
          অ্যাডমিন সেশন যাচাই হচ্ছে...
        </div>
      );
    }

    if (!user || !isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                অ্যাডমিন ড্যাশবোর্ড লগইন
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                ওয়েবসাইট পরিচালনা ও কাস্টমাইজ করতে অনুমোদিত মালিকের গুগল অ্যাকাউন্ট দিয়ে সাইন ইন করুন।
              </p>
            </div>

            {user && !isAdmin && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                <p className="font-semibold">অ্যাক্সেস অনুমোদিত নয়</p>
                <p>
                  আপনি বর্তমানে <span className="font-mono-num">{user.email}</span> দিয়ে লগইন করেছেন, যার অ্যাডমিন অনুমতি নেই। অনুগ্রহ করে{' '}
                  <span className="font-mono-num font-semibold">{OWNER_EMAIL}</span> দিয়ে লগইন করুন।
                </p>
              </div>
            )}

            {authError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {authError}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSignIn}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90"
              >
                <LogIn className="w-4 h-4" />
                গুগল অ্যাকাউন্ট দিয়ে অ্যাডমিন লগইন
              </button>
              <button
                type="button"
                onClick={() => setViewMode('store')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                ওয়েবসাইটে ফিরে যান
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        {quotaExceeded && !quotaBannerDismissed && (
          <div className="bg-amber-50 dark:bg-amber-950/70 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3">
            <span>
              Firestore দৈনিক ফ্রি রিড কোটা পূর্ণ হয়েছে — আগামীকাল কোটা পুনরায় চালু হবে। এখন ক্যাশ করা ডেটা দেখানো হচ্ছে।{' '}
              <a
                href={FIRESTORE_UPGRADE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:opacity-80"
              >
                ডাটাবেস আপগ্রেড / কোটা দেখুন
              </a>
            </span>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                disabled={syncingNow}
                onClick={handleRetrySync}
                className="font-semibold underline hover:opacity-80 disabled:opacity-50"
              >
                {syncingNow ? 'চেক হচ্ছে...' : 'আবার চেষ্টা করুন'}
              </button>
              <button
                type="button"
                onClick={() => setQuotaBannerDismissed(true)}
                className="font-semibold underline"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        )}
        <AdminDashboard
          settings={settings}
          categories={categories}
          products={products}
          orders={orders}
          customers={customers}
          pages={pages}
          admins={admins}
          user={user}
          isPrimaryOwner={isPrimaryOwner}
          syncStatus={syncStatus}
          liveProductCount={liveProductCount}
          syncingNow={syncingNow}
          syncMessage={syncMessage}
          onRetrySync={handleRetrySync}
          onExitAdmin={() => setViewMode('store')}
          onSignOut={handleSignOut}
        />
      </>
    );
  }

  return (
    <>
      {quotaExceeded && isAdmin && !quotaBannerDismissed && (
        <div className="bg-amber-50 dark:bg-amber-950/70 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-xs text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-2">
          <span>
            Firestore-এর আজকের ফ্রি রিড কোটা পূর্ণ হওয়ায় লাইভ ডাটাবেস থেকে আপনার যোগ করা পণ্যগুলো এখন লোড হচ্ছে না (ডাটাবেসে নিরাপদ আছে)। কোটা রিসেট হলে বা{' '}
            <a
              href={FIRESTORE_UPGRADE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:opacity-80"
            >
              আপগ্রেড করলে
            </a>{' '}
            পণ্যগুলো স্বয়ংক্রিয়ভাবে চলে আসবে।
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={syncingNow}
              onClick={handleRetrySync}
              className="font-semibold underline hover:opacity-80 disabled:opacity-50"
            >
              {syncingNow ? 'চেক হচ্ছে...' : 'আবার চেষ্টা করুন'}
            </button>
            <button
              type="button"
              onClick={() => setQuotaBannerDismissed(true)}
              className="font-semibold underline"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
      <Storefront
        settings={settings}
        categories={categories}
        products={products}
        pages={pages}
        cart={cart}
        user={user}
        isAdmin={isAdmin}
        myOrders={myOrders}
        onAddToCart={handleAddToCart}
        onOpenCart={() => setCartOpen(true)}
        onOpenAdmin={() => setViewMode('admin')}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <CartCheckoutDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        settings={settings}
        customerUid={user ? user.uid : 'guest'}
        customerDefaultName={user?.displayName || ''}
        customerDefaultEmail={user?.email || ''}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCart([])}
      />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreApp />
    </ErrorBoundary>
  );
}
