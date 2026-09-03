import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface TopHeaderProps {
  onMenuClick: () => void;
  pageTitle?: string;
  isLive?: boolean;
}

const TopHeader: React.FC<TopHeaderProps> = ({ onMenuClick, pageTitle = 'Dashboard', isLive = true }) => {
  const { farmer } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-lg"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 hidden sm:block">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Connection Status */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
          <span className="text-xs font-semibold text-gray-600 tracking-wide">{isLive ? 'Live' : 'Connecting...'}</span>
        </div>

        {/* Notifications */}
        <Link to="/farmer/notifications" className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </Link>

        {/* Profile Dropdown Area (Simplified for now) */}
        <div className="flex items-center gap-3 pl-3 sm:pl-6 border-l border-gray-200">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-800">{farmer?.name || 'Farmer'}</p>
            <p className="text-xs text-gray-500">{farmer?.farmer_id || 'ID Pending'}</p>
          </div>
          <Link to="/farmer/profile" className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/20 hover:bg-primary/20 transition-colors">
            <User size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
