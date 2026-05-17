import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Clock3, XCircle, ArrowRight } from 'lucide-react';

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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-gray-50 dark:from-slate-800 dark:to-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Campañas Recientes
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Últimas acciones en el sistema</p>
        </div>
        {showViewAll && userRole === 'coordinador' && (
          <Link
            to="/aprobacion"
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="divide-y divide-gray-100 dark:divide-slate-700">
        {loading ? (
          <div className="px-6 py-6">
            <CampaignLoadingSkeleton />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full mb-3">
              <Clock className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No hay campañas recientes</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Comienza creando una nueva campaña</p>
          </div>
        ) : (
          campaigns.map((c, idx) => (
            <div
              key={c.id}
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900 dark:text-white capitalize truncate">
                      {c.dimension}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      por {c.analista}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                      {getTimeAgo(c.created_at)}
                    </span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline">
                      {c.tamanio_audiencia > 0
                        ? `${c.tamanio_audiencia} clientes`
                        : 'Audiencia dinámica'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                {getCampaignStateBadge(c.estado)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
