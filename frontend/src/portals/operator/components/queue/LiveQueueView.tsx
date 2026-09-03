import React, { useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import { QueueBadge, PaymentBadge } from '../common/Badge';
import { QueueItem, QueueStatus } from '../../types';
import { maskName, maskAadhaar, formatCurrency } from '../../utils/privacy';
import { generateInvoicePDF } from '../../utils/InvoiceGenerator';
import {
  Search,
  Megaphone,
  Play,
  CheckCircle2,
  SkipForward,
  UserX,
  Eye,
  CreditCard,
  QrCode,
  Download,
  RefreshCw,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LiveQueueViewProps {
  onOpenFarmerDetail: (item: QueueItem) => void;
  onOpenProcurementModal: (token: string) => void;
  onOpenPaymentModal: (item: QueueItem) => void;
  onOpenScanner: () => void;
}

export const LiveQueueView: React.FC<LiveQueueViewProps> = ({
  onOpenFarmerDetail,
  onOpenProcurementModal,
  onOpenPaymentModal,
  onOpenScanner,
}) => {
  const {
    queue,
    privacyMode,
    callNextFarmer,
    updateStatus,
    activeFilterStatus,
    setActiveFilterStatus,
    searchQuery,
    setSearchQuery,
    refreshing,
    fetchQueueData,
  } = useQueue();

  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('ALL');

  const filterStatuses = [
    { id: 'ALL', label: 'All Tokens', count: queue.length },
    { id: 'ARRIVED', label: 'Arrived' },
    { id: 'WAITING', label: 'Waiting', count: queue.filter(q => q.status === 'WAITING').length },
    { id: 'CALLED', label: 'Called' },
    { id: 'PROCESSING', label: 'Processing' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'SKIPPED', label: 'Skipped' },
    { id: 'NO_SHOW', label: 'No Show' },
  ];

  const cropList = Array.from(new Set(queue.map(q => q.crop)));

  const filteredQueue = queue.filter(item => {
    if (activeFilterStatus !== 'ALL' && item.status !== activeFilterStatus) return false;
    if (selectedCropFilter !== 'ALL' && item.crop !== selectedCropFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        item.token.toLowerCase().includes(q) ||
        item.farmerName.toLowerCase().includes(q) ||
        item.farmerId.toLowerCase().includes(q) ||
        item.aadhaarLast4.includes(q) ||
        item.crop.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCallNext = async () => {
    try {
      const called = await callNextFarmer();
      if (called) {
        toast.success(`Now calling Token ${called.token} — ${called.farmerName}`, { duration: 4000 });
      } else {
        toast('No farmers currently waiting.', { icon: '📋' });
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to call next farmer');
    }
  };

  const handleStatusChange = async (token: string, status: QueueStatus) => {
    try {
      await updateStatus(token, status);
      toast.success(`Token ${token} status updated to ${status}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-4">

      {/* Header & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Live Queue Management
              <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Auto-refresh: ON
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {queue.filter(q => q.status === 'WAITING').length} farmers waiting • {queue.filter(q => q.status === 'PROCESSING').length} processing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleCallNext} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95">
              <Megaphone className="w-3.5 h-3.5" />
              CALL NEXT
            </button>
            <button onClick={onOpenScanner} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all">
              <QrCode className="w-3.5 h-3.5 text-green-600" />
              Scan QR
            </button>
            <button onClick={() => fetchQueueData()} disabled={refreshing} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-green-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {filterStatuses.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilterStatus(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilterStatus === tab.id
                    ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
                    : 'bg-slate-50 text-slate-500 border border-transparent hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 text-[10px]">({tab.count})</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCropFilter}
              onChange={e => setSelectedCropFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:border-green-400"
            >
              <option value="ALL">All Crops</option>
              {cropList.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>

            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search token, farmer..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-green-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Crop</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Slot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Procurement</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No tokens match the selected filters.</p>
                    <p className="text-xs text-slate-400 mt-1">Try changing your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredQueue.map(item => (
                  <tr
                    key={item.token}
                    className={`hover:bg-slate-50 transition-colors ${
                      item.status === 'PROCESSING' || item.status === 'CALLED' ? 'bg-green-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-slate-100 text-slate-400 font-mono flex items-center justify-center text-[9px]">
                          {item.queuePosition > 0 ? `#${item.queuePosition}` : '—'}
                        </span>
                        <span className="font-mono font-bold text-slate-800 text-sm">{item.token}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => onOpenFarmerDetail(item)}
                        className="font-semibold text-slate-800 hover:text-green-600 transition-colors text-left"
                      >
                        {maskName(item.farmerName, privacyMode)}
                      </button>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {item.farmerId} • {maskAadhaar(item.aadhaarLast4, privacyMode)}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">{item.crop}</span>
                      {item.variety && <p className="text-[10px] text-slate-400">{item.variety}</p>}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {item.actualQuantity ? (
                        <span>
                          <strong className="text-green-700">{item.actualQuantity}</strong>
                          <span className="text-[10px] text-slate-400 block">Bkd: {item.bookedQuantity}</span>
                        </span>
                      ) : (
                        <span>{item.bookedQuantity} Qtl</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-medium">{item.slot}</span>
                      <p className="text-[10px] text-slate-400">{item.bookingTime}</p>
                    </td>

                    <td className="py-3 px-4">
                      <QueueBadge status={item.status} size="sm" />
                    </td>

                    <td className="py-3 px-4">
                      {item.totalAmount ? (
                        <div>
                          <span className="font-bold text-green-700 text-sm">{formatCurrency(item.totalAmount)}</span>
                          <div className="mt-0.5">
                            <PaymentBadge status={item.paymentStatus || 'PENDING'} size="sm" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(item.status === 'ARRIVED' || item.status === 'WAITING') && (
                          <button
                            onClick={() => handleStatusChange(item.token, 'PROCESSING')}
                            className="px-2 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center gap-1 border border-indigo-200"
                          >
                            <Play className="w-3 h-3 fill-current" /> Start
                          </button>
                        )}

                        {item.status === 'PROCESSING' && (
                          <button
                            onClick={() => onOpenProcurementModal(item.token)}
                            className="px-2 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white font-bold text-[11px] flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Complete
                          </button>
                        )}

                        {item.status === 'COMPLETED' && (
                          <>
                            <button
                              onClick={() => onOpenPaymentModal(item)}
                              className="px-2 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-green-700 border border-slate-200 text-[11px] font-semibold flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" /> Pay
                            </button>
                            <button
                              onClick={() => generateInvoicePDF(item)}
                              className="px-2 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-indigo-700 border border-slate-200 text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </>
                        )}

                        {item.status !== 'COMPLETED' && item.status !== 'NO_SHOW' && item.status !== 'SKIPPED' && (
                          <>
                            <button onClick={() => handleStatusChange(item.token, 'SKIPPED')} className="p-1 rounded-md bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600 border border-slate-100" title="Skip">
                              <SkipForward className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleStatusChange(item.token, 'NO_SHOW')} className="p-1 rounded-md bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-100" title="No Show">
                              <UserX className="w-3 h-3" />
                            </button>
                          </>
                        )}

                        <button onClick={() => onOpenFarmerDetail(item)} className="p-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-100" title="View Details">
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredQueue.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No tokens match filters.</p>
            </div>
          ) : (
            filteredQueue.map(item => (
              <div key={item.token} className={`p-4 space-y-3 ${item.status === 'PROCESSING' ? 'bg-green-50/30' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-green-700 text-sm">{item.token}</span>
                    <span className="font-semibold text-slate-800 text-sm">{maskName(item.farmerName, privacyMode)}</span>
                  </div>
                  <QueueBadge status={item.status} size="sm" />
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                  <span>{item.crop}</span>
                  <span>{item.bookedQuantity} Qtl</span>
                  <span>{item.slot}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(item.status === 'ARRIVED' || item.status === 'WAITING') && (
                    <button onClick={() => handleStatusChange(item.token, 'PROCESSING')} className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
                      Start Processing
                    </button>
                  )}
                  {item.status === 'PROCESSING' && (
                    <button onClick={() => onOpenProcurementModal(item.token)} className="px-2.5 py-1.5 rounded-lg bg-green-600 text-white font-bold text-[11px]">
                      Complete Entry
                    </button>
                  )}
                  <button onClick={() => onOpenFarmerDetail(item)} className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-600 font-semibold text-[11px] border border-slate-200">
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
