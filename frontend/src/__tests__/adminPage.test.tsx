import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminPage } from '../pages/AdminPage';

vi.mock('../services/adminService', () => ({
  adminService: {
    getOverviewMetrics: vi.fn().mockResolvedValue({
      userCounts: { total: 100, active: 95, suspended: 5 },
      propertyCounts: { total: 50, active: 40, pendingApproval: 5, pendingVerification: 3, rejected: 2 },
      reportCounts: { total: 4, pending: 1, resolved: 3 },
      totalProjects: 8,
      recentAuditLogs: [
        {
          id: 'log_1',
          action: 'PROPERTY_APPROVAL_APPROVED',
          entity: 'Property',
          createdAt: new Date().toISOString(),
          user: { firstName: 'Admin', lastName: 'User', email: 'admin@test.com' },
        },
      ],
    }),
  },
}));

describe('AdminPage Component Render', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders Admin Overview metrics and audit activity feed', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AdminPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const pendingApprovalText = await screen.findByText('Pending Approvals');
    expect(pendingApprovalText).toBeInTheDocument();

    expect(screen.getByText('5 Suspended')).toBeInTheDocument();
    expect(screen.getByText('PROPERTY_APPROVAL_APPROVED')).toBeInTheDocument();
  });
});
