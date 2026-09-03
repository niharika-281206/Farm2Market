import React from 'react';
import { Modal } from '../common/Modal';
import { QueueItem } from '../../types';
import { QueueBadge, PaymentBadge } from '../common/Badge';
import { maskName, maskAadhaar, formatCurrency } from '../../utils/privacy';
import { useQueue } from '../../context/QueueContext';
import { User, Wheat, Scale, ShieldCheck } from 'lucide-react';

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
      title={`Farmer Record • ${item.token}`}
      subtitle="Complete farmer registration and booking details"
      maxWidth="xl"
    >
      <div className="space-y-5">

        {/* Status Header */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-800 font-mono font-bold text-base border border-green-200">
              {item.token}
            </span>
            <div>
              <h4 className="font-bold text-slate-800 text-base">
                {maskName(item.farmerName, privacyMode)}
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                ID: {item.farmerId}
              </p>
            </div>
          </div>
          <QueueBadge status={item.status} size="lg" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Identity */}
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
            <h5 className="text-xs font-bold text-green-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Identity & Registration
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Aadhaar:</span>
                <strong className="text-slate-700 font-mono">{maskAadhaar(item.aadhaarLast4, privacyMode)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Phone:</span>
                <strong className="text-slate-700 font-mono">{item.farmerPhone}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Verification:</span>
                <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  PM-KISAN Verified
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Gate Pass:</span>
                <strong className="text-slate-700 font-mono">{item.gatePassId || 'GP-PENDING'}</strong>
              </div>
            </div>
          </div>

          {/* Crop & Slot */}
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
            <h5 className="text-xs font-bold text-green-700 uppercase tracking-wider flex items-center gap-1.5">
              <Wheat className="w-4 h-4" />
              Crop & Schedule
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Crop:</span>
                <strong className="text-slate-800">{item.crop}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Variety:</span>
                <strong className="text-slate-700">{item.variety || 'Standard MSP'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Booked Qty:</span>
                <strong className="text-green-700">{item.bookedQuantity} Quintals</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Slot:</span>
                <strong className="text-slate-700">{item.slot}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Procurement Summary (if completed) */}
        {item.totalAmount ? (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 space-y-3">
            <h5 className="text-xs font-bold text-green-800 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              Procurement Summary
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white border border-green-100">
                <span className="text-slate-500 block text-[11px]">Actual Weight:</span>
                <strong className="text-green-700 text-sm">{item.actualQuantity} Qtl</strong>
              </div>
              <div className="p-3 rounded-lg bg-white border border-green-100">
                <span className="text-slate-500 block text-[11px]">MSP Rate:</span>
                <strong className="text-slate-800 text-sm">₹{item.ratePerQuintal}</strong>
              </div>
              <div className="p-3 rounded-lg bg-white border border-green-100">
                <span className="text-slate-500 block text-[11px]">Total Amount:</span>
                <strong className="text-green-700 text-sm font-extrabold">{formatCurrency(item.totalAmount)}</strong>
              </div>
              <div className="p-3 rounded-lg bg-white border border-green-100">
                <span className="text-slate-500 block text-[11px]">Grade:</span>
                <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-bold text-xs inline-block">
                  Grade {item.qualityGrade || 'A'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-600">Payment Status:</span>
              <PaymentBadge status={item.paymentStatus || 'PENDING'} />
            </div>
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
          >
            Close
          </button>
          {item.status === 'PROCESSING' && (
            <button
              onClick={() => { onClose(); onOpenProcurementModal(item.token); }}
              className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-sm"
            >
              Enter Procurement Weight & Rate
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
