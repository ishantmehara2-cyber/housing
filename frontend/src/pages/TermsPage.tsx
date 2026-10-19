import React from 'react';
import { FileText, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 bg-brand-50 text-brand-primary rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Terms of Service</h1>
            <p className="text-xs text-gray-500 font-medium">Marketplace listing guidelines & user agreement</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-gray-700 leading-relaxed font-medium">
          <p>
            Welcome to <strong>Housing.clone Marketplace</strong>. By accessing or using our platform, you agree to comply with and be bound by the following Terms of Service.
          </p>

          <section className="space-y-2 pt-2">
            <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-primary" />
              <span>1. Listing Accuracy & Verification</span>
            </h2>
            <p>
              Property owners, agents, and corporate developers must ensure that all listing details—including ownership titles, pricing, carpet area, and photographs—are accurate and non-misleading. Misrepresentation may result in listing rejection or account suspension.
            </p>
          </section>

          <section className="space-y-2 pt-2">
            <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-brand-primary" />
              <span>2. Zero Brokerage & Spam Policy</span>
            </h2>
            <p>
              Spam enquiries, duplicate listings, or unauthorized commercial harvesting of user phone numbers is strictly prohibited and subject to automated rate limiting and moderation penalties.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
