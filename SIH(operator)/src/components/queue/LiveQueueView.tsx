import React, { useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import { QueueBadge, PaymentBadge } from '../common/Badge';
import { QueueItem, QueueStatus } from '../../types';
import { maskName, maskAadhaar, formatCurrency } from '../../utils/privacy';
import { 
  Search, 
  Filter, 
  Megaphone, 
  Play, 
  CheckCircle2, 
  SkipForward, 
  UserX, 
  Eye, 
  CreditCard, 
  FileSpreadsheet,
  QrCode,
  Sparkles
} from 'lucide-react';

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
  } = useQueue();

  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('ALL');

  const filterStatuses = [
    { id: 'ALL', label: 'All Tokens' },
    { id: 'ARRIVED', label: 'Arrived Gate' },
    { id: 'WAITING', label: 'In Waiting Queue' },
    { id: 'PROCESSING', label: 'Processing' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'SKIPPED', label: 'Skipped' },
    { id: 'NO_SHOW', label: 'No Show' },
  ];

  // Unique crop list for filter dropdown
  const cropList = Array.from(new Set(queue.map(q => q.crop)));

  // Filtered Queue
  const filteredQueue = queue.filter(item => {
    // Status Filter
    if (activeFilterStatus !== 'ALL' && item.status !== activeFilterStatus) {
      return false;
    }
    // Crop Filter
    if (selectedCropFilter !== 'ALL' && item.crop !== selectedCropFilter) {
      return false;
    }
    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchToken = item.token.toLowerCase().includes(q);
      const matchName = item.farmerName.toLowerCase().includes(q);
      const matchId = item.farmerId.toLowerCase().includes(q);
      const matchAadhaar = item.aadhaarLast4.includes(q);
      const matchCrop = item.crop.toLowerCase().includes(q);
      return matchToken || matchName || matchId || matchAadhaar || matchCrop;
    }
    return true;
  });

  const handleCallNext = async () => {
    const called = await callNextFarmer();
    if (called) {
      alert(`Successfully called token ${called.token} (${called.farmerName}) to Processing Bay!`);
    } else {
      alert('No waiting or arrived farmers available in queue.');
    }
  };

  const handleStatusChange = async (token: string, status: QueueStatus) => {
    try {
      await updateStatus(token, status);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed';
      alert(msg);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Main Control Toolbar */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Live Queue Management</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage token queue, trigger call calls, record weight & quality grades, and update payment status.
            </p>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCallNext}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg glow-emerald transition-all transform active:scale-95"
            >
              <Megaphone className="w-4 h-4 animate-bounce" />
              <span>CALL NEXT</span>
            </button>

            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 text-xs font-semibold transition-all"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Scan QR</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {filterStatuses.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeFilterStatus === tab.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Crop Dropdown */}
          <div className="flex items-center gap-2.5">
            {/* Crop Selector */}
            <select
              value={selectedCropFilter}
              onChange={e => setSelectedCropFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Crops</option>
              {cropList.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Token, Farmer, Aadhaar..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Live Queue Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Pos / Token</th>
                <th className="py-3.5 px-4">Farmer Details</th>
                <th className="py-3.5 px-4">Crop & Variety</th>
                <th className="py-3.5 px-4">Booked Wt</th>
                <th className="py-3.5 px-4">Booking Time / Slot</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Procurement & Payment</th>
                <th className="py-3.5 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No tokens match the selected filters or search query.
                  </td>
                </tr>
              ) : (
                filteredQueue.map(item => (
                  <tr 
                    key={item.token}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      item.status === 'PROCESSING' ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Token & Pos */}
                    <td className="py-4 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[10px]">
                          {item.queuePosition > 0 ? `#${item.queuePosition}` : '—'}
                        </span>
                        <span className="font-bold text-white text-sm">
                          {item.token}
                        </span>
                      </div>
                    </td>

                    {/* Farmer Details */}
                    <td className="py-4 px-4">
                      <div>
                        <button
                          onClick={() => onOpenFarmerDetail(item)}
                          className="font-bold text-white hover:text-emerald-400 transition-colors text-xs text-left"
                        >
                          {maskName(item.farmerName, privacyMode)}
                        </button>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {item.farmerId} • Aadhaar: {maskAadhaar(item.aadhaarLast4, privacyMode)}
                        </p>
                      </div>
                    </td>

                    {/* Crop & Variety */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-semibold text-slate-200">{item.crop}</span>
                        {item.variety && (
                          <p className="text-[11px] text-slate-400">Var: {item.variety}</p>
                        )}
                      </div>
                    </td>

                    {/* Booked Quantity */}
                    <td className="py-4 px-4 font-bold text-slate-200">
                      {item.actualQuantity ? (
                        <span>
                          <strong className="text-emerald-400">{item.actualQuantity} Qtl</strong> (Actual)
                          <p className="text-[10px] text-slate-500 font-normal">Booked: {item.bookedQuantity} Qtl</p>
                        </span>
                      ) : (
                        <span>{item.bookedQuantity} Quintals</span>
                      )}
                    </td>

                    {/* Booking Time / Slot */}
                    <td className="py-4 px-4 text-slate-300">
                      <div>
                        <span className="font-medium text-slate-200">{item.slot}</span>
                        <p className="text-[11px] text-slate-400">Booked @ {item.bookingTime}</p>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <QueueBadge status={item.status} />
                    </td>

                    {/* Procurement & Payment Info */}
                    <td className="py-4 px-4">
                      {item.totalAmount ? (
                        <div>
                          <span className="font-bold text-emerald-400">
                            {formatCurrency(item.totalAmount)}
                          </span>
                          <div className="mt-1">
                            <PaymentBadge status={item.paymentStatus || 'PENDING'} size="sm" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Not entered</span>
                      )}
                    </td>

                    {/* Quick Action Buttons */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        
                        {/* Start Processing */}
                        {item.status === 'ARRIVED' || item.status === 'WAITING' ? (
                          <button
                            onClick={() => handleStatusChange(item.token, 'PROCESSING')}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                            title="Start Processing token at bay"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Start</span>
                          </button>
                        ) : null}

                        {/* Complete Procurement Entry */}
                        {item.status === 'PROCESSING' && (
                          <button
                            onClick={() => onOpenProcurementModal(item.token)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow glow-emerald"
                            title="Enter Actual Weight & Rate"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Complete Entry</span>
                          </button>
                        )}

                        {/* Payment Update Modal */}
                        {item.status === 'COMPLETED' && (
                          <button
                            onClick={() => onOpenPaymentModal(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1"
                            title="Update Payment DBT Status"
                          >
                            <CreditCard className="w-3 h-3 text-emerald-400" />
                            <span>Payment</span>
                          </button>
                        )}

                        {/* Skip Button */}
                        {item.status !== 'COMPLETED' && item.status !== 'NO_SHOW' && (
                          <button
                            onClick={() => handleStatusChange(item.token, 'SKIPPED')}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300"
                            title="Skip Farmer Turn"
                          >
                            <SkipForward className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Mark No Show */}
                        {item.status !== 'COMPLETED' && item.status !== 'NO_SHOW' && (
                          <button
                            onClick={() => handleStatusChange(item.token, 'NO_SHOW')}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                            title="Mark No Show"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* View Farmer Details */}
                        <button
                          onClick={() => onOpenFarmerDetail(item)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="View Full Farmer Record"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
