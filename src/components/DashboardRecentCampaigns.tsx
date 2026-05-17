import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
import { CampaignCard } from './CampaignCard';

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

export function DashboardRecentCampaigns({
  campaigns,
  showViewAll = false,
  loading = false,
  userRole,
}: DashboardRecentCampaignsProps) {
  return (
    <div className="space-y-4">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Campañas Recientes
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
            Seguimiento de tus últimas campañas y estado actual
          </p>
        </div>
        {showViewAll && userRole === 'coordinador' && (
          <Link
            to="/aprobacion"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Campaigns grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 animate-pulse"
            />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 py-12 text-center bg-gray-50 dark:bg-slate-900/20">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-full mb-4">
            <Clock className="w-7 h-7 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">No hay campañas recientes</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Comienza creando una nueva campaña para verla aquí
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c, idx) => (
            <CampaignCard key={c.id} campaign={c} index={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
