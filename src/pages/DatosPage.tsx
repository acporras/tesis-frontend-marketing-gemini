import { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, Calendar, RefreshCcw, DatabaseBackup, Clock } from 'lucide-react';
import { API_URL } from '../config';

export default function DatosPage() {
  const [datos, setDatos] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        const res = await fetch(`${API_URL}/datos/resumen`, { headers });
        
        if (!res.ok) throw new Error('Error al obtener datos');
        
        const data = await res.json();
        setDatos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-xl text-red-700 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Sin registros') return dateString;
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const { total_registros, ultima_ingesta, proxima_ingesta, por_dimension, historial } = datos;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Database className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Base de Datos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Información sobre los registros disponibles para generar campañas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ÚLTIMA INGESTA */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm tracking-wider flex items-center">
              <RefreshCcw className="w-4 h-4 mr-2 text-indigo-500" />
              ÚLTIMA INGESTA
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400 flex items-center"><Calendar className="w-4 h-4 mr-2" /> Fecha:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(ultima_ingesta)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400 flex items-center"><DatabaseBackup className="w-4 h-4 mr-2" /> Registros totales:</span>
              <span className="font-bold text-indigo-600 text-lg">
                {total_registros.toLocaleString()} 
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Estado:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Exitosa ✓
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 flex items-center"><Clock className="w-4 h-4 mr-2" /> Próxima:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{proxima_ingesta}</span>
            </div>
          </div>
        </div>

        {/* COMPOSICIÓN POR DIMENSIÓN */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm tracking-wider">COMPOSICIÓN POR DIMENSIÓN</h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🚀 Onboarding</span>
                <span className="text-sm font-bold text-emerald-600">{por_dimension.onboarding.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${(por_dimension.onboarding / total_registros) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">💎 Fidelización</span>
                <span className="text-sm font-bold text-blue-600">{por_dimension.fidelizacion.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(por_dimension.fidelizacion / total_registros) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">♻️ Reactivación</span>
                <span className="text-sm font-bold text-violet-600">{por_dimension.reactivacion.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-violet-500 h-2.5 rounded-full" style={{ width: `${(por_dimension.reactivacion / total_registros) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORIAL DE INGESTAS */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm tracking-wider">HISTORIAL DE INGESTAS (últimos 7 días)</h3>
        </div>
        <div className="p-0">
          {historial.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {historial.map((h: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium w-1/3">
                      {h.fecha}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 w-1/3">
                      +{h.registros} registros
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-1/3 text-right">
                      {h.estado === 'exitosa' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Exitosa
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3 mr-1" /> Sin datos nuevos
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center flex flex-col items-center justify-center bg-white dark:bg-gray-800">
              <Calendar className="w-10 h-10 text-gray-300 mb-3" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">Sin historial de ingestas</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">No se ha implementado aún la tabla de auditoría para sincronizaciones ETL. La ingesta actual es en tiempo real de la tabla de registros_campania.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
