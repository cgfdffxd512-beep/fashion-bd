import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromCache,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentReference,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PAGES,
  DEFAULT_PRODUCTS,
  DEFAULT_SETTINGS,
  type AdminUser,
  type Category,
  type CustomerRecord,
  type CustomPage,
  type Order,
  type OrderStatus,
  type Product,
  type SiteSettings,
} from '../types/store';
import {
  db,
  handleFirestoreError,
  isQuotaExceededError,
  OperationType,
} from './firebase';

type QuotaCallback = () => void;

function readCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeCache(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

function getTimestampMillis(ts: unknown): number {
  if (!ts) return 0;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'object' && 'toMillis' in ts && typeof (ts as { toMillis: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  if (typeof ts === 'object' && 'seconds' in ts && typeof (ts as { seconds: number }).seconds === 'number') {
    return (ts as { seconds: number }).seconds * 1000;
  }
  return 0;
}

async function getExistingCreatedAt(ref: DocumentReference): Promise<unknown> {
  try {
    const cached = await getDocFromCache(ref);
    if (cached.exists() && cached.data()?.createdAt) {
      return cached.data().createdAt;
    }
  } catch {
    // Cache miss; fall back to server getDoc
  }
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data()?.createdAt || serverTimestamp() : serverTimestamp();
}

export function slugifyId(input: string, prefix = 'item'): string {
  const cleaned = input
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const rand = Math.random().toString(36).slice(2, 7);
  return cleaned ? `${cleaned}-${rand}` : `${prefix}-${Date.now()}-${rand}`;
}

// --- Public Storefront Subscriptions ---
export function subscribeSiteSettings(
  onData: (settings: SiteSettings) => void,
  onQuotaExceeded?: QuotaCallback
): Unsubscribe {
  const ref = doc(db, 'settings', 'site');
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const merged = { ...DEFAULT_SETTINGS, ...(snap.data() as SiteSettings) };
        writeCache('fbd_cache_settings', merged);
        onData(merged);
      } else {
        onData(readCache('fbd_cache_settings', DEFAULT_SETTINGS));
      }
    },
    (error) => {
      if (isQuotaExceededError(error)) {
        onQuotaExceeded?.();
        onData(readCache('fbd_cache_settings', DEFAULT_SETTINGS));
        return;
      }
      console.warn('Settings listener fallback:', error.message);
      onData(readCache('fbd_cache_settings', DEFAULT_SETTINGS));
    }
  );
}

export function subscribeCategories(
  onData: (categories: Category[]) => void,
  onQuotaExceeded?: QuotaCallback
): Unsubscribe {
  const q = query(collection(db, 'categories'));
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        onData(readCache('fbd_cache_categories', DEFAULT_CATEGORIES));
      } else {
        const list = snap.docs
          .map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Category, 'id'>),
          }))
          .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
        writeCache('fbd_cache_categories', list);
        onData(list);
      }
    },
    (error) => {
      if (isQuotaExceededError(error)) {
        onQuotaExceeded?.();
        onData(readCache('fbd_cache_categories', DEFAULT_CATEGORIES));
        return;
      }
      handleFirestoreError(error, OperationType.LIST, 'categories');
    }
  );
}

export function subscribeProducts(
  onData: (products: Product[]) => void,
  onQuotaExceeded?: QuotaCallback
): Unsubscribe {
  const q = query(collection(db, 'products'));
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        onData(readCache('fbd_cache_products', DEFAULT_PRODUCTS));
      } else {
        const list = snap.docs
          .map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Product, 'id'>),
          }))
          .sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
        writeCache('fbd_cache_products', list);
        onData(list);
      }
    },
    (error) => {
      if (isQuotaExceededError(error)) {
        onQuotaExceeded?.();
        onData(readCache('fbd_cache_products', DEFAULT_PRODUCTS));
        return;
      }
      handleFirestoreError(error, OperationType.LIST, 'products');
    }
  );
}

