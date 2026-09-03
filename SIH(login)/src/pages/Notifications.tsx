import React, { useEffect, useState } from 'react';
import { notificationService } from '../api/apiService';
import type { Notification } from '../types';
import { Bell, Info, CheckCircle, AlertTriangle } from 'lucide-react';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      setLoading(false);
    };
    fetchNotifs();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="loader"></div></div>;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle size={24} className="text-success" />;
      case 'WARNING': return <AlertTriangle size={24} className="text-warning" />;
      default: return <Info size={24} className="text-info" />;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Bell size={28} className="text-primary" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center p-8 card bg-gray-50 border border-gray-100">
          <Bell size={48} className="mx-auto text-muted mb-4 opacity-30" />
          <p className="text-muted">No new notifications</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`card flex items-start gap-4 p-4 ${!notif.read ? 'border-l-4' : ''}`}
              style={{ borderLeftColor: !notif.read ? 'var(--color-primary)' : 'transparent' }}
            >
              <div className="mt-1">{getIcon(notif.type)}</div>
              <div className="flex-1">
                <p className={`text-gray-800 ${!notif.read ? 'font-semibold' : ''}`}>{notif.message}</p>
                <p className="text-xs text-muted mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
