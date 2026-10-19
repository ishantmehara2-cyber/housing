import React, { useState } from 'react';
import { UserSummary } from '@housing-clone/shared';
import { Phone, MessageSquare, Calendar, Share2, Flag, ShieldCheck } from 'lucide-react';

interface PropertyContactCardProps {
  postedByUser: UserSummary;
  onEnquireClick: () => void;
}

export const PropertyContactCard: React.FC<PropertyContactCardProps> = ({
  postedByUser,
  onEnquireClick,
}) => {
  const [showPhone, setShowPhone] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-5 sticky top-20">
      {/* Contact Person Card */}
      <div className="flex items-center space-x-3.5 pb-4 border-b border-gray-100">
        <div className="w-12 h-12 bg-brand-primary text-white font-bold rounded-2xl flex items-center justify-center text-lg shadow-md shrink-0">
          {postedByUser.firstName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {postedByUser.firstName} {postedByUser.lastName}
            </h3>
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <p className="text-xs text-brand-primary font-semibold uppercase">{postedByUser.role}</p>
        </div>
      </div>

      {/* Direct Contact Actions */}
      <div className="space-y-2.5">
        {showPhone && postedByUser.phone ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center space-x-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>{postedByUser.phone}</span>
          </div>
        ) : (
          <button
            onClick={() => setShowPhone(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Get Contact Number</span>
          </button>
        )}

        <button
          onClick={onEnquireClick}
          className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-sm"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Send Instant Enquiry</span>
        </button>

        <button
          onClick={onEnquireClick}
          className="w-full border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition"
        >
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>Schedule Property Visit</span>
        </button>
      </div>

      {/* Share / Report Secondary Actions */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Property URL copied to clipboard!');
          }}
          className="flex items-center space-x-1 hover:text-brand-primary font-semibold transition"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Property</span>
        </button>

        <button
          onClick={() => alert('Report submitted to moderation team.')}
          className="flex items-center space-x-1 hover:text-red-600 font-semibold transition"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report Listing</span>
        </button>
      </div>
    </div>
  );
};
