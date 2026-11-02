import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BrokersDirectoryPage } from '../pages/BrokersDirectoryPage';
import { BrokerProfilePage } from '../pages/BrokerProfilePage';
import { Role } from '@housing-clone/shared';
import { brokerService } from '../services/brokerService';

vi.mock('../services/brokerService', () => ({
  brokerService: {
    getBrokers: vi.fn(),
    getBrokerById: vi.fn(),
    getBrokerProperties: vi.fn(),
    contactBroker: vi.fn(),
  },
}));

describe('Broker & Agent Marketplace Pages Render', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('1. renders Brokers Directory Page with "Are you a Broker?" entry banner and broker cards', async () => {
    vi.mocked(brokerService.getBrokers).mockResolvedValue({
      brokers: [
        {
          id: 'brk_123',
          firstName: 'Sanjay',
          lastName: 'Kulkarni',
          email: 'sanjay@example.test',
          phone: '+919876543213',
          avatarUrl: null,
          role: Role.DEVELOPER,
          agencyName: 'Apex Realty',
          experienceYears: 5,
          city: 'Mumbai',
          areasServed: ['Powai', 'Andheri'],
          propertyTypesServed: ['Apartment'],
          specialization: 'BUY',
          verified: true,
          rating: 4.8,
          reviewCount: 10,
          activeListingCount: 3,
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: {
        page: 1,
        limit: 12,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    render(
      <MemoryRouter initialEntries={['/brokers']}>
        <Routes>
          <Route path="/brokers" element={<BrokersDirectoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Find Trusted Real Estate Agents & Brokers/i)).toBeInTheDocument();
    expect(await screen.findByText(/Are you a Broker\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Login as Broker/i)).toBeInTheDocument();
    expect(await screen.findByText(/Sanjay Kulkarni/i)).toBeInTheDocument();
    expect(screen.getByText(/Apex Realty/i)).toBeInTheDocument();
  });

  it('2. renders Broker Profile Page with broker details and active listings', async () => {
    vi.mocked(brokerService.getBrokerById).mockResolvedValue({
      id: 'brk_123',
      firstName: 'Sanjay',
      lastName: 'Kulkarni',
      email: 'sanjay@example.test',
      phone: '+919876543213',
      avatarUrl: null,
      role: Role.DEVELOPER,
      agencyName: 'Apex Realty',
      experienceYears: 5,
      city: 'Mumbai',
      areasServed: ['Powai'],
      propertyTypesServed: ['Apartment'],
      specialization: 'BUY',
      verified: true,
      rating: 4.8,
      reviewCount: 10,
      activeListingCount: 1,
      createdAt: new Date().toISOString(),
      about: 'Leading real estate developer in Mumbai.',
      activeProperties: [],
    });

    render(
      <MemoryRouter initialEntries={['/brokers/brk_123']}>
        <Routes>
          <Route path="/brokers/:id" element={<BrokerProfilePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Sanjay Kulkarni/i)).toBeInTheDocument();
    expect(await screen.findByText(/About Sanjay/i)).toBeInTheDocument();
    expect(screen.getByText(/Enquire with Sanjay/i)).toBeInTheDocument();
  });
});
