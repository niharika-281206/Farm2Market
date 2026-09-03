import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  QueueItem,
  QueueStatus,
  DashboardMetrics,
  NotificationItem,
  ProcurementEntryPayload,
  PaymentUpdatePayload,
} from '../types';
import { queueService } from '../services/queueService';
import { reportService } from '../services/reportService';
import { notificationService } from '../services/notificationService';
import { procurementService } from '../services/procurementService';
import { paymentService } from '../services/paymentService';
import { bookingService } from '../services/bookingService';
import { socketService } from '../services/socketService';

interface QueueContextType {
  queue: QueueItem[];
  metrics: DashboardMetrics | null;
  notifications: NotificationItem[];
  privacyMode: boolean;
  loading: boolean;
  refreshing: boolean;
  activeFilterStatus: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setActiveFilterStatus: (s: string) => void;
  togglePrivacyMode: () => void;
  fetchQueueData: () => Promise<void>;
  callNextFarmer: () => Promise<QueueItem | null>;
  updateStatus: (token: string, status: QueueStatus, remarks?: string) => Promise<void>;
  submitProcurement: (payload: ProcurementEntryPayload) => Promise<QueueItem>;
  updatePayment: (payload: PaymentUpdatePayload) => Promise<QueueItem>;
  markFarmerArrived: (token: string) => Promise<QueueItem>;
  markNotificationRead: (id: string) => Promise<void>;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeFilterStatus, setActiveFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchQueueData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [queueData, metricsData, notifData] = await Promise.all([
        queueService.getQueue(),
        reportService.getDashboardMetrics(),
        notificationService.getNotifications(),
      ]);
      setQueue(queueData);
      setMetrics(metricsData);
      setNotifications(notifData);
    } catch (err) {
      console.error('Error loading queue context data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQueueData();
    socketService.connect();

    // Listen for WebSocket real-time updates
    const handleQueueUpdate = (updatedQueue: QueueItem[]) => {
      setQueue(updatedQueue);
      reportService.getDashboardMetrics().then(setMetrics);
    };

    const handleNewNotif = (notif: NotificationItem) => {
      setNotifications(prev => [notif, ...prev]);
    };

    socketService.on('queue:update', handleQueueUpdate as (...args: unknown[]) => void);
    socketService.on('notification:new', handleNewNotif as (...args: unknown[]) => void);

    return () => {
      socketService.off('queue:update', handleQueueUpdate as (...args: unknown[]) => void);
      socketService.off('notification:new', handleNewNotif as (...args: unknown[]) => void);
    };
  }, [fetchQueueData]);

  const togglePrivacyMode = () => {
    setPrivacyMode(prev => !prev);
  };

  const callNextFarmer = async (): Promise<QueueItem | null> => {
    const nextItem = await queueService.callNext();
    if (nextItem) {
      const updatedQueue = await queueService.getQueue();
      setQueue(updatedQueue);
      socketService.emitCallNext(nextItem);
      socketService.emitQueueUpdate(updatedQueue);
      reportService.getDashboardMetrics().then(setMetrics);
    }
    return nextItem;
  };

  const updateStatus = async (token: string, status: QueueStatus, remarks?: string) => {
    await queueService.updateStatus(token, status, remarks);
    const updatedQueue = await queueService.getQueue();
    setQueue(updatedQueue);
    socketService.emitStatusChange(token, status);
    socketService.emitQueueUpdate(updatedQueue);
    reportService.getDashboardMetrics().then(setMetrics);
  };

  const submitProcurement = async (payload: ProcurementEntryPayload): Promise<QueueItem> => {
    const result = await procurementService.submitProcurement(payload);
    const updatedQueue = await queueService.getQueue();
    setQueue(updatedQueue);
    socketService.emitProcurementCompleted(result);
    socketService.emitQueueUpdate(updatedQueue);
    reportService.getDashboardMetrics().then(setMetrics);
    return result;
  };

  const updatePayment = async (payload: PaymentUpdatePayload): Promise<QueueItem> => {
    const result = await paymentService.updatePayment(payload);
    const updatedQueue = await queueService.getQueue();
    setQueue(updatedQueue);
    socketService.emitQueueUpdate(updatedQueue);
    reportService.getDashboardMetrics().then(setMetrics);
    return result;
  };

  const markFarmerArrived = async (token: string): Promise<QueueItem> => {
    const result = await bookingService.markFarmerArrived(token);
    const updatedQueue = await queueService.getQueue();
    setQueue(updatedQueue);
    socketService.emitQueueUpdate(updatedQueue);
    reportService.getDashboardMetrics().then(setMetrics);
    return result;
  };

  const markNotificationRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <QueueContext.Provider
      value={{
        queue,
        metrics,
        notifications,
        privacyMode,
        loading,
        refreshing,
        activeFilterStatus,
        searchQuery,
        setSearchQuery,
        setActiveFilterStatus,
        togglePrivacyMode,
        fetchQueueData,
        callNextFarmer,
        updateStatus,
        submitProcurement,
        updatePayment,
        markFarmerArrived,
        markNotificationRead,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const ctx = useContext(QueueContext);
  if (!ctx) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return ctx;
};
