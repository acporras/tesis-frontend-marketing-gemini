import { useState, useEffect } from 'react';
import { HeartHandshake, Loader2, Send, CheckCircle2, AlertCircle, Clock3, XCircle, Trash2 } from 'lucide-react';
import { API_URL } from '../config';

interface ResultadoDeteccion {
  ejecutado_at: string;
  nuevos_clientes: number;
  campanas_generadas: number;
  campana_id?: string;
  errores: string[];
  mensaje?: string;
  segmento?: any;
  metricas?: {
    tiempo_respuesta_ms: number;
    tasa_anonimizacion: number;
    precision_segmento: number;
  };
  tipo_campana?: string;
  tono?: string;
  objetivo?: string;
  productos_recomendados?: string[];
  canal_optimo?: any;
}

export default function FidelizacionPage() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoDeteccion | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [instruccion, setInstruccion] = useState('');
  const [objetivo, setObjetivo] = useState<'cross_selling' | 'up_selling' | 'retencion' | 'satisfaccion'>('cross_selling');
  
  const [audiencias, setAudiencias] = useState<any[]>([]);
  const [selectedAudiencia, setSelectedAudiencia] = useState<string>('general');
  
  // Filtros Opcionales
  const [scoreMinimo, setScoreMinimo] = useState('');
  const [operacionesMinimas, setOperacionesMinimas] = useState('');
  const [canalPreferido, setCanalPreferido] = useState('');
  const [productosExcluir, setProductosExcluir] = useState<string[]>([]);

  const toggleProducto = (prod: string) => {
    setProductosExcluir(prev => prev.includes(prod) ? prev.filter(p => p !== prod) : [...prev, prod]);
  };

  const [enviandoAprobacion, setEnviandoAprobacion] = useState(false);
  const [estadoAprobacion, setEstadoAprobacion] = useState<'idle' | 'success' | 'error'>('idle');

  const [misCampanas, setMisCampanas] = useState<any[]>([]);
  const [campanaView, setCampanaView] = useState<any | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'borradores' | 'historial'>('borradores');
  
  const [refinarTexto, setRefinarTexto] = useState('');
  const [refinando, setRefinando] = useState(false);
  const [refinarTextoPreview, setRefinarTextoPreview] = useState('');
  const [refinandoPreview, setRefinandoPreview] = useState(false);
  const [modalTab, setModalTab] = useState<'contenido' | 'auditoria'>('contenido');
  const [loadingModal, setLoadingModal] = useState(false);

  const fetchMisCampanas = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/fidelizacion/mis-campanas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMisCampanas(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAudiencias = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/audiencias?estado=activa`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAudiencias(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMisCampanas();
    fetchAudiencias();
  }, []);

  const handleVerCampana = async (id: string) => {
    setLoadingModal(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/fidelizacion/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCampanaView(data);
        setModalTab('contenido');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleGenerar = async () => {
    if (instruccion.trim().length < 10) {
      setError("La instrucción debe tener al menos 10 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);
    setEstadoAprobacion('idle');

    try {
      const token = localStorage.getItem('access_token');
      
      const payload: any = {
        instruccion: instruccion,
        objetivo: objetivo,
        audiencia_id: selectedAudiencia !== 'general' ? selectedAudiencia : null
      };

      const filtros: any = {};
      if (scoreMinimo) filtros.score_minimo = parseInt(scoreMinimo);
      if (operacionesMinimas) filtros.operaciones_minimas_mes = parseInt(operacionesMinimas);
      if (canalPreferido) filtros.canal_preferido = canalPreferido;
      if (productosExcluir.length > 0) filtros.productos_excluir = productosExcluir;

      if (Object.keys(filtros).length > 0) {
        payload.filtros_opcionales = filtros;
      }

      const res = await fetch(`${API_URL}/fidelizacion/generar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let errorMessage = 'Error al ejecutar la detección';
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => `${err.loc.slice(-1)}: ${err.msg}`).join(' | ');
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      setResultado({
        ejecutado_at: data.created_at,
        nuevos_clientes: data.tamanio_audiencia,
        campanas_generadas: 1,
        campana_id: data.campana_id,
        errores: [],
        mensaje: data.mensaje,
        segmento: data.segmento,
        metricas: data.metricas,
        tipo_campana: data.tipo_campana,
        tono: data.tono,
        objetivo: data.objetivo,
        productos_recomendados: data.productos_recomendados,
        canal_optimo: data.canal_optimo
      });
      
      setRefinarTextoPreview('');
      fetchMisCampanas();
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarAprobacion = async () => {
    if (!resultado?.campana_id) return;
    
    setEnviandoAprobacion(true);
    setEstadoAprobacion('idle');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/fidelizacion/${resultado.campana_id}/enviar-aprobacion`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Error al enviar a aprobación');
      }

      setEstadoAprobacion('success');
      fetchMisCampanas();
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      setEstadoAprobacion('error');
    } finally {
      setEnviandoAprobacion(false);
    }
  };

  const handleEnviarAprobacionHistorial = async (campanaId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/fidelizacion/${campanaId}/enviar-aprobacion`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Error al enviar a aprobación');
      }

      setCampanaView((prev: any) => prev ? { ...prev, estado: 'pendiente_aprobacion' } : null);
      fetchMisCampanas();
    } catch (err: any) {
      alert(err.message || 'Error de conexión');
    }
  };

  const handleEliminarBorrador = async (campanaId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/fidelizacion/${campanaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Error al eliminar el borrador');
      }

      setCampanaView(null);
      setConfirmarEliminar(null);
      fetchMisCampanas();
    } catch (err: any) {
      alert(err.message || 'Error de conexión');
    }
  };

  const handleRefinar = async () => {
    if (!refinarTexto.trim() || !campanaView) return;
    
    setRefinando(true);
    try {
      const token = localStorage.getItem('access_token');
      const instruccionActualizada = `${campanaView.instruccion_original}\n\nAJUSTE REQUERIDO: ${refinarTexto}`;
      
      const res = await fetch(`${API_URL}/fidelizacion/generar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instruccion: instruccionActualizada,
          objetivo: campanaView.objetivo || 'cross_selling',
          campana_id: campanaView.id
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let errorMessage = 'Error al refinar la campaña';
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => `${err.loc.slice(-1)}: ${err.msg}`).join(' | ');
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      
      setCampanaView({
        ...campanaView,
        instruccion_original: instruccionActualizada,
        mensaje_generado: data.mensaje,
        segmento_generado: data.segmento,
        canal_recomendado: data.canal_optimo?.canal_principal,
        canales_alternativos: data.canal_optimo?.canales_alternativos,
        justificacion_canal: data.canal_optimo?.justificacion,
        score_confianza_canal: data.canal_optimo?.score_confianza,
        horario_optimo_canal: data.canal_optimo?.horario_optimo
      });
      setRefinarTexto('');
      fetchMisCampanas();
      
    } catch (err: any) {
      alert(err.message || 'Error al regenerar');
    } finally {
      setRefinando(false);
    }
  };

  const handleRefinarPreview = async () => {
    if (!refinarTextoPreview.trim() || !resultado?.campana_id) return;
    
    setRefinandoPreview(true);
    try {
      const token = localStorage.getItem('access_token');
      const instruccionActualizada = `${instruccion}\n\nAJUSTE REQUERIDO: ${refinarTextoPreview}`;
      
      const payload: any = {
        instruccion: instruccionActualizada,
        objetivo: objetivo,
        campana_id: resultado.campana_id
      };

      const res = await fetch(`${API_URL}/fidelizacion/generar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let errorMessage = 'Error al refinar la campaña';
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => `${err.loc.slice(-1)}: ${err.msg}`).join(' | ');
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      
      setResultado({
        ...resultado,
        nuevos_clientes: data.tamanio_audiencia,
        mensaje: data.mensaje,
        segmento: data.segmento,
        metricas: data.metricas,
        tipo_campana: data.tipo_campana,
        tono: data.tono,
        objetivo: data.objetivo,
        productos_recomendados: data.productos_recomendados,
        canal_optimo: data.canal_optimo
      });
      
      setInstruccion(instruccionActualizada);
      setRefinarTextoPreview('');
      fetchMisCampanas();
      
    } catch (err: any) {
      alert(err.message || 'Error al regenerar');
    } finally {
      setRefinandoPreview(false);
    }
  };

  const getStateBadge = (estado: string) => {
    switch (estado) {
      case 'aprobada': return <span className="inline-flex items-center text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded"><CheckCircle2 className="w-3 h-3 mr-1"/> APROBADA</span>;
      case 'pendiente_aprobacion': return <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded"><Clock3 className="w-3 h-3 mr-1"/> PENDIENTE</span>;
      case 'borrador': return <span className="inline-flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">BORRADOR</span>;
      case 'rechazada': return <span className="inline-flex items-center text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded"><XCircle className="w-3 h-3 mr-1"/> RECHAZADA</span>;
      default: return <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{estado}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <HeartHandshake className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">💎 Fidelización — Generar Campaña</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Aumenta el valor de tus clientes y mejora la retención.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: GENERADOR */}
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight border-b pb-2">PASO 1 — Define el objetivo</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fuente de datos:</label>
                <select
                  value={selectedAudiencia}
                  onChange={(e) => setSelectedAudiencia(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="general">◉ Dataset general</option>
                  {audiencias.map(a => (
                    <option key={a.id} value={a.id}>○ Audiencia: {a.nombre} ({a.total_registros} registros)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Objetivo de la campaña:</label>
                <div className="grid grid-cols-2 gap-3 sm:flex sm:space-x-4 sm:gap-0">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" value="cross_selling" checked={objetivo === 'cross_selling'} onChange={(e) => setObjetivo(e.target.value as any)} className="text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-800 dark:text-gray-200">Cross-selling</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" value="up_selling" checked={objetivo === 'up_selling'} onChange={(e) => setObjetivo(e.target.value as any)} className="text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-800 dark:text-gray-200">Up-selling</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" value="retencion" checked={objetivo === 'retencion'} onChange={(e) => setObjetivo(e.target.value as any)} className="text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-800 dark:text-gray-200">Retención</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" value="satisfaccion" checked={objetivo === 'satisfaccion'} onChange={(e) => setObjetivo(e.target.value as any)} className="text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-800 dark:text-gray-200">Satisfacción</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Instrucción:</label>
                <textarea
                  className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Ej: Cross-selling tarjeta clásica para clientes con cuenta de ahorros activa y al menos 5 operaciones al mes..."
                  value={instruccion}
                  onChange={(e) => setInstruccion(e.target.value)}
                />
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight border-b pb-2">PASO 2 — Filtros opcionales (avanzado)</h2>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Score crediticio mínimo:</label>
                  <input
                    type="number"
                    placeholder="Ej: 650"
                    value={scoreMinimo}
                    onChange={(e) => setScoreMinimo(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Operaciones mínimas/mes:</label>
                  <input
                    type="number"
                    placeholder="Ej: 5"
                    value={operacionesMinimas}
                    onChange={(e) => setOperacionesMinimas(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Productos a excluir:</label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={productosExcluir.includes('tarjeta_credito')} onChange={() => toggleProducto('tarjeta_credito')} className="text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-800 dark:text-gray-200">Tarjeta de crédito</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={productosExcluir.includes('prestamo_personal')} onChange={() => toggleProducto('prestamo_personal')} className="text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-800 dark:text-gray-200">Préstamo personal</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Canal preferido:</label>
                <select
                  value={canalPreferido}
                  onChange={(e) => setCanalPreferido(e.target.value)}
                  className="w-full sm:w-1/2 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Cualquiera</option>
                  <option value="app_movil">App Móvil</option>
                  <option value="banca_internet">Banca por Internet</option>
                  <option value="agencia">Agencia</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerar}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" /> : "✨ GENERAR CAMPAÑA"}
            </button>
            
            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* RESULTADO PREVIEW */}
          {resultado && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-blue-100 relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-2xl" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Propuesta generada</h2>
              
              {/* MÉTRICAS DE EJECUCIÓN */}
              {resultado.metricas && (
                <div className="mb-6 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-wider uppercase">Métricas de Ejecución</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* I1 */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-gray-400">I1</span>
                        {(resultado.metricas.tiempo_respuesta_ms / 1000) <= 30 ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">✓ ≤ 30s</span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">✗ &gt; 30s</span>
                        )}
                      </div>
                      <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{(resultado.metricas.tiempo_respuesta_ms / 1000).toFixed(1)} seg</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">T. Respuesta</span>
                    </div>

                    {/* I2 */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-gray-400">I2</span>
                        {resultado.metricas.tasa_anonimizacion >= 99.5 ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">✓ ≥ 99.5%</span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">✗ &lt; 99.5%</span>
                        )}
                      </div>
                      <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{resultado.metricas.tasa_anonimizacion.toFixed(2)}%</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Anonimización</span>
                    </div>

                    {/* I3 */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-gray-400">I3</span>
                        {resultado.metricas.precision_segmento >= 85 ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">✓ ≥ 85%</span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">⚠ &lt; 85%</span>
                        )}
                      </div>
                      <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{resultado.metricas.precision_segmento.toFixed(1)}%</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Precisión segmento</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENIDO GENERADO: SIDE-BY-SIDE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* SEGMENTO */}
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 flex flex-col">
                  <h4 className="text-xs font-bold text-indigo-900 mb-3 tracking-wider uppercase">Segmento Generado</h4>
                  
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-indigo-700">{resultado.nuevos_clientes}</span>
                    <span className="text-sm text-indigo-900 ml-1">clientes</span>
                  </div>
                  
                  <div className="mb-4 flex-grow">
                    <p className="text-xs font-semibold text-indigo-800 mb-1">Criterios técnicos:</p>
                    <pre className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-indigo-100 overflow-x-auto">
                      {JSON.stringify(resultado.segmento, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="space-y-1 text-xs text-indigo-800 pt-3 border-t border-indigo-200">
                    <p><span className="font-semibold">Audiencia:</span> {resultado.nuevos_clientes} clientes</p>
                    <p><span className="font-semibold">Tono:</span> {resultado.tono || 'Cercano'}</p>
                    <p><span className="font-semibold">Objetivo:</span> {resultado.objetivo || objetivo}</p>
                  </div>
                </div>

                {/* MENSAJE */}
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col">
                  <h4 className="text-xs font-bold text-amber-900 mb-3 tracking-wider uppercase">Mensaje Personalizado</h4>
                  <div className="bg-white dark:bg-gray-800 p-3.5 rounded-lg border border-amber-100 flex-grow shadow-sm text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {resultado.mensaje}
                  </div>
                  {resultado.productos_recomendados && resultado.productos_recomendados.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <p className="text-xs font-semibold text-amber-900 mb-1">Productos clave:</p>
                      <div className="flex gap-2 flex-wrap">
                        {resultado.productos_recomendados.map(p => (
                          <span key={p} className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded">
                            {p.replace('_', ' ').toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CANAL ÓPTIMO RECOMENDADO */}
              {resultado.canal_optimo && (
                <div className="mb-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50 p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                  
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center">
                    <span className="bg-indigo-100 dark:bg-indigo-800 p-1.5 rounded-lg mr-2">🎯</span>
                    CANAL ÓPTIMO RECOMENDADO
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1">
                      <div className="flex flex-col h-full justify-center">
                        <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-indigo-100 dark:border-indigo-800/30">
                          <span className="text-3xl block mb-2">
                            {resultado.canal_optimo.canal_principal === 'email' ? '📧' :
                             resultado.canal_optimo.canal_principal === 'sms' ? '💬' :
                             resultado.canal_optimo.canal_principal === 'push' ? '📱' :
                             resultado.canal_optimo.canal_principal === 'whatsapp' ? '🟢' : '📲'}
                          </span>
                          <span className="font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide text-sm block mb-2">
                            {resultado.canal_optimo.canal_principal.replace('_', ' ')}
                          </span>
                          
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${resultado.canal_optimo.score_confianza}%` }}></div>
                          </div>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                            Confianza: {resultado.canal_optimo.score_confianza}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">¿Por qué?</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-indigo-50 dark:border-indigo-900/30">
                          {resultado.canal_optimo.justificacion}
                        </p>
                      </div>
                      
                      {resultado.canal_optimo.horario_optimo && (
                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                          <Clock3 className="w-4 h-4 mr-2 text-indigo-500" />
                          <span className="font-medium">Horario óptimo:</span> 
                          <span className="ml-2">{resultado.canal_optimo.horario_optimo}</span>
                        </div>
                      )}
                      
                      {resultado.canal_optimo.canales_alternativos && resultado.canal_optimo.canales_alternativos.length > 0 && (
                        <div className="pt-2 border-t border-indigo-100 dark:border-indigo-800/30">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Canales alternativos:</span>
                          <div className="flex flex-wrap gap-2">
                            {resultado.canal_optimo.canales_alternativos.map((alt: string, idx: number) => (
                              <span key={alt} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                <span className="text-gray-400 mr-1">{idx + 2}º</span> {alt.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* REFACTORIZACIÓN EN LA VISTA PRINCIPAL */}
              {estadoAprobacion !== 'success' && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                    <Send className="w-4 h-4 mr-1"/> Refinar con IA
                  </h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={refinarTextoPreview}
                      onChange={(e) => setRefinarTextoPreview(e.target.value)}
                      placeholder="Ej: Haz el mensaje más corto, cambia el tono a más urgente..."
                      className="block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={refinandoPreview}
                    />
                    <button
                      onClick={handleRefinarPreview}
                      disabled={refinandoPreview || !refinarTextoPreview.trim()}
                      className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {refinandoPreview ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Regenerar'}
                    </button>
                  </div>
                </div>
              )}

              {estadoAprobacion === 'success' ? (
                <div className="mt-4 flex items-center justify-center text-blue-700 bg-blue-50 px-4 py-3 rounded-xl font-bold text-sm border border-blue-200">
                  <CheckCircle2 className="h-5 w-5 mr-2" /> ENVIADA PARA APROBACIÓN
                </div>
              ) : (
                <>
                  <div className="mt-6 mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-xs text-yellow-800">
                      Para activar esta campaña debes replicar los criterios de segmentación en Adobe Journey Optimizer u otra plataforma de orquestación del banco.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setResultado(null); fetchMisCampanas(); }}
                      className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-bold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 focus:outline-none transition-colors"
                    >
                      ✗ Descartar
                    </button>
                    <button
                      onClick={handleEnviarAprobacion}
                      disabled={enviandoAprobacion}
                      className="flex-[2] flex items-center justify-center px-4 py-3 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors disabled:opacity-50"
                    >
                      {enviandoAprobacion ? <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> : <CheckCircle2 className="-ml-1 mr-2 h-5 w-5" />}
                      ✓ ENVIAR PARA APROBACIÓN
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: HISTORIAL */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[calc(100vh-10rem)]">
            <div className="flex-shrink-0 mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-4">Mis campañas</h2>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('borradores')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'borradores' ? 'bg-white dark:bg-gray-800 text-blue-700 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300'}`}
                >
                  Borradores
                </button>
                <button
                  onClick={() => setActiveTab('historial')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'historial' ? 'bg-white dark:bg-gray-800 text-blue-700 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300'}`}
                >
                  Enviadas
                </button>
              </div>
            </div>
            
            <div className="space-y-3 overflow-y-auto pr-2 flex-grow scrollbar-thin scrollbar-thumb-gray-200">
              {(() => {
                const filtered = misCampanas.filter(c => activeTab === 'borradores' ? c.estado === 'borrador' : c.estado !== 'borrador');
                
                if (filtered.length === 0) {
                  return <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No tienes campañas en esta sección.</p>;
                }
                
                return filtered.map(c => {
                  let tamanio = 0;
                  if (c.segmento_generado && typeof c.segmento_generado === 'object') {
                     tamanio = c.segmento_generado.tamanio_audiencia || 0;
                  }
                  
                  return (
                    <div key={c.id} className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 transition-colors flex justify-between items-center">
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <span className="capitalize">{c.instruccion_original.slice(0, 30)}...</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                          <span>{new Date(c.created_at).toLocaleDateString()} {new Date(c.created_at).toLocaleTimeString()}</span>
                          <span>·</span>
                          <span>{tamanio > 0 ? `${tamanio} clientes` : 'Audiencia dinámica'}</span>
                        </div>
                        <div className="mt-2">
                          {getStateBadge(c.estado)}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleVerCampana(c.id)}
                        disabled={loadingModal}
                        className="text-sm text-blue-600 font-semibold hover:text-blue-800 disabled:opacity-50"
                      >
                        Ver →
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL VIEW */}
      {campanaView && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setCampanaView(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-gray-100" id="modal-title">
                        Detalle de Campaña
                      </h3>
                      <button 
                        onClick={() => setCampanaView(null)}
                        className="text-gray-400 hover:text-gray-500 dark:text-gray-400 focus:outline-none"
                      >
                        <span className="sr-only">Cerrar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4">
                      <button
                        onClick={() => setModalTab('contenido')}
                        className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${modalTab === 'contenido' ? 'bg-white dark:bg-gray-800 text-blue-700 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300'}`}
                      >
                        Contenido
                      </button>
                      <button
                        onClick={() => setModalTab('auditoria')}
                        className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${modalTab === 'auditoria' ? 'bg-white dark:bg-gray-800 text-blue-700 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300'}`}
                      >
                        Auditoría IA
                      </button>
                    </div>

                    {modalTab === 'contenido' ? (
                      <div className="space-y-4">
                        {campanaView.estado === 'rechazada' && campanaView.comentario_rechazo && (
                          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                            <h4 className="text-sm font-bold text-red-800 mb-1 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" /> Motivo de Rechazo
                            </h4>
                            <p className="text-sm text-red-700">
                              {campanaView.comentario_rechazo}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Instrucción Original:</span>
                          <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{campanaView.instruccion_original}</p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                          <h4 className="text-xs font-semibold text-amber-900 mb-1">Mensaje Generado:</h4>
                          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{campanaView.mensaje_generado}</p>
                          <div className="mt-3 pt-3 border-t border-amber-200">
                            <h4 className="text-xs font-semibold text-amber-900 mb-1">Criterios del Segmento:</h4>
                            <pre className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto border border-amber-100">
                              {JSON.stringify(campanaView.segmento_generado, null, 2)}
                            </pre>
                          </div>
                        </div>

                        {/* CANAL ÓPTIMO RECOMENDADO */}
                        {campanaView.canal_recomendado && (
                          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50 p-5 relative overflow-hidden mt-4">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                            
                            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center">
                              <span className="bg-indigo-100 dark:bg-indigo-800 p-1.5 rounded-lg mr-2">🎯</span>
                              CANAL ÓPTIMO RECOMENDADO
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="col-span-1">
                                <div className="flex flex-col h-full justify-center">
                                  <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-indigo-100 dark:border-indigo-800/30">
                                    <span className="text-3xl block mb-2">
                                      {campanaView.canal_recomendado === 'email' ? '📧' :
                                       campanaView.canal_recomendado === 'sms' ? '💬' :
                                       campanaView.canal_recomendado === 'push' ? '📱' :
                                       campanaView.canal_recomendado === 'whatsapp' ? '🟢' : '📲'}
                                    </span>
                                    <span className="font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide text-sm block mb-2">
                                      {campanaView.canal_recomendado.replace('_', ' ')}
                                    </span>
                                    
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${campanaView.score_confianza_canal}%` }}></div>
                                    </div>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                      Confianza: {campanaView.score_confianza_canal}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="col-span-1 md:col-span-2 space-y-3">
                                <div>
                                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">¿Por qué?</span>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-indigo-50 dark:border-indigo-900/30">
                                    {campanaView.justificacion_canal}
                                  </p>
                                </div>
                                
                                {campanaView.horario_optimo_canal && (
                                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                    <Clock3 className="w-4 h-4 mr-2 text-indigo-500" />
                                    <span className="font-medium">Horario óptimo:</span> 
                                    <span className="ml-2">{campanaView.horario_optimo_canal}</span>
                                  </div>
                                )}
                                
                                {campanaView.canales_alternativos && campanaView.canales_alternativos.length > 0 && (
                                  <div className="pt-2 border-t border-indigo-100 dark:border-indigo-800/30">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Canales alternativos:</span>
                                    <div className="flex flex-wrap gap-2">
                                      {campanaView.canales_alternativos.map((alt: string, idx: number) => (
                                        <span key={alt} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                          <span className="text-gray-400 mr-1">{idx + 2}º</span> {alt.replace('_', ' ')}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* REFACTORIZACIÓN IA PARA BORRADORES */}
                        {campanaView.estado === 'borrador' && (
                          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                              <Send className="w-4 h-4 mr-1"/> Refinar con IA
                            </h4>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={refinarTexto}
                                onChange={(e) => setRefinarTexto(e.target.value)}
                                placeholder="Ej: Haz el mensaje más corto, cambia el tono a más urgente..."
                                className="block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                disabled={refinando}
                              />
                              <button
                                onClick={handleRefinar}
                                disabled={refinando || !refinarTexto.trim()}
                                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                              >
                                {refinando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Regenerar'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                            Métricas Técnicas de la Generación
                          </h4>
                          {campanaView.logs && campanaView.logs.length > 0 ? (
                            (() => {
                              const metricas = campanaView.logs[campanaView.logs.length - 1];
                              if (!metricas) return <p className="text-sm text-gray-500 dark:text-gray-400">Métricas no disponibles.</p>;
                              
                              return (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {/* I1 */}
                                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 mb-1">I1 - T. RESPUESTA</span>
                                    <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{(metricas.tiempo_respuesta_ms / 1000).toFixed(1)}s</span>
                                    {(metricas.tiempo_respuesta_ms / 1000) <= 30 ? (
                                      <span className="text-[10px] font-bold text-blue-600 mt-1">✓ Óptimo (≤30s)</span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-red-600 mt-1">✗ Lento (&gt;30s)</span>
                                    )}
                                  </div>

                                  {/* I2 */}
                                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 mb-1">I2 - ANONIMIZACIÓN</span>
                                    <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{Number(metricas.tasa_anonimizacion).toFixed(2)}%</span>
                                    {metricas.tasa_anonimizacion >= 99.5 ? (
                                      <span className="text-[10px] font-bold text-blue-600 mt-1">✓ Seguro (≥99.5%)</span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-red-600 mt-1">✗ Riesgo (&lt;99.5%)</span>
                                    )}
                                  </div>

                                  {/* I3 */}
                                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 mb-1">I3 - PRECISIÓN SEG.</span>
                                    <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{Number(metricas.precision_segmento).toFixed(1)}%</span>
                                    {metricas.precision_segmento >= 85 ? (
                                      <span className="text-[10px] font-bold text-blue-600 mt-1">✓ Alta (≥85%)</span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-amber-600 mt-1">⚠ Baja (&lt;85%)</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No hay registros de auditoría para esta campaña.</p>
                          )}
                        </div>
                        
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                          <h4 className="text-sm font-semibold text-indigo-900 mb-2">Logs de Ejecución</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-indigo-200">
                            {campanaView.logs && campanaView.logs.length > 0 ? (
                              campanaView.logs.map((log: any, idx: number) => (
                                <div key={idx} className="bg-white dark:bg-gray-800 p-2 rounded border border-indigo-50 text-xs">
                                  <div className="flex justify-between text-indigo-400 mb-1">
                                    <span className="font-bold">Ejecución #{idx + 1}</span>
                                    <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                                  </div>
                                  <pre className="text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap font-mono mt-1">
                                    {JSON.stringify({
                                      tiempo_respuesta_ms: log.tiempo_respuesta_ms,
                                      tasa_anonimizacion: log.tasa_anonimizacion,
                                      precision_segmento: log.precision_segmento,
                                      timestamp_instruccion: log.timestamp_instruccion,
                                      timestamp_respuesta: log.timestamp_respuesta
                                    }, null, 2)}
                                  </pre>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-indigo-400">Sin logs.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:justify-between">
                <div className="flex flex-col sm:flex-row-reverse gap-2 sm:gap-0">
                  <button
                    type="button"
                    onClick={() => setCampanaView(null)}
                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cerrar
                  </button>
                  {campanaView.estado === 'borrador' && (
                    <button
                      type="button"
                      onClick={() => handleEnviarAprobacionHistorial(campanaView.id)}
                      className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:w-auto sm:text-sm"
                    >
                      <Send className="-ml-1 mr-2 h-4 w-4" />
                      Enviar a Aprobación
                    </button>
                  )}
                </div>
                {campanaView.estado === 'borrador' && (
                  <button
                    type="button"
                    onClick={() => setConfirmarEliminar(campanaView.id)}
                    className="mt-3 sm:mt-0 w-full inline-flex justify-center items-center rounded-xl border border-red-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none sm:w-auto sm:text-sm transition-colors"
                  >
                    <Trash2 className="-ml-1 mr-2 h-4 w-4" />
                    Eliminar Borrador
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {confirmarEliminar && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={() => setConfirmarEliminar(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-gray-100 dark:border-gray-700">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-gray-100" id="modal-title">
                      Eliminar borrador
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ¿Estás seguro de que deseas eliminar permanentemente este borrador? Esta acción no se puede deshacer y perderás la instrucción y el mensaje generado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2 sm:gap-0">
                <button
                  type="button"
                  onClick={() => handleEliminarBorrador(confirmarEliminar)}
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Sí, eliminar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmarEliminar(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
