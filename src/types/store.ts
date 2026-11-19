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
  siteName: 'Fashion BD',
  tagline: 'বাংলাদেশ ফ্যাশন কালেকশন',
  logoUrl: GENERATED_ASSETS.logo,
  profileImageUrl: GENERATED_ASSETS.profile,
  ownerName: 'তাসনিম রহমান',
  themeMode: 'light',
  primaryColor: '#F97316',
  accentColor: '#DB2777',
  surfaceStyle: 'slate',
  layoutStyle: 'grid',
  fontStyle: 'modern',
  borderRadius: 'soft',
  announcementEnabled: false,
  announcementText: '৩,০০০ টাকার বেশি অর্ডারে সারাদেশে ফ্রি ডেলিভারি — প্রোমো কোড: SAVE10',
  heroTitle: 'বাংলাদেশ ফ্যাশন কালেকশন',
  heroSubtitle:
    'জেন্টস উইন্টার, লেডিস উইন্টার, টি-শার্ট এবং কিডস কালেকশন। বিকাশ, নগদ ও ক্যাশ অন ডেলিভারিতে অর্ডার করুন।',
  heroCtaText: 'সব পণ্য দেখুন',
  heroImageUrl: GENERATED_ASSETS.hero,
  offerEnabled: true,
  offerTitle: 'শীতকালীন ও উৎসব কালেকশনে ১০% ছাড়',
  offerSubtitle:
    'চেকআউটের সময় প্রোমো কোড SAVE10 ব্যবহার করে পান তাৎক্ষণিক ডিসকাউন্ট এবং দ্রুত হোম ডেলিভারি।',
  offerBadgeText: 'বিশেষ অফার',
  offerDiscountCode: 'SAVE10',
  offerImageUrl: GENERATED_ASSETS.offer,
  bkashNumber: '01700-000000',
  nagadNumber: '01800-000000',
  rocketNumber: '01900-000000',
  whatsappNumber: '8801700000000',
  phoneNumber: '+880 1700-000000',
  contactEmail: 'cgfdffxd512@gmail.com',
  storeAddress: 'বাড়ি ২৪, রোড ৭, বনানী, ঢাকা-১২১৩',
  websiteUrl:
    'https://ais-pre-zpxvpxlo6aoctkipuzbf5e-812877704657.asia-northeast1.run.app/',
  deliveryInsideDhaka: 70,
  deliveryOutsideDhaka: 130,
  freeDeliveryMinAmount: 3000,
  codEnabled: true,
  paymentInstructions:
    'বিকাশ বা নগদে "Send Money" / "Payment" করে আপনার প্রেরিত নম্বর ও Transaction ID নিচের ঘরে লিখুন। ক্যাশ অন ডেলিভারিতে পণ্য হাতে পেয়ে টাকা পরিশোধ করতে পারবেন।',
  currencySymbol: '৳',
  seoTitle: 'Fashion BD | Online Shopping Bangladesh',
  seoDescription:
    'Fashion BD — বাংলাদেশের বিশ্বস্ত অনলাইন ফ্যাশন ও লাইফস্টাইল শপ। প্রিমিয়াম হুডি, জ্যাকেট, টি-শার্ট, লেডিস ও কিডস কালেকশন অর্ডার করুন।',
  seoKeywords: 'Fashion BD, Online Shopping Bangladesh, হুডি, জ্যাকেট, টি-শার্ট, উইন্টার কালেকশন',
  ogImageUrl: GENERATED_ASSETS.logo,
  footerAbout:
    'Fashion BD — সাশ্রয়ী মূল্যে সেরা মানের দেশীয় ও এক্সপোর্ট কোয়ালিটি পোশাকের বিশ্বস্ত অনলাইন শপ।',
  footerCopyright: '© ২০২৬ Fashion BD। সর্বস্বত্ব সংরক্ষিত।',
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-gents-winter',
    name: 'জেন্টস উইন্টার',
    slug: 'gents-winter',
    description: '৪টি সাব-ক্যাটাগরি',
    imageUrl: GENERATED_ASSETS.panjabi,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-ladies-winter',
    name: 'লেডিস উইন্টার',
    slug: 'ladies-winter',
    description: '৪টি সাব-ক্যাটাগরি',
    imageUrl: GENERATED_ASSETS.kurti,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-tshirt',
    name: 'টি-শার্ট কালেকশন',
    slug: 'tshirt-collection',
    description: '৪টি সাব-ক্যাটাগরি',
    imageUrl: GENERATED_ASSETS.offer,
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-kids-baby',
    name: 'কিডস ও বেবি',
    slug: 'kids-baby',
    description: '৪টি সাব-ক্যাটাগরি',
    imageUrl: GENERATED_ASSETS.jamdani,
    sortOrder: 4,
    isActive: true,
  },
];

