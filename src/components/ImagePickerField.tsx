import { Image as ImageIcon, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { BUILTIN_GALLERY, compressImageFileToDataUrl } from '../lib/imageUtils';
import { SmartImage } from './SmartImage';

interface ImagePickerFieldProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  maxWidth?: number;
  helperText?: string;
  aspectClass?: string;
}

export function ImagePickerField({
  label,
  value,
  onChange,
  maxWidth = 900,
  helperText,
  aspectClass = 'w-24 h-20',
}: ImagePickerFieldProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const dataUrl = await compressImageFileToDataUrl(file, maxWidth);
      onChange(dataUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'ছবি আপলোড করতে সমস্যা হয়েছে।'
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
      </label>
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div
          className={`${aspectClass} shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800`}
        >
          <SmartImage
            src={value}
            alt={label}
            fallbackLabel="ছবি নেই"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 w-full space-y-2">
          <input
            type="text"
            value={value.startsWith('data:') ? '[আপলোড করা ছবি সংরক্ষিত]' : value}
            onChange={(e) => {
              const v = e.target.value;
              if (v !== '[আপলোড করা ছবি সংরক্ষিত]') {
                onChange(v);
              }
            }}
            placeholder="ছবির লিংক (URL) দিন অথবা নিচ থেকে আপলোড করুন"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'প্রসেস হচ্ছে...' : 'ডিভাইস থেকে আপলোড'}
            </button>
            <button
              type="button"
              onClick={() => setShowPresets((p) => !p)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              {showPresets ? 'গ্যালারি বন্ধ করুন' : 'স্টুডিও গ্যালারি'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline whitespace-nowrap"
              >
                মুছুন
              </button>
            )}
          </div>
          {helperText && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {helperText}
            </p>
          )}
          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}
        </div>
      </div>

      {showPresets && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          {BUILTIN_GALLERY.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => {
                onChange(preset.url);
                setShowPresets(false);
              }}
              className="group text-left border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:border-slate-900 dark:hover:border-slate-300 transition-colors"
            >
              <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                <SmartImage
                  src={preset.url}
                  alt={preset.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-1.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                {preset.label}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
