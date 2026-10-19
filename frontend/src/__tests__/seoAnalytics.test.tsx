import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminAnalyticsPage } from '../pages/AdminAnalyticsPage';

vi.mock('../services/analyticsService', () => ({
  analyticsService: {
    getAdminAnalyticsSummary: vi.fn().mockResolvedValue({
      eventMetrics: {
        totalEvents: 1500,
        propertyViews: 1200,
        searchesCount: 200,
        enquiriesCount: 80,
        visitsCount: 20,
      },
      topProperties: [
        {
          id: 'prop_top_1',
          title: 'Luxurious 3 BHK Apartment in Powai',
          slug: '3-bhk-powai',
          viewCount: 450,
          enquiryCount: 25,
        },
      ],
    }),
  },
}));

describe('AdminAnalyticsPage Render', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders Systemwide Product Analytics page and property view counters', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AdminAnalyticsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const title = await screen.findByText('Systemwide Product Analytics');
    expect(title).toBeInTheDocument();

    expect(screen.getByText('1200')).toBeInTheDocument();
    expect(screen.getByText('450 Views')).toBeInTheDocument();
  });
});
