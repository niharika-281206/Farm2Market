import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import {
  QrCode,
  Megaphone,
  Eye,
  EyeOff,
  Bell,
  LogOut,
  RefreshCw,
  Search,
  HelpCircle,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface HeaderProps {
  onOpenScanner: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenScanner,
  onOpenNotifications,
}) => {
  const { operator, logout } = useAuth();
  const {
    privacyMode,
    togglePrivacyMode,
    callNextFarmer,
    notifications,
    fetchQueueData,
    refreshing,
    searchQuery,
    setSearchQuery,
  } = useQueue();

  const unreadCount = notifications.filter(n => !n.read).length;
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const handleCallNext = async () => {
    try {
      const called = await callNextFarmer();
      if (called) {
        toast.success(`Now calling Token ${called.token} — ${called.farmerName}`, { duration: 4000 });
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch {
          // ignore
        }
      } else {
        toast('No farmers are currently waiting in the queue.', { icon: '📋' });
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to call next farmer');
    }
  };

  const handleRefresh = async () => {
    await fetchQueueData();
    setLastSyncTime(new Date());
    toast.success('Dashboard synchronized', { duration: 2000 });
  };

  const syncAgo = Math.round((Date.now() - lastSyncTime.getTime()) / 1000);
  const syncText = syncAgo < 5 ? 'Just now' : syncAgo < 60 ? `${syncAgo}s ago` : `${Math.round(syncAgo / 60)}m ago`;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-6 py-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-3">

        {/* Left: Centre Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden lg:block">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-800 truncate">
                {operator?.centreName || 'APMC Procurement Centre #402'}
              </h1>
              <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Operator: <strong className="text-slate-600">{operator?.name || 'Operator'}</strong></span>
              <span>•</span>
              <span>Synced {syncText}</span>
            </p>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:block flex-1 max-w-sm mx-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search token, farmer, phone..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">

          {/* Scan QR */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-all"
            title="Scan Gate QR"
          >
            <QrCode className="w-3.5 h-3.5 text-green-600" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>

          {/* Call Next */}
          <button
            onClick={handleCallNext}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all active:scale-95"
            title="Call Next Farmer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CALL NEXT</span>
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

          {/* Privacy Toggle */}
          <button
            onClick={togglePrivacyMode}
            className={`p-1.5 rounded-lg border transition-all ${
              privacyMode
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={privacyMode ? 'Privacy ON' : 'Privacy OFF'}
          >
            {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-green-500' : ''}`} />
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
