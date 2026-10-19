import React, { useEffect, useState } from 'react';
import { recommendationService, ScoredProperty } from '../services/recommendationService';
import { RecommendationSection } from '../components/recommendations/RecommendationSection';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

export const RecommendationsDashboardPage: React.FC = () => {
  const [feedItems, setFeedItems] = useState<ScoredProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = () => {
    setLoading(true);
    recommendationService
      .getPersonalizedFeed(12)
      .then((res) => setFeedItems(res.items))
      .catch(() => setFeedItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Personalized Property Recommendations</h1>
          <p className="text-xs text-gray-500 font-medium">Smart discovery feed scored by location, price, and recent activity</p>
        </div>

        <div className="inline-flex items-center space-x-1.5 bg-brand-50 text-brand-primary border border-brand-200 px-3 py-1.5 rounded-xl text-xs font-bold">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Algorithm: recommendation-v1</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 bg-gray-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : feedItems.length === 0 ? (
        <div className="p-12 text-center text-gray-400 space-y-2">
          <Sparkles className="w-12 h-12 mx-auto text-brand-primary opacity-40" />
          <p className="text-xs font-bold">No personalized recommendations available yet</p>
        </div>
      ) : (
        <RecommendationSection
          title="Recommended Properties for Your Preferences"
          items={feedItems}
          onFeedbackRecorded={fetchFeed}
        />
      )}
    </div>
  );
};
