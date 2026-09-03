import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useQueue } from '../../context/QueueContext';
import { QueueItem } from '../../types';
import { procurementService } from '../../services/procurementService';
import { formatCurrency, maskName } from '../../utils/privacy';
import { Scale, Calculator, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

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

  const [actualQuantity, setActualQuantity] = useState<number>(0);
  const [ratePerQuintal, setRatePerQuintal] = useState<number>(2275);
  const [qualityGrade, setQualityGrade] = useState<'A' | 'B' | 'C' | 'Grade-1'>('A');
  const [moistureContent, setMoistureContent] = useState<number>(11.5);
  const [remarks, setRemarks] = useState<string>('Weighbridge verified & moisture passed.');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Default MSP rates by crop
  useEffect(() => {
    if (currentItem) {
      setActualQuantity(currentItem.actualQuantity || currentItem.bookedQuantity || 0);

      // Default MSP lookup
      const cropName = currentItem.crop.toLowerCase();
      if (cropName.includes('mustard') || cropName.includes('sarson')) {
        setRatePerQuintal(5650);
      } else if (cropName.includes('gram') || cropName.includes('chana')) {
        setRatePerQuintal(5440);
      } else if (cropName.includes('paddy') || cropName.includes('dhan')) {
        setRatePerQuintal(2183);
      } else {
        // Wheat MSP 2026 default
        setRatePerQuintal(2275);
      }
    }
  }, [currentItem]);

  // Automatic calculation using required formula: Total = Actual Quantity × Rate
  const totalAmount = procurementService.calculateTotal(actualQuantity, ratePerQuintal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentItem) return;

    if (actualQuantity <= 0) {
      setError('Actual quantity must be greater than 0 Quintals.');
      return;
    }

    if (ratePerQuintal <= 0) {
      setError('Rate per quintal must be greater than 0.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await submitProcurement({
        token: currentItem.token,
        actualQuantity,
        ratePerQuintal,
        qualityGrade,
        moistureContent,
        totalAmount,
        remarks,
      });

      alert(`Procurement entry for Token ${token} completed! Total Amount: ${formatCurrency(totalAmount)}`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit procurement entry.';
      setError(msg);
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
      subtitle="Record actual weighbridge weight, quality inspection metrics, and MSP rate calculation"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Token & Farmer Context Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Farmer Name:</span>
            <strong className="text-white text-sm font-bold">
              {maskName(currentItem.farmerName, privacyMode)}
            </strong>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Crop: <strong className="text-slate-200">{currentItem.crop}</strong> • Booked Slot Wt: <strong className="text-emerald-400">{currentItem.bookedQuantity} Qtl</strong>
            </p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30">
              {currentItem.token}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Entry Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Actual Weight Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Actual Weight / Quantity (Quintals) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={actualQuantity || ''}
                onChange={e => setActualQuantity(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-emerald-400">
                Qtl
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">From Digital Weighbridge scale</p>
          </div>

          {/* Rate per Quintal Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              MSP Rate per Quintal (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="1"
                min="100"
                value={ratePerQuintal || ''}
                onChange={e => setRatePerQuintal(parseFloat(e.target.value) || 0)}
                required
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Government MSP 2026 Rate</p>
          </div>

          {/* Quality Grade Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Quality Grade / Status *
            </label>
            <select
              value={qualityGrade}
              onChange={e => setQualityGrade(e.target.value as 'A' | 'B' | 'C' | 'Grade-1')}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="A">Grade A (Premium Quality - Full MSP)</option>
              <option value="Grade-1">Grade 1 (FAQ Standard)</option>
              <option value="B">Grade B (Minor Refraction)</option>
              <option value="C">Grade C (Subject to Deduction)</option>
            </select>
          </div>

          {/* Moisture Percentage */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
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
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                %
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Standard limit ≤ 12%</p>
          </div>

        </div>

        {/* Remarks Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Operator Inspection Remarks
          </label>
          <input
            type="text"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="e.g. Weighbridge Slip #WB-901 generated"
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* AUTO-CALCULATED TOTAL AMOUNT DISPLAY BOX */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 glow-emerald space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              <span>Automated Procurement Formula</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Total = Actual Wt ({actualQuantity} Qtl) × Rate (₹{ratePerQuintal})
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-slate-200">
              Calculated Total Disbursement:
            </span>
            <span className="text-2xl font-black text-emerald-300 font-display">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading || totalAmount <= 0}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg glow-emerald flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>COMPLETE PROCUREMENT</span>
          </button>
        </div>

      </form>
    </Modal>
  );
};
