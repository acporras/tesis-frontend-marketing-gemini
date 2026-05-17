import { CheckCircle2, XCircle } from 'lucide-react';

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
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {value}
        <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">{unit}</span>
      </div>
      <div
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          cumulsMeta
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {cumulsMeta ? (
          <CheckCircle2 className="w-3 h-3 mr-1" />
        ) : (
          <XCircle className="w-3 h-3 mr-1" />
        )}
        {metaLabel} {meta}
      </div>
    </div>
  );
}
