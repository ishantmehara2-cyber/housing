/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { Settings, Save, Loader2 } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemSettings();
      setSettings(data);
      const valMap: Record<string, string> = {};
      data.forEach((s: any) => {
        valMap[s.key] = s.value;
      });
      setEditValues(valMap);
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveSetting = async (key: string) => {
    try {
      setSavingKey(key);
      await adminService.updateSystemSetting(key, editValues[key] || '');
      fetchSettings();
    } catch {
      // Error
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Settings className="w-6 h-6 text-brand-primary" />
          <span>System Settings & Operational Defaults</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Configure global application parameters, support contacts, and default rules</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100 p-6 space-y-4">
        {loading ? (
          <div className="text-center text-gray-400 text-sm">Loading system settings...</div>
        ) : (
          settings.map((s) => (
            <div key={s.id} className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-gray-700">{s.key.replace(/_/g, ' ')}</p>
                <p className="text-[10px] text-gray-400 font-mono">{s.key}</p>
              </div>

              <div className="flex items-center space-x-2 sm:w-1/2">
                <input
                  type="text"
                  value={editValues[s.key] || ''}
                  onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                  className="flex-grow px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <button
                  onClick={() => handleSaveSetting(s.key)}
                  disabled={savingKey === s.key}
                  className="bg-brand-primary hover:bg-brand-hover text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                >
                  {savingKey === s.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
