import { MessageCircle, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import type { Product, SiteSettings } from '../types/store';
import { SmartImage } from './SmartImage';

interface ProductDetailModalProps {
  product: Product | null;
  settings: SiteSettings;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    size: string,
    color: string,
    openCart: boolean
  ) => void;
}

export function ProductDetailModal({
  product,
  settings,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(
    product?.colors?.[0] || ''
  );
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const currency = settings.currencySymbol || '৳';
  const hasDiscount =
    product.discountPrice > 0 && product.discountPrice < product.price;
  const effectivePrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const outOfStock = product.stock <= 0;

  const activeSize = selectedSize || product.sizes[0] || '';
  const activeColor = selectedColor || product.colors[0] || '';

  const whatsappClean = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappText = encodeURIComponent(
    `আসসালামু আলাইকুম, আমি "${product.name}" (SKU: ${product.sku || product.id}) অর্ডার করতে চাই। সাইজ: ${activeSize || 'N/A'}, কালার: ${activeColor || 'N/A'}, পরিমাণ: ${quantity}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[2px] p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col md:flex-row">
        <button
          type="button"
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Image */}
        <div className="md:w-1/2 bg-slate-100 dark:bg-slate-800 aspect-[4/3] md:aspect-auto">
          <SmartImage
            src={product.imageUrl}
            alt={product.name}
            fallbackLabel={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Purchase Module */}
        <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>{product.categoryName}</span>
              {product.sku && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num">{product.sku}</span>
                </>
              )}
            </div>

            <h2 className="text-2xl font-bold leading-snug">{product.name}</h2>

            <div className="flex items-baseline gap-3">
              <span
                className="text-2xl font-bold tabular-nums"
                style={{ color: settings.primaryColor }}
              >
                {currency}
                {effectivePrice.toLocaleString('en-US')}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-slate-400 line-through tabular-nums">
                    {currency}
                    {product.price.toLocaleString('en-US')}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {discountPercent}% ছাড়
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  সাইজ নির্বাচন করুন
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const active = activeSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          active
                            ? 'text-white border-transparent'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                        }`}
                        style={
                          active ? { backgroundColor: settings.primaryColor } : undefined
                        }
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="space-y-2">
                <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  কালার নির্বাচন করুন
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const active = activeColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          active
                            ? 'text-white border-transparent'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                        }`}
                        style={
                          active ? { backgroundColor: settings.primaryColor } : undefined
                        }
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity & Stock */}
            <div className="flex items-center justify-between pt-2">
              <div className="inline-flex items-center border border-slate-200 dark:border-slate-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-medium tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(Math.max(1, product.stock), q + 1))
                  }
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span
                className={`text-xs font-medium ${
                  outOfStock
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {outOfStock ? 'স্টক শেষ' : `স্টকে আছে (${product.stock} টি)`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={outOfStock}
                onClick={() => {
                  onAddToCart(product, quantity, activeSize, activeColor, false);
                  onClose();
                }}
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                ব্যাগে রাখুন
              </button>
              <button
                type="button"
                disabled={outOfStock}
                onClick={() => {
                  onAddToCart(product, quantity, activeSize, activeColor, true);
                  onClose();
                }}
                className="py-2.5 px-4 text-sm font-semibold text-white rounded-lg hover:opacity-95 disabled:opacity-50"
                style={{ backgroundColor: settings.primaryColor }}
              >
                এখনই অর্ডার করুন
              </button>
            </div>
            {whatsappClean && (
              <a
                href={`https://wa.me/${whatsappClean}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium rounded-lg border border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp-এ সরাসরি অর্ডার করুন
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
