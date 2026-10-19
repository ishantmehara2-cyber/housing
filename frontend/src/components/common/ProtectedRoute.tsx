import React from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Role } from '@housing-clone/shared';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';
import { ShieldAlert, LogOut, KeyRound } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isInitializing, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const handleSwitchAccount = async () => {
      try {
        await authService.logout();
      } catch {
        // Ignore logout errors
      } finally {
        clearAuth();
        navigate(`/auth/login?redirect=${encodeURIComponent(location.pathname)}`);
      }
    };

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">403 Access Denied</h1>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your current account (<strong className="text-gray-900">{user.firstName} {user.lastName}</strong> &bull; <span className="font-bold text-brand-primary uppercase">{user.role}</span>) does not have administrative permissions.
          </p>

          <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-left space-y-1">
            <p className="font-bold text-gray-900 flex items-center space-x-1">
              <KeyRound className="w-3.5 h-3.5 text-brand-primary" />
              <span>Super Admin Credentials:</span>
            </p>
            <p className="text-gray-700">Username: <strong className="text-gray-900">housing.com</strong></p>
            <p className="text-gray-700">Password: <strong className="text-gray-900">housing@123</strong></p>
          </div>

          <button
            onClick={handleSwitchAccount}
            className="w-full bg-brand-primary hover:bg-brand-hover text-white py-2.5 rounded-xl font-bold text-xs shadow transition flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch to Super Admin Account</span>
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
