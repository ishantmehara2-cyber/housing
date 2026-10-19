import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('Frontend Sanity Test', () => {
  it('renders application brand title', async () => {
    render(<App />);
    const brandElements = await screen.findAllByText(/Housing/i);
    expect(brandElements.length).toBeGreaterThan(0);
  });
});
