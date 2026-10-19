import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  FolderGit2,
  Bell,
  User,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuthStore();

  const isDeveloper = user?.role === 'DEVELOPER';

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/recommendations', label: 'Smart Discovery', icon: Sparkles },
    { to: '/dashboard/properties', label: 'My Properties', icon: Building2 },
    { to: '/dashboard/leads', label: 'Lead CRM', icon: Users },
    { to: '/dashboard/visits', label: 'Visit Requests', icon: Calendar },
    ...(isDeveloper ? [{ to: '/dashboard/projects', label: 'Developer Projects', icon: FolderGit2 }] : []),
    { to: '/dashboard/billing', label: 'Billing & Subscriptions', icon: CreditCard },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/dashboard/profile', label: 'Profile Settings', icon: User },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <aside className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-6 self-start">
          <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-primary text-white font-bold rounded-xl flex items-center justify-center text-sm">
              {user?.firstName[0]}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-xs truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="text-[10px] font-bold text-brand-primary uppercase flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{user?.role}</span>
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Right Dashboard Body Content */}
        <main className="lg:col-span-3 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
