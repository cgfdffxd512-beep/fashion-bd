import type { User } from 'firebase/auth';
import { Edit3, FilePlus, ShieldCheck, Trash2, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { formatFirestoreUiError, OWNER_EMAIL } from '../../lib/firebase';
import {
  addAdminUser,
  removeAdminUser,
  removeCustomPage,
  saveCustomPage,
} from '../../lib/storeService';
import type { AdminUser, CustomPage } from '../../types/store';

interface PagesAndAccessManagerProps {
  mode: 'pages' | 'access';
  pages: CustomPage[];
  admins: AdminUser[];
  currentUser: User;
  isPrimaryOwner: boolean;
}

export function PagesAndAccessManager({
  mode,
  pages,
  admins,
  currentUser,
  isPrimaryOwner,
}: PagesAndAccessManagerProps) {
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Page Modal State
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | undefined>();
  const [pTitle, setPTitle] = useState('');
  const [pSlug, setPSlug] = useState('');
  const [pContent, setPContent] = useState('');
  const [pShowHeader, setPShowHeader] = useState(true);
  const [pShowFooter, setPShowFooter] = useState(true);
  const [pSortOrder, setPSortOrder] = useState('1');
  const [pIsActive, setPIsActive] = useState(true);

  // Admin Access Form State
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');

  const openNewPage = () => {
    setEditingPageId(undefined);
    setPTitle('');
    setPSlug('');
    setPContent('');
    setPShowHeader(true);
    setPShowFooter(true);
    setPSortOrder(String(pages.length + 1));
    setPIsActive(true);
    setPageModalOpen(true);
  };

  const openEditPage = (pg: CustomPage) => {
    setEditingPageId(pg.id);
    setPTitle(pg.title);
    setPSlug(pg.slug);
    setPContent(pg.content);
    setPShowHeader(pg.showInHeader);
    setPShowFooter(pg.showInFooter);
    setPSortOrder(String(pg.sortOrder));
    setPIsActive(pg.isActive);
    setPageModalOpen(true);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle.trim()) return;
    setSaving(true);
    setFeedback('');
    setErrorMsg('');
    try {
      await saveCustomPage(
        {
          title: pTitle.trim(),
          slug: pSlug.trim() || pTitle.trim(),
          content: pContent,
          showInHeader: pShowHeader,
          showInFooter: pShowFooter,
          sortOrder: Number(pSortOrder) || 0,
          isActive: pIsActive,
        },
        editingPageId
      );
      setPageModalOpen(false);
      setFeedback('পেজ ও মেনু সফলভাবে সংরক্ষিত হয়েছে।');
    } catch (err) {
      setErrorMsg(formatFirestoreUiError(err, 'পেজ সংরক্ষণ করা যায়নি।'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFeedback('');
    setSaving(true);
    try {
      await addAdminUser(
        newAdminUid,
        newAdminEmail,
        newAdminName,
        currentUser.uid
      );
      setNewAdminUid('');
      setNewAdminEmail('');
      setNewAdminName('');
      setFeedback('নতুন অ্যাডমিন অ্যাক্সেস যুক্ত করা হয়েছে।');
    } catch (err) {
      setErrorMsg(formatFirestoreUiError(err, 'অ্যাডমিন যুক্ত করা যায়নি।'));
    } finally {
      setSaving(false);
    }
  };

  if (mode === 'access') {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-xl font-bold">মালিকানা ও অ্যাডমিন অ্যাক্সেস</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ওয়েবসাইটের সম্পূর্ণ মালিকানা এবং নিরাপত্তা নিয়ন্ত্রণ
          </p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold">
                প্রধান স্বত্বাধিকারী (Verified Primary Owner)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                মালিকানার ইমেইল:{' '}
                <span className="font-mono-num font-semibold">{OWNER_EMAIL}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                আপনার বর্তমান সেশন: {currentUser.email} (UID:{' '}
                <span className="font-mono-num">{currentUser.uid}</span>)
              </p>
            </div>
          </div>
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

        {isPrimaryOwner && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 space-y-5">
            <div>
              <h3 className="text-base font-semibold">
                সহকারী অ্যাডমিন ব্যবস্থাপনা (ঐচ্ছিক)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                আপনি চাইলে আপনার টিমের কাউকে সীমিত অ্যাডমিন অ্যাক্সেস দিতে বা যেকোনো সময় বাতিল করতে পারেন।
              </p>
            </div>

            <form
              onSubmit={handleAddAdmin}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <input
                type="text"
                required
                value={newAdminUid}
                onChange={(e) => setNewAdminUid(e.target.value)}
                placeholder="Firebase User UID"
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono-num"
              />
              <input
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Email"
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="নাম"
                  className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 whitespace-nowrap shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  যোগ
                </button>
              </div>
            </form>

            {admins.length > 0 && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800 pt-2">
                {admins.map((adm) => (
                  <div
                    key={adm.id}
                    className="py-3 flex items-center justify-between gap-4 text-sm"
                  >
                    <div>
                      <div className="font-medium">{adm.name}</div>
                      <div className="text-xs text-slate-500">
                        {adm.email} ·{' '}
                        <span className="font-mono-num">{adm.id}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAdminUser(adm.id)}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      অ্যাক্সেস বাতিল
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">পেজ ও মেনু ব্যবস্থাপনা</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            হেডার ও ফুটারের মেনু লিংক এবং সব পেজের কনটেন্ট পরিবর্তন করুন
          </p>
        </div>
        <button
          type="button"
          onClick={openNewPage}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 whitespace-nowrap shrink-0"
        >
          <FilePlus className="w-4 h-4" />
          নতুন পেজ তৈরি করুন
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
          {feedback}
        </div>
      )}

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-3 px-4 font-medium">পেজের শিরোনাম</th>
              <th className="py-3 px-4 font-medium">স্লাগ</th>
              <th className="py-3 px-4 font-medium">মেনু অবস্থান</th>
              <th className="py-3 px-4 font-medium text-right">ক্রম</th>
              <th className="py-3 px-4 font-medium">অবস্থা</th>
              <th className="py-3 px-4 font-medium text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {pages.map((pg) => (
              <tr
                key={pg.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="py-3 px-4 font-medium">{pg.title}</td>
                <td className="py-3 px-4 font-mono-num text-xs text-slate-500">
                  /{pg.slug}
                </td>
                <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                  {[
                    pg.showInHeader ? 'হেডার মেনু' : '',
                    pg.showInFooter ? 'ফুটার মেনু' : '',
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'শুধু ডিরেক্ট লিংক'}
                </td>
                <td className="py-3 px-4 text-right tabular-nums">
                  {pg.sortOrder}
                </td>
                <td className="py-3 px-4 text-xs">
                  <span
                    className={
                      pg.isActive
                        ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                        : 'text-slate-400'
                    }
                  >
                    {pg.isActive ? 'সক্রিয়' : 'লুকানো'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditPage(pg)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCustomPage(pg.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
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

      {pageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold">
                {editingPageId ? 'পেজ সম্পাদনা' : 'নতুন পেজ তৈরি'}
              </h3>
              <button
                type="button"
                onClick={() => setPageModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={handleSavePage}
              className="p-6 overflow-y-auto space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1">
                    পেজ / মেনুর শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                    placeholder="যেমন: রিটার্ন পলিসি"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    ক্রম নম্বর
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={pSortOrder}
                    onChange={(e) => setPSortOrder(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 tabular-nums"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  ইংরেজি স্লাগ (URL)
                </label>
                <input
                  type="text"
                  value={pSlug}
                  onChange={(e) => setPSlug(e.target.value)}
                  placeholder="return-policy"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  পেজের বিস্তারিত লেখা (Content) *
                </label>
                <textarea
                  rows={7}
                  required
                  value={pContent}
                  onChange={(e) => setPContent(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div className="flex flex-wrap gap-5 pt-1">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={pShowHeader}
                    onChange={(e) => setPShowHeader(e.target.checked)}
                    className="rounded"
                  />
                  হেডার মেনুতে দেখান
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={pShowFooter}
                    onChange={(e) => setPShowFooter(e.target.checked)}
                    className="rounded"
                  />
                  ফুটার মেনুতে দেখান
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={pIsActive}
                    onChange={(e) => setPIsActive(e.target.checked)}
                    className="rounded"
                  />
                  সক্রিয় রাখুন
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPageModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
