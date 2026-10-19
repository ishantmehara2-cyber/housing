import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { ApiResponse, LeadStatus } from '@housing-clone/shared';
import { Users, Phone, Mail, Edit3, Check } from 'lucide-react';

interface LeadRecord {
  id: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  enquiry: { name: string; email: string; phone: string; message: string };
  property: { id: string; title: string; slug: string };
}

export const AgentDashboardPage: React.FC = () => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [newStatus, setNewStatus] = useState<LeadStatus>(LeadStatus.CONTACTED);

  const fetchLeads = () => {
    setLoading(true);
    apiClient
      .get<ApiResponse<{ items: LeadRecord[] }>>('/leads')
      .then((res) => setLeads(res.data.data?.items || []))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      await apiClient.patch(`/leads/${selectedLead.id}/status`, { status: newStatus });
      setSelectedLead(null);
      fetchLeads();
    } catch {
      alert('Failed to update lead status');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Lead CRM Management</h1>
          <p className="text-xs text-gray-500 font-medium">Track buyer enquiries and update lead conversion statuses</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="p-8 text-center text-gray-400 space-y-2">
          <Users className="w-10 h-10 mx-auto opacity-40" />
          <p className="text-xs font-bold">No buyer leads received yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {leads.map((lead) => (
            <div key={lead.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900">{lead.enquiry.name}</h3>
                  <span className="bg-brand-50 text-brand-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {lead.status}
                  </span>
                </div>
                <p className="text-gray-600 font-medium">Property: {lead.property.title}</p>
                <div className="flex items-center space-x-3 text-gray-400 text-[11px]">
                  <span className="flex items-center space-x-1"><Phone className="w-3 h-3" /><span>{lead.enquiry.phone}</span></span>
                  <span className="flex items-center space-x-1"><Mail className="w-3 h-3" /><span>{lead.enquiry.email}</span></span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedLead(lead);
                  setNewStatus(lead.status);
                }}
                className="bg-brand-primary text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1 self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update Status</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-gray-900">Update Lead Status</h2>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold"
                >
                  <option value={LeadStatus.NEW}>New</option>
                  <option value={LeadStatus.CONTACTED}>Contacted</option>
                  <option value={LeadStatus.MEETING_SCHEDULED}>Meeting Scheduled</option>
                  <option value={LeadStatus.NEGOTIATING}>Negotiating</option>
                  <option value={LeadStatus.CONVERTED}>Converted</option>
                  <option value={LeadStatus.LOST}>Lost</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
