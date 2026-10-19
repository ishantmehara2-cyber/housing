import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropertyDetailPage } from '../pages/PropertyDetailPage';

vi.mock('../services/propertyService', () => ({
  propertyService: {
    getPropertyBySlug: vi.fn().mockResolvedValue({
      id: 'prop_123',
      title: '3 BHK Lakeview Apartment in Powai',
      slug: '3-bhk-lakeview-powai',
      description: 'Stunning luxury apartment with lake views',
      listingPurpose: 'BUY',
      propertyCategory: 'RESIDENTIAL',
      propertyType: { id: 'pt1', name: 'Apartment', slug: 'apartment', category: 'RESIDENTIAL', icon: 'building' },
      price: 24500000,
      rent: null,
      carpetArea: 1250,
      areaUnit: 'SQFT',
      bhk: 3,
      bedrooms: 3,
      bathrooms: 3,
      furnishing: 'SEMI_FURNISHED',
      address: 'Powai Lake Road',
      city: { id: 'c1', name: 'Mumbai', slug: 'mumbai', state: { id: 's1', name: 'Maharashtra', code: 'MH' }, latitude: 19.07, longitude: 72.87, isPopular: true, isActive: true },
      locality: { id: 'l1', name: 'Powai', slug: 'powai', cityId: 'c1', pincode: '400076', latitude: 19.12, longitude: 72.90 },
      subLocality: null,
      project: null,
      developerOrganization: null,
      owner: { id: 'u1', firstName: 'John', lastName: 'Doe', email: 'owner@test.com', phone: '9876543210', avatarUrl: null, role: 'OWNER', status: 'ACTIVE', emailVerified: true, phoneVerified: true, createdAt: '2026-01-01' },
      postedByUser: { id: 'u1', firstName: 'John', lastName: 'Doe', email: 'owner@test.com', phone: '9876543210', avatarUrl: null, role: 'OWNER', status: 'ACTIVE', emailVerified: true, phoneVerified: true, createdAt: '2026-01-01' },
      assignedAgent: null,
      primaryImage: null,
      verificationState: 'VERIFIED',
      listingState: 'ACTIVE',
      isFeatured: true,
      isPremium: false,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      amenities: [{ id: 'a1', name: 'Lift', category: 'BASIC', icon: 'lift', slug: 'lift' }],
      media: [],
      latitude: 19.12,
      longitude: 72.90,
    }),
  },
}));

vi.mock('../services/searchService', () => ({
  searchService: {
    searchProperties: vi.fn().mockResolvedValue({ items: [], pagination: { total: 0 } }),
  },
}));

describe('PropertyDetailPage Component Render', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders property title, pricing and contact owner card', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/property/3-bhk-lakeview-powai']}>
          <Routes>
            <Route path="/property/:slug" element={<PropertyDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const title = await screen.findByText('3 BHK Lakeview Apartment in Powai');
    expect(title).toBeInTheDocument();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Send Instant Enquiry')).toBeInTheDocument();
  });
});
