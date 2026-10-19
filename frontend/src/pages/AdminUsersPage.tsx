import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { ShieldAlert, CheckCircle } from 'lucide-react';

interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    adminService
      .getUsers()
      .then((res) => setUsers(res.items as UserRecord[]))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change user status to ${nextStatus}?`)) return;

    try {
      await adminService.updateUserStatus(id, nextStatus);
      fetchUsers();
    } catch {
      alert('Failed to update user status');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">User Accounts & Roles</h1>
          <p className="text-xs text-gray-500 font-medium">Manage user accounts and suspend abusive profiles</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {users.map((u) => (
            <div key={u.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <p className="font-bold text-gray-900">{u.firstName} {u.lastName} ({u.email})</p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="bg-brand-50 text-brand-primary font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    {u.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {u.status}
                  </span>
                </div>
              </div>

              {u.role !== 'SUPER_ADMIN' && (
                <button
                  onClick={() => handleToggleStatus(u.id, u.status)}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 shrink-0 ${
                    u.status === 'ACTIVE'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {u.status === 'ACTIVE' ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  <span>{u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
