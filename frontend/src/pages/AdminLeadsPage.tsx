/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { PhoneCall } from 'lucide-react';

export const AdminLeadsPage: React.FC = () => {
  const [tab, setTab] = useState<'leads' | 'enquiries' | 'visits'>('leads');
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (tab === 'leads') {
        const res = await adminService.getLeads(1, 50);
        setItems(res.items);
      } else if (tab === 'enquiries') {
        const res = await adminService.getEnquiries(1, 50);
        setItems(res.items);
      } else {
        const res = await adminService.getVisits(1, 50);
        setItems(res.items);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <PhoneCall className="w-6 h-6 text-brand-primary" />
            <span>Platform Leads, Enquiries & Visit Bookings</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monitor buyer activity, seller leads, and property visit schedules</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setTab('leads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            tab === 'leads' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Leads
        </button>
        <button
          onClick={() => setTab('enquiries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            tab === 'enquiries' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Enquiries
        </button>
        <button
          onClick={() => setTab('visits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            tab === 'visits' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Property Visits
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold uppercase text-gray-500">
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-bold text-gray-900">{item.property?.title || 'General'}</td>
                    <td className="py-3 px-4">{item.name || item.requester?.firstName || item.user?.firstName || 'Buyer'}</td>
                    <td className="py-3 px-4">{item.seller?.firstName || item.assignedAgent?.firstName || 'Seller'}</td>
                    <td className="py-3 px-4 text-gray-500">{item.message || item.notes || item.status || 'Enquiry'}</td>
                    <td className="py-3 px-4 text-gray-400">{new Date(item.createdAt || item.scheduledDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
