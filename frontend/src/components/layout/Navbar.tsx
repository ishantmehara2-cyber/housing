import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CitySummary } from '@housing-clone/shared';
import { locationService } from '../../services/locationService';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';
import { NotificationBell } from './NotificationBell';
import {
  Building2,
  ChevronDown,
  User,
  Heart,
  PlusCircle,
  LogOut,
  MapPin,
  Menu,
  X,
  Bookmark,
  Clock,
  Bell,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    locationService.getCities().then((data) => {
      setCities(data);
      if (data.length > 0 && !selectedCity) {
        setSelectedCity(data[0].slug);
      }
    }).catch(() => {
      // Ignore API errors gracefully
    });
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore API logout error if session expired
    }
    clearAuth();
    setProfileOpen(false);
    navigate('/');
  };

  const isAdminRole = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'MODERATOR';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Location */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-900 tracking-tight leading-none">
                HOUSING<span className="text-brand-primary">.CLONE</span>
              </span>
              <span className="text-[10px] font-bold text-brand-primary tracking-widest uppercase">
                Real Estate
              </span>
            </div>
          </Link>

          {/* Location Dropdown */}
          <div className="hidden md:flex items-center space-x-1 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer transition">
            <MapPin className="w-3.5 h-3.5 text-brand-primary" />
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                if (e.target.value) {
                  navigate(`/search?city=${e.target.value}`);
                }
              }}
              className="bg-transparent font-semibold text-gray-800 outline-none cursor-pointer"
            >
              {cities.length > 0 ? (
                cities.map((city) => (
                  <option key={city.id} value={city.slug}>
                    {city.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Select City</option>
              )}
            </select>
          </div>
        </div>

        {/* Center: Category Links */}
        <div className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-gray-600">
          <Link to="/search?listingPurpose=BUY" className="hover:text-brand-primary transition">
            For Buyers
          </Link>
          <Link to="/search?listingPurpose=RENT" className="hover:text-brand-primary transition">
            For Tenants
          </Link>
          <Link to="/post-property" className="hover:text-brand-primary transition">
            For Sellers
          </Link>
          <Link to="/search?propertyCategory=COMMERCIAL" className="hover:text-brand-primary transition">
            Commercial
          </Link>
          <Link to="/brokers" className="hover:text-brand-primary transition">
            Brokers
          </Link>
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/post-property"
            className="inline-flex items-center space-x-2 bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Property</span>
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">
              Free
            </span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <NotificationBell />

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 border border-gray-200 p-1.5 pr-2.5 rounded-xl hover:border-gray-300 transition bg-white"
                >
                  <div className="w-7 h-7 bg-brand-100 text-brand-primary rounded-lg flex items-center justify-center font-bold text-xs">
                    {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-gray-800">{user?.firstName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 text-xs font-semibold text-gray-700">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-[11px] text-gray-500 font-normal">{user?.email || user?.phone}</p>
                    </div>
                    {isAdminRole && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-red-600 font-bold border-b border-gray-100"
                      >
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        <span>Admin Portal</span>
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span>My Dashboard</span>
                    </Link>
                    <Link
                      to="/dashboard/recommendations"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-brand-primary"
                    >
                      <Sparkles className="w-4 h-4 text-brand-primary" />
                      <span>Smart Discovery Feed</span>
                    </Link>
                    <Link
                      to="/favorites"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50"
                    >
                      <Heart className="w-4 h-4 text-brand-primary" />
                      <span>Saved Favorites</span>
                    </Link>
                    <Link
                      to="/saved-searches"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50"
                    >
                      <Bookmark className="w-4 h-4 text-brand-primary" />
                      <span>Saved Searches</span>
                    </Link>
                    <Link
                      to="/recently-viewed"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50"
                    >
                      <Clock className="w-4 h-4 text-brand-primary" />
                      <span>Browsing History</span>
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50"
                    >
                      <Bell className="w-4 h-4 text-brand-primary" />
                      <span>Notifications</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/auth/login"
                className="text-xs font-bold text-gray-700 hover:text-brand-primary px-3 py-2 rounded-lg transition"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="text-xs font-bold border border-gray-300 hover:bg-gray-50 text-gray-800 px-3.5 py-2 rounded-xl transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-brand-primary"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/search?listingPurpose=BUY"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-800"
          >
            For Buyers
          </Link>
          <Link
            to="/search?listingPurpose=RENT"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-800"
          >
            For Tenants
          </Link>
          {isAdminRole && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-red-600"
            >
              Admin Portal
            </Link>
          )}
          <Link
            to="/favorites"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-800"
          >
            Saved Favorites
          </Link>
          <Link
            to="/notifications"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-800"
          >
            Notifications
          </Link>
          <Link
            to="/post-property"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-brand-primary"
          >
            + Post Property (Free)
          </Link>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="block w-full text-left text-sm font-semibold text-red-600 pt-2 border-t border-gray-100"
            >
              Logout
            </button>
          ) : (
            <div className="pt-2 border-t border-gray-100 flex space-x-3">
              <Link
                to="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center bg-gray-100 text-gray-800 py-2 rounded-lg text-xs font-bold"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center bg-brand-primary text-white py-2 rounded-lg text-xs font-bold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
