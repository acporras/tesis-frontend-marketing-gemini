import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { 
  UserPlus, 
  HeartHandshake, 
  RotateCcw, 
  CheckSquare, 
  BarChart3,
} from 'lucide-react';
import { DashboardWelcome } from '../components/DashboardWelcome';
import { DashboardModuleGrid } from '../components/DashboardModuleGrid';
import { DashboardMetricsSection } from '../components/DashboardMetricsSection';
import { DashboardRecentCampaigns } from '../components/DashboardRecentCampaigns';

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [metricas, setMetricas] = useState<any>(null);
  const [campanasRecientes, setCampanasRecientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [metricasRes, recientesRes] = await Promise.all([
          fetch(`${API_URL}/metricas/resumen`, { headers }),
          fetch(`${API_URL}/dashboard/recientes`, { headers })
        ]);

        if (metricasRes.ok) {
          const mData = await metricasRes.json();
          setMetricas(mData);
        }
        
        if (recientesRes.ok) {
          const rData = await recientesRes.json();
          setCampanasRecientes(rData);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  const modules = [
    {
      title: 'Onboarding',
      description: 'Crea campañas para nuevos clientes y asegura su activación inicial.',
      icon: UserPlus,
      color: 'bg-emerald-500',
      path: '/onboarding',
      roles: ['analista', 'coordinador']
    },
    {
      title: 'Fidelización',
      description: 'Genera incentivos para aumentar el uso de tarjeta y fidelidad.',
      icon: HeartHandshake,
      color: 'bg-blue-500',
      path: '/fidelizacion',
      roles: ['analista', 'coordinador']
    },
    {
      title: 'Reactivación',
      description: 'Recupera clientes inactivos con ofertas personalizadas.',
      icon: RotateCcw,
      color: 'bg-violet-500',
      path: '/reactivacion',
      roles: ['analista', 'coordinador']
    },
    {
      title: 'Aprobaciones',
      description: 'Revisa y aprueba campañas pendientes generadas por analistas.',
      icon: CheckSquare,
      color: 'bg-amber-500',
      path: '/aprobacion',
      roles: ['coordinador']
    },
    {
      title: 'Analítica Global',
      description: 'Monitorea el rendimiento del sistema (I1, I2, I3) y métricas clave.',
      icon: BarChart3,
      color: 'bg-rose-500',
      path: '/metricas',
      roles: ['coordinador']
    }
  ];

  const visibleModules = modules.filter(m => 
    usuario?.rol && m.roles.includes(usuario.rol)
  );

  return (
    <div className="space-y-6">
      <DashboardWelcome userName={usuario?.nombre || ''} />

      {/* SECCIÓN 1: NAVEGACIÓN RÁPIDA */}
      <DashboardModuleGrid modules={visibleModules} />

      {/* SECCIÓN 2: MÉTRICAS E INDICADORES */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          RESUMEN DE INDICADORES (Histórico Global)
        </h2>
        <DashboardMetricsSection metrics={metricas} loading={loading} />
      </div>

      {/* SECCIÓN 3: CAMPAÑAS RECIENTES */}
      <DashboardRecentCampaigns
        campaigns={campanasRecientes}
        showViewAll
        loading={loading}
        userRole={usuario?.rol}
      />
    </div>
  );
}
