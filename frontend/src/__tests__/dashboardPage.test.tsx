import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantDashboardPage } from '../pages/TenantDashboardPage';

vi.mock('../services/dashboardService', () => ({
  dashboardService: {
    getOverviewMetrics: vi.fn().mockResolvedValue({
      propertyCounts: { total: 5, active: 4, pending: 1, paused: 0, rejected: 0 },
      leadCounts: { total: 12, newLeads: 3, contacted: 5, converted: 4 },
      visitCounts: { total: 8, upcoming: 2, completed: 6 },
      unreadNotifications: 3,
      recentActivity: {
        leads: [],
        visits: [],
      },
    }),
  },
}));

describe('TenantDashboardPage Overview Render', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders summary metric cards for properties, leads, visits and alerts', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TenantDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const activeText = await screen.findByText('4 Active Listings');
    expect(activeText).toBeInTheDocument();

    expect(screen.getByText('3 New Enquiries')).toBeInTheDocument();
    expect(screen.getByText('View Notifications')).toBeInTheDocument();
  });
});
