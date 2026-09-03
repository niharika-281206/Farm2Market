import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  BarChart3, 
  ShieldCheck, 
  Wheat, 
  Clock,
  Sparkles
} from 'lucide-react';

export type NavTab = 'dashboard' | 'queue' | 'scanner' | 'reports';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenScanner: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenScanner,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Operator Dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      id: 'queue' as NavTab,
      label: 'Live Queue & Entry',
      icon: Users,
      badge: 'Action',
    },
    {
      id: 'scanner' as NavTab,
      label: 'Gate QR Scanner',
      icon: QrCode,
      onClick: onOpenScanner,
    },
    {
      id: 'reports' as NavTab,
      label: 'Centre Analytics',
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900/60 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        
        {/* Brand Logo Header */}
        <div className="px-3 py-2 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-bold shadow-lg">
            <Wheat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wider font-display uppercase">
              SIH 2026 Procurement
            </h2>
            <p className="text-[11px] font-medium text-emerald-400">
              Smart Queue Operator
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Main Portal
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600/30 to-emerald-500/10 border border-emerald-500/30 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${
                        item.badge === 'Live'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Operations Guide Box */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Fast Operator Shortcuts</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 text-[11px]">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <strong>CALL NEXT:</strong> Shift farmer to Processing.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <strong>PROCUREMENT:</strong> Enter Actual Wt & Rate.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <strong>QR SCAN:</strong> Gate arrival check-in.
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Version Info */}
      <div className="pt-4 border-t border-slate-800/60 text-[10px] text-slate-400 px-3">
        <div className="flex items-center justify-between mb-1">
          <span>Problem Statement</span>
          <span className="font-semibold text-slate-300">SIH 26032</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Module Version</span>
          <span className="font-mono text-emerald-400">v1.2.0-Prod</span>
        </div>
      </div>
    </aside>
  );
};
