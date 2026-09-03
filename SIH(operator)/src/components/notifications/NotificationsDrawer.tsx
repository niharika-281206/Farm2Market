import React from 'react';
import { useQueue } from '../../context/QueueContext';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Wrench, 
  Megaphone, 
  Calendar, 
  Info,
  CheckCheck
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
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case 'QUEUE_DELAY':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'EQUIPMENT_ISSUE':
        return <Wrench className="w-4 h-4 text-sky-400" />;
      case 'FARMER_TURN':
        return <Megaphone className="w-4 h-4 text-indigo-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">System Alerts</h3>
                <p className="text-xs text-slate-400">Live operational events & alerts</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No system alerts present.
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => markNotificationRead(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    item.read
                      ? 'bg-slate-950/50 border-slate-800/60 opacity-70'
                      : 'bg-slate-800/80 border-slate-700/80 shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      {renderIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold ${item.read ? 'text-slate-300' : 'text-white'}`}>
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
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
