import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { 
  UserPlus, 
  HeartHandshake, 
  RotateCcw, 
  CheckSquare, 
  BarChart3,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Clock3
} from 'lucide-react';

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          ¡Hola, {usuario?.nombre?.split(' ')[0]}! 👋
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Bienvenido al sistema ADCAMI. ¿Qué te gustaría gestionar hoy?
        </p>
      </div>

      {/* SECCIÓN 1: NAVEGACIÓN RÁPIDA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {visibleModules.map((modulo) => (
          <Link 
            key={modulo.title} 
            to={modulo.path}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1.5 h-full ${modulo.color}`} />
            
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${modulo.color} bg-opacity-10`}>
                <modulo.icon className={`h-6 w-6 ${modulo.color.replace('bg-', 'text-')}`} />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
            </div>
            
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                {modulo.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {modulo.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <div className="h-6 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-5 w-28 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3 mt-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="p-6 space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SECCIÓN 2: MÉTRICAS E INDICADORES */}
          <div className="lg:col-span-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">RESUMEN DE INDICADORES (Histórico Global)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* I1 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">I1 - Tiempo Respuesta</p>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {metricas?.I1?.valor || '0'}<span className="text-lg text-gray-500 dark:text-gray-400 ml-1">ms</span>
                </div>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${metricas?.I1?.cumple_meta ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {metricas?.I1?.cumple_meta ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  Meta ≤ {metricas?.I1?.meta} ms
                </div>
              </div>
              {/* I2 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">I2 - Anonimización</p>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {metricas?.I2?.valor || '0'}<span className="text-lg text-gray-500 dark:text-gray-400 ml-1">%</span>
                </div>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${metricas?.I2?.cumple_meta ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {metricas?.I2?.cumple_meta ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  Meta ≥ {metricas?.I2?.meta}%
                </div>
              </div>
              {/* I3 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">I3 - Precisión Segmento</p>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {metricas?.I3?.valor || '0'}<span className="text-lg text-gray-500 dark:text-gray-400 ml-1">%</span>
                </div>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${metricas?.I3?.cumple_meta ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {metricas?.I3?.cumple_meta ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  Meta ≥ {metricas?.I3?.meta}%
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: CAMPAÑAS RECIENTES */}
          <div className="lg:col-span-3 mt-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">CAMPAÑAS RECIENTES</h2>
                {usuario?.rol === 'coordinador' && (
                  <Link to="/aprobacion" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Ver todas →
                  </Link>
                )}
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {campanasRecientes.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No hay campañas recientes en el sistema.
                  </div>
                ) : (
                  campanasRecientes.map((c) => {
                    const timeAgo = (dateStr: string) => {
                      const diff = Date.now() - new Date(dateStr).getTime();
                      const hours = Math.floor(diff / (1000 * 60 * 60));
                      if (hours < 24) return `Hace ${hours}h`;
                      return `Hace ${Math.floor(hours / 24)}d`;
                    };

                    const getStateBadge = (estado: string) => {
                      switch (estado) {
                        case 'aprobada': return <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded"><CheckCircle2 className="w-3 h-3 mr-1"/> APROBADA</span>;
                        case 'pendiente_aprobacion': return <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded"><Clock3 className="w-3 h-3 mr-1"/> PENDIENTE</span>;
                        case 'borrador': return <span className="inline-flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">BORRADOR</span>;
                        case 'rechazada': return <span className="inline-flex items-center text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded"><XCircle className="w-3 h-3 mr-1"/> RECHAZADA</span>;
                        default: return <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{estado}</span>;
                      }
                    };

                    return (
                      <div key={c.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize">📌 {c.dimension}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">— Creado por {c.analista}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {timeAgo(c.created_at)}</span>
                            <span>·</span>
                            <span>{c.tamanio_audiencia > 0 ? `${c.tamanio_audiencia} clientes` : 'Audiencia dinámica'}</span>
                          </div>
                        </div>
                        <div>
                          {getStateBadge(c.estado)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
