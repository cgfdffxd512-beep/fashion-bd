import { Edit3, FolderPlus, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { formatFirestoreUiError } from '../../lib/firebase';
import {
  removeCategory,
  removeProduct,
  saveCategory,
  saveProduct,
} from '../../lib/storeService';
import type { Category, Product } from '../../types/store';
import { ImagePickerField } from '../ImagePickerField';
import { SmartImage } from '../SmartImage';

interface CatalogManagerProps {
  mode: 'products' | 'categories';
  products: Product[];
  categories: Category[];
  currency: string;
}

export function CatalogManager({
  mode,
  products,
  categories,
  currency,
}: CatalogManagerProps) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Product Form Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | undefined>();
  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pCategoryId, setPCategoryId] = useState('');
  const [pPrice, setPPrice] = useState('0');
  const [pDiscountPrice, setPDiscountPrice] = useState('0');
  const [pStock, setPStock] = useState('10');
  const [pSizesText, setPSizesText] = useState('M, L, XL');
  const [pColorsText, setPColorsText] = useState('কালো, সাদা');
  const [pDescription, setPDescription] = useState('');
  const [pImageUrl, setPImageUrl] = useState('');
  const [pFeatured, setPFeatured] = useState(true);
  const [pIsActive, setPIsActive] = useState(true);

  // Category Form Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | undefined>();
  const [cName, setCName] = useState('');
  const [cSlug, setCSlug] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cImageUrl, setCImageUrl] = useState('');
  const [cSortOrder, setCSortOrder] = useState('1');
  const [cIsActive, setCIsActive] = useState(true);

  const openNewProduct = () => {
    setEditingProductId(undefined);
    setPName('');
    setPSku(`SKU-${String(Date.now()).slice(-4)}`);
    setPCategoryId(categories[0]?.id || 'cat-general');
    setPPrice('1500');
    setPDiscountPrice('0');
    setPStock('20');
    setPSizesText('M, L, XL');
    setPColorsText('কালো, নীল');
    setPDescription('');
    setPImageUrl('');
    setPFeatured(true);
    setPIsActive(true);
    setProductModalOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setPName(p.name);
    setPSku(p.sku);
    setPCategoryId(p.categoryId);
    setPPrice(String(p.price));
    setPDiscountPrice(String(p.discountPrice || 0));
    setPStock(String(p.stock));
    setPSizesText(p.sizes.join(', '));
    setPColorsText(p.colors.join(', '));
    setPDescription(p.description);
    setPImageUrl(p.imageUrl);
    setPFeatured(p.featured);
    setPIsActive(p.isActive);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;
    setSaving(true);
    setFeedback('');
    setErrorMsg('');
    try {
      const cat = categories.find((c) => c.id === pCategoryId);
      await saveProduct(
        {
          name: pName.trim(),
          sku: pSku.trim(),
          categoryId: pCategoryId || 'cat-general',
          categoryName: cat?.name || 'সাধারণ',
          description: pDescription.trim(),
          price: Number(pPrice) || 0,
          discountPrice: Number(pDiscountPrice) || 0,
          stock: Number(pStock) || 0,
          sizes: pSizesText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          colors: pColorsText
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean),
          imageUrl: pImageUrl,
          featured: pFeatured,
          isActive: pIsActive,
        },
        editingProductId
      );
      setProductModalOpen(false);
      setFeedback('পণ্যটি সফলভাবে সংরক্ষণ করা হয়েছে।');
    } catch (err) {
      setErrorMsg(formatFirestoreUiError(err, 'পণ্যটি সংরক্ষণ করা যায়নি।'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setSaving(true);
    setErrorMsg('');
    try {
      await removeProduct(id);
      setFeedback('পণ্যটি মুছে ফেলা হয়েছে।');
    } catch (err) {
      setErrorMsg(formatFirestoreUiError(err, 'পণ্যটি মুছে ফেলা যায়নি।'));
    } finally {
      setSaving(false);
    }
  };

  const openNewCategory = () => {
    setEditingCatId(undefined);
    setCName('');
    setCSlug('');
    setCDesc('');
    setCImageUrl('');
    setCSortOrder(String(categories.length + 1));
    setCIsActive(true);
    setErrorMsg('');
    setCatModalOpen(true);
  };

  const openEditCategory = (c: Category) => {
    setEditingCatId(c.id);
    setCName(c.name);
    setCSlug(c.slug);
    setCDesc(c.description);
    setCImageUrl(c.imageUrl);
    setCSortOrder(String(c.sortOrder));
    setCIsActive(c.isActive);
    setErrorMsg('');
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) return;
    setSaving(true);
    setFeedback('');
    setErrorMsg('');
    try {
      await saveCategory(
        {
          name: cName.trim(),
          slug: cSlug.trim() || cName.trim(),
          description: cDesc.trim(),
          imageUrl: cImageUrl,
          sortOrder: Number(cSortOrder) || 0,
          isActive: cIsActive,
        },
        editingCatId
      );
      setCatModalOpen(false);
      setFeedback('ক্যাটাগরি সফলভাবে সংরক্ষণ করা হয়েছে।');
    } catch (err) {
      setErrorMsg(formatFirestoreUiError(err, 'ক্যাটাগরি সংরক্ষণ করা যায়নি।'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setSaving(true);
    setErrorMsg('');
    try {
      await removeCategory(id);
      setFeedback('ক্যাটাগরি মুছে ফেলা হয়েছে।');
    } catch (err) {
      setErrorMsg(formatFirestoreUiError(err, 'ক্যাটাগরি মুছে ফেলা যায়নি।'));
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (catFilter !== 'all' && p.categoryId !== catFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
    );
  });

  if (mode === 'categories') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">ক্যাটাগরি ব্যবস্থাপনা</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              নতুন ক্যাটাগরি তৈরি, পরিবর্তন, ক্রম সাজানো ও ডিলিট করুন
            </p>
          </div>
          <button
            type="button"
            onClick={openNewCategory}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 whitespace-nowrap shrink-0"
          >
            <FolderPlus className="w-4 h-4" />
            নতুন ক্যাটাগরি যোগ করুন
          </button>
        </div>

        {feedback && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
            {feedback}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-medium">ক্যাটাগরি</th>
                <th className="py-3 px-4 font-medium">স্লাগ (Slug)</th>
                <th className="py-3 px-4 font-medium text-right">ক্রম</th>
                <th className="py-3 px-4 font-medium">অবস্থা</th>
                <th className="py-3 px-4 font-medium text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <SmartImage
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{cat.name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-xs">
                          {cat.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono-num text-xs text-slate-500">
                    {cat.slug}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {cat.sortOrder}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <span
                      className={
                        cat.isActive
                          ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                          : 'text-slate-400'
                      }
                    >
                      {cat.isActive ? 'সক্রিয়' : 'লুকানো'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditCategory(cat)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="সম্পাদনা"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                        title="ডিলিট"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Category Modal */}
        {catModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-semibold">
                  {editingCatId ? 'ক্যাটাগরি পরিবর্তন করুন' : 'নতুন ক্যাটাগরি'}
                </h3>
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form
                onSubmit={handleSaveCategory}
                className="p-6 overflow-y-auto space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium mb-1">
                    ক্যাটাগরির নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    placeholder="যেমন: শীতের পোশাক"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      ইংরেজি স্লাগ (URL ID)
                    </label>
                    <input
                      type="text"
                      value={cSlug}
                      onChange={(e) => setCSlug(e.target.value)}
                      placeholder="winter-wear"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      ক্রম নম্বর
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={cSortOrder}
                      onChange={(e) => setCSortOrder(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 tabular-nums"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">বিবরণ</label>
                  <input
                    type="text"
                    value={cDesc}
                    onChange={(e) => setCDesc(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <ImagePickerField
                  label="ক্যাটাগরির ছবি"
                  value={cImageUrl}
                  onChange={setCImageUrl}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={cIsActive}
                    onChange={(e) => setCIsActive(e.target.checked)}
                    className="rounded"
                  />
                  ওয়েবসাইটে প্রদর্শন করুন (Active)
                </label>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCatModalOpen(false)}
                    className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 text-sm font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  >
                    {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">পণ্য ব্যবস্থাপনা</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            নতুন পণ্য যোগ, দাম-ডিসকাউন্ট, সাইজ-কালার, স্টক ও তথ্য পরিবর্তন করুন
          </p>
        </div>
        <button
          type="button"
          onClick={openNewProduct}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          নতুন পণ্য যোগ করুন
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
          {feedback}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="পণ্যের নাম বা SKU দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="all">সব ক্যাটাগরি</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Data Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-3 px-4 font-medium">পণ্য</th>
              <th className="py-3 px-4 font-medium">ক্যাটাগরি</th>
              <th className="py-3 px-4 font-medium text-right">দাম</th>
              <th className="py-3 px-4 font-medium text-right">ডিসকাউন্ট</th>
              <th className="py-3 px-4 font-medium text-right">স্টক</th>
              <th className="py-3 px-4 font-medium">অবস্থা</th>
              <th className="py-3 px-4 font-medium text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  কোনো পণ্য পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <SmartImage
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate max-w-[220px]">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono-num">
                          {p.sku || p.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                    {p.categoryName}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-medium">
                    {currency}
                    {p.price.toLocaleString('en-US')}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-xs">
                    {p.discountPrice > 0 && p.discountPrice < p.price
                      ? `${currency}${p.discountPrice.toLocaleString('en-US')}`
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    <span
                      className={
                        p.stock <= 5
                          ? 'text-amber-600 dark:text-amber-400 font-semibold'
                          : ''
                      }
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <span
                      className={
                        p.isActive
                          ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                          : 'text-slate-400'
                      }
                    >
                      {p.isActive ? 'সক্রিয়' : 'লুকানো'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditProduct(p)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="সম্পাদনা"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleDeleteProduct(p.id)}
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

      {/* Product Add/Edit Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold">
                {editingProductId ? 'পণ্যের তথ্য পরিবর্তন করুন' : 'নতুন পণ্য যোগ করুন'}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={handleSaveProduct}
              className="p-6 overflow-y-auto space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1">
                    পণ্যের নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="যেমন: প্রিমিয়াম কটন পাঞ্জাবি"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">SKU কোড</label>
                  <input
                    type="text"
                    value={pSku}
                    onChange={(e) => setPSku(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono-num"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={pCategoryId}
                    onChange={(e) => setPCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    মূল দাম ({currency}) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    ডিসকাউন্ট দাম (০ = নেই)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={pDiscountPrice}
                    onChange={(e) => setPDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    স্টক পরিমাণ *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    সাইজ (কমা দিয়ে আলাদা করুন)
                  </label>
                  <input
                    type="text"
                    value={pSizesText}
                    onChange={(e) => setPSizesText(e.target.value)}
                    placeholder="S, M, L, XL"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    কালার (কমা দিয়ে আলাদা করুন)
                  </label>
                  <input
                    type="text"
                    value={pColorsText}
                    onChange={(e) => setPColorsText(e.target.value)}
                    placeholder="কালো, সাদা, সবুজ"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  পণ্যের বিবরণ
                </label>
                <textarea
                  rows={3}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <ImagePickerField
                label="পণ্যের ছবি"
                value={pImageUrl}
                onChange={setPImageUrl}
              />

              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={pIsActive}
                    onChange={(e) => setPIsActive(e.target.checked)}
                    className="rounded"
                  />
                  ওয়েবসাইটে প্রদর্শন করুন
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={pFeatured}
                    onChange={(e) => setPFeatured(e.target.checked)}
                    className="rounded"
                  />
                  ফিচার্ড পণ্য হিসেবে রাখুন
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
