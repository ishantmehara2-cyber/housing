import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { User, ShieldCheck, Check, Loader2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export const ProfileDashboardPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const res = await apiClient.patch('/users/me', {
        firstName,
        lastName,
        phone,
      });

      if (res.data.data) {
        setUser(res.data.data);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch {
      alert('Failed to update profile info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl">
      <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
        <div className="w-10 h-10 bg-brand-50 text-brand-primary rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-brand-primary" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Profile & Account Settings</h1>
          <p className="text-xs text-gray-500 font-medium">Update public contact information for your seller account</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full p-2.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl font-medium cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
          <span className="font-bold text-gray-700">Account Role</span>
          <span className="bg-brand-primary text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{user?.role}</span>
          </span>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-brand-primary hover:bg-brand-hover text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center space-x-1.5 transition shadow-sm"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Profile Changes</span>
          )}
        </button>
      </form>
    </div>
  );
};
