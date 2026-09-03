import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { CentreReport } from '../../types';
import { StatCard } from '../common/StatCard';
import { formatCurrency } from '../../utils/privacy';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Users, 
  CheckCircle2, 
  Clock, 
  Scale, 
  IndianRupee,
  Wheat,
  CalendarDays,
  FileText
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [report, setReport] = useState<CentreReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [activeDateFilter, setActiveDateFilter] = useState<'TODAY' | 'YESTERDAY' | 'CUSTOM'>('TODAY');

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

  const handleDateFilterClick = (filter: 'TODAY' | 'YESTERDAY') => {
    setActiveDateFilter(filter);
    const date = new Date();
    if (filter === 'YESTERDAY') {
      date.setDate(date.getDate() - 1);
    }
    setSelectedDate(date.toISOString().split('T')[0]);
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
    <div className="space-y-5">
      
      {/* Header & Controls */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Procurement Reports
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive operational summary, tonnage metrics, and financial audit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all"
            >
              <Download className="w-4 h-4 text-green-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => handleDateFilterClick('TODAY')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeDateFilter === 'TODAY' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Today
            </button>
            <button
              onClick={() => handleDateFilterClick('YESTERDAY')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeDateFilter === 'YESTERDAY' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setActiveDateFilter('CUSTOM')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeDateFilter === 'CUSTOM' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Custom
            </button>
          </div>

          <div className="relative">
            <CalendarDays className="w-4 h-4 absolute left-3 top-2 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => {
                setSelectedDate(e.target.value);
                setActiveDateFilter('CUSTOM');
              }}
              className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Operations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              title="Daily Total Farmers"
              value={report?.dailyFarmersCount || 0}
              subtitle="Total token bookings today"
              icon={Users}
              variant="sky"
              compact
            />
            <StatCard
              title="Completed Procurement"
              value={report?.completedProcurementCount || 0}
              subtitle="Finalized entries"
              icon={CheckCircle2}
              variant="emerald"
              compact
            />
            <StatCard
              title="Pending Procurement"
              value={report?.pendingProcurementCount || 0}
              subtitle="In queue or processing"
              icon={Clock}
              variant="amber"
              compact
            />
            <StatCard
              title="Total Procured (Qtl)"
              value={report?.totalQuantityQuintals || 0}
              subtitle="Net weighbridge tonnage"
              icon={Scale}
              variant="indigo"
              compact
            />
          </div>

          {/* Financials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              title="Total Payout (DBT)"
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
              title="Avg Processing Time"
              value={`${report?.avgProcessingTime || 0} mins`}
              subtitle="Weighbridge to completion"
              icon={Clock}
              variant="slate"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Crop-Wise Breakdown
              </h3>
              <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">Date: {report?.date}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Produce Crop</th>
                    <th className="py-3 px-4">Total Farmers</th>
                    <th className="py-3 px-4">Procured (Qtl)</th>
                    <th className="py-3 px-4">Disbursed (₹)</th>
                    <th className="py-3 px-4 text-right">Avg Rate / Qtl</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!report?.cropWiseBreakdown.length ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">No procurement data for this date.</td>
                    </tr>
                  ) : (
                    report.cropWiseBreakdown.map((row, idx) => {
                      const avgRate = row.quantityQuintals > 0 ? Math.round(row.amountRs / row.quantityQuintals) : 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                            <Wheat className="w-3.5 h-3.5 text-green-600" />
                            {row.crop}
                          </td>
                          <td className="py-3 px-4">{row.totalFarmers} Farmers</td>
                          <td className="py-3 px-4 font-bold text-green-700">
                            {row.quantityQuintals} Qtl
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {formatCurrency(row.amountRs)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500">
                            ₹{avgRate} / Qtl
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
