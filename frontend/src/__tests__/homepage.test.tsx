import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from '../pages/HomePage';

vi.mock('../services/searchService', () => ({
  searchService: {
    searchProperties: vi.fn().mockResolvedValue({
      items: [
        {
          id: 'prop_123',
          title: 'Luxurious 3 BHK Apartment in Powai',
          slug: 'luxurious-3-bhk-powai',
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
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      appliedFilters: {},
    }),
  },
}));

vi.mock('../services/propertyTypeService', () => ({
  propertyTypeService: {
    getPropertyTypes: vi.fn().mockResolvedValue([
      { id: 'apartment', name: 'Apartment', category: 'RESIDENTIAL', slug: 'apartment' },
    ]),
  },
}));

vi.mock('../services/locationService', () => ({
  locationService: {
    getCities: vi.fn().mockResolvedValue([
      { id: 'c1', name: 'Mumbai', slug: 'mumbai' },
    ]),
  },
}));

describe('HomePage Component Render', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders marketplace hero title and search purpose tabs', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const headline = await screen.findByText('Trusted place to find a home');
    expect(headline).toBeInTheDocument();

    expect(screen.getByText('Featured Properties for Sale')).toBeInTheDocument();
    expect(screen.getByText('Verified Rental Listings')).toBeInTheDocument();
  });
});
