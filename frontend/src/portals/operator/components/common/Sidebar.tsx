import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  QrCode,
  BarChart3,
  Wheat,
  Settings,
  CreditCard,
  ClipboardList,
  FileText,
  ChevronLeft,
  ChevronRight,
  Radio,
  TrendingUp,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'queue' | 'scanner' | 'reports' | 'farmers' | 'payments' | 'analytics' | 'settings' | 'procurement' | 'history';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenScanner: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  waitingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenScanner,
  collapsed = false,
  onToggleCollapse,
  waitingCount = 0,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navSections = [
    {
      label: 'Operations',
      items: [
        { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'queue' as NavTab, label: 'Live Queue', icon: Users, badge: waitingCount > 0 ? waitingCount : undefined },
        { id: 'scanner' as NavTab, label: 'Gate Entry', icon: QrCode, onClick: onOpenScanner },
        { id: 'procurement' as NavTab, label: 'Procurement', icon: ClipboardList },
      ],
    },
    {
      label: 'Management',
      items: [
        { id: 'farmers' as NavTab, label: 'Farmers', icon: Users },
        { id: 'payments' as NavTab, label: 'Payments', icon: CreditCard },
        { id: 'history' as NavTab, label: 'Procurement History', icon: FileText },
      ],
    },
    {
      label: 'Insights',
      items: [
        { id: 'analytics' as NavTab, label: 'Analytics', icon: TrendingUp },
        { id: 'reports' as NavTab, label: 'Reports', icon: BarChart3 },
        { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
      ],
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Brand Header */}
      <div className={`px-4 py-5 border-b border-slate-100 ${collapsed ? 'px-2' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="p-2 rounded-lg bg-green-600 text-white shrink-0">
            <Wheat className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 tracking-wide uppercase">
                Farm2Market
              </h2>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                APMC Procurement Ops
              </p>
            </div>
          )}
        </div>

        {/* Centre Info */}
        {!collapsed && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-700">APMC Procurement Centre #402</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: APMC-PB-402</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {section.label}
              </p>
            )}
            <nav className="space-y-0.5">
              {section.items.map((item) => {
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
                      setMobileOpen(false);
                    }}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      isActive
                        ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`flex items-center ${collapsed ? '' : 'gap-2.5'}`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-slate-400'}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-700 border border-amber-200">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer — System Status */}
      <div className={`border-t border-slate-100 ${collapsed ? 'p-2' : 'p-4'}`}>
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <Radio className="w-3 h-3" />
                System: Operational
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Last sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="System Operational" />
          </div>
        )}

        {/* Collapse Toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="mt-3 w-full flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="lg:hidden fixed top-3 left-3 z-40 p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-600"
        onClick={() => setMobileOpen(true)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 shadow-xl transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block shrink-0 bg-white border-r border-slate-200 h-full transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
