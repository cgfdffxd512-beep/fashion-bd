import React from 'react';
import { isQuotaExceededError } from '../lib/firebase';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || 'অপ্রত্যাশিত একটি সমস্যা হয়েছে।',
    };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      let friendly = 'তথ্য লোড বা সংরক্ষণের সময় একটি ত্রুটি ঘটেছে।';
      if (isQuotaExceededError(this.state.message)) {
        friendly =
          'Firestore দৈনিক ফ্রি রিড/রাইট কোটা শেষ হয়ে গেছে। আগামীকাল কোটা পুনরায় চালু হবে অথবা ডাটাবেস আপগ্রেড করতে হবে।';
      } else if (this.state.message.includes('Missing or insufficient permissions')) {
        friendly =
          'এই কাজটি করার অনুমতি আপনার অ্যাকাউন্টে নেই। অনুগ্রহ করে সঠিক অ্যাডমিন অ্যাকাউন্ট দিয়ে লগইন করুন।';
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              সিস্টেম বার্তা
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {friendly}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity"
            >
              পেজ রিলোড করুন
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
