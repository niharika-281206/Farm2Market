import { apiClient, USE_MOCK_API } from './apiClient';
import { QueueItem, QueueStatus } from '../types';
import { INITIAL_MOCK_QUEUE } from './mockData';

let memoryQueue: QueueItem[] = [...INITIAL_MOCK_QUEUE];

export const queueService = {
  /**
   * GET /api/operator/queue
   */
  async getQueue(): Promise<QueueItem[]> {
    if (USE_MOCK_API) {
      return [...memoryQueue];
    }
    return apiClient.get<QueueItem[]>('/api/operator/queue');
  },

  /**
   * POST /api/operator/queue/call-next
   */
  async callNext(): Promise<QueueItem | null> {
    if (USE_MOCK_API) {
      // Find first WAITING or ARRIVED farmer in queue order
      const nextCandidate = memoryQueue.find(item => item.status === 'ARRIVED' || item.status === 'WAITING');
      if (!nextCandidate) {
        return null;
      }
      memoryQueue = memoryQueue.map(item =>
        item.token === nextCandidate.token
          ? {
              ...item,
              status: 'PROCESSING',
              processingStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : item
      );
      return memoryQueue.find(i => i.token === nextCandidate.token) || null;
    }
    return apiClient.post<QueueItem>('/api/operator/queue/call-next');
  },

  /**
   * PUT /api/operator/queue/:token/status
   */
  async updateStatus(token: string, status: QueueStatus, remarks?: string): Promise<QueueItem> {
    if (USE_MOCK_API) {
      let updatedItem: QueueItem | null = null;
      memoryQueue = memoryQueue.map(item => {
        if (item.token.toUpperCase() === token.toUpperCase()) {
          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          updatedItem = {
            ...item,
            status,
            remarks: remarks || item.remarks,
            ...(status === 'ARRIVED' && !item.arrivedTime ? { arrivedTime: nowTime } : {}),
            ...(status === 'PROCESSING' && !item.processingStartTime ? { processingStartTime: nowTime } : {}),
            ...(status === 'COMPLETED' && !item.procurementCompletedTime ? { procurementCompletedTime: nowTime } : {}),
          };
          return updatedItem;
        }
        return item;
      });

      if (!updatedItem) {
        throw new Error(`Token ${token} not found in live queue.`);
      }
      return updatedItem;
    }

    return apiClient.put<QueueItem>(`/api/operator/queue/${token}/status`, { status, remarks });
  },

  // Helper to sync local memory state in mock mode
  setMemoryQueue(queue: QueueItem[]) {
    memoryQueue = queue;
  }
};
