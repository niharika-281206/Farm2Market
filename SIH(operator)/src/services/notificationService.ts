import { apiClient, USE_MOCK_API } from './apiClient';
import { NotificationItem } from '../types';
import { INITIAL_MOCK_NOTIFICATIONS } from './mockData';

let memoryNotifications: NotificationItem[] = [...INITIAL_MOCK_NOTIFICATIONS];

export const notificationService = {
  /**
   * GET /api/operator/notifications
   */
  async getNotifications(): Promise<NotificationItem[]> {
    if (USE_MOCK_API) {
      return [...memoryNotifications];
    }
    return apiClient.get<NotificationItem[]>('/api/operator/notifications');
  },

  async markAsRead(id: string): Promise<void> {
    memoryNotifications = memoryNotifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
  },

  async markAllAsRead(): Promise<void> {
    memoryNotifications = memoryNotifications.map(n => ({ ...n, read: true }));
  },

  addNotification(notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): NotificationItem {
    const newItem: NotificationItem = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    memoryNotifications = [newItem, ...memoryNotifications];
    return newItem;
  },
};
