import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useQueue } from '../../context/QueueContext';
import { QueueItem, PaymentStatus } from '../../types';
import { formatCurrency, maskName } from '../../utils/privacy';
import { CheckCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  item: QueueItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const { updatePayment, privacyMode } = useQueue();

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('COMPLETED');
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('DBT direct bank transfer processed.');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setPaymentAmount(item.totalAmount || 0);
      setPaymentStatus(item.paymentStatus || 'COMPLETED');
      setTransactionId(item.transactionId || `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`);
      setPaymentDate(item.paymentDate || new Date().toISOString().substring(0, 10));
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (paymentAmount <= 0) {
      setError('Payment amount must be greater than 0.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await updatePayment({
        token: item.token,
        paymentAmount,
        paymentStatus,
        transactionId: transactionId.trim() || `TXN-${Date.now()}`,
        paymentDate: paymentDate || new Date().toISOString().substring(0, 10),
        remarks,
      });

      toast.success(`Payment for ${item.token} updated to ${paymentStatus}!`, { duration: 4000 });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update payment status.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`DBT Payment • ${item.token}`}
      subtitle="Update Direct Benefit Transfer payout status"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Context */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Farmer:</span>
            <strong className="text-slate-800 text-sm">{maskName(item.farmerName, privacyMode)}</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {item.crop} ({item.actualQuantity || item.bookedQuantity} Qtl)
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-800 font-mono font-bold border border-green-200">
            {item.token}
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Disbursement Amount (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
            <input
              type="number"
              value={paymentAmount || ''}
              onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
              required
              className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 font-mono focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            DBT Status *
          </label>
          <select
            value={paymentStatus}
            onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-green-500"
          >
            <option value="PENDING">PENDING (Awaiting Bank Batch)</option>
            <option value="PROCESSING">PROCESSING (Under Bank Gateway)</option>
            <option value="COMPLETED">COMPLETED (DBT Account Credited)</option>
            <option value="FAILED">FAILED (Bank Aadhaar Link Mismatch)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Transaction ID / UTR
          </label>
          <input
            type="text"
            value={transactionId}
            onChange={e => setTransactionId(e.target.value)}
            placeholder="e.g. TXN-908123891"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Payment Date
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={e => setPaymentDate(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            UPDATE PAYMENT
          </button>
        </div>
      </form>
    </Modal>
  );
};
