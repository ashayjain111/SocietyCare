import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationAPI.getAll({ limit: 50 });
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) { /* ignore */ }
  };

  const typeColors = {
    emergency: 'border-l-red-500 bg-red-50',
    service_request: 'border-l-blue-500',
    payment: 'border-l-green-500',
    announcement: 'border-l-purple-500',
    assignment: 'border-l-orange-500',
    general: 'border-l-gray-400',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button onClick={markAllRead} className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700">
          <FiCheckCircle /><span>Mark all read</span>
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FiBell className="text-4xl text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id}
              className={`bg-white rounded-lg border border-gray-200 border-l-4 ${typeColors[n.type] || ''} p-4 ${!n.isRead ? 'shadow-sm' : 'opacity-75'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <button onClick={() => markAsRead(n.id)} className="text-gray-400 hover:text-primary-600 ml-3" title="Mark as read">
                    <FiCheck />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
