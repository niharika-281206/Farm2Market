import React from 'react';
import { useQueue } from '../../context/QueueContext';
import { StatCard } from '../common/StatCard';
import { QueueBadge } from '../common/Badge';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  UserX, 
  Timer, 
  Scale, 
  IndianRupee,
  Megaphone,
  QrCode,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { formatCurrency, maskName } from '../../utils/privacy';

interface DashboardViewProps {
  onNavigateToQueue: (statusFilter?: string) => void;
  onOpenScanner: () => void;
  onOpenProcurementModal: (token: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToQueue,
  onOpenScanner,
  onOpenProcurementModal,
}) => {
  const { metrics, queue, privacyMode, callNextFarmer } = useQueue();

  const activeProcessing = queue.filter(q => q.status === 'PROCESSING');
  const waitingList = queue.filter(q => q.status === 'WAITING' || q.status === 'ARRIVED');

  const handleCallNext = async () => {
    const called = await callNextFarmer();
    if (called) {
      alert(`Called token ${called.token} (${called.farmerName}) to processing bay!`);
    } else {
      alert('No waiting or arrived farmers available in queue.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner / Operational Header */}
      <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Operator Control Centre</span>
            </div>
            <h2 className="text-2xl font-black text-white font-display">
              {metrics?.centreName || 'Central APMC Procurement Hub #402'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active Procurement Session • Live WebSocket Synchronized with Farmer App & LED Token Board
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCallNext}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl glow-emerald transition-all transform active:scale-95"
            >
              <Megaphone className="w-4 h-4 animate-bounce" />
              <span>CALL NEXT FARMER</span>
            </button>

            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs transition-all"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Scan Gate QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigateToQueue('ALL')}
          className="cursor-pointer"
        >
          <StatCard
            title="Today's Total Bookings"
            value={metrics?.todayTotalBookings || 0}
            subtitle="Registered slots for today"
            icon={Users}
            variant="sky"
          />
        </div>

        <div 
          onClick={() => onNavigateToQueue('ARRIVED')}
          className="cursor-pointer"
        >
          <StatCard
            title="Farmers Arrived at Gate"
            value={metrics?.farmersArrived || 0}
            subtitle="Checked in via Gate QR"
            icon={UserCheck}
            variant="emerald"
          />
        </div>

        <div 
          onClick={() => onNavigateToQueue('WAITING')}
          className="cursor-pointer"
        >
          <StatCard
            title="Waiting Farmers in Queue"
            value={metrics?.waitingFarmers || 0}
            subtitle="Awaiting Call Next signal"
            icon={Clock}
            variant="amber"
            pulse={metrics ? metrics.waitingFarmers > 5 : false}
          />
        </div>

        <div 
          onClick={() => onNavigateToQueue('PROCESSING')}
          className="cursor-pointer"
        >
          <StatCard
            title="Currently Processing"
            value={metrics?.currentlyProcessing || 0}
            subtitle="At Weighbridge / Testing Bay"
            icon={Loader2}
            variant="indigo"
          />
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Completed Procurement"
          value={metrics?.completedProcurement || 0}
          subtitle="Tokens finalized today"
          icon={CheckCircle2}
          variant="emerald"
        />

        <StatCard
          title="No-Show Farmers"
          value={metrics?.noShowFarmers || 0}
          subtitle="Missed slot schedule"
          icon={UserX}
          variant="rose"
        />

        <StatCard
          title="Avg Waiting Time"
          value={`${metrics?.avgWaitingTimeMinutes || 0} mins`}
          subtitle="Target < 20 mins"
          icon={Timer}
          variant="slate"
        />

        <StatCard
          title="Avg Processing Time"
          value={`${metrics?.avgProcessingTimeMinutes || 0} mins`}
          subtitle="Weight & Grade entry"
          icon={Timer}
          variant="slate"
        />

        <StatCard
          title="Total Procurement Tonnage"
          value={`${metrics?.totalProcurementQuantityQuintals || 0} Qtl`}
          subtitle={`₹${(metrics?.totalDisbursedAmountRs || 0).toLocaleString('en-IN')} Total`}
          icon={Scale}
          variant="indigo"
        />
      </div>

      {/* Currently Processing Bays & Waiting List Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Processing Bay Card */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              <span>Currently Processing Bays</span>
            </h3>
            <button
              onClick={() => onNavigateToQueue('PROCESSING')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View All ({activeProcessing.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeProcessing.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
              No farmer currently at processing bay. Click <strong>CALL NEXT FARMER</strong> to start processing.
            </div>
          ) : (
            <div className="space-y-3">
              {activeProcessing.map(item => (
                <div
                  key={item.token}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold text-sm">
                        {item.token}
                      </span>
                      <h4 className="font-bold text-white text-sm">
                        {maskName(item.farmerName, privacyMode)}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Crop: <strong className="text-slate-200">{item.crop}</strong> • Booked: <strong className="text-slate-200">{item.bookedQuantity} Qtl</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenProcurementModal(item.token)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all"
                  >
                    Enter Wt & Complete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Waiting Farmers Queue Preview */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Next Farmers in Queue</span>
            </h3>
            <button
              onClick={() => onNavigateToQueue('WAITING')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Full Queue ({waitingList.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {waitingList.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
              No farmers currently waiting in queue.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {waitingList.slice(0, 4).map((item, idx) => (
                <div
                  key={item.token}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-mono font-bold text-emerald-400 mr-2">{item.token}</span>
                      <span className="font-bold text-white">{maskName(item.farmerName, privacyMode)}</span>
                      <p className="text-[11px] text-slate-400">{item.crop} ({item.bookedQuantity} Qtl) • Slot: {item.slot}</p>
                    </div>
                  </div>
                  <QueueBadge status={item.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
