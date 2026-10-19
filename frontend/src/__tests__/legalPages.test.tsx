import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { PrivacyPage } from '../pages/PrivacyPage';
import { TermsPage } from '../pages/TermsPage';
import { SafetyPage } from '../pages/SafetyPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';

describe('Public Trust & Legal Pages Render', () => {
  it('1. renders Privacy Policy page title', () => {
    render(
      <BrowserRouter>
        <PrivacyPage />
      </BrowserRouter>
    );
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('2. renders Terms of Service page title', () => {
    render(
      <BrowserRouter>
        <TermsPage />
      </BrowserRouter>
    );
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('3. renders Safety & Trust Guide page title', () => {
    render(
      <BrowserRouter>
        <SafetyPage />
      </BrowserRouter>
    );
    expect(screen.getByText('Safety & Trust Guide')).toBeInTheDocument();
  });

  it('4. renders About Us page title', () => {
    render(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    );
    expect(screen.getByText('About Housing.clone')).toBeInTheDocument();
  });

  it('5. renders Contact Support page title', () => {
    render(
      <BrowserRouter>
        <ContactPage />
      </BrowserRouter>
    );
    expect(screen.getByText('Contact Support & Help Desk')).toBeInTheDocument();
  });
});
