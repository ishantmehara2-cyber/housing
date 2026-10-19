import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LocationAutocomplete } from '../components/maps/LocationAutocomplete';

vi.mock('../services/geocodingService', () => ({
  geocodingService: {
    searchAddress: vi.fn().mockResolvedValue([
      {
        label: 'Powai, Mumbai',
        latitude: 19.1176,
        longitude: 72.906,
        city: 'Mumbai',
        locality: 'Powai',
        formattedAddress: 'Powai Lake, Mumbai',
      },
    ]),
    reverseGeocode: vi.fn().mockResolvedValue({
      label: 'Powai, Mumbai',
      latitude: 19.1176,
      longitude: 72.906,
      city: 'Mumbai',
      locality: 'Powai',
      formattedAddress: 'Powai Lake, Mumbai',
    }),
  },
}));

describe('LocationAutocomplete Component Render', () => {
  it('renders search input and button', () => {
    render(
      <LocationAutocomplete
        placeholder="Search locality..."
        onSelect={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('Search locality...');
    expect(input).toBeInTheDocument();
  });
});
