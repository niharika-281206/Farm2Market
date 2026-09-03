import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { useSocket } from '../contexts/SocketContext';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { connected } = useSocket();
  const location = useLocation();

  // Determine page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/farmer' || path === '/farmer/') return 'Dashboard';
    if (path.includes('book-slot')) return 'Book Slot';
    if (path.includes('my-token')) return 'My Token';
    if (path.includes('live-queue')) return 'Live Queue';
    if (path.includes('payment')) return 'Payments';
    if (path.includes('procurement')) return 'Procurement History';
    if (path.includes('profile')) return 'My Profile';
    if (path.includes('notifications')) return 'Notifications';
    if (path.includes('nearby-centres')) return 'Nearby Centres';
    if (path.includes('scanner')) return 'QR Scanner';
    if (path.includes('help')) return 'Help & Support';
    if (path.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <TopHeader 
          onMenuClick={() => setIsSidebarOpen(true)}
          pageTitle={getPageTitle()}
          isLive={connected}
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
