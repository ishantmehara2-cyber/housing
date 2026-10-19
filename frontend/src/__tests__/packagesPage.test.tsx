import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PackagesPage } from '../pages/PackagesPage';

vi.mock('../services/paymentService', () => ({
  paymentService: {
    getPackages: vi.fn().mockResolvedValue([
      {
        id: 'pkg_pro',
        name: 'Pro Owner Plan',
        targetRole: 'OWNER',
        price: 2999,
        validityDays: 30,
        maxListings: 3,
        featuredListingsCount: 1,
        isActive: true,
      },
    ]),
    createOrder: vi.fn().mockResolvedValue({ transactionId: 'tx1', providerOrderId: 'ord1', amount: 2999, keyId: 'key1' }),
    verifyPayment: vi.fn().mockResolvedValue({ status: 'SUCCESS' }),
  },
}));

describe('PackagesPage Component Render', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders Packages page headline and Pro Owner Plan package card', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PackagesPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const title = await screen.findByText('Choose a Seller Package');
    expect(title).toBeInTheDocument();

    const planName = await screen.findByText('Pro Owner Plan');
    expect(planName).toBeInTheDocument();
    expect(screen.getByText('Choose Plan')).toBeInTheDocument();
  });
});