export function subscribePages(
  onData: (pages: CustomPage[]) => void,
  onQuotaExceeded?: QuotaCallback
): Unsubscribe {
  const q = query(collection(db, 'pages'));
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        onData(readCache('fbd_cache_pages', DEFAULT_PAGES));
      } else {
        const list = snap.docs
          .map((d) => ({
            id: d.id,
            ...(d.data() as Omit<CustomPage, 'id'>),
          }))
          .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
        writeCache('fbd_cache_pages', list);
        onData(list);
      }
    },
    (error) => {
      if (isQuotaExceededError(error)) {
        onQuotaExceeded?.();
        onData(readCache('fbd_cache_pages', DEFAULT_PAGES));
        return;
      }
      handleFirestoreError(error, OperationType.LIST, 'pages');
    }
  );
}

// --- Seed Initial Data for First-Time Admin Login ---
export async function ensureSeededStoreData(): Promise<void> {
  const settingsRef = doc(db, 'settings', 'site');
  try {
    const existing = await getDoc(settingsRef);
    if (existing.exists()) return;

    const batch = writeBatch(db);
    const { updatedAt: _u, ...settingsClean } = DEFAULT_SETTINGS;
    batch.set(settingsRef, {
      ...settingsClean,
      updatedAt: serverTimestamp(),
    });

    for (const cat of DEFAULT_CATEGORIES) {
      const { id, createdAt: _c, updatedAt: _cu, ...catData } = cat;
      batch.set(doc(db, 'categories', id), {
        ...catData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const prod of DEFAULT_PRODUCTS) {
      const { id, createdAt: _c, updatedAt: _pu, ...prodData } = prod;
      batch.set(doc(db, 'products', id), {
        ...prodData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const pg of DEFAULT_PAGES) {
      const { id, createdAt: _c, updatedAt: _gu, ...pgData } = pg;
      batch.set(doc(db, 'pages', id), {
        ...pgData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.warn('Firestore quota exceeded during initial seed check.');
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, 'settings/site');
  }
}

export async function applyFashionBdPreset(): Promise<void> {
  const settingsRef = doc(db, 'settings', 'site');
  try {
    const batch = writeBatch(db);
    const { updatedAt: _u, ...settingsClean } = DEFAULT_SETTINGS;
    batch.set(settingsRef, {
      ...settingsClean,
      updatedAt: serverTimestamp(),
    });

    for (const cat of DEFAULT_CATEGORIES) {
      const { id, createdAt: _c, updatedAt: _cu, ...catData } = cat;
      batch.set(doc(db, 'categories', id), {
        ...catData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const prod of DEFAULT_PRODUCTS) {
      const { id, createdAt: _c, updatedAt: _pu, ...prodData } = prod;
      batch.set(doc(db, 'products', id), {
        ...prodData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/site');
  }
}

// --- Admin Settings Write ---
export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const ref = doc(db, 'settings', 'site');
  try {
    const payload = {
      siteName: settings.siteName.trim().slice(0, 80) || 'আভিজাত্য',
      tagline: settings.tagline.trim().slice(0, 160),
      logoUrl: settings.logoUrl.slice(0, 350000),
      profileImageUrl: settings.profileImageUrl.slice(0, 350000),
      ownerName: settings.ownerName.trim().slice(0, 80),
      themeMode: settings.themeMode,
      primaryColor: /^#[0-9a-fA-F]{6}$/.test(settings.primaryColor)
        ? settings.primaryColor
        : '#0D4F3C',
      accentColor: /^#[0-9a-fA-F]{6}$/.test(settings.accentColor)
        ? settings.accentColor
        : '#B45309',
      surfaceStyle: settings.surfaceStyle,
      layoutStyle: settings.layoutStyle,
      fontStyle: settings.fontStyle,
      borderRadius: settings.borderRadius,
      announcementEnabled: Boolean(settings.announcementEnabled),
      announcementText: settings.announcementText.trim().slice(0, 160),
      heroTitle: settings.heroTitle.trim().slice(0, 140) || 'স্বাগতম',
      heroSubtitle: settings.heroSubtitle.trim().slice(0, 320),
      heroCtaText: settings.heroCtaText.trim().slice(0, 40) || 'কালেকশন দেখুন',
      heroImageUrl: settings.heroImageUrl.slice(0, 350000),
      offerEnabled: Boolean(settings.offerEnabled),
      offerTitle: settings.offerTitle.trim().slice(0, 120),
      offerSubtitle: settings.offerSubtitle.trim().slice(0, 300),
      offerBadgeText: settings.offerBadgeText.trim().slice(0, 40),
      offerDiscountCode: settings.offerDiscountCode.trim().toUpperCase().slice(0, 30),
      offerImageUrl: settings.offerImageUrl.slice(0, 350000),
      bkashNumber: settings.bkashNumber.trim().slice(0, 30),
      nagadNumber: settings.nagadNumber.trim().slice(0, 30),
      rocketNumber: settings.rocketNumber.trim().slice(0, 30),
      whatsappNumber: settings.whatsappNumber.trim().slice(0, 30),
      phoneNumber: settings.phoneNumber.trim().slice(0, 30),
      contactEmail: settings.contactEmail.trim().slice(0, 100),
      storeAddress: settings.storeAddress.trim().slice(0, 240),
      websiteUrl: settings.websiteUrl.trim().slice(0, 200),
      deliveryInsideDhaka: Math.max(0, Number(settings.deliveryInsideDhaka) || 0),
      deliveryOutsideDhaka: Math.max(0, Number(settings.deliveryOutsideDhaka) || 0),
      freeDeliveryMinAmount: Math.max(
        0,
        Number(settings.freeDeliveryMinAmount) || 0
      ),
      codEnabled: Boolean(settings.codEnabled),
      paymentInstructions: settings.paymentInstructions.trim().slice(0, 400),
      currencySymbol: settings.currencySymbol.trim().slice(0, 10) || '৳',
      seoTitle: settings.seoTitle.trim().slice(0, 100),
      seoDescription: settings.seoDescription.trim().slice(0, 260),
      seoKeywords: settings.seoKeywords.trim().slice(0, 260),
      ogImageUrl: settings.ogImageUrl.slice(0, 350000),
      footerAbout: settings.footerAbout.trim().slice(0, 300),
      footerCopyright: settings.footerCopyright.trim().slice(0, 120),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/site');
  }
}

// --- Category CRUD ---
export async function saveCategory(
  category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId || slugifyId(category.slug || category.name, 'cat');
  const ref = doc(db, 'categories', id);
  const safeSlug =
    category.slug
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || id;

  try {
    const cleanData = {
      name: category.name.trim().slice(0, 60),
      slug: safeSlug,
      description: category.description.trim().slice(0, 200),
      imageUrl: category.imageUrl.slice(0, 350000),
      sortOrder: Math.max(0, Number(category.sortOrder) || 0),
      isActive: Boolean(category.isActive),
    };
    const createdAt = existingId
      ? await getExistingCreatedAt(ref)
      : serverTimestamp();
    await setDoc(ref, {
      ...cleanData,
      createdAt,
      updatedAt: serverTimestamp(),
    });
    const cached = readCache<Category[]>('fbd_cache_categories', DEFAULT_CATEGORIES);
    const updated = existingId
      ? cached.map((c) => (c.id === id ? { ...c, ...cleanData, id } : c))
      : [...cached, { ...cleanData, id }];
    writeCache('fbd_cache_categories', updated);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `categories/${id}`);
  }
}

export async function removeCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'categories', id));
    const cached = readCache<Category[]>('fbd_cache_categories', DEFAULT_CATEGORIES);
    writeCache(
      'fbd_cache_categories',
      cached.filter((c) => c.id !== id)
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
  }
}

// --- Product CRUD ---
export async function saveProduct(
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId || slugifyId(product.sku || product.name, 'prod');
  const ref = doc(db, 'products', id);
  const price = Math.max(0, Number(product.price) || 0);
  const rawDiscount = Math.max(0, Number(product.discountPrice) || 0);
  const discountPrice = rawDiscount > price ? price : rawDiscount;

  try {
    const cleanData = {
      name: product.name.trim().slice(0, 120),
      sku: product.sku.trim().slice(0, 40),
      categoryId: product.categoryId.trim().slice(0, 128),
      categoryName: product.categoryName.trim().slice(0, 60),
      description: product.description.trim().slice(0, 2000),
      price,
      discountPrice,
      stock: Math.max(0, Math.round(Number(product.stock) || 0)),
      sizes: product.sizes.slice(0, 12).map((s) => s.trim()).filter(Boolean),
      colors: product.colors.slice(0, 12).map((c) => c.trim()).filter(Boolean),
      imageUrl: product.imageUrl.slice(0, 350000),
      featured: Boolean(product.featured),
      isActive: Boolean(product.isActive),
    };
    const createdAt = existingId
      ? await getExistingCreatedAt(ref)
      : serverTimestamp();

    await setDoc(ref, {
      ...cleanData,
      createdAt,
      updatedAt: serverTimestamp(),
    });
    const cached = readCache<Product[]>('fbd_cache_products', DEFAULT_PRODUCTS);
    const updated = existingId
      ? cached.map((p) => (p.id === id ? { ...p, ...cleanData, id } : p))
      : [{ ...cleanData, id, createdAt: new Date() }, ...cached];
    writeCache('fbd_cache_products', updated);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${id}`);
  }
}

export async function removeProduct(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', id));
    const cached = readCache<Product[]>('fbd_cache_products', DEFAULT_PRODUCTS);
    writeCache(
      'fbd_cache_products',
      cached.filter((p) => p.id !== id)
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
  }
}

// --- Custom Pages CRUD ---
export async function saveCustomPage(
  page: Omit<CustomPage, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId || slugifyId(page.slug || page.title, 'page');
  const ref = doc(db, 'pages', id);
  const safeSlug =
    page.slug
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || id;

  try {
    const createdAt = existingId
      ? await getExistingCreatedAt(ref)
      : serverTimestamp();

    await setDoc(ref, {
      title: page.title.trim().slice(0, 80),
      slug: safeSlug,
      content: page.content.slice(0, 8000),
      showInHeader: Boolean(page.showInHeader),
      showInFooter: Boolean(page.showInFooter),
      sortOrder: Math.max(0, Number(page.sortOrder) || 0),
      isActive: Boolean(page.isActive),
      createdAt,
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `pages/${id}`);
  }
}

export async function removeCustomPage(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'pages', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `pages/${id}`);
  }
}

// --- Orders ---
export async function placeCustomerOrder(
  orderInput: Omit<Order, 'id' | 'orderNumber' | 'status' | 'adminNote' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  const id = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const orderNumber = `ORD-${String(Date.now()).slice(-6)}`;
  const ref = doc(db, 'orders', id);
  const payload = {
    orderNumber,
    customerUid: orderInput.customerUid || 'guest',
    customerName: orderInput.customerName.trim().slice(0, 100),
    customerPhone: orderInput.customerPhone.trim().slice(0, 25),
    customerEmail: (orderInput.customerEmail || '').trim().slice(0, 120),
    shippingAddress: orderInput.shippingAddress.trim().slice(0, 300),
    deliveryZone: orderInput.deliveryZone,
    paymentMethod: orderInput.paymentMethod,
    paymentSenderNumber: (orderInput.paymentSenderNumber || '').trim().slice(0, 30),
    paymentTrxId: (orderInput.paymentTrxId || '').trim().slice(0, 60),
    items: orderInput.items.slice(0, 30),
    subtotal: Math.max(0, Number(orderInput.subtotal) || 0),
    deliveryCharge: Math.max(0, Number(orderInput.deliveryCharge) || 0),
    discountAmount: Math.max(0, Number(orderInput.discountAmount) || 0),
    totalAmount: Math.max(0, Number(orderInput.totalAmount) || 0),
    status: 'pending' as OrderStatus,
    customerNote: (orderInput.customerNote || '').trim().slice(0, 300),
    adminNote: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(ref, payload);
    return {
      ...payload,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `orders/${id}`);
  }
}

export function subscribeAllOrdersAdmin(
  onData: (orders: Order[]) => void,
  onQuotaExceeded?: QuotaCallback
): Unsubscribe {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Order, 'id'>),
      }));
      writeCache('fbd_cache_admin_orders', list);
      onData(list);
    },
    (error) => {
      if (isQuotaExceededError(error)) {
        onQuotaExceeded?.();
        onData(readCache('fbd_cache_admin_orders', []));
        return;
      }
      handleFirestoreError(error, OperationType.LIST, 'orders');
    }
  );
}

export function subscribeMyOrders(
  uid: string,
  onData: (orders: Order[]) => void,
  onQuotaExceeded?: QuotaCallback
): Unsubscribe {
  const q = query(
    collection(db, 'orders'),
    where('customerUid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }))
      );
    },
    (error) => {
      if (isQuotaExceededError(error)) {
        onQuotaExceeded?.();
        onData([]);
        return;
      }
      handleFirestoreError(error, OperationType.LIST, 'orders');
    }
  );
}

export async function updateOrderStatusAdmin(
  orderId: string,
  status: OrderStatus,
  adminNote?: string
): Promise<void> {
  const ref = doc(db, 'orders', orderId);
  try {
    const updatePayload: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp(),
    };
    if (adminNote !== undefined) {
      updatePayload.adminNote = adminNote.trim().slice(0, 300);
    }
    await updateDoc(ref, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

export async function deleteOrderAdmin(orderId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
  }
}

// --- Customer Directory (Admin Only) ---
export function subscribeCustomersAdmin(
  onData: (customers: CustomerRecord[]) => void,
  onQuotaExceeded?: QuotaCallback
): Unsubscribe {
  const q = query(collection(db, 'customers'), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CustomerRecord, 'id'>),
      }));
      writeCache('fbd_cache_admin_customers', list);
      onData(list);
    },
    (error) => {
      if (isQuotaExceededError(error)) {
        onQuotaExceeded?.();
        onData(readCache('fbd_cache_admin_customers', []));
        return;
      }
      handleFirestoreError(error, OperationType.LIST, 'customers');
    }
  );
}

export async function saveCustomerAdmin(
  customer: Omit<CustomerRecord, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId || slugifyId(customer.phone, 'cust');
  const ref = doc(db, 'customers', id);
  try {
    const snap = existingId ? await getDoc(ref) : null;
    const createdAt =
      snap && snap.exists() ? snap.data().createdAt : serverTimestamp();
    await setDoc(ref, {
      name: customer.name.trim().slice(0, 100),
      phone: customer.phone.trim().slice(0, 25),
      email: customer.email.trim().slice(0, 120),
      address: customer.address.trim().slice(0, 300),
      notes: customer.notes.trim().slice(0, 500),
      createdAt,
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `customers/${id}`);
  }
}

export async function deleteCustomerAdmin(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'customers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `customers/${id}`);
  }
}

// --- Delegated Admins (Owner Only) ---
export async function checkIsAdminUser(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export function subscribeAdminsOwner(
  onData: (admins: AdminUser[]) => void,
  onQuotaExceeded?: QuotaCallback
): Unsubscribe {
  const q = query(collection(db, 'admins'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdminUser, 'id'>) }))
      );
    },
    (error) => {
      if (isQuotaExceededError(error)) {
        onQuotaExceeded?.();
        onData([]);
        return;
      }
      handleFirestoreError(error, OperationType.LIST, 'admins');
    }
  );
}

export async function addAdminUser(
  uid: string,
  email: string,
  name: string,
  addedByUid: string
): Promise<void> {
  const cleanUid = uid.trim();
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(cleanUid)) {
    throw new Error('সঠিক Firebase User UID দিন (শুধুমাত্র অক্ষর, সংখ্যা, _ বা -)।');
  }
  try {
    await setDoc(doc(db, 'admins', cleanUid), {
      email: email.trim().slice(0, 120),
      name: name.trim().slice(0, 80),
      role: 'admin',
      addedBy: addedByUid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `admins/${cleanUid}`);
  }
}

export async function removeAdminUser(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'admins', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `admins/${uid}`);
  }
}
