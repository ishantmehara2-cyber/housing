import React from 'react';
import { ShieldCheck, AlertTriangle, Lock } from 'lucide-react';

export const SafetyPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Safety & Trust Guide</h1>
            <p className="text-xs text-gray-500 font-medium">Fraud prevention & secure property transaction tips</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-gray-700 leading-relaxed font-medium">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800">
              <strong>Important Safety Tip:</strong> Never transfer token money or advance booking fees before physically visiting the property and inspecting original land registry documents.
            </p>
          </div>

          <section className="space-y-2 pt-2">
            <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-brand-primary" />
              <span>Verified Listing Indicators</span>
            </h2>
            <p>
              Look for the <strong>VERIFIED</strong> badge on property cards. Verified listings have been document-inspected and location-checked by our moderation team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
