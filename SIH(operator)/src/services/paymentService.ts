import { apiClient, USE_MOCK_API } from './apiClient';
import { QueueItem, PaymentUpdatePayload } from '../types';
import { queueService } from './queueService';

export const paymentService = {
  /**
   * PUT /api/operator/payment/:id
   */
  async updatePayment(payload: PaymentUpdatePayload): Promise<QueueItem> {
    if (USE_MOCK_API) {
      const queue = await queueService.getQueue();
      const existing = queue.find(i => i.token.toUpperCase() === payload.token.toUpperCase());
      if (!existing) {
        throw new Error(`Token ${payload.token} not found for payment update.`);
      }

      const updated: QueueItem = {
        ...existing,
        paymentStatus: payload.paymentStatus,
        transactionId: payload.transactionId,
        paymentDate: payload.paymentDate || new Date().toISOString().replace('T', ' ').substring(0, 16),
        totalAmount: payload.paymentAmount || existing.totalAmount,
        remarks: payload.remarks || existing.remarks,
      };

      const updatedQueue = queue.map(item =>
        item.token.toUpperCase() === payload.token.toUpperCase() ? updated : item
      );
      queueService.setMemoryQueue(updatedQueue);

      return updated;
    }

    const id = payload.paymentId || payload.token;
    return apiClient.put<QueueItem>(`/api/operator/payment/${id}`, payload);
  },
};
