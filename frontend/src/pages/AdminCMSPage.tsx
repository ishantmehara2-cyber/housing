/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { FileText, Save, Loader2, CheckCircle2 } from 'lucide-react';

export const AdminCMSPage: React.FC = () => {
  const [contents, setContents] = useState<unknown[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchCMS = useCallback(async () => {
    try {
      const data = await adminService.getCMSContents();
      setContents(data);
      if (data.length > 0 && !selectedSlug) {
        const item = data[0] as any;
        setSelectedSlug(item.slug);
        setTitle(item.title);
        setContent(item.content);
        setMetaTitle(item.metaTitle || '');
        setMetaDesc(item.metaDesc || '');
      }
    } catch {
      // Error
    }
  }, [selectedSlug]);

  useEffect(() => {
    fetchCMS();
  }, [fetchCMS]);

  const handleSelectContent = (item: any) => {
    setSelectedSlug(item.slug);
    setTitle(item.title);
    setContent(item.content);
    setMetaTitle(item.metaTitle || '');
    setMetaDesc(item.metaDesc || '');
    setSuccessMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg(null);
      await adminService.upsertCMSContent({
        slug: selectedSlug,
        title,
        content,
        metaTitle: metaTitle || undefined,
        metaDesc: metaDesc || undefined,
      });
      setSuccessMsg('Content saved successfully');
      fetchCMS();
    } catch {
      // Error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <FileText className="w-6 h-6 text-brand-primary" />
          <span>Website Content & CMS Management</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage legal policies, about us details, and SEO metadata across the platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Slugs List */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-2">
          <h2 className="text-xs font-extrabold uppercase text-gray-400 mb-2">CMS Documents</h2>
          {contents.map((item: any) => (
            <button
              key={item.id}
              onClick={() => handleSelectContent(item)}
              className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition ${
                selectedSlug === item.slug
                  ? 'border-brand-primary bg-brand-50 text-brand-primary'
                  : 'border-gray-100 hover:border-gray-200 text-gray-700 bg-gray-50'
              }`}
            >
              <p>{item.title}</p>
              <p className="text-[10px] text-gray-400 font-normal">/{item.slug}</p>
            </button>
          ))}
        </div>

        {/* Right Column: Editor */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Page Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Meta Title (SEO)</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Page Body Content</label>
              <textarea
                rows={8}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-brand-primary hover:bg-brand-hover text-white px-6 py-2.5 rounded-xl font-bold text-xs transition inline-flex items-center space-x-2 shadow-md"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Content Changes</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
