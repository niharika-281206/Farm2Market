import { apiClient, USE_MOCK_API } from './apiClient';
import { DashboardMetrics, CentreReport, QueueItem } from '../types';
import { INITIAL_MOCK_METRICS, INITIAL_MOCK_REPORT } from './mockData';
import { queueService } from './queueService';

export const reportService = {
  /**
   * GET /api/operator/dashboard
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    if (USE_MOCK_API) {
      const queue = await queueService.getQueue();
      return calculateDynamicMetrics(queue);
    }
    return apiClient.get<DashboardMetrics>('/api/operator/dashboard');
  },

  /**
   * GET /api/operator/reports
   */
  async getCentreReport(dateFilter?: string): Promise<CentreReport> {
    if (USE_MOCK_API) {
      const queue = await queueService.getQueue();
      const metrics = calculateDynamicMetrics(queue);

      return {
        ...INITIAL_MOCK_REPORT,
        date: dateFilter || new Date().toISOString().split('T')[0],
        dailyFarmersCount: metrics.todayTotalBookings,
        completedProcurementCount: metrics.completedProcurement,
        pendingProcurementCount: metrics.waitingFarmers + metrics.currentlyProcessing,
        noShowCount: metrics.noShowFarmers,
        totalQuantityQuintals: metrics.totalProcurementQuantityQuintals,
        totalPaymentAmount: metrics.totalDisbursedAmountRs,
        avgWaitingTime: metrics.avgWaitingTimeMinutes,
        avgProcessingTime: metrics.avgProcessingTimeMinutes,
      };
    }
    return apiClient.get<CentreReport>(`/api/operator/reports${dateFilter ? `?date=${dateFilter}` : ''}`);
  },
};

function calculateDynamicMetrics(queue: QueueItem[]): DashboardMetrics {
  const arrived = queue.filter(q => q.status === 'ARRIVED').length;
  const waiting = queue.filter(q => q.status === 'WAITING').length;
  const processing = queue.filter(q => q.status === 'PROCESSING').length;
  const completed = queue.filter(q => q.status === 'COMPLETED').length;
  const noShow = queue.filter(q => q.status === 'NO_SHOW').length;

  let totalQty = 0;
  let totalDisbursed = 0;

  queue.forEach(item => {
    if (item.status === 'COMPLETED' || item.status === 'PROCESSING') {
      totalQty += item.actualQuantity || item.bookedQuantity || 0;
      totalDisbursed += item.totalAmount || 0;
    }
  });

  return {
    ...INITIAL_MOCK_METRICS,
    todayTotalBookings: queue.length,
    farmersArrived: arrived + waiting + processing + completed,
    waitingFarmers: waiting,
    currentlyProcessing: processing,
    completedProcurement: completed,
    noShowFarmers: noShow,
    totalProcurementQuantityQuintals: Number(totalQty.toFixed(1)),
    totalDisbursedAmountRs: Math.round(totalDisbursed),
  };
}
