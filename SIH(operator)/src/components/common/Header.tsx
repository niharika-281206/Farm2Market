import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { 
  QrCode, 
  Megaphone, 
  Eye, 
  EyeOff, 
  Bell, 
  LogOut, 
  Building2, 
  Activity,
  RefreshCw,
  UserCheck
} from 'lucide-react';

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
    metrics, 
    privacyMode, 
    togglePrivacyMode, 
    callNextFarmer, 
    notifications,
    fetchQueueData,
    refreshing 
  } = useQueue();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCallNext = async () => {
    const called = await callNextFarmer();
    if (called) {
      // Audio announcement chime
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {
        // ignore audio play restrictions
      }
    } else {
      alert('No waiting or arrived farmers available in queue.');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Centre Info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white font-display tracking-wide">
                {operator?.centreName || metrics?.centreName || 'APMC Procurement Centre #402'}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-slate-800 text-slate-300 rounded border border-slate-700">
                {operator?.centreCode || 'APMC-PB-402'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Sync Ready
              </span>
              <span>•</span>
              <span>Operator: <strong className="text-slate-200">{operator?.name || 'Operator'}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          
          {/* Privacy Masking Toggle */}
          <button
            onClick={togglePrivacyMode}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
              privacyMode
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title={privacyMode ? 'Privacy Protection Active (Names & Aadhaar hidden)' : 'Click to enable Privacy Mask'}
          >
            {privacyMode ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{privacyMode ? 'Privacy ON' : 'Privacy OFF'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchQueueData()}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Live Queue"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* QR Scanner Trigger */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 hover:border-emerald-500/50 transition-all shadow-sm"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Scan QR Code</span>
          </button>

          {/* Call Next Button (PRIMARY FAST ACTION) */}
          <button
            onClick={handleCallNext}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg glow-emerald transition-all transform active:scale-95"
          >
            <Megaphone className="w-4 h-4 animate-bounce" />
            <span>CALL NEXT FARMER</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            title="System Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
            title="Logout Session"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
