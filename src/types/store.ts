export type ThemeMode = 'light' | 'dark';
export type SurfaceStyle = 'crisp' | 'warm' | 'slate';
export type LayoutStyle = 'grid' | 'editorial' | 'compact';
export type FontStyle = 'modern' | 'editorial' | 'minimal';
export type BorderRadiusStyle = 'sharp' | 'rounded' | 'soft';
export type DeliveryZone = 'inside_dhaka' | 'outside_dhaka';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  profileImageUrl: string;
  ownerName: string;
  themeMode: ThemeMode;
  primaryColor: string;
  accentColor: string;
  surfaceStyle: SurfaceStyle;
  layoutStyle: LayoutStyle;
  fontStyle: FontStyle;
  borderRadius: BorderRadiusStyle;
  announcementEnabled: boolean;
  announcementText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroImageUrl: string;
  offerEnabled: boolean;
  offerTitle: string;
  offerSubtitle: string;
  offerBadgeText: string;
  offerDiscountCode: string;
  offerImageUrl: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  whatsappNumber: string;
  phoneNumber: string;
  contactEmail: string;
  storeAddress: string;
  websiteUrl: string;
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  freeDeliveryMinAmount: number;
  codEnabled: boolean;
  paymentInstructions: string;
  currencySymbol: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImageUrl: string;
  footerAbout: string;
  footerCopyright: string;
  updatedAt?: unknown;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  discountPrice: number;
  stock: number;
  sizes: string[];
  colors: string[];
  imageUrl: string;
  featured: boolean;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerUid: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  deliveryZone: DeliveryZone;
  paymentMethod: PaymentMethod;
  paymentSenderNumber: string;
  paymentTrxId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  customerNote: string;
  adminNote: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  showInHeader: boolean;
  showInFooter: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin';
  addedBy: string;
  createdAt?: unknown;
}

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  imageUrl: string;
  maxStock: number;
}

