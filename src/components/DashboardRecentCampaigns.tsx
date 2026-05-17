import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Clock3, XCircle } from 'lucide-react';

interface Campaign {
  id: string;
  dimension: string;
  analista: string;
  created_at: string;
  tamanio_audiencia: number;
  estado: string;
}

interface DashboardRecentCampaignsProps {
  campaigns: Campaign[];
  showViewAll?: boolean;
  loading?: boolean;
  userRole?: string;
}

function getCampaignStateBadge(estado: string) {
  switch (estado) {
    case 'aprobada':
      return (
        <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3 mr-1" /> APROBADA
        </span>
      );
    case 'pendiente_aprobacion':
      return (
        <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
          <Clock3 className="w-3 h-3 mr-1" /> PENDIENTE
        </span>
      );
    case 'borrador':
      return (
        <span className="inline-flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
          BORRADOR
        </span>
      );
    case 'rechazada':
      return (
        <span className="inline-flex items-center text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded">
          <XCircle className="w-3 h-3 mr-1" /> RECHAZADA
        </span>
      );
    default:
      return (
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
          {estado}
        </span>
      );
  }
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `Hace ${hours}h`;
  return `Hace ${Math.floor(hours / 24)}d`;
}

function CampaignLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

export function DashboardRecentCampaigns({
  campaigns,
  showViewAll = false,
  loading = false,
  userRole,
}: DashboardRecentCampaignsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          CAMPAÑAS RECIENTES
        </h2>
        {showViewAll && userRole === 'coordinador' && (
          <Link
            to="/aprobacion"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Ver todas →
          </Link>
        )}
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {loading ? (
          <div className="px-6 py-6">
            <CampaignLoadingSkeleton />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
            No hay campañas recientes en el sistema.
          </div>
        ) : (
          campaigns.map((c) => (
            <div
              key={c.id}
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize">
                    📌 {c.dimension}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    — Creado por {c.analista}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" /> {getTimeAgo(c.created_at)}
                  </span>
                  <span>·</span>
                  <span>
                    {c.tamanio_audiencia > 0
                      ? `${c.tamanio_audiencia} clientes`
                      : 'Audiencia dinámica'}
                  </span>
                </div>
              </div>
              <div>{getCampaignStateBadge(c.estado)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
