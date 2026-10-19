import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          {/* Brand Col */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-primary rounded-xl flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                HOUSING<span className="text-brand-primary">.CLONE</span>
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              India's premier real estate marketplace platform for verified property listings, zero brokerage, and direct buyer connections.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Marketplace</h4>
            <ul className="space-y-1.5 font-medium">
              <li><Link to="/search?listingPurpose=BUY" className="hover:text-white transition">Buy Property</Link></li>
              <li><Link to="/search?listingPurpose=RENT" className="hover:text-white transition">Rent Property</Link></li>
              <li><Link to="/post-property" className="hover:text-white transition">Post Property (Free)</Link></li>
              <li><Link to="/packages" className="hover:text-white transition">Seller Packages</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Company</h4>
            <ul className="space-y-1.5 font-medium">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact Support</Link></li>
              <li><Link to="/safety" className="hover:text-white transition">Safety & Trust Guide</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Legal</h4>
            <ul className="space-y-1.5 font-medium">
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/notifications" className="hover:text-white transition">Notification Center</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 font-medium">
          <p>© 2026 Housing.clone Real Estate Marketplace. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-brand-primary fill-brand-primary" />
            <span>for Indian Real Estate</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
