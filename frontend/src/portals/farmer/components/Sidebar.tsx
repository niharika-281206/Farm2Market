import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarClock, Ticket, Activity, IndianRupee, History, User, Bell, HelpCircle, Settings, LogOut, Sprout } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/farmer/', icon: LayoutDashboard },
    { name: 'Book a Slot', path: '/farmer/book-slot', icon: CalendarClock },
    { name: 'My Bookings', path: '/farmer/my-token', icon: Ticket },
    { name: 'Live Queue', path: '/farmer/live-queue', icon: Activity },
    { name: 'Payments', path: '/farmer/payment', icon: IndianRupee },
    { name: 'Procurement History', path: '/farmer/procurement', icon: History },
    { name: 'Profile', path: '/farmer/profile', icon: User },
    { name: 'Notifications', path: '/farmer/notifications', icon: Bell },
    { name: 'Help & Support', path: '/farmer/help', icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:z-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-primary text-white">
          <Sprout size={24} className="mr-2 text-green-200" />
          <span className="text-xl font-bold tracking-tight">Farm2Market</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              end={item.path === '/farmer/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-green-50 text-primary' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={20} className={item.path === '/farmer/' ? 'opacity-100' : 'opacity-70'} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          <NavLink
            to="/farmer/settings"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Settings size={20} className="opacity-70" />
            Settings
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} className="opacity-70" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
