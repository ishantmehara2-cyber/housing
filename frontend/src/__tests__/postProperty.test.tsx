import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostPropertyPage } from '../pages/PostPropertyPage';

vi.mock('../services/draftService', () => ({
  draftService: {
    getDrafts: vi.fn().mockResolvedValue([]),
    createDraft: vi.fn().mockResolvedValue({
      id: 'draft_123',
      title: 'Draft Property',
      listingPurpose: 'BUY',
      propertyCategory: 'RESIDENTIAL',
      propertyType: { id: 'apartment', name: 'Apartment' },
      city: { id: 'c1', name: 'Mumbai' },
      locality: { id: 'l1', name: 'Powai' },
      address: 'Powai',
      carpetArea: 1000,
      areaUnit: 'SQFT',
      furnishing: 'SEMI_FURNISHED',
      listingState: 'DRAFT',
      completedStep: 1,
      media: [],
      amenities: [],
    }),
    updateDraft: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../services/propertyTypeService', () => ({
  propertyTypeService: {
    getPropertyTypes: vi.fn().mockResolvedValue([
      { id: 'apartment', name: 'Apartment', category: 'RESIDENTIAL', slug: 'apartment' },
    ]),
  },
}));

import { useAuthStore } from '../store/useAuthStore';
import { Role, UserStatus } from '@housing-clone/shared';

describe('PostPropertyPage Wizard Flow', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders Post Property Wizard step indicator and step 1 purpose options', async () => {
    useAuthStore.getState().setAuth(
      {
        id: 'usr_owner_123',
        firstName: 'Owner',
        lastName: 'User',
        email: 'owner@example.test',
        phone: '9876543210',
        avatarUrl: null,
        role: Role.OWNER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date().toISOString(),
      },
      'dummy_owner_token'
    );

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PostPropertyPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const heading = await screen.findByText('Select Listing Purpose');
    expect(heading).toBeInTheDocument();

    expect(screen.getByText('Sell / Buy')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
    expect(screen.getByText('Commercial')).toBeInTheDocument();
    expect(screen.getByText('Save & Continue')).toBeInTheDocument();
  });
});
