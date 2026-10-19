import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecommendationsDashboardPage } from '../pages/RecommendationsDashboardPage';

vi.mock('../services/recommendationService', () => ({
  recommendationService: {
    getPersonalizedFeed: vi.fn().mockResolvedValue({
      algorithmVersion: 'recommendation-v1',
      items: [
        {
          property: {
            id: 'prop_rec_123',
            title: '3 BHK Lakeview Apartment in Powai',
            slug: '3-bhk-lakeview-powai',
            listingPurpose: 'BUY',
            propertyCategory: 'RESIDENTIAL',
            propertyType: { id: 'pt1', name: 'Apartment', slug: 'apartment' },
            price: 24500000,
            rent: null,
            carpetArea: 1250,
            areaUnit: 'SQFT',
            bhk: 3,
            furnishing: 'SEMI_FURNISHED',
            address: 'Powai',
            city: { id: 'c1', name: 'Mumbai', slug: 'mumbai' },
            locality: { id: 'l1', name: 'Powai', slug: 'powai' },
            primaryImage: null,
            verificationState: 'VERIFIED',
            listingState: 'ACTIVE',
            isFeatured: true,
            isPremium: false,
            createdAt: new Date().toISOString(),
          },
          score: 95,
          reasons: ['Matches your preferred price in Mumbai'],
        },
      ],
      generatedAt: new Date().toISOString(),
    }),
    recordFeedback: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('RecommendationsDashboardPage Render', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders Personalized Recommendations header and 95% Match property card with reason tag', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <RecommendationsDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const title = await screen.findByText('Personalized Property Recommendations');
    expect(title).toBeInTheDocument();

    expect(screen.getByText('95% Match')).toBeInTheDocument();
    expect(screen.getByText('Matches your preferred price in Mumbai')).toBeInTheDocument();
  });
});
