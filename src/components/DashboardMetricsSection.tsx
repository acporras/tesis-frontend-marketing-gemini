import { DashboardMetricCard } from './DashboardMetricCard';

interface Metrics {
  I1?: {
    valor: number;
    meta: number;
    cumple_meta: boolean;
  };
  I2?: {
    valor: number;
    meta: number;
    cumple_meta: boolean;
  };
  I3?: {
    valor: number;
    meta: number;
    cumple_meta: boolean;
  };
}

interface DashboardMetricsSectionProps {
  metrics: Metrics | null;
  loading?: boolean;
}

function MetricsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center"
        >
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-3"></div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
          <div className="h-5 w-28 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

export function DashboardMetricsSection({
  metrics,
  loading = false,
}: DashboardMetricsSectionProps) {
  if (loading) {
    return <MetricsLoadingSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* I1 - Tiempo Respuesta */}
      <DashboardMetricCard
        label="I1 - Tiempo Respuesta"
        value={metrics?.I1?.valor || '0'}
        unit="ms"
        cumulsMeta={metrics?.I1?.cumple_meta || false}
        meta={metrics?.I1?.meta || '0'}
        metaLabel="Meta ≤"
      />

      {/* I2 - Anonimización */}
      <DashboardMetricCard
        label="I2 - Anonimización"
        value={metrics?.I2?.valor || '0'}
        unit="%"
        cumulsMeta={metrics?.I2?.cumple_meta || false}
        meta={metrics?.I2?.meta || '0'}
        metaLabel="Meta ≥"
      />

      {/* I3 - Precisión Segmento */}
      <DashboardMetricCard
        label="I3 - Precisión Segmento"
        value={metrics?.I3?.valor || '0'}
        unit="%"
        cumulsMeta={metrics?.I3?.cumple_meta || false}
        meta={metrics?.I3?.meta || '0'}
        metaLabel="Meta ≥"
      />
    </div>
  );
}
