import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'indigo' | 'amber' | 'sky' | 'rose' | 'slate';
  pulse?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'slate',
  pulse = false,
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    sky: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    slate: 'bg-slate-800/60 border-slate-700/60 text-slate-300',
  };

  return (
    <div className={`p-4 rounded-2xl glass-panel glass-panel-hover relative overflow-hidden ${pulse ? 'border-amber-500/40 glow-amber' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-extrabold text-white mt-1 font-display tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${variantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
