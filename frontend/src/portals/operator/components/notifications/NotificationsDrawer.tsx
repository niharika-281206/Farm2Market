import React from 'react';
import { useQueue } from '../../context/QueueContext';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Wrench, 
  Megaphone, 
  Calendar, 
  Info
} from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, markNotificationRead } = useQueue();

  if (!isOpen) return null;

  const renderIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'NEW_BOOKING':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'QUEUE_DELAY':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'EQUIPMENT_ISSUE':
        return <Wrench className="w-4 h-4 text-sky-500" />;
      case 'FARMER_TURN':
        return <Megaphone className="w-4 h-4 text-indigo-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">System Alerts</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Live operational events & notifications</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm flex flex-col items-center">
                <Bell className="w-8 h-8 text-slate-200 mb-3" />
                No system alerts present.
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => markNotificationRead(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    item.read
                      ? 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                      : 'bg-white border-green-200 shadow-sm ring-1 ring-green-500/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${item.read ? 'bg-slate-50' : 'bg-green-50'}`}>
                      {renderIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-bold truncate ${item.read ? 'text-slate-600' : 'text-slate-900'}`}>
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
