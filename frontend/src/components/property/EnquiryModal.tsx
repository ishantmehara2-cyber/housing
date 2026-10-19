import React, { useState } from 'react';
import { X, Send, Check, Loader2, MessageSquare } from 'lucide-react';
import { enquiryService } from '../../services/enquiryService';
import { useAuthStore } from '../../store/useAuthStore';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
}) => {
  const { user } = useAuthStore();
  const [message, setMessage] = useState('I am interested in this property. Please share further details.');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await enquiryService.createEnquiry({
        propertyId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email || 'buyer@example.test',
        phone: user.phone || '9876543210',
        message,
        source: 'WEB',
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 1800);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const resErr = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error;
        setErrorMsg(resErr?.message || 'Failed to submit enquiry');
      } else {
        setErrorMsg('Server connection error. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-bold text-gray-900">Send Property Enquiry</h2>
        </div>

        <p className="text-xs text-gray-500 font-medium truncate">Re: {propertyTitle}</p>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {submittedSuccess ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Enquiry submitted successfully! Seller notified.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Message</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Enquiry...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Enquiry Now</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
