import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueueProvider, useQueue } from './context/QueueContext';
import { Header } from './components/common/Header';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { LiveQueueView } from './components/queue/LiveQueueView';
import { ReportsView } from './components/reports/ReportsView';
import { QRScannerModal } from './components/scanner/QRScannerModal';
import { FarmerDetailModal } from './components/farmer/FarmerDetailModal';
import { ProcurementModal } from './components/procurement/ProcurementModal';
import { PaymentModal } from './components/payment/PaymentModal';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { QueueItem } from './types';
import { Construction } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const PlaceholderView: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
    <Construction className="w-12 h-12 text-slate-300 mb-4" />
    <h2 className="text-xl font-bold text-slate-700">{title}</h2>
    <p className="text-slate-500 mt-2">This module is currently under development.</p>
  </div>
);

const MainLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const { setActiveFilterStatus, queue } = useQueue();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Modal States
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [selectedFarmerDetail, setSelectedFarmerDetail] = useState<QueueItem | null>(null);
  const [procurementToken, setProcurementToken] = useState<string | null>(null);
  const [paymentModalItem, setPaymentModalItem] = useState<QueueItem | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-medium text-sm">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-green-600 rounded-full animate-spin mb-4" />
        Initializing Workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/';
    return null;
  }

  const handleNavigateToQueue = (statusFilter?: string) => {
    if (statusFilter) {
      setActiveFilterStatus(statusFilter);
    }
    setActiveTab('queue');
  };

  const waitingCount = queue.filter(q => q.status === 'WAITING').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Toaster position="top-right" />
      
      {/* Top Header Navigation */}
      <Header
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenScanner={() => setIsScannerOpen(true)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          waitingCount={waitingCount}
        />

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 w-full relative">
          <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigateToQueue={handleNavigateToQueue}
                onOpenScanner={() => setIsScannerOpen(true)}
                onOpenProcurementModal={(token) => setProcurementToken(token)}
              />
            )}

            {activeTab === 'queue' && (
              <LiveQueueView
                onOpenFarmerDetail={(item) => setSelectedFarmerDetail(item)}
                onOpenProcurementModal={(token) => setProcurementToken(token)}
                onOpenPaymentModal={(item) => setPaymentModalItem(item)}
                onOpenScanner={() => setIsScannerOpen(true)}
              />
            )}

            {activeTab === 'reports' && <ReportsView />}
            
            {activeTab === 'farmers' && <PlaceholderView title="Farmers Directory" />}
            {activeTab === 'payments' && <PlaceholderView title="Payments & Settlements" />}
            {activeTab === 'history' && <PlaceholderView title="Procurement History" />}
            {activeTab === 'analytics' && <PlaceholderView title="Advanced Analytics" />}
            {activeTab === 'settings' && <PlaceholderView title="System Settings" />}
            {activeTab === 'procurement' && <PlaceholderView title="Procurement Master Entry" />}
          </div>
        </main>
      </div>

      {/* Modals & Overlays */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <FarmerDetailModal
        item={selectedFarmerDetail}
        isOpen={!!selectedFarmerDetail}
        onClose={() => setSelectedFarmerDetail(null)}
        onOpenProcurementModal={(token) => setProcurementToken(token)}
      />

      <ProcurementModal
        token={procurementToken}
        isOpen={!!procurementToken}
        onClose={() => setProcurementToken(null)}
      />

      <PaymentModal
        item={paymentModalItem}
        isOpen={!!paymentModalItem}
        onClose={() => setPaymentModalItem(null)}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

    </div>
  );
};

export function OperatorApp() {
  return (
    <AuthProvider>
      <QueueProvider>
        <MainLayout />
      </QueueProvider>
    </AuthProvider>
  );
}

export default OperatorApp;
