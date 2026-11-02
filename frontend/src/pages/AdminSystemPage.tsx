/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { Activity, Database, Server, RefreshCw, CheckCircle2 } from 'lucide-react';

export const AdminSystemPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemHealth();
      setHealth(data);
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Activity className="w-6 h-6 text-brand-primary" />
            <span>System Operational Health & Probes</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Real-time status monitor for database connectivity, API uptime, and runtime environment</p>
        </div>

        <button
          onClick={fetchHealth}
          className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition inline-flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Health</span>
        </button>
      </div>

      {loading || !health ? (
        <div className="p-8 bg-white rounded-2xl border text-center text-gray-400 text-sm">Checking system health...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Platform Status</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 uppercase">{health.status}</p>
            <p className="text-xs text-gray-400">Environment: {health.environment}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-2">
            <div className="flex items-center space-x-2 text-brand-primary font-bold text-sm">
              <Database className="w-5 h-5" />
              <span>MySQL Database</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 uppercase">{health.database}</p>
            <p className="text-xs text-gray-400">Connection: Active</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-2">
            <div className="flex items-center space-x-2 text-gray-700 font-bold text-sm">
              <Server className="w-5 h-5" />
              <span>Runtime & Uptime</span>
            </div>
            <p className="text-xl font-extrabold text-gray-900">{health.nodeVersion}</p>
            <p className="text-xs text-gray-400">Uptime: {Math.floor(health.uptimeSeconds / 60)} minutes</p>
          </div>
        </div>
      )}
    </div>
  );
};
