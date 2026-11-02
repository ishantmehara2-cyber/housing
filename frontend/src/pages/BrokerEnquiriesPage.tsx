import React, { useEffect, useState } from 'react';
import { brokerService } from '../services/brokerService';
import { MessageSquare } from 'lucide-react';

interface BrokerEnquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  property?: { title?: string };
}

export const BrokerEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<BrokerEnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    brokerService
      .getMyBrokerEnquiries()
      .then((res) => setEnquiries(Array.isArray(res) ? (res as BrokerEnquiryItem[]) : []))
      .catch(() => setEnquiries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Buyer Enquiries</h1>
          <p className="text-xs text-gray-500 font-medium">Messages sent by potential buyers and tenants</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-20 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : enquiries.length === 0 ? (
        <div className="p-12 text-center text-gray-400 space-y-2">
          <MessageSquare className="w-12 h-12 mx-auto opacity-40 text-brand-primary" />
          <p className="text-xs font-bold">No enquiries received for your listings</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {enquiries.map((e) => (
            <div key={e.id} className="py-4 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">{e.name} ({e.email} | {e.phone})</span>
                <span className="text-[10px] text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-500 font-medium">Property: {e.property?.title}</p>
              <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 italic">"{e.message}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
