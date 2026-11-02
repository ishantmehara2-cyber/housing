import React, { useEffect, useState } from 'react';
import { brokerService } from '../services/brokerService';
import { Users, Mail, Phone, UserCheck } from 'lucide-react';

interface LeadItem {
  id: string;
  status: string;
  assignedAgentId?: string | null;
  enquiry?: { name?: string; email?: string; phone?: string };
  property?: { title?: string };
  assignedAgent?: { id: string; firstName: string; lastName: string };
}

interface TeamMemberItem {
  memberId: string;
  memberRole: string;
  user: { id: string; firstName: string; lastName: string; email: string };
}

export const BrokerLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [team, setTeam] = useState<TeamMemberItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeadsAndTeam = () => {
    setLoading(true);
    Promise.all([brokerService.getMyBrokerLeads(), brokerService.getBrokerTeam()])
      .then(([leadsRes, teamRes]) => {
        setLeads(Array.isArray(leadsRes) ? (leadsRes as LeadItem[]) : []);
        setTeam(Array.isArray(teamRes) ? (teamRes as TeamMemberItem[]) : []);
      })
      .catch(() => {
        setLeads([]);
        setTeam([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeadsAndTeam();
  }, []);

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      await brokerService.updateLeadStatusByBroker(leadId, status);
      fetchLeadsAndTeam();
    } catch {
      alert('Failed to update lead status');
    }
  };

  const handleAssignAgent = async (leadId: string, targetAgentId: string) => {
    if (!targetAgentId) return;
    try {
      await brokerService.assignLeadToSubAgent(leadId, targetAgentId);
      fetchLeadsAndTeam();
    } catch {
      alert('Failed to assign lead to team member');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Lead CRM & Team Assignments</h1>
          <p className="text-xs text-gray-500 font-medium">Manage buyer lead statuses, follow-up notes, and team assignments</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="p-12 text-center text-gray-400 space-y-2">
          <Users className="w-12 h-12 mx-auto opacity-40 text-brand-primary" />
          <p className="text-xs font-bold">No leads assigned to your account</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {leads.map((l) => (
            <div key={l.id} className="py-4 space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900">{l.enquiry?.name || 'Buyer Lead'}</h3>
                    <select
                      value={l.status}
                      onChange={(e) => handleUpdateStatus(l.id, e.target.value)}
                      className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-200 outline-none"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="MEETING_SCHEDULED">MEETING_SCHEDULED</option>
                      <option value="NEGOTIATING">NEGOTIATING</option>
                      <option value="CONVERTED">CONVERTED</option>
                      <option value="LOST">LOST</option>
                      <option value="SPAM">SPAM</option>
                    </select>
                  </div>
                  <p className="text-gray-500 font-medium pt-0.5">Property: {l.property?.title}</p>
                </div>

                {/* Sub-Agent Assignment Dropdown */}
                {team.length > 0 && (
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                    <select
                      value={l.assignedAgentId || ''}
                      onChange={(e) => handleAssignAgent(l.id, e.target.value)}
                      className="p-1.5 border border-gray-300 rounded-lg text-[11px] font-semibold text-gray-800 outline-none"
                    >
                      <option value="">Unassigned</option>
                      {team.map((m) => (
                        <option key={m.user.id} value={m.user.id}>
                          Assign to: {m.user.firstName} {m.user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 text-gray-400 text-[11px]">
                <span className="flex items-center space-x-1"><Mail className="w-3 h-3" /><span>{l.enquiry?.email}</span></span>
                <span className="flex items-center space-x-1"><Phone className="w-3 h-3" /><span>{l.enquiry?.phone}</span></span>
                {l.assignedAgent && (
                  <span className="text-brand-primary font-bold">Assigned: {l.assignedAgent.firstName} {l.assignedAgent.lastName}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
