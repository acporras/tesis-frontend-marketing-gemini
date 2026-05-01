import { useState, useEffect } from 'react';
import { Database, UploadCloud, RefreshCcw, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { API_URL } from '../config';

export default function AdminDatasetPage() {
  const [estado, setEstado] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formularios
  const [archivo, setArchivo] = useState<File | null>(null);
  const [modoCarga, setModoCarga] = useState<'upsert' | 'reemplazo' | 'agregar'>('upsert');
  const [cantidadSintetico, setCantidadSintetico] = useState(10000);
  const [distOnboarding, setDistOnboarding] = useState(20);
  const [distFidelizacion, setDistFidelizacion] = useState(50);
  const [distReactivacion, setDistReactivacion] = useState(30);

  const fetchEstado = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/admin/dataset/estado`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEstado(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistorial = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/admin/dataset/historial`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setHistorial(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEstado();
    fetchHistorial();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleImportarManual = async () => {
    if (!archivo) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('modo', modoCarga);

      const res = await fetch(`${API_URL}/admin/dataset/cargar-archivo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Error al importar');
      }
      
      setArchivo(null);
      await fetchEstado();
      await fetchHistorial();
      alert("Carga completada con éxito.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerarSintetico = async () => {
    if (distOnboarding + distFidelizacion + distReactivacion !== 100) {
      setError("La suma de las distribuciones debe ser 100%");
      return;
    }

    if (!window.confirm("¿Estás seguro? Esta acción reemplazará todos los datos del dataset general.")) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/admin/dataset/regenerar-sintetico`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cantidad: cantidadSintetico,
          distribucion: {
            onboarding: distOnboarding,
            fidelizacion: distFidelizacion,
            reactivacion: distReactivacion
          }
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Error al regenerar');
      }
      
      await fetchEstado();
      await fetchHistorial();
      alert("Generación sintética completada.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Database className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">⚙️ Administración {'>'} Dataset General</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center mt-1">
            <AlertCircle className="w-4 h-4 mr-1 text-amber-500" /> Solo accesible para coordinadores con rol admin
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center border border-red-100 shadow-sm">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ESTADO ACTUAL */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Estado Actual del Dataset</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total de registros</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{estado?.total_registros?.toLocaleString() || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Última actualización</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {estado?.ultima_actualizacion ? new Date(estado.ultima_actualizacion).toLocaleString() : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Origen actual</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
              {estado?.origen_actual?.replace('_', ' ') || '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Próxima actualización</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <Clock className="w-4 h-4 mr-1 text-gray-400" /> Automática
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IMPORTAR MANUAL */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
            <UploadCloud className="w-5 h-5 mr-2 text-indigo-500" /> Importar archivo manual
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Sube un archivo CSV/JSON/XLSX para actualizar el dataset general. Esta operación afecta a todos los usuarios.
          </p>

          <div className="space-y-4 mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Modo de carga:</label>
            <div className="space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900">
                <input type="radio" value="upsert" checked={modoCarga === 'upsert'} onChange={() => setModoCarga('upsert')} className="mt-1" />
                <div>
                  <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">◉ Actualizar (UPSERT)</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Solo actualiza registros existentes y agrega nuevos</span>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 border-red-100 dark:border-red-900/50">
                <input type="radio" value="reemplazo" checked={modoCarga === 'reemplazo'} onChange={() => setModoCarga('reemplazo')} className="mt-1" />
                <div>
                  <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200 text-red-700 dark:text-red-400">○ Reemplazar completo ⚠</span>
                  <span className="text-xs text-red-500">Elimina los actuales y carga el archivo desde cero</span>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900">
                <input type="radio" value="agregar" checked={modoCarga === 'agregar'} onChange={() => setModoCarga('agregar')} className="mt-1" />
                <div>
                  <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">○ Solo agregar</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Agrega nuevos sin tocar existentes</span>
                </div>
              </label>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center relative mb-4">
            <input type="file" accept=".csv,.json,.xlsx" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            {archivo ? (
              <span className="text-sm font-medium text-indigo-600">{archivo.name}</span>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">Haz clic o arrastra un archivo</span>
            )}
          </div>

          <button 
            onClick={handleImportarManual}
            disabled={!archivo || loading}
            className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Subir y procesar archivo'}
          </button>
        </div>

        {/* REGENERAR SINTÉTICO */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
            <RefreshCcw className="w-5 h-5 mr-2 text-emerald-500" /> Regenerar dataset sintético
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Solo para entornos de desarrollo y pruebas. Ejecuta el generador de datos interno (data_generator).
            <br/><strong className="text-red-500">⚠ Esto reemplaza el dataset actual.</strong>
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Cantidad de registros:</label>
              <input 
                type="number" 
                value={cantidadSintetico} 
                onChange={(e) => setCantidadSintetico(Number(e.target.value))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">Distribución por dimensión (%)</label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Onboarding</span>
                <input type="number" min="0" max="100" value={distOnboarding} onChange={(e) => setDistOnboarding(Number(e.target.value))} className="w-20 p-1 border rounded text-right" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Fidelización</span>
                <input type="number" min="0" max="100" value={distFidelizacion} onChange={(e) => setDistFidelizacion(Number(e.target.value))} className="w-20 p-1 border rounded text-right" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Reactivación</span>
                <input type="number" min="0" max="100" value={distReactivacion} onChange={(e) => setDistReactivacion(Number(e.target.value))} className="w-20 p-1 border rounded text-right" />
              </div>
              <div className="pt-2 flex justify-end">
                <span className={`text-xs font-bold ${distOnboarding+distFidelizacion+distReactivacion === 100 ? 'text-emerald-600' : 'text-red-500'}`}>
                  Total: {distOnboarding + distFidelizacion + distReactivacion}%
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleRegenerarSintetico}
            disabled={loading}
            className="w-full py-2.5 bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 font-semibold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 disabled:opacity-50 mt-auto"
          >
            {loading ? 'Generando...' : '🔄 Iniciar Regeneración'}
          </button>
        </div>
      </div>

      {/* HISTORIAL */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Historial de Cargas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">Fecha</th>
                <th className="px-6 py-3 font-semibold">Origen</th>
                <th className="px-6 py-3 font-semibold">Modo</th>
                <th className="px-6 py-3 font-semibold">Usuario</th>
                <th className="px-6 py-3 font-semibold">Impacto</th>
                <th className="px-6 py-3 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {historial.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900/50 transition-colors">
                  <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {item.origen.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {item.modo_carga === 'reemplazo' ? <span className="text-red-600 font-medium">Reemplazo total</span> : <span className="capitalize">{item.modo_carga}</span>}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {item.usuarios?.nombre || 'Sistema (API)'}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-emerald-600">+{item.registros_carga}</span> registros procesados
                  </td>
                  <td className="px-6 py-3 text-center">
                    {item.estado === 'completado' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : item.estado === 'error' ? (
                      <span title={item.error_mensaje}><AlertCircle className="w-5 h-5 text-red-500 mx-auto" /></span>
                    ) : (
                      <Clock className="w-5 h-5 text-amber-500 mx-auto animate-pulse" />
                    )}
                  </td>
                </tr>
              ))}
              {historial.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No hay historial de cargas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
