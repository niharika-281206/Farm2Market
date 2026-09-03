import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'indigo' | 'amber' | 'sky' | 'rose' | 'slate';
  pulse?: boolean;
  compact?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'slate',
  pulse = false,
  compact = false,
}) => {
  const iconStyles: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  const valueStyles: Record<string, string> = {
    emerald: 'text-emerald-700',
    indigo: 'text-indigo-700',
    amber: 'text-amber-700',
    sky: 'text-sky-700',
    rose: 'text-rose-700',
    slate: 'text-slate-800',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${
        pulse ? 'ring-2 ring-amber-200 ring-offset-1' : ''
      } ${compact ? 'p-3.5' : 'p-4'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-tight">
            {title}
          </p>
          <p className={`${compact ? 'text-xl' : 'text-2xl'} font-extrabold mt-1 tracking-tight ${valueStyles[variant]}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg border ${iconStyles[variant]} shrink-0`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
    </div>
  );
};
