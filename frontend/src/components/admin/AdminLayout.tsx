import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  ShieldAlert,
  Building2,
  ShieldCheck,
  Users,
  Flag,
  FileText,
  LayoutDashboard,
  Package,
  CreditCard,
  BarChart3,
  UserCheck,
  MapPin,
  Sliders,
  PhoneCall,
  Calendar,
  ToggleLeft,
  Settings,
  FileCode,
  Activity,
  Award,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user } = useAuthStore();

  const navGroups = [
    {
      title: 'Platform Overview',
      items: [
        { to: '/admin', label: 'Overview', icon: LayoutDashboard },
        { to: '/admin/analytics', label: 'Product Analytics', icon: BarChart3 },
        { to: '/admin/system', label: 'System Health', icon: Activity },
      ],
    },
    {
      title: 'User & Network',
      items: [
        { to: '/admin/users', label: 'User Accounts', icon: Users },
        { to: '/admin/brokers', label: 'Brokers & Agents', icon: UserCheck },
        { to: '/admin/projects', label: 'Projects & Developers', icon: Building2 },
      ],
    },
    {
      title: 'Listings & Moderation',
      items: [
        { to: '/admin/properties', label: 'Property Moderation', icon: Building2 },
        { to: '/admin/verification', label: 'Verification Queue', icon: ShieldCheck },
        { to: '/admin/locations', label: 'Cities & Localities', icon: MapPin },
        { to: '/admin/property-types', label: 'Types & Amenities', icon: Sliders },
      ],
    },
    {
      title: 'Leads & Safety',
      items: [
        { to: '/admin/leads', label: 'Leads & Enquiries', icon: PhoneCall },
        { to: '/admin/visits', label: 'Property Visits', icon: Calendar },
        { to: '/admin/reports', label: 'User Reports', icon: Flag },
      ],
    },
    {
      title: 'Monetization & CMS',
      items: [
        { to: '/admin/packages', label: 'Monetization Packages', icon: Package },
        { to: '/admin/transactions', label: 'Transactions & Refunds', icon: CreditCard },
        { to: '/admin/cms', label: 'CMS Content', icon: FileText },
      ],
    },
    {
      title: 'Platform Control',
      items: [
        { to: '/admin/feature-flags', label: 'Feature Flags', icon: ToggleLeft },
        { to: '/admin/settings', label: 'System Settings', icon: Settings },
        { to: '/admin/audit-logs', label: 'Audit History', icon: FileCode },
      ],
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Admin Sidebar */}
        <aside className="bg-gray-900 text-white rounded-2xl p-5 shadow-xl space-y-6 self-start">
          <div className="p-3.5 bg-red-900/40 border border-red-500/30 rounded-xl flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-primary text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-xs truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider inline-flex items-center space-x-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>{user?.role} Portal</span>
              </span>
            </div>
          </div>

          <nav className="space-y-5">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-3 mb-1">
                  {group.title}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/admin'}
                      className={({ isActive }) =>
                        `flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                          isActive
                            ? 'bg-brand-primary text-white shadow-md'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Right Admin Outlet Content */}
        <main className="lg:col-span-3 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