export const GENERATED_ASSETS = {
  hero: '/src/assets/images/hero_boutique_showcase_1794973601310.jpg',
  offer: '/src/assets/images/offer_banner_editorial_1794973601628.jpg',
  panjabi: '/src/assets/images/product_panjabi_emerald_1794973602059.jpg',
  jamdani: '/src/assets/images/product_jamdani_saree_1794973600586.jpg',
  leatherBag: '/src/assets/images/product_leather_tote_1794973601887.jpg',
  kurti: '/src/assets/images/product_kurti_linen_1794973603425.jpg',
  watch: '/src/assets/images/product_watch_classic_1794973603120.jpg',
  logo: '/src/assets/images/store_logo_emblem_1794973603345.jpg',
  profile: '/src/assets/images/owner_profile_portrait_1794973604469.jpg',
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'আভিজাত্য',
  tagline: 'হ্যান্ডক্রাফটেড ফ্যাশন ও আধুনিক লাইফস্টাইল স্টোর',
  logoUrl: GENERATED_ASSETS.logo,
  profileImageUrl: GENERATED_ASSETS.profile,
  ownerName: 'তাসনিম রহমান',
  themeMode: 'light',
  primaryColor: '#0D4F3C',
  accentColor: '#B45309',
  surfaceStyle: 'crisp',
  layoutStyle: 'grid',
  fontStyle: 'modern',
  borderRadius: 'rounded',
  announcementEnabled: true,
  announcementText: '৩,০০০ টাকার বেশি অর্ডারে সারাদেশে ফ্রি ডেলিভারি — প্রোমো কোড: SAVE10',
  heroTitle: 'ঐতিহ্য ও আধুনিকতার নিখুঁত সমন্বয়',
  heroSubtitle:
    'উন্নত মানের হ্যান্ডলুম পাঞ্জাবি, ঢাকাই জামদানি, ফুল-গ্রেইন লেদার ব্যাগ এবং নির্বাচিত লাইফস্টাইল কালেকশন। সরাসরি অর্ডার করুন বিকাশ, নগদ বা ক্যাশ অন ডেলিভারিতে।',
  heroCtaText: 'কালেকশন দেখুন',
  heroImageUrl: GENERATED_ASSETS.hero,
  offerEnabled: true,
  offerTitle: 'উৎসবের বিশেষ কালেকশনে ১০% ছাড়',
  offerSubtitle:
    'চেকআউটের সময় প্রোমো কোড ব্যবহার করে পান তাৎক্ষণিক ডিসকাউন্ট এবং ঢাকার ভেতরে দ্রুত ডেলিভারি সুবিধা।',
  offerBadgeText: 'সীমিত সময়ের অফার',
  offerDiscountCode: 'SAVE10',
  offerImageUrl: GENERATED_ASSETS.offer,
  bkashNumber: '01700-000000',
  nagadNumber: '01800-000000',
  rocketNumber: '01900-000000',
  whatsappNumber: '8801700000000',
  phoneNumber: '+880 1700-000000',
  contactEmail: 'cgfdffxd512@gmail.com',
  storeAddress: 'বাড়ি ২৪, রোড ৭, বনানী, ঢাকা-১২১৩',
  websiteUrl: typeof window !== 'undefined' ? window.location.origin : '',
  deliveryInsideDhaka: 70,
  deliveryOutsideDhaka: 130,
  freeDeliveryMinAmount: 3000,
  codEnabled: true,
  paymentInstructions:
    'বিকাশ বা নগদে "Send Money" / "Payment" করে আপনার প্রেরিত নম্বর ও Transaction ID নিচের ঘরে লিখুন। ক্যাশ অন ডেলিভারিতে পণ্য হাতে পেয়ে টাকা পরিশোধ করতে পারবেন।',
  currencySymbol: '৳',
  seoTitle: 'আভিজাত্য — প্রিমিয়াম লাইফস্টাইল ও ফ্যাশন স্টোর',
  seoDescription:
    'হ্যান্ডলুম পাঞ্জাবি, জামদানি শাড়ি, লেদার ব্যাগ এবং আধুনিক লাইফস্টাইল পণ্যের বিশ্বস্ত অনলাইন স্টোর। বিকাশ, নগদ ও ক্যাশ অন ডেলিভারিতে অর্ডার করুন।',
  seoKeywords: 'পাঞ্জাবি, জামদানি শাড়ি, লেদার ব্যাগ, অনলাইন শপ বাংলাদেশ, বিকাশ শপিং',
  ogImageUrl: GENERATED_ASSETS.hero,
  footerAbout:
    'নিজস্ব ডিজাইন ও দক্ষ কারিগরদের হাতের ছোঁয়ায় তৈরি প্রতিটি পণ্য। মান ও ক্রেতার আস্থাই আমাদের মূল অঙ্গীকার।',
  footerCopyright: '© ২০২৬ আভিজাত্য। সর্বস্বত্ব সংরক্ষিত।',
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-panjabi',
    name: 'পাঞ্জাবি ও কুর্তা',
    slug: 'panjabi-kurta',
    description: 'প্রিমিয়াম কটন ও লিনেন পাঞ্জাবি কালেকশন',
    imageUrl: GENERATED_ASSETS.panjabi,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-saree',
    name: 'জামদানি ও কুর্তি',
    slug: 'saree-kurti',
    description: 'হাতে বোনা ঐতিহ্যবাহী জামদানি ও আধুনিক কুর্তি',
    imageUrl: GENERATED_ASSETS.jamdani,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-leather',
    name: 'লেদার ব্যাগ',
    slug: 'leather-bags',
    description: 'ফুল-গ্রেইন লেদার টোট ও অফিস মেসেঞ্জার ব্যাগ',
    imageUrl: GENERATED_ASSETS.leatherBag,
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-accessories',
    name: 'ঘড়ি ও অ্যাক্সেসরিজ',
    slug: 'watches-accessories',
    description: 'মিনিমালিস্ট রিস্টওয়াচ ও দৈনন্দিন অনুষঙ্গ',
    imageUrl: GENERATED_ASSETS.watch,
    sortOrder: 4,
    isActive: true,
  },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-emerald-panjabi',
    name: 'এমেরাল্ড কটন এমব্রয়ডারি পাঞ্জাবি',
    sku: 'AVJ-PNJ-101',
    categoryId: 'cat-panjabi',
    categoryName: 'পাঞ্জাবি ও কুর্তা',
    description:
      '১০০% প্রিমিয়াম হেরিংবোন কটনে তৈরি গভীর সবুজ রঙের পাঞ্জাবি। কলার ও প্লেটে নিখুঁত টোনাল সূচিকর্ম রয়েছে যা যেকোনো উৎসব বা দৈনন্দিন পরিধানের জন্য আরামদায়ক।',
    price: 2650,
    discountPrice: 2290,
    stock: 24,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['বটল গ্রিন', 'আইভরি', 'নেভি ব্লু'],
    imageUrl: GENERATED_ASSETS.panjabi,
    featured: true,
    isActive: true,
  },
  {
    id: 'prod-ivory-jamdani',
    name: 'আইভরি গোল্ড ঢাকাই জামদানি শাড়ি',
    sku: 'AVJ-SAR-204',
    categoryId: 'cat-saree',
    categoryName: 'জামদানি ও কুর্তি',
    description:
      'নারায়ণগঞ্জের দক্ষ তাঁতিদের হাতে বোনা খাঁটি মসলিন-ব্লেন্ড জামদানি শাড়ি। সূক্ষ্ম সোনালি জরি পাড় ও বুটি কাজ বিয়ে ও উৎসবের জন্য অনন্য।',
    price: 8500,
    discountPrice: 7450,
    stock: 9,
    sizes: ['১২ হাত (স্ট্যান্ডার্ড)'],
    colors: ['আইভরি গোল্ড', 'প্যাস্টেল ক্রিম'],
    imageUrl: GENERATED_ASSETS.jamdani,
    featured: true,
    isActive: true,
  },
  {
    id: 'prod-espresso-tote',
    name: 'এস্প্রেসো ফুল-গ্রেইন লেদার টোট ব্যাগ',
    sku: 'AVJ-BAG-302',
    categoryId: 'cat-leather',
    categoryName: 'লেদার ব্যাগ',
    description:
      'আসল গরুর চামড়ায় তৈরি মজবুত ও মার্জিত টোট এবং ক্রসবডি ব্যাগ। ১৪ ইঞ্চি ল্যাপটপ, ডায়েরি ও প্রয়োজনীয় সামগ্রী রাখার জন্য আলাদা চেম্বার রয়েছে।',
    price: 4200,
    discountPrice: 3650,
    stock: 14,
    sizes: ['স্ট্যান্ডার্ড (১৪" ফিট)'],
    colors: ['ডার্ক এস্প্রেসো', 'ট্যান ব্রাউন', 'কালো'],
    imageUrl: GENERATED_ASSETS.leatherBag,
    featured: true,
    isActive: true,
  },
  {
    id: 'prod-sage-kurti',
    name: 'সেজ মিস্ট পিওর লিনেন টিউনিক কুর্তি',
    sku: 'AVJ-KRT-405',
    categoryId: 'cat-saree',
    categoryName: 'জামদানি ও কুর্তি',
    description:
      'গরম আবহাওয়ার জন্য আদর্শ ব্রেদেবল ইউরোপিয়ান লিনেন টিউনিক। আধুনিক মিনিমালিস্ট কাট ও ডাবল পকেট ডিজাইনে অফিস এবং ক্যাজুয়াল লুকে সমান মানানসই।',
    price: 1950,
    discountPrice: 0,
    stock: 30,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['সেজ গ্রিন', 'অফ-হোয়াইট'],
    imageUrl: GENERATED_ASSETS.kurti,
    featured: true,
    isActive: true,
  },
  {
    id: 'prod-classic-watch',
    name: 'ক্লাসিক ব্রাশড স্টিল ড্রেস ওয়াচ',
    sku: 'AVJ-WTC-501',
    categoryId: 'cat-accessories',
    categoryName: 'ঘড়ি ও অ্যাক্সেসরিজ',
    description:
      'জাপানিজ কোয়ার্টজ মুভমেন্ট ও স্ক্র্যাচ-রেজিস্ট্যান্ট মিনারেল গ্লাস সমৃদ্ধ স্লিম ড্রেস ঘড়ি। ইতালিয়ান লেদার স্ট্র্যাপ এবং ৫০ মিটার ওয়াটার রেজিস্ট্যান্স।',
    price: 3800,
    discountPrice: 3250,
    stock: 16,
    sizes: ['৪০ মিমি ডায়াল'],
    colors: ['সিলভার ব্ল্যাক', 'রোজ গোল্ড ব্রাউন'],
    imageUrl: GENERATED_ASSETS.watch,
    featured: true,
    isActive: true,
  },
];

