import { GENERATED_ASSETS } from '../types/store';

export interface GalleryPreset {
  label: string;
  url: string;
}

export const BUILTIN_GALLERY: GalleryPreset[] = [
  { label: 'স্টোর লোগো', url: GENERATED_ASSETS.logo },
  { label: 'প্রোফাইল ছবি', url: GENERATED_ASSETS.profile },
  { label: 'হিরো ব্যানার', url: GENERATED_ASSETS.hero },
  { label: 'অফার ব্যানার', url: GENERATED_ASSETS.offer },
  { label: 'পাঞ্জাবি', url: GENERATED_ASSETS.panjabi },
  { label: 'জামদানি শাড়ি', url: GENERATED_ASSETS.jamdani },
  { label: 'লেদার ব্যাগ', url: GENERATED_ASSETS.leatherBag },
  { label: 'লিনেন কুর্তি', url: GENERATED_ASSETS.kurti },
  { label: 'রিস্টওয়াচ', url: GENERATED_ASSETS.watch },
];

export async function compressImageFileToDataUrl(
  file: File,
  maxWidth = 900,
  maxBytes = 240000
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ছবিটি পড়া সম্ভব হয়নি।'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('সঠিক ইমেজ ফাইল নির্বাচন করুন।'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('ক্যানভাস তৈরি করা যায়নি।'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.82;
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        while (dataUrl.length > maxBytes && quality > 0.35) {
          quality -= 0.12;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (dataUrl.length > 340000) {
          reject(
            new Error(
              'ছবির সাইজ অনেক বড়। অনুগ্রহ করে ছোট ছবি আপলোড করুন বা ইমেজ লিংক দিন।'
            )
          );
          return;
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
