import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useQueue } from '../../context/QueueContext';
import { QueueItem, PaymentStatus } from '../../types';
import { formatCurrency, maskName } from '../../utils/privacy';
import { CreditCard, CheckCheck, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

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

      alert(`Payment status for Token ${item.token} updated to ${paymentStatus}!`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update payment status.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update DBT Payment Status • ${item.token}`}
      subtitle="Record Direct Benefit Transfer (DBT) bank payout transaction details"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Token Context */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Farmer Name:</span>
            <strong className="text-white text-sm">
              {maskName(item.farmerName, privacyMode)}
            </strong>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Crop: {item.crop} ({item.actualQuantity || item.bookedQuantity} Qtl)
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold">
            {item.token}
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Payment Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Disbursement Amount (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
              ₹
            </span>
            <input
              type="number"
              value={paymentAmount || ''}
              onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
              required
              className="w-full pl-8 pr-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Payment Status Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            DBT Status *
          </label>
          <select
            value={paymentStatus}
            onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="PENDING">PENDING (Awaiting Bank Batch)</option>
            <option value="PROCESSING">PROCESSING (Under Bank Gateway)</option>
            <option value="COMPLETED">COMPLETED (DBT Account Credited)</option>
            <option value="FAILED">FAILED (Bank Aadhaar Link Mismatch)</option>
          </select>
        </div>

        {/* Transaction ID / UTR */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Bank Transaction ID / UTR Ref
          </label>
          <input
            type="text"
            value={transactionId}
            onChange={e => setTransactionId(e.target.value)}
            placeholder="e.g. TXN-908123891"
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Payment Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Payment Date
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={e => setPaymentDate(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg glow-emerald flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            <span>UPDATE PAYMENT STATUS</span>
          </button>
        </div>

      </form>
    </Modal>
  );
};