export const DEFAULT_PAGES: CustomPage[] = [
  {
    id: 'page-about',
    title: 'আমাদের সম্পর্কে',
    slug: 'about',
    content:
      'আভিজাত্য একটি বাংলাদেশি আধুনিক লাইফস্টাইল ও হ্যান্ডক্রাফট ফ্যাশন ব্র্যান্ড। আমাদের প্রতিটি পোশাক ও লেদার সামগ্রী দেশীয় কারিগরদের নিপুণ হাতে তৈরি।\n\nআমরা বিশ্বাস করি ভালো মানের পণ্য সবার নাগালের মধ্যে থাকা উচিত। তাই সরাসরি কারিগরদের কাছ থেকে সংগ্রহ করে ক্রেতার হাতে পৌঁছে দেওয়া হয় সেরা মানের পণ্য।',
    showInHeader: true,
    showInFooter: true,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'page-shipping',
    title: 'ডেলিভারি ও রিটার্ন নীতি',
    slug: 'shipping-policy',
    content:
      '১. ঢাকার ভেতরে ডেলিভারি সময়: ২৪ থেকে ৪৮ ঘণ্টা।\n২. ঢাকার বাইরে ডেলিভারি সময়: ২ থেকে ৪ কার্যদিবস।\n৩. পণ্য হাতে পাওয়ার পর ডেলিভারি ম্যানের সামনেই চেক করে নেওয়ার সুযোগ রয়েছে।\n৪. কোনো ত্রুটি বা সাইজের সমস্যা থাকলে ৩ দিনের মধ্যে সহজ এক্সচেঞ্জ সুবিধা প্রযোজ্য।',
    showInHeader: false,
    showInFooter: true,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'page-contact',
    title: 'যোগাযোগ',
    slug: 'contact',
    content:
      'যেকোনো অর্ডার, কাস্টম সাইজ বা পাইকারি তথ্যের জন্য আমাদের সরাসরি কল অথবা WhatsApp করতে পারেন।\n\nশো-রুম খোলা থাকে: প্রতিদিন সকাল ১০টা থেকে রাত ৯টা পর্যন্ত।',
    showInHeader: true,
    showInFooter: true,
    sortOrder: 3,
    isActive: true,
  },
];
