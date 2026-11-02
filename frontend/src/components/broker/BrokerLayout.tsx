import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  Calendar,
  User,
  Bell,
  ShieldCheck,
  PlusCircle,
  UserCheck,
  BarChart3,
} from 'lucide-react';

export const BrokerLayout: React.FC = () => {
  const { user } = useAuthStore();

  const navItems = [
    { to: '/broker/dashboard', label: 'Broker Overview', icon: LayoutDashboard },
    { to: '/broker/properties', label: 'My Properties', icon: Building2 },
    { to: '/post-property', label: '+ Post Property', icon: PlusCircle },
    { to: '/broker/leads', label: 'Lead CRM', icon: Users },
    { to: '/broker/analytics', label: 'Performance Analytics', icon: BarChart3 },
    { to: '/broker/team', label: 'Agency Team', icon: UserCheck },
    { to: '/broker/enquiries', label: 'Enquiries', icon: MessageSquare },
    { to: '/broker/visits', label: 'Property Visits', icon: Calendar },
    { to: '/broker/profile', label: 'Broker Profile', icon: User },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <aside className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-6 self-start">
          <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-primary text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-md">
              {user?.firstName[0]}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-xs truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="text-[10px] font-bold text-brand-primary uppercase flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Broker Partner</span>
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
                  end={item.to === '/broker/dashboard'}
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

        {/* Right Content */}
        <main className="lg:col-span-3 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
