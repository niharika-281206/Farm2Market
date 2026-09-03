import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueueProvider, useQueue } from './context/QueueContext';
import { LoginView } from './components/auth/LoginView';
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

const MainLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const { setActiveFilterStatus } = useQueue();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modal States
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [selectedFarmerDetail, setSelectedFarmerDetail] = useState<QueueItem | null>(null);
  const [procurementToken, setProcurementToken] = useState<string | null>(null);
  const [paymentModalItem, setPaymentModalItem] = useState<QueueItem | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        Initializing Smart Procurement Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleNavigateToQueue = (statusFilter?: string) => {
    if (statusFilter) {
      setActiveFilterStatus(statusFilter);
    }
    setActiveTab('queue');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Header Navigation */}
      <Header
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenScanner={() => setIsScannerOpen(true)}
        />

        {/* Content View */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
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

export function App() {
  return (
    <AuthProvider>
      <QueueProvider>
        <MainLayout />
      </QueueProvider>
    </AuthProvider>
  );
}

export default App;
