import { apiClient, USE_MOCK_API } from './apiClient';
import { QueueItem, ProcurementEntryPayload } from '../types';
import { queueService } from './queueService';

export const procurementService = {
  /**
   * Calculate Total Amount using formula: Total = Actual Quantity × Rate
   */
  calculateTotal(actualQuantity: number, ratePerQuintal: number): number {
    if (isNaN(actualQuantity) || isNaN(ratePerQuintal) || actualQuantity < 0 || ratePerQuintal < 0) {
      return 0;
    }
    return Number((actualQuantity * ratePerQuintal).toFixed(2));
  },

  /**
   * POST /api/operator/procurement
   */
  async submitProcurement(payload: ProcurementEntryPayload): Promise<QueueItem> {
    const totalAmount = this.calculateTotal(payload.actualQuantity, payload.ratePerQuintal);

    if (USE_MOCK_API) {
      const queue = await queueService.getQueue();
      const existing = queue.find(i => i.token.toUpperCase() === payload.token.toUpperCase());
      if (!existing) {
        throw new Error(`Token ${payload.token} not found in procurement queue.`);
      }

      const updated: QueueItem = {
        ...existing,
        actualQuantity: payload.actualQuantity,
        ratePerQuintal: payload.ratePerQuintal,
        totalAmount,
        qualityGrade: (payload.qualityGrade as 'A' | 'B' | 'C' | 'Grade-1') || 'A',
        moistureContent: payload.moistureContent ?? 11.5,
        status: 'COMPLETED',
        procurementCompletedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paymentStatus: 'PENDING',
        remarks: payload.remarks || 'Procurement completed successfully.',
      };

      await queueService.updateStatus(payload.token, 'COMPLETED', updated.remarks);
      return updated;
    }

    return apiClient.post<QueueItem>('/api/operator/procurement', {
      ...payload,
      totalAmount,
    });
  },
};
