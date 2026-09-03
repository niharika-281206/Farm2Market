import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { CentreReport } from '../../types';
import { StatCard } from '../common/StatCard';
import { formatCurrency } from '../../utils/privacy';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  Scale, 
  IndianRupee,
  Wheat,
  Sparkles
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [report, setReport] = useState<CentreReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadReport(selectedDate);
  }, [selectedDate]);

  const loadReport = async (date: string) => {
    try {
      setLoading(true);
      const data = await reportService.getCentreReport(date);
      setReport(data);
    } catch (err) {
      console.error('Error fetching centre report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!report) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Procurement Centre Daily Report\n';
    csvContent += `Date,${report.date}\n`;
    csvContent += `Daily Farmers,${report.dailyFarmersCount}\n`;
    csvContent += `Completed Procurement,${report.completedProcurementCount}\n`;
    csvContent += `Pending Procurement,${report.pendingProcurementCount}\n`;
    csvContent += `Total Quantity (Quintals),${report.totalQuantityQuintals}\n`;
    csvContent += `Total Payment Disbursed (Rs),${report.totalPaymentAmount}\n\n`;
    csvContent += 'Crop,Total Farmers,Quantity (Qtl),Amount (Rs)\n';

    report.cropWiseBreakdown.forEach(row => {
      csvContent += `"${row.crop}",${row.totalFarmers},${row.quantityQuintals},${row.amountRs}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `procurement_report_${report.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Date Controls */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Procurement Centre Daily Reports</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive operational summary, tonnage metrics, and financial DBT audit reports.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2.5">
            {/* Date Selector */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Total Farmers"
          value={report?.dailyFarmersCount || 0}
          subtitle="Total token bookings today"
          icon={Users}
          variant="sky"
        />

        <StatCard
          title="Completed Procurement"
          value={report?.completedProcurementCount || 0}
          subtitle="Finalized entries"
          icon={CheckCircle2}
          variant="emerald"
        />

        <StatCard
          title="Pending Procurement"
          value={report?.pendingProcurementCount || 0}
          subtitle="In queue or processing"
          icon={Clock}
          variant="amber"
        />

        <StatCard
          title="Total Procurement Quantity"
          value={`${report?.totalQuantityQuintals || 0} Qtl`}
          subtitle="Net weighbridge tonnage"
          icon={Scale}
          variant="indigo"
        />
      </div>

      {/* Financials & Duration Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Payment Amount (DBT)"
          value={formatCurrency(report?.totalPaymentAmount || 0)}
          subtitle="Total farmer payout value"
          icon={IndianRupee}
          variant="emerald"
        />

        <StatCard
          title="Average Waiting Time"
          value={`${report?.avgWaitingTime || 0} mins`}
          subtitle="Queue gate to call time"
          icon={Clock}
          variant="slate"
        />

        <StatCard
          title="Average Processing Time"
          value={`${report?.avgProcessingTime || 0} mins`}
          subtitle="Weighbridge & grade entry time"
          icon={Clock}
          variant="slate"
        />
      </div>

      {/* Crop Wise Breakdown Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Wheat className="w-5 h-5 text-emerald-400" />
            <span>Crop-Wise Procurement Distribution</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Date: {report?.date}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Produce Crop</th>
                <th className="py-3 px-4">Total Farmers</th>
                <th className="py-3 px-4">Quantity Procured (Qtl)</th>
                <th className="py-3 px-4">Disbursed Amount (₹)</th>
                <th className="py-3 px-4 text-right">Avg Rate / Qtl</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {report?.cropWiseBreakdown.map((row, idx) => {
                const avgRate = row.quantityQuintals > 0 ? Math.round(row.amountRs / row.quantityQuintals) : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {row.crop}
                    </td>
                    <td className="py-3.5 px-4 font-mono">{row.totalFarmers} Farmers</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                      {row.quantityQuintals} Qtl
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white font-mono">
                      {formatCurrency(row.amountRs)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      ₹{avgRate} / Qtl
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
