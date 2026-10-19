import React from 'react';
import { PropertyCard } from '../property/PropertyCard';
import { ScoredProperty, recommendationService } from '../../services/recommendationService';
import { Sparkles, ThumbsDown } from 'lucide-react';

interface RecommendationSectionProps {
  title?: string;
  items: ScoredProperty[];
  onFeedbackRecorded?: () => void;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  title = 'Recommended for You',
  items,
  onFeedbackRecorded,
}) => {
  if (items.length === 0) return null;

  const handleNotInterested = async (propertyId: string) => {
    try {
      await recommendationService.recordFeedback(propertyId, 'NOT_INTERESTED');
      if (onFeedbackRecorded) onFeedbackRecorded();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-5 h-5 text-brand-primary" />
        <h2 className="text-xl font-black text-gray-900">{title}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(({ property, score, reasons }) => (
          <div key={property.id} className="flex flex-col h-full relative group">
            {/* Explanation Reason Tag Header */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-dark text-white p-2.5 rounded-t-2xl flex items-center justify-between text-[11px] font-bold shadow-sm">
              <span className="truncate">{reasons[0] || 'Matches your preferences'}</span>
              <span className="bg-white/20 text-white px-2 py-0.5 rounded shrink-0">{score}% Match</span>
            </div>

            <div className="flex-1">
              <PropertyCard property={property} />
            </div>

            {/* Dismiss / Not Interested Quick Action */}
            <button
              onClick={() => handleNotInterested(property.id)}
              className="mt-1 text-[10px] font-semibold text-gray-400 hover:text-red-600 flex items-center justify-center space-x-1 py-1 transition"
              title="Not interested in this property"
            >
              <ThumbsDown className="w-3 h-3" />
              <span>Not interested</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
