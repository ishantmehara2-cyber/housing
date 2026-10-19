import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FavoritesPage } from '../pages/FavoritesPage';

vi.mock('../services/favoriteService', () => ({
  favoriteService: {
    getUserFavorites: vi.fn().mockResolvedValue([
      {
        id: 'prop_fav_123',
        title: 'Saved Luxury Villa in Bandra',
        slug: 'saved-luxury-villa-bandra',
        listingPurpose: 'BUY',
        propertyCategory: 'RESIDENTIAL',
        propertyType: { id: 'pt_villa', name: 'Villa', slug: 'villa' },
        price: 50000000,
        rent: null,
        carpetArea: 3200,
        areaUnit: 'SQFT',
        bhk: 4,
        furnishing: 'FULLY_FURNISHED',
        address: 'Bandra West',
        city: { id: 'c1', name: 'Mumbai', slug: 'mumbai' },
        locality: { id: 'l2', name: 'Bandra', slug: 'bandra' },
        primaryImage: null,
        verificationState: 'VERIFIED',
        listingState: 'ACTIVE',
        isFeatured: true,
        isPremium: true,
        createdAt: new Date().toISOString(),
      },
    ]),
  },
}));

describe('FavoritesPage Component Render', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders Saved Favorites header and bookmarked property card', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <FavoritesPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const heading = await screen.findByText('Saved Favorites');
    expect(heading).toBeInTheDocument();

    expect(screen.getByText('Saved Luxury Villa in Bandra')).toBeInTheDocument();
  });
});