export const DEFAULT_PRODUCTS: Product[] = [
  // জেন্টস উইন্টার
  {
    id: 'prod-solid-hoodie',
    name: 'সলিড হুডি',
    sku: 'FBD-GW-439',
    categoryId: 'cat-gents-winter',
    categoryName: 'জেন্টস উইন্টার',
    description:
      '৩২০ জিএসএম প্রিমিয়াম ফ্লিস কটনে তৈরি সলিড হুডি। শীতের জন্য আরামদায়ক ও স্টাইলিশ ফিট।',
    price: 1150,
    discountPrice: 890,
    stock: 439,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['মেরুন', 'কালো', 'অলিভ'],
    imageUrl: GENERATED_ASSETS.panjabi,
    featured: true,
    isActive: true,
  },
  {
    id: 'prod-contrast-hoodie',
    name: 'কনট্রাস্ট হুডি',
    sku: 'FBD-GW-140',
    categoryId: 'cat-gents-winter',
    categoryName: 'জেন্টস উইন্টার',
    description:
      'ডাবল-টোন কনট্রাস্ট ডিজাইনের হেভি কটন হুডি। প্রতিদিনের ক্যাজুয়াল লুকের জন্য আদর্শ।',
    price: 1290,
    discountPrice: 990,
    stock: 140,
    sizes: ['M', 'L', 'XL'],
    colors: ['ব্রাউন', 'নেভি ব্লু'],
    imageUrl: GENERATED_ASSETS.offer,
    featured: true,
    isActive: true,
  },
  {
    id: 'prod-padding-jacket',
    name: 'প্যাডিং জ্যাকেট',
    sku: 'FBD-GW-078',
    categoryId: 'cat-gents-winter',
    categoryName: 'জেন্টস উইন্টার',
    description:
      'ওয়াটার-রেজিস্ট্যান্ট উইন্ডপ্রুফ প্যাডিং জ্যাকেট। প্রচণ্ড শীতেও শরীর উষ্ণ রাখে।',
    price: 2200,
    discountPrice: 1750,
    stock: 78,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['অলিভ গ্রিন', 'কালো'],
    imageUrl: GENERATED_ASSETS.leatherBag,
    featured: true,
    isActive: true,
  },
  {
    id: 'prod-varsity-jacket',
    name: 'ভার্সিটি জ্যাকেট',
    sku: 'FBD-GW-012',
    categoryId: 'cat-gents-winter',
    categoryName: 'জেন্টস উইন্টার',
    description:
      'এক্সপোর্ট কোয়ালিটির প্রিমিয়াম ভার্সিটি জ্যাকেট। সফট ইনার লাইনিং ও টেকসই স্ন্যাপ বাটন।',
    price: 2450,
    discountPrice: 1950,
    stock: 12,
    sizes: ['M', 'L', 'XL'],
    colors: ['পার্পল ব্ল্যাক', 'রয়্যাল ব্লু'],
    imageUrl: GENERATED_ASSETS.watch,
    featured: true,
    isActive: true,
  },

  // লেডিস উইন্টার
  {
    id: 'prod-ladies-hoodie',
    name: 'লেডিস হুডি',
    sku: 'FBD-LW-131',
    categoryId: 'cat-ladies-winter',
    categoryName: 'লেডিস উইন্টার',
    description:
      'সফট ব্রাশড ফ্লিসে তৈরি স্টাইলিশ লেডিস হুডি। শীতের সকালে বা সন্ধ্যায় আরামদায়ক পরিধান।',
    price: 1100,
    discountPrice: 850,
    stock: 131,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['রোজ পিঙ্ক', 'ল্যাভেন্ডার', 'অফ-হোয়াইট'],
    imageUrl: GENERATED_ASSETS.kurti,
    featured: true,
    isActive: true,
  },
  {
    id: 'prod-ladies-jacket',
    name: 'লেডিস জ্যাকেট',
    sku: 'FBD-LW-024',
    categoryId: 'cat-ladies-winter',
    categoryName: 'লেডিস উইন্টার',
    description:
      'মডার্ন টেইলার্ড ফিট লেডিস উইন্টার জ্যাকেট। হালকা ওজন ও উষ্ণ ইনসুলেশন।',
    price: 2150,
    discountPrice: 1690,
    stock: 24,
    sizes: ['S', 'M', 'L'],
    colors: ['ইন্ডিগো', 'চারকোল'],
    imageUrl: GENERATED_ASSETS.hero,
    featured: true,
    isActive: true,
  },
  {
    id: 'prod-sweater-cardigan',
    name: 'সোয়েটার কার্ডিগান',
    sku: 'FBD-LW-056',
    categoryId: 'cat-ladies-winter',
    categoryName: 'লেডিস উইন্টার',
    description:
      'ফাইন নিটেড সফট উল-ব্লেন্ড কার্ডিগান। শাড়ি বা কুর্তির সাথে সমান মানানসই।',
    price: 1450,
    discountPrice: 1190,
    stock: 56,
    sizes: ['M', 'L', 'XL'],
    colors: ['ক্যারামেল', 'ক্রিম'],
    imageUrl: GENERATED_ASSETS.jamdani,
    featured: true,
    isActive: true,
  },
  {
    id: 'prod-skirt-tops',
    name: 'স্কার্ট ও টপস',
    sku: 'FBD-LW-019',
    categoryId: 'cat-ladies-winter',
    categoryName: 'লেডিস উইন্টার',
    description:
      'এলিগ্যান্ট ম্যাচিং উইন্টার টপস ও স্কার্ট সেট। পার্টি ও ক্যাজুয়াল আউটিংয়ের জন্য সেরা।',
    price: 1850,
    discountPrice: 1490,
    stock: 19,
    sizes: ['S', 'M', 'L'],
    colors: ['বারগান্ডি', 'ব্ল্যাক'],
    imageUrl: GENERATED_ASSETS.kurti,
    featured: true,
    isActive: true,
  },

  // টি-শার্ট কালেকশন
  {
    id: 'prod-drop-shoulder',
    name: 'ড্রপ শোল্ডার টি-শার্ট',
    sku: 'FBD-TS-090',
    categoryId: 'cat-tshirt',
    categoryName: 'টি-শার্ট কালেকশন',
    description:
      '২২০ জিএসএম সিঙ্গেল জার্সি ১০০% কটনে তৈরি ওভারসাইজড ড্রপ শোল্ডার টি-শার্ট।',
    price: 650,
    discountPrice: 490,
    stock: 90,
    sizes: ['M', 'L', 'XL'],
    colors: ['নেভি', 'সাদা', 'কালো'],
    imageUrl: GENERATED_ASSETS.offer,
    featured: false,
    isActive: true,
  },
  {
    id: 'prod-polo-tshirt',
    name: 'পিকে পোলো টি-শার্ট',
    sku: 'FBD-TS-065',
    categoryId: 'cat-tshirt',
    categoryName: 'টি-শার্ট কালেকশন',
    description:
      'ক্লাসিক পিকে কটন পোলো শার্ট। অফিস ও স্মার্ট-ক্যাজুয়াল পরিধানের জন্য আদর্শ।',
    price: 850,
    discountPrice: 690,
    stock: 65,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['ফরেস্ট গ্রিন', 'অ্যাশ'],
    imageUrl: GENERATED_ASSETS.panjabi,
    featured: false,
    isActive: true,
  },
  {
    id: 'prod-solid-tee',
    name: 'প্রিমিয়াম সলিড টি-শার্ট',
    sku: 'FBD-TS-040',
    categoryId: 'cat-tshirt',
    categoryName: 'টি-শার্ট কালেকশন',
    description:
      'বায়ো-ওয়াশড কম্বেড কটন টি-শার্ট। রং ওঠা বা শ্রিঙ্ক হওয়ার ভয় নেই।',
    price: 550,
    discountPrice: 420,
    stock: 40,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['সাদা', 'চারকোল'],
    imageUrl: GENERATED_ASSETS.hero,
    featured: false,
    isActive: true,
  },
  {
    id: 'prod-printed-tee',
    name: 'গ্রাফিক প্রিন্টেড টি-শার্ট',
    sku: 'FBD-TS-025',
    categoryId: 'cat-tshirt',
    categoryName: 'টি-শার্ট কালেকশন',
    description:
      'হাই-ডেনসিটি প্লাস্টিসল প্রিন্টসহ আধুনিক ডিজাইনের কটন টি-শার্ট।',
    price: 690,
    discountPrice: 540,
    stock: 25,
    sizes: ['M', 'L', 'XL'],
    colors: ['ব্ল্যাক', 'রয়্যাল ব্লু'],
    imageUrl: GENERATED_ASSETS.watch,
    featured: false,
    isActive: true,
  },

  // কিডস ও বেবি
  {
    id: 'prod-kids-hoodie-set',
    name: 'কিডস হুডি সেট',
    sku: 'FBD-KB-045',
    categoryId: 'cat-kids-baby',
    categoryName: 'কিডস ও বেবি',
    description:
      'বাচ্চাদের কোমল ত্বকের উপযোগী ১০০% অর্গানিক কটন হুডি ও ট্রাউজার সেট।',
    price: 950,
    discountPrice: 780,
    stock: 45,
    sizes: ['২-৩ বছর', '৪-৫ বছর', '৬-৭ বছর'],
    colors: ['মিন্ট গ্রিন', 'স্কাই ব্লু'],
    imageUrl: GENERATED_ASSETS.kurti,
    featured: false,
    isActive: true,
  },
  {
    id: 'prod-baby-sweater',
    name: 'বেবি নিট সোয়েটার',
    sku: 'FBD-KB-032',
    categoryId: 'cat-kids-baby',
    categoryName: 'কিডস ও বেবি',
    description:
      'হালকা ও সুপার-সফট বেবি সোয়েটার, শীতের বাতাস থেকে সুরক্ষা দেয়।',
    price: 890,
    discountPrice: 690,
    stock: 32,
    sizes: ['১-২ বছর', '৩-৪ বছর'],
    colors: ['হলুদ', 'পিঙ্ক'],
    imageUrl: GENERATED_ASSETS.jamdani,
    featured: false,
    isActive: true,
  },
  {
    id: 'prod-kids-jacket',
    name: 'বয়েজ উইন্টার জ্যাকেট',
    sku: 'FBD-KB-028',
    categoryId: 'cat-kids-baby',
    categoryName: 'কিডস ও বেবি',
    description:
      'হালকা প্যাডিংসহ বয়েজ জ্যাকেট, স্কুল ও ভ্রমণের জন্য উপযোগী।',
    price: 1350,
    discountPrice: 1090,
    stock: 28,
    sizes: ['৪-৫ বছর', '৬-৮ বছর', '৯-১০ বছর'],
    colors: ['নেভি', 'অলিভ'],
    imageUrl: GENERATED_ASSETS.leatherBag,
    featured: false,
    isActive: true,
  },
  {
    id: 'prod-kids-cotton-set',
    name: 'কিডস কটন কমফোর্ট সেট',
    sku: 'FBD-KB-050',
    categoryId: 'cat-kids-baby',
    categoryName: 'কিডস ও বেবি',
    description:
      'সারা বছর পরার উপযোগী ব্রেদেবল কটন টি-শার্ট ও শর্টস/প্যান্ট সেট।',
    price: 750,
    discountPrice: 590,
    stock: 50,
    sizes: ['২-৩ বছর', '৪-৫ বছর', '৬-৭ বছর'],
    colors: ['পেস্টেল ব্লু', 'ক্রিম'],
    imageUrl: GENERATED_ASSETS.hero,
    featured: false,
    isActive: true,
  },
];

export const DEFAULT_PAGES: CustomPage[] = [
  {
    id: 'page-about',
    title: 'আমাদের সম্পর্কে',
    slug: 'about',
    content:
      'Fashion BD বাংলাদেশের একটি বিশ্বস্ত অনলাইন ফ্যাশন ও লাইফস্টাইল স্টোর। আমাদের লক্ষ্য সাশ্রয়ী মূল্যে সেরা মানের শীতকালীন পোশাক, টি-শার্ট ও ফ্যাশন পণ্য সবার কাছে পৌঁছে দেওয়া।\n\nদেশের যেকোনো প্রান্ত থেকে ঘরে বসেই বিকাশ, নগদ ও ক্যাশ অন ডেলিভারিতে অর্ডার করতে পারবেন।',
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
      'যেকোনো অর্ডার, সাইজ তথ্য বা পাইকারি ক্রয়ের জন্য সরাসরি কল অথবা WhatsApp করুন।\n\nসাপোর্ট সময়: প্রতিদিন সকাল ১০টা থেকে রাত ১০টা পর্যন্ত।',
    showInHeader: true,
    showInFooter: true,
    sortOrder: 3,
    isActive: true,
  },
];
