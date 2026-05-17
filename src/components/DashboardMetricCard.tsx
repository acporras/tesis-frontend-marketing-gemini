import { CheckCircle2, AlertCircle } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  cumulsMeta: boolean;
  meta: string | number;
  metaLabel: string;
}

export function DashboardMetricCard({
  label,
  value,
  unit,
  cumulsMeta,
  meta,
  metaLabel,
}: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all duration-200 p-6">
      {/* Status indicator top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${cumulsMeta ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {value}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{unit}</span>
          </div>
        </div>
        <div className={`p-2 rounded-lg ${cumulsMeta ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
          {cumulsMeta ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          )}
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
        <p className={`text-xs font-medium ${cumulsMeta ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
          {metaLabel} {meta} {unit}
        </p>
        <p className={`text-xs mt-1 ${cumulsMeta ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {cumulsMeta ? '✓ Meta alcanzada' : '⚠ Revisar progreso'}
        </p>
      </div>
    </div>
  );
}
