import React from 'react';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 bg-brand-50 text-brand-primary rounded-xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Privacy Policy</h1>
            <p className="text-xs text-gray-500 font-medium">Last updated: February 18, 2026</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-gray-700 leading-relaxed font-medium">
          <p>
            At <strong>Housing.clone Real Estate Marketplace</strong>, we are committed to protecting your personal information and privacy. This Privacy Policy outlines the types of information we collect, how it is used, and the measures we take to safeguard your data.
          </p>

          <section className="space-y-2 pt-2">
            <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
              <Eye className="w-4 h-4 text-brand-primary" />
              <span>1. Information We Collect</span>
            </h2>
            <p>
              We collect information you provide directly when creating an account, posting property listings, or submitting enquiries. This includes your name, email address, phone number, and property preference criteria.
            </p>
          </section>

          <section className="space-y-2 pt-2">
            <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-primary" />
              <span>2. How We Use Your Data</span>
            </h2>
            <p>
              Your information is used strictly to facilitate property enquiries, match buyer preferences, process monetization subscriptions, and deliver in-app activity notifications. We never sell your personal contact information to unauthorized third-party advertisers.
            </p>
          </section>

          <section className="space-y-2 pt-2">
            <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-brand-primary" />
              <span>3. Security & Retention</span>
            </h2>
            <p>
              All sensitive credentials, including passwords and refresh session hashes, are cryptographically secured using industry-standard hashing algorithms (Bcrypt/SHA-256). Payment details are processed via PCI-DSS compliant payment gateways (Razorpay).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
