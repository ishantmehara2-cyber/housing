import React, { useState } from 'react';
import { Bookmark, X, Check, Loader2 } from 'lucide-react';
import { savedSearchService } from '../../services/savedSearchService';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCriteria: Record<string, unknown>;
}

export const SaveSearchModal: React.FC<SaveSearchModalProps> = ({
  isOpen,
  onClose,
  currentCriteria,
}) => {
  const [searchName, setSearchName] = useState('');
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await savedSearchService.createSavedSearch({
        name: searchName.trim() || undefined,
        searchCriteria: currentCriteria,
        enableAlerts,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1500);
    } catch {
      alert('Failed to save search criteria');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <Bookmark className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-bold text-gray-900">Save Search Criteria</h2>
        </div>

        {savedSuccess ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Search saved successfully!</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Search Name (Optional)
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g. 2 BHK Apartment under ₹80L"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>

            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={enableAlerts}
                onChange={(e) => setEnableAlerts(e.target.checked)}
                className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <span>Receive email alerts for new matching properties</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Search...</span>
                </>
              ) : (
                <span>Save Search</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
