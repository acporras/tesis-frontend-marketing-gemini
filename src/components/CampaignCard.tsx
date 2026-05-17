import { CheckCircle2, Clock, Clock3, XCircle, TrendingUp } from 'lucide-react';

interface Campaign {
  id: string;
  dimension: string;
  analista: string;
  created_at: string;
  tamanio_audiencia: number;
  estado: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
}

function getCampaignStateColor(estado: string): { bg: string; icon: JSX.Element; label: string; color: string } {
  switch (estado) {
    case 'aprobada':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        icon: <CheckCircle2 className="w-4 h-4" />,
        label: 'Aprobada',
        color: 'text-emerald-700 dark:text-emerald-400'
      };
    case 'pendiente_aprobacion':
      return {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        icon: <Clock3 className="w-4 h-4" />,
        label: 'Pendiente',
        color: 'text-amber-700 dark:text-amber-400'
      };
    case 'borrador':
      return {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        icon: <Clock className="w-4 h-4" />,
        label: 'Borrador',
        color: 'text-gray-700 dark:text-gray-400'
      };
    case 'rechazada':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Rechazada',
        color: 'text-red-700 dark:text-red-400'
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        icon: <Clock className="w-4 h-4" />,
        label: estado,
        color: 'text-gray-700 dark:text-gray-400'
      };
  }
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `Hace ${hours}h`;
  return `Hace ${Math.floor(hours / 24)}d`;
}

function getDimensionColor(dimension: string): string {
  const colors: Record<string, string> = {
    'Onboarding': 'from-emerald-400 to-emerald-600',
    'Fidelización': 'from-blue-400 to-blue-600',
    'Reactivación': 'from-violet-400 to-violet-600',
  };
  return colors[dimension] || 'from-blue-400 to-blue-600';
}

export function CampaignCard({ campaign, index }: CampaignCardProps) {
  const stateInfo = getCampaignStateColor(campaign.estado);
  const dimensionColor = getDimensionColor(campaign.dimension);
  const timeAgo = getTimeAgo(campaign.created_at);

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700">
      {/* Top gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${dimensionColor}`} />

      {/* Background decoration */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-5 bg-gradient-to-br ${dimensionColor} group-hover:opacity-10 transition-opacity duration-500`} />

      <div className="p-5 relative z-10">
        {/* Header with index and state */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-gray-200 to-gray-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{index}</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors capitalize">
                {campaign.dimension}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                por <span className="font-medium">{campaign.analista}</span>
              </p>
            </div>
          </div>
          
          {/* Status badge */}
          <div className={`${stateInfo.bg} px-3 py-1.5 rounded-lg flex items-center gap-1.5`}>
            <div className={stateInfo.color}>
              {stateInfo.icon}
            </div>
            <span className={`text-xs font-semibold ${stateInfo.color}`}>
              {stateInfo.label}
            </span>
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{timeAgo}</span>
          </div>
          
          {campaign.tamanio_audiencia > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium">{campaign.tamanio_audiencia} clientes</span>
            </div>
          )}
          
          {campaign.tamanio_audiencia === 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-500 italic">Audiencia dinámica</div>
          )}
        </div>
      </div>
    </div>
  );
}
