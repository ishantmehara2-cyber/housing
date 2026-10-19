import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationService, NotificationRecord } from '../../services/notificationService';
import { useAuthStore } from '../../store/useAuthStore';

export const NotificationBell: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    notificationService.getUnreadCount().then((count) => setUnreadCount(count)).catch(() => {});
    notificationService.getUserNotifications().then((items) => setNotifications(items.slice(0, 5))).catch(() => {});
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="p-2 text-gray-600 hover:text-brand-primary relative rounded-xl hover:bg-gray-100 transition"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-brand-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border border-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-xs">
          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
            <span className="font-bold text-gray-900 text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-brand-primary hover:underline flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400 font-medium">No new notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-3 space-y-1 transition ${n.isRead ? 'bg-white' : 'bg-brand-50/50 font-semibold'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 line-clamp-1">{n.title}</span>
                    <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-gray-600 text-[11px] line-clamp-2">{n.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-gray-100 text-center">
            <Link
              to="/notifications"
              onClick={() => setDropdownOpen(false)}
              className="text-xs font-bold text-brand-primary hover:underline block py-1"
            >
              View Notification Center
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
