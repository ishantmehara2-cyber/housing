import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationsPage } from '../pages/NotificationsPage';

vi.mock('../services/notificationService', () => ({
  notificationService: {
    getUserNotifications: vi.fn().mockResolvedValue([
      {
        id: 'notif_1',
        userId: 'u1',
        title: 'New Property Enquiry Received',
        message: 'John Buyer sent an enquiry for 3 BHK Lakeview Apartment',
        type: 'ENQUIRY',
        channel: 'IN_APP',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ]),
    getUnreadCount: vi.fn().mockResolvedValue(1),
    markAsRead: vi.fn().mockResolvedValue(undefined),
    markAllAsRead: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('NotificationsPage Component Render', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders Notification Center header and notification alert item', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <NotificationsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const title = await screen.findByText('Notification Center');
    expect(title).toBeInTheDocument();

    const notifTitle = await screen.findByText('New Property Enquiry Received');
    expect(notifTitle).toBeInTheDocument();
  });
});
