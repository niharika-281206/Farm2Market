import React from 'react';
import { Modal } from '../common/Modal';
import { QueueItem } from '../../types';
import { QueueBadge, PaymentBadge } from '../common/Badge';
import { maskName, maskAadhaar, formatCurrency } from '../../utils/privacy';
import { useQueue } from '../../context/QueueContext';
import { User, Calendar, Phone, Wheat, Scale, Award, CreditCard, ShieldCheck } from 'lucide-react';

interface FarmerDetailModalProps {
  item: QueueItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenProcurementModal: (token: string) => void;
}

export const FarmerDetailModal: React.FC<FarmerDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onOpenProcurementModal,
}) => {
  const { privacyMode } = useQueue();

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Farmer Procurement Record • ${item.token}`}
      subtitle="Complete farmer registration, land quota, and slot booking overview"
      maxWidth="xl"
    >
      <div className="space-y-6">
        
        {/* Status Header Badge Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-bold text-base border border-emerald-500/30">
              {item.token}
            </span>
            <div>
              <h4 className="font-extrabold text-white text-base">
                {maskName(item.farmerName, privacyMode)}
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Farmer ID: {item.farmerId}
              </p>
            </div>
          </div>
          <QueueBadge status={item.status} size="lg" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Personal & Land Records */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Identity & Registration</span>
            </h5>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Aadhaar Card:</span>
                <strong className="text-slate-200 font-mono">
                  {maskAadhaar(item.aadhaarLast4, privacyMode)}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Registered Phone:</span>
                <strong className="text-slate-200 font-mono">{item.farmerPhone}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Verification Badge:</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  PM-KISAN Verified
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Gate Pass ID:</span>
                <strong className="text-slate-200 font-mono">{item.gatePassId || 'GP-PENDING'}</strong>
              </div>
            </div>
          </div>

          {/* Booking & Crop Details */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wheat className="w-4 h-4" />
              <span>Crop & Slot Schedule</span>
            </h5>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Produce Crop:</span>
                <strong className="text-white font-semibold">{item.crop}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Variety Code:</span>
                <strong className="text-slate-200">{item.variety || 'Standard MSP'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Booked Quota:</span>
                <strong className="text-emerald-400 font-bold">{item.bookedQuantity} Quintals</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Booked Time Slot:</span>
                <strong className="text-slate-200">{item.slot}</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Procurement Entry Result (If Processed or Completed) */}
        {item.totalAmount ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-3">
            <h5 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              <span>Procurement Weighbridge Summary</span>
            </h5>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Actual Weight:</span>
                <strong className="text-emerald-400 text-sm font-bold">{item.actualQuantity} Qtl</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">MSP Rate/Qtl:</span>
                <strong className="text-white text-sm font-bold">₹{item.ratePerQuintal}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Total Amount:</span>
                <strong className="text-emerald-300 text-sm font-extrabold">{formatCurrency(item.totalAmount)}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Quality Grade:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs inline-block">
                  Grade {item.qualityGrade || 'A'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                DBT Payment Status:
              </span>
              <PaymentBadge status={item.paymentStatus || 'PENDING'} />
            </div>
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Close Window
          </button>
          
          {item.status === 'PROCESSING' && (
            <button
              onClick={() => {
                onClose();
                onOpenProcurementModal(item.token);
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg glow-emerald"
            >
              Enter Procurement Weight & Rate
            </button>
          )}
        </div>

      </div>
    </Modal>
  );
};
