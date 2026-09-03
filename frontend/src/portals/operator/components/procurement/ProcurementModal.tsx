import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useQueue } from '../../context/QueueContext';
import { procurementService } from '../../services/procurementService';
import { formatCurrency, maskName } from '../../utils/privacy';
import { Scale, Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProcurementModalProps {
  token: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProcurementModal: React.FC<ProcurementModalProps> = ({
  token,
  isOpen,
  onClose,
}) => {
  const { queue, submitProcurement, privacyMode } = useQueue();
  const currentItem = queue.find(q => q.token.toUpperCase() === token?.toUpperCase());

  const [grossWeight, setGrossWeight] = useState<number>(0);
  const [tareWeight, setTareWeight] = useState<number>(0);
  const [ratePerQuintal, setRatePerQuintal] = useState<number>(2275);
  const [qualityGrade, setQualityGrade] = useState<'A' | 'B' | 'C' | 'Grade-1'>('A');
  const [moistureContent, setMoistureContent] = useState<number>(11.5);
  const [remarks, setRemarks] = useState<string>('Weighbridge verified & moisture passed.');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Net Weight auto-calculation
  const netWeight = Math.max(0, grossWeight - tareWeight);

  useEffect(() => {
    if (currentItem) {
      const booked = currentItem.actualQuantity || currentItem.bookedQuantity || 0;
      setGrossWeight(booked);
      setTareWeight(0);
      setError(null);

      const cropName = currentItem.crop.toLowerCase();
      if (cropName.includes('mustard') || cropName.includes('sarson')) {
        setRatePerQuintal(5650);
      } else if (cropName.includes('gram') || cropName.includes('chana')) {
        setRatePerQuintal(5440);
      } else if (cropName.includes('paddy') || cropName.includes('dhan')) {
        setRatePerQuintal(2183);
      } else {
        setRatePerQuintal(2275);
      }
    }
  }, [currentItem]);

  const totalAmount = procurementService.calculateTotal(netWeight, ratePerQuintal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentItem) return;

    if (netWeight <= 0) {
      setError('Net weight must be greater than 0. Check Gross and Tare weights.');
      return;
    }
    if (ratePerQuintal <= 0) {
      setError('Rate per quintal must be greater than 0.');
      return;
    }
    if (grossWeight < tareWeight) {
      setError('Gross weight cannot be less than tare weight.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await submitProcurement({
        token: currentItem.token,
        actualQuantity: netWeight,
        ratePerQuintal,
        qualityGrade,
        moistureContent,
        totalAmount,
        remarks,
      });

      toast.success(
        `Procurement completed for ${currentItem.token}! Amount: ${formatCurrency(totalAmount)}`,
        { duration: 5000 }
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit procurement entry.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!currentItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Procurement Entry • ${currentItem.token}`}
      subtitle="Record weighbridge weight, quality grade, and MSP rate"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Farmer Context */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">Farmer:</span>
            <strong className="text-slate-800 text-sm">
              {maskName(currentItem.farmerName, privacyMode)}
            </strong>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {currentItem.crop} • Booked: <strong>{currentItem.bookedQuantity} Qtl</strong>
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-800 font-mono font-bold border border-green-200">
            {currentItem.token}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Weight Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Gross Weight (Qtl) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={grossWeight || ''}
              onChange={e => setGrossWeight(parseFloat(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-green-500 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">Vehicle + crop weight</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Tare Weight (Qtl)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={tareWeight || ''}
              onChange={e => setTareWeight(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-green-500 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">Empty vehicle weight</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Net Weight (Qtl)
            </label>
            <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-bold text-green-700 font-mono">
              {netWeight.toFixed(1)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Gross − Tare</p>
          </div>
        </div>

        {/* Quality & Rate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              MSP Rate (₹/Qtl) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="1"
                min="100"
                value={ratePerQuintal || ''}
                onChange={e => setRatePerQuintal(parseFloat(e.target.value) || 0)}
                required
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-green-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Quality Grade *
            </label>
            <select
              value={qualityGrade}
              onChange={e => setQualityGrade(e.target.value as 'A' | 'B' | 'C' | 'Grade-1')}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-green-500"
            >
              <option value="A">Grade A (Premium — Full MSP)</option>
              <option value="Grade-1">Grade 1 (FAQ Standard)</option>
              <option value="B">Grade B (Minor Refraction)</option>
              <option value="C">Grade C (Subject to Deduction)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Moisture Content (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="25"
                value={moistureContent || ''}
                onChange={e => setMoistureContent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-green-500 font-mono"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Limit ≤ 12%</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="e.g. Weighbridge Slip #WB-901"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* Total Calculation */}
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-green-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              Total = Net Wt ({netWeight.toFixed(1)}) × Rate (₹{ratePerQuintal})
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-slate-700">Disbursement Amount:</span>
            <span className="text-2xl font-extrabold text-green-700">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || totalAmount <= 0}
            className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                COMPLETE PROCUREMENT
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
