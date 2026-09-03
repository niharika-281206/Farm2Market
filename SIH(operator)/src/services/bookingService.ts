import { apiClient, USE_MOCK_API } from './apiClient';
import { QueueItem } from '../types';
import { queueService } from './queueService';

export const bookingService = {
  /**
   * GET /api/operator/booking/:token
   */
  async getBookingByToken(token: string): Promise<QueueItem> {
    if (USE_MOCK_API) {
      const queue = await queueService.getQueue();
      const found = queue.find(item => item.token.toUpperCase() === token.trim().toUpperCase());
      if (!found) {
        throw new Error(`Booking for Token '${token}' not found.`);
      }
      return found;
    }
    return apiClient.get<QueueItem>(`/api/operator/booking/${token}`);
  },

  /**
   * POST /api/operator/booking/:token/arrive
   */
  async markFarmerArrived(token: string): Promise<QueueItem> {
    if (USE_MOCK_API) {
      return queueService.updateStatus(token, 'ARRIVED', 'Marked arrived via QR Scanner at Gate');
    }
    return apiClient.post<QueueItem>(`/api/operator/booking/${token}/arrive`);
  },
};
