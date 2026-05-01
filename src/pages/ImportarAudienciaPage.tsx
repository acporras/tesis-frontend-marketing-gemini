import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UploadCloud, CheckCircle2, ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { API_URL } from '../config';

export default function ImportarAudienciaPage() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleContinuarPaso2 = () => {
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setError(null);
    setPaso(2);
  };

  const handleContinuarPaso3 = () => {
    if (!archivo) {
      setError('Debes seleccionar un archivo');
      return;
    }
    setError(null);
    setPaso(3); // In a real app we might parse the CSV here for preview
  };

  const handleImportar = async () => {
    if (!archivo) return;
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('archivo', archivo);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/audiencias/importar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error en la importación');
      
      setResultado(data);
      setPaso(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <Link to="/audiencias" className="text-gray-400 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex text-lg font-medium text-gray-500 dark:text-gray-400 space-x-2">
          <Link to="/audiencias" className="hover:text-gray-800 dark:hover:text-gray-200 dark:text-gray-200">Audiencias Importadas</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 font-bold tracking-tight">Nueva audiencia</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* PASO 1 */}
      {paso === 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">PASO 1 — Información de la audiencia</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre*</label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Pre-test Onboarding Q1 2026"
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <textarea 
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Audiencia generada para pruebas pre-test..."
                rows={3}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border"
              ></textarea>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleContinuarPaso2}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 2 */}
      {paso === 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">PASO 2 — Cargar archivo</h2>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 transition-colors relative">
            <input 
              type="file" 
              accept=".csv,.json,.xlsx" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <UploadCloud className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Arrastra tu archivo aquí</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">o haz clic para buscar</p>
            {archivo ? (
              <div className="bg-indigo-50 text-indigo-700 font-medium p-3 rounded-lg inline-block">
                Archivo seleccionado: {archivo.name}
              </div>
            ) : (
              <div className="text-sm text-gray-400">Formatos soportados: CSV · JSON · XLSX<br/>Tamaño máximo: 10 MB</div>
            )}
          </div>
          
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start">
            <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <strong className="font-semibold block mb-1">¿Qué columnas debe tener mi archivo?</strong>
              <p className="mb-2">El sistema procesa automáticamente columnas que tengan los siguientes nombres (o similares):</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 columns-1 sm:columns-2">
                <li><code>cliente_id</code> / <code>cliente_hash</code></li>
                <li><code>fecha_apertura</code></li>
                <li><code>fecha_ult_tx</code></li>
                <li><code>canal</code></li>
                <li><code>productos</code></li>
                <li><code>score</code></li>
                <li><code>ops_mes</code></li>
              </ul>
              <p className="mt-3 text-xs opacity-90">
                Nota: Cualquier columna adicional no listada aquí será agrupada y guardada como "Datos adicionales" automáticamente para enriquecer tus campañas.
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <button onClick={() => setPaso(1)} className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-lg">Volver</button>
            <button 
              onClick={handleContinuarPaso3}
              disabled={!archivo}
              className={`px-6 py-2.5 font-medium rounded-lg ${archivo ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* PASO 3 & 4 */}
      {paso === 3 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">PASO 3 — Preview y Validación</h2>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 mb-6">
            <h3 className="font-semibold text-emerald-800 flex items-center mb-2">
              <CheckCircle2 className="w-5 h-5 mr-2" /> Archivo listo para importar
            </h3>
            <p className="text-emerald-600 text-sm">
              El archivo <strong>{archivo?.name}</strong> parece estar correcto. La validación real de PII, columnas y dimensión se realizará en el servidor durante la importación.
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setPaso(2)} disabled={loading} className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-lg">Volver</button>
            <button 
              onClick={handleImportar}
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Importando...</>
              ) : (
                <>✓ IMPORTAR AUDIENCIA</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* PASO 4 - ÉXITO */}
      {paso === 4 && resultado && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">¡Audiencia importada con éxito!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Se importaron {resultado.total_registros} registros. La información ya está disponible para ser usada en tus campañas.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 text-left max-w-md mx-auto mb-8 border border-gray-100 dark:border-gray-700">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">COMPOSICIÓN DETECTADA</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">🚀 Onboarding</span>
                <span className="font-semibold">{resultado.composicion.onboarding}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">💎 Fidelización</span>
                <span className="font-semibold">{resultado.composicion.fidelizacion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">♻️ Reactivación</span>
                <span className="font-semibold">{resultado.composicion.reactivacion}</span>
              </div>
            </div>
          </div>

          <button onClick={() => navigate('/audiencias')} className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">
            Ir a mis audiencias
          </button>
        </div>
      )}
    </div>
  );
}
