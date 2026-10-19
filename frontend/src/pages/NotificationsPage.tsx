import React, { useEffect, useState } from 'react';
import { notificationService, NotificationRecord } from '../services/notificationService';
import { Bell, CheckCheck, Trash2, CheckCircle2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    notificationService
      .getUserNotifications()
      .then((data) => setNotifications(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      alert('Failed to mark notifications read');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // Ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      alert('Failed to delete notification');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-50 text-brand-primary rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Notification Center</h1>
              <p className="text-xs text-gray-500 font-medium">In-app activity alerts and property notifications ({notifications.length})</p>
            </div>
          </div>

          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-brand-primary hover:underline flex items-center space-x-1.5 bg-brand-50 px-3.5 py-2 rounded-xl border border-brand-200"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-20 bg-gray-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-gray-900">No new notifications</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              You're all caught up! Activity regarding property enquiries, visits, and lead status updates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                  n.isRead ? 'bg-white border-gray-200' : 'bg-brand-50/40 border-brand-200 font-semibold'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900 text-sm">{n.title}</span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs font-bold text-brand-primary hover:underline px-2 py-1"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
