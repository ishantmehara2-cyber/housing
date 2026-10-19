import React, { useState } from 'react';
import { X, Calendar, Check, Loader2 } from 'lucide-react';
import { visitService } from '../../services/visitService';

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

export const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
}) => {
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('11:00 AM - 12:00 PM');
  const [notes, setNotes] = useState('Looking forward to viewing the property.');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await visitService.createVisit({
        propertyId,
        scheduledDate: new Date(scheduledDate).toISOString(),
        timeSlot,
        notes,
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 1800);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const resErr = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error;
        setErrorMsg(resErr?.message || 'Failed to schedule visit');
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
          <Calendar className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-bold text-gray-900">Schedule Property Visit</h2>
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
            <span>Visit request submitted successfully! Owner/Agent notified.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Preferred Date</label>
              <input
                type="date"
                value={scheduledDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Preferred Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-primary outline-none"
              >
                <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Notes / Instructions</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                  <span>Submitting Request...</span>
                </>
              ) : (
                <span>Request Visit</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
