import React from 'react';
import { useQueue } from '../../context/QueueContext';
import { StatCard } from '../common/StatCard';
import { QueueBadge } from '../common/Badge';
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  UserX,
  Timer,
  Scale,
  Megaphone,
  QrCode,
  ArrowRight,
  Play,
  Loader2,
  CalendarDays,
  Activity,
} from 'lucide-react';
import { maskName } from '../../utils/privacy';
import toast from 'react-hot-toast';

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
  const { metrics, queue, privacyMode, callNextFarmer, loading } = useQueue();

  const activeProcessing = queue.filter(q => q.status === 'PROCESSING' || q.status === 'CALLED');
  const waitingList = queue.filter(q => q.status === 'WAITING' || q.status === 'ARRIVED');
  const currentServing = activeProcessing.length > 0 ? activeProcessing[0] : null;

  const today = new Date();
  const hours = today.getHours();
  const greeting = hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening';
  const dateStr = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleCallNext = async () => {
    try {
      const called = await callNextFarmer();
      if (called) {
        toast.success(`Now calling Token ${called.token} — ${called.farmerName}`, { duration: 4000 });
      } else {
        toast('No farmers currently waiting in queue.', { icon: '📋' });
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to call next farmer');
    }
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-slate-100 rounded-xl" />
          <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Operational Header */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {greeting}, Operator 👋
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Here's today's procurement activity at Centre #402
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                Today's Session • {dateStr}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 text-[11px]">
                Centre: OPEN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCallNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-sm transition-all active:scale-95"
            >
              <Megaphone className="w-4 h-4" />
              CALL NEXT FARMER
            </button>

            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-all"
            >
              <QrCode className="w-4 h-4 text-green-600" />
              Scan Gate QR
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid — Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div onClick={() => onNavigateToQueue('ALL')} className="cursor-pointer">
          <StatCard
            title="Today's Bookings"
            value={metrics?.todayTotalBookings || 0}
            subtitle="Registered slots for today"
            icon={Users}
            variant="sky"
            compact
          />
        </div>

        <div onClick={() => onNavigateToQueue('ARRIVED')} className="cursor-pointer">
          <StatCard
            title="Farmers Arrived"
            value={metrics?.farmersArrived || 0}
            subtitle={`${metrics?.todayTotalBookings ? Math.round((metrics.farmersArrived / metrics.todayTotalBookings) * 100) : 0}% of bookings`}
            icon={UserCheck}
            variant="emerald"
            compact
          />
        </div>

        <div onClick={() => onNavigateToQueue('WAITING')} className="cursor-pointer">
          <StatCard
            title="Currently Waiting"
            value={metrics?.waitingFarmers || 0}
            subtitle={`Avg wait: ${metrics?.avgWaitingTimeMinutes || 0} min`}
            icon={Clock}
            variant="amber"
            pulse={metrics ? metrics.waitingFarmers > 5 : false}
            compact
          />
        </div>

        <div className="cursor-pointer" onClick={() => onNavigateToQueue('PROCESSING')}>
          <StatCard
            title="Processing"
            value={metrics?.currentlyProcessing || 0}
            subtitle="Active procurement bays"
            icon={Activity}
            variant="indigo"
            compact
          />
        </div>
      </div>

      {/* KPI Grid — Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div onClick={() => onNavigateToQueue('COMPLETED')} className="cursor-pointer">
          <StatCard
            title="Completed Today"
            value={metrics?.completedProcurement || 0}
            subtitle={`${metrics?.todayTotalBookings ? Math.round((metrics.completedProcurement / metrics.todayTotalBookings) * 100) : 0}% completed`}
            icon={CheckCircle2}
            variant="emerald"
            compact
          />
        </div>

        <StatCard
          title="Total Quantity"
          value={`${metrics?.totalProcurementQuantityQuintals || 0} Qtl`}
          subtitle={`₹${(metrics?.totalDisbursedAmountRs || 0).toLocaleString('en-IN')}`}
          icon={Scale}
          variant="indigo"
          compact
        />

        <StatCard
          title="Avg Waiting Time"
          value={`${metrics?.avgWaitingTimeMinutes || 0} min`}
          subtitle="Target < 20 min"
          icon={Timer}
          variant="slate"
          compact
        />

        <StatCard
          title="No-Show"
          value={metrics?.noShowFarmers || 0}
          subtitle="Missed slot schedule"
          icon={UserX}
          variant="rose"
          compact
        />
      </div>

      {/* NOW SERVING & Queue Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* NOW SERVING Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-green-600" />
              Now Serving
            </h3>
            {activeProcessing.length > 1 && (
              <button
                onClick={() => onNavigateToQueue('PROCESSING')}
                className="text-[11px] text-green-600 hover:underline flex items-center gap-1 font-semibold"
              >
                View All ({activeProcessing.length}) <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="p-5">
            {!currentServing ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                <Loader2 className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No farmer currently being processed.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click <strong className="text-green-600">CALL NEXT FARMER</strong> to begin.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Token & Status */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-800 font-mono font-bold text-lg border border-green-200">
                    {currentServing.token}
                  </span>
                  <QueueBadge status={currentServing.status} size="md" />
                </div>

                {/* Farmer Info */}
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">
                    {maskName(currentServing.farmerName, privacyMode)}
                  </h4>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {currentServing.crop} • {currentServing.bookedQuantity} Qtl
                  </p>
                </div>

                {/* Workflow Stages */}
                <div className="flex items-center gap-1 text-[10px] font-semibold">
                  {['Weighing', 'Quality', 'Procurement', 'Payment'].map((stage, i) => (
                    <React.Fragment key={stage}>
                      <span className={`px-2 py-1 rounded ${i === 0 ? 'bg-green-100 text-green-700' : 'bg-slate-50 text-slate-400'}`}>
                        {stage}
                      </span>
                      {i < 3 && <span className="text-slate-300">→</span>}
                    </React.Fragment>
                  ))}
                </div>

                {/* Action */}
                <button
                  onClick={() => onOpenProcurementModal(currentServing.token)}
                  className="w-full px-5 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Scale className="w-4 h-4" />
                  START PROCUREMENT ENTRY
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Queue Preview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Next in Queue
              {waitingList.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-200">
                  {waitingList.length}
                </span>
              )}
            </h3>
            <button
              onClick={() => onNavigateToQueue('WAITING')}
              className="text-[11px] text-green-600 hover:underline flex items-center gap-1 font-semibold"
            >
              Full Queue <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4">
            {waitingList.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                <Users className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No farmers waiting in queue.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Farmers who check in at the gate will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {waitingList.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.token}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded bg-slate-200 text-slate-500 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-mono font-bold text-green-700">{item.token}</span>
                          <span className="font-semibold text-slate-800 truncate">{maskName(item.farmerName, privacyMode)}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.crop} • {item.bookedQuantity} Qtl • {item.slot}
                        </p>
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
    </div>
  );
};
