/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

export const AdminFeatureFlagsPage: React.FC = () => {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getFeatureFlags();
      setFlags(data);
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const handleToggle = async (flag: any) => {
    try {
      setTogglingId(flag.id);
      await adminService.toggleFeatureFlag(flag.id, !flag.isEnabled);
      fetchFlags();
    } catch {
      // Error
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <ToggleLeft className="w-6 h-6 text-brand-primary" />
          <span>Feature Flags & Rollout Control</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Super Admin controls for dynamically enabling or disabling platform subsystems</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading feature flags...</div>
        ) : (
          flags.map((flag) => (
            <div key={flag.id} className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-sm text-gray-900">{flag.key}</p>
                <p className="text-xs text-gray-500">{flag.description || 'System feature flag'}</p>
              </div>

              <button
                onClick={() => handleToggle(flag)}
                disabled={togglingId === flag.id}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                  flag.isEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {togglingId === flag.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : flag.isEnabled ? (
                  <>
                    <ToggleRight className="w-6 h-6 text-emerald-600" />
                    <span>ENABLED</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                    <span>DISABLED</span>
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
