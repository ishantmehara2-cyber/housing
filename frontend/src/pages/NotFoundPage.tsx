import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, LayoutDashboard, Building2 } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 bg-brand-50 text-brand-primary rounded-2xl flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8 text-brand-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900">404</h1>
          <h2 className="text-lg font-bold text-gray-800">Page Not Found</h2>
          <p className="text-xs text-gray-500 font-medium">
            The page or property listing you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            to="/"
            className="bg-brand-primary hover:bg-brand-hover text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>

          <Link
            to="/search"
            className="border border-gray-300 hover:bg-gray-50 text-gray-800 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition"
          >
            <Search className="w-4 h-4" />
            <span>Search Properties</span>
          </Link>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <Link
            to="/dashboard"
            className="text-xs font-bold text-brand-primary hover:underline flex items-center justify-center space-x-1"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Open Seller Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
