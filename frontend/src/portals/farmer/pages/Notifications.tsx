import React, { useEffect, useState } from 'react';
import { notificationService } from '../api/apiService';
import type { Notification } from '../types';
import { Bell, Info, CheckCircle, AlertTriangle, BellOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data || []);
      } catch (error) {
        toast.error("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading notifications...</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle size={22} className="text-green-500" />;
      case 'WARNING': return <AlertTriangle size={22} className="text-orange-500" />;
      case 'INFO':
      default: return <Info size={22} className="text-blue-500" />;
    }
  };

  const getBgClass = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bg-green-50 border-green-100';
      case 'WARNING': return 'bg-orange-50 border-orange-100';
      case 'INFO':
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="pb-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Bell size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Alerts & Notifications</h1>
          <p className="text-xs text-gray-500">Stay updated with your mandi activities</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="card border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center p-10 text-center mt-4">
          <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
            <BellOff size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No New Alerts</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">You're all caught up! New notifications will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`card flex items-start gap-4 p-4 shadow-sm transition-all hover:shadow-md ${!notif.is_read ? 'border-l-4 ' + getBgClass(notif.type) : 'border border-gray-100 bg-white'}`}
              style={{ borderLeftColor: !notif.is_read ? 'var(--color-primary)' : 'transparent' }}
            >
              <div className="mt-1 flex-shrink-0 bg-white p-1 rounded-full shadow-sm">{getIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm tracking-tight ${!notif.is_read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{notif.title || 'Notification'}</h3>
                <p className={`text-sm mt-1 leading-snug ${!notif.is_read ? 'text-gray-800' : 'text-gray-600'}`}>{notif.message}</p>
                <p className="text-xs text-gray-400 mt-2 font-medium">{new Date(notif.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
              {!notif.is_read && <div className="w-2.5 h-2.5 bg-primary rounded-full mt-2 flex-shrink-0 shadow-sm"></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
