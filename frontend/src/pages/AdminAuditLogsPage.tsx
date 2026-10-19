import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { FileText, ShieldAlert } from 'lucide-react';

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string; role: string };
}

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getAuditLogs()
      .then((res) => setLogs(res.items as AuditLogItem[]))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">System Audit Log Viewer</h1>
          <p className="text-xs text-gray-500 font-medium">Append-only audit trail of systemwide administrative and moderation actions</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center text-gray-400 space-y-2">
          <FileText className="w-10 h-10 mx-auto opacity-40" />
          <p className="text-xs font-bold">No system audit logs found</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {logs.map((log) => (
            <div key={log.id} className="py-3.5 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase border border-gray-200">
                    {log.action}
                  </span>
                  <span className="font-bold text-gray-800">Entity: {log.entity} ({log.entityId || 'N/A'})</span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono">
                  {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="text-[11px] text-gray-500 flex items-center space-x-2">
                <ShieldAlert className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                <span>
                  Actor: {log.user ? `${log.user.firstName} ${log.user.lastName} (${log.user.email} - ${log.user.role})` : 'System Task'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
