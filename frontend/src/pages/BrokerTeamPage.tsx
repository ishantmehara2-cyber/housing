import React, { useEffect, useState } from 'react';
import { brokerService } from '../services/brokerService';
import { Users, UserPlus, ShieldCheck } from 'lucide-react';

interface TeamMemberRecord {
  memberId: string;
  memberRole: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
  };
}

export const BrokerTeamPage: React.FC = () => {
  const [team, setTeam] = useState<TeamMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // New sub-agent modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const fetchTeam = () => {
    setLoading(true);
    brokerService
      .getBrokerTeam()
      .then((res) => setTeam(Array.isArray(res) ? (res as TeamMemberRecord[]) : []))
      .catch(() => setTeam([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleAddSubAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await brokerService.addSubAgent({ firstName, lastName, email, phone, password });
      setCreateModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      fetchTeam();
    } catch {
      alert('Failed to add sub-agent');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Agency Team Management</h1>
          <p className="text-xs text-gray-500 font-medium">Manage sub-agents and team lead assignments</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Sub-Agent</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-20 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : team.length === 0 ? (
        <div className="p-12 text-center text-gray-400 space-y-2">
          <Users className="w-12 h-12 mx-auto opacity-40 text-brand-primary" />
          <p className="text-xs font-bold">No team members / sub-agents registered in your agency</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {team.map((member) => (
            <div key={member.memberId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900">{member.user?.firstName} {member.user?.lastName}</h3>
                  <span className="bg-brand-50 text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-brand-200">
                    {member.memberRole}
                  </span>
                </div>
                <p className="text-gray-500 font-medium">{member.user?.email} | {member.user?.phone}</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{member.user?.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Sub-Agent Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-gray-900">Add Agency Sub-Agent</h2>
            <form onSubmit={handleAddSubAgent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full p-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-primary text-white font-bold rounded-xl">
                  Add Sub-Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
