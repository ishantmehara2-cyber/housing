/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { Role } from '@housing-clone/shared';
import {
  UserCheck,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const AdminBrokersPage: React.FC = () => {
  const [users, setUsers] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('AGENT');
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBrokers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers(1, 50, roleFilter);
      setUsers(res.items);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  const handleCreateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);

      await adminService.createBroker({
        firstName,
        lastName,
        email,
        phone,
        password,
        role: Role.AGENT,
        agencyName: agencyName || undefined,
      });

      setShowAddModal(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setAgencyName('');
      fetchBrokers();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const resErr = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error;
        setErrorMsg(resErr?.message || 'Failed to create broker account');
      } else {
        setErrorMsg('Error creating broker account');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await adminService.updateUserStatus(userId, nextStatus);
    fetchBrokers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-brand-primary" />
            <span>Broker & Partner Management</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage real estate agents, owners, developers, and partner organizations</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs transition inline-flex items-center space-x-2 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Broker</span>
        </button>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setRoleFilter('AGENT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            roleFilter === 'AGENT' ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Agents
        </button>
        <button
          onClick={() => setRoleFilter('OWNER')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            roleFilter === 'OWNER' ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Owners
        </button>
        <button
          onClick={() => setRoleFilter('DEVELOPER')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            roleFilter === 'DEVELOPER' ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-100 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Developers
        </button>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-4">Name & Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <div>{u.firstName} {u.lastName}</div>
                      <div className="text-[11px] font-normal text-gray-400">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">{u.phone || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-semibold text-brand-primary">{u.role}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        className="px-3 py-1.5 rounded-lg border text-xs font-bold transition hover:bg-gray-100"
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Broker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Add New Broker Account</h2>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateBroker} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Agency Name (Optional)</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Broker</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
