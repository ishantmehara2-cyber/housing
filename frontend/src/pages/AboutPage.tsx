import React from 'react';
import { Building2, Users, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">About Housing.clone</h1>
            <p className="text-xs text-gray-500 font-medium">India's modern real estate marketplace platform</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-gray-700 leading-relaxed font-medium">
          <p>
            <strong>Housing.clone</strong> is a full-scale real estate discovery platform connecting property buyers, tenants, owners, agents, and corporate real estate developers across major Indian metropolitan hubs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-1">
              <Sparkles className="w-5 h-5 text-brand-primary" />
              <h3 className="font-bold text-gray-900 text-sm">Smart Discovery</h3>
              <p className="text-[11px] text-gray-500">Interactive map searches, radius discovery, and weighted recommendation feeds.</p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-1">
              <Users className="w-5 h-5 text-brand-primary" />
              <h3 className="font-bold text-gray-900 text-sm">Direct Seller Leads</h3>
              <p className="text-[11px] text-gray-500">Connect directly with verified owners and agents with zero brokerage markup.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
