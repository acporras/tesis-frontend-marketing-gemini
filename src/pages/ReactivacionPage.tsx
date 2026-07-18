import { useState, useEffect } from 'react';
import { RotateCcw, Loader2, Send, CheckCircle2, AlertCircle, Clock3, Search } from 'lucide-react';
import { API_URL } from '../config';

export default function ReactivacionPage() {
  const [loading, setLoading] = useState(false);
  const [detectados, setDetectados] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [campanaView, setCampanaView] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'contenido' | 'auditoria'>('contenido');
  const [loadingModal] = useState(false);

  // Refactor states
  const [refinarTexto, setRefinarTexto] = useState('');
  const [refinando, setRefinando] = useState(false);

  const [enviandoAprobacion, setEnviandoAprobacion] = useState<string | null>(null);

  const fetchDetectados = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/reactivacion/detectados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // data es un array de {campana_id, perfil_inactividad, ...}
        
        // Ahora traemos el detalle de cada uno para tener los logs
        const detallados = await Promise.all(data.map(async (d: any) => {
          const detailRes = await fetch(`${API_URL}/reactivacion/${d.campana_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            return { ...d, ...detailData };
          }
          return d;
        }));
        
        setDetectados(detallados);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetectados();
  }, []);

  const handleEjecutarManual = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/reactivacion/ejecutar-deteccion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Error al ejecutar la detección');
      }

      await fetchDetectados();
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarAprobacion = async (campanaId: string) => {
    setEnviandoAprobacion(campanaId);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/reactivacion/${campanaId}/enviar-aprobacion`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Error al enviar a aprobación');
      }
      
      // Update local state to remove it from the list
      setDetectados(prev => prev.filter(c => c.campana_id !== campanaId));
      if (campanaView?.id === campanaId) setCampanaView(null);
    } catch (err: any) {
      alert(err.message || 'Error de conexión');
    } finally {
      setEnviandoAprobacion(null);
    }
  };

  const handleVerDetalle = (campanaId: string, initialTab: 'contenido' | 'auditoria' = 'contenido') => {
    const item = detectados.find(d => d.campana_id === campanaId);
    if (item) {
      setCampanaView(item);
      setModalTab(initialTab);
    }
  };

  const handleRefinar = async () => {
    if (!refinarTexto.trim() || !campanaView) return;
    
    setRefinando(true);
    try {
      const token = localStorage.getItem('access_token');
      const instruccionActualizada = `${campanaView.instruccion_original}\n\nAJUSTE REQUERIDO: ${refinarTexto}`;
      
      const res = await fetch(`${API_URL}/reactivacion/${campanaView.id}/refinar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nueva_instruccion: instruccionActualizada
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
      fetchDetectados();
    } catch (err: any) {
      alert(err.message || 'Error al regenerar');
    } finally {
      setRefinando(false);
    }
  };

  const perfilColors: any = {
    'reciente': 'bg-violet-100 text-violet-800 border-violet-200',
    'moderada': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    'prolongada': 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-violet-100 rounded-lg">
              <RotateCcw className="h-6 w-6 text-violet-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Reactivación — Detección Automática
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 flex items-center mt-2 text-sm">
            <Clock3 className="w-4 h-4 mr-1.5" />
            {detectados.length > 0
              ? (() => {
                  const ultima = new Date(
                    Math.max(...detectados.map((c: any) => new Date(c.created_at).getTime()))
                  )
                  const hoy = new Date()
                  const ayer = new Date(hoy)
                  ayer.setDate(hoy.getDate() - 1)
                  const esHoy = ultima.toDateString() === hoy.toDateString()
                  const esAyer = ultima.toDateString() === ayer.toDateString()
                  const hora = ultima.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                  const fechaLabel = esHoy ? 'hoy' : esAyer ? 'anoche' : ultima.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })
                  return `Última detección automática: ${fechaLabel} a las ${hora}`
                })()
              : 'El job nocturno se ejecuta diariamente a las 2:00 AM — aún no hay detecciones registradas'}
          </p>
        </div>
        <button
          onClick={handleEjecutarManual}
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition-all duration-200"
        >
          {loading ? (
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
          ) : (
            <RotateCcw className="-ml-1 mr-2 h-4 w-4" />
          )}
          Ejecutar manualmente
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Buscando detecciones de inactividad...</p>
        </div>
      ) : detectados.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center">
          <Search className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No hay perfiles detectados pendientes</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">Todos los clientes inactivos ya fueron gestionados o están en aprobación.</p>
          <button
            onClick={handleEjecutarManual}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-violet-600 hover:bg-violet-700"
          >
            Forzar nueva detección
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {detectados.map((item) => {
            const perfil = item.perfil_inactividad || 'reciente';
            const colorClass = perfilColors[perfil] || perfilColors['reciente'];
            const metricas = item.logs && item.logs.length > 0 ? item.logs[item.logs.length - 1] : null;

            return (
              <div key={item.campana_id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${colorClass}`}>
                        ● INACTIVIDAD {perfil}
                      </span>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        ({item.dias_inactividad_min}-{item.dias_inactividad_max} días)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.tamanio_audiencia}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">clientes detectados</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">Mensaje Propuesto:</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 italic">"{item.mensaje}"</p>
                  </div>

                  {item.canal_recomendado && (
                    <div className="flex items-center mt-2 mb-4 bg-indigo-50/50 dark:bg-indigo-900/10 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                      <span className="text-2xl mr-3">
                        {item.canal_recomendado === 'email' ? '📧' :
                         item.canal_recomendado === 'sms' ? '💬' :
                         item.canal_recomendado === 'push' ? '📱' :
                         item.canal_recomendado === 'whatsapp' ? '🟢' : '📲'}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase">
                          {item.canal_recomendado.replace('_', ' ')}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                          Confianza: {item.score_confianza_canal}%
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      {metricas ? (
                        <>
                          <div className="flex items-center text-xs">
                            <span className="font-semibold text-gray-500 dark:text-gray-400 mr-1">I1:</span>
                            <span className="text-gray-900 dark:text-gray-100">{(metricas.tiempo_respuesta_ms / 1000).toFixed(1)}s</span>
                            {metricas.tiempo_respuesta_ms <= 30000 ? <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-1" /> : <AlertCircle className="w-3 h-3 text-amber-500 ml-1" />}
                          </div>
                          <div className="flex items-center text-xs">
                            <span className="font-semibold text-gray-500 dark:text-gray-400 mr-1">I2:</span>
                            <span className="text-gray-900 dark:text-gray-100">{Number(metricas.tasa_anonimizacion).toFixed(1)}%</span>
                            {metricas.tasa_anonimizacion >= 99.5 ? <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-1" /> : <AlertCircle className="w-3 h-3 text-amber-500 ml-1" />}
                          </div>
                          <div className="flex items-center text-xs">
                            <span className="font-semibold text-gray-500 dark:text-gray-400 mr-1">I3:</span>
                            <span className="text-gray-900 dark:text-gray-100">{Number(metricas.precision_segmento).toFixed(1)}%</span>
                            {metricas.precision_segmento >= 85 ? <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-1" /> : <AlertCircle className="w-3 h-3 text-amber-500 ml-1" />}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Calculando métricas...</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleVerDetalle(item.campana_id, 'contenido')}
                        disabled={loadingModal}
                        className="text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors"
                      >
                        Ver →
                      </button>
                      <button
                        onClick={() => handleEnviarAprobacion(item.campana_id)}
                        disabled={enviandoAprobacion === item.campana_id}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-colors"
                      >
                        {enviandoAprobacion === item.campana_id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Aprobar →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                        Detalle de Campaña (Reactivación)
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
                        className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${modalTab === 'contenido' ? 'bg-white dark:bg-gray-800 text-violet-700 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300'}`}
                      >
                        Contenido
                      </button>
                      <button
                        onClick={() => setModalTab('auditoria')}
                        className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${modalTab === 'auditoria' ? 'bg-white dark:bg-gray-800 text-violet-700 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300'}`}
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
                          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50 p-5 relative overflow-hidden">
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
                            <h4 className="text-sm font-semibold text-violet-800 mb-2 flex items-center">
                              <Send className="w-4 h-4 mr-1"/> Ajustar / Refinar con IA
                            </h4>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={refinarTexto}
                                onChange={(e) => setRefinarTexto(e.target.value)}
                                placeholder="Ej: Haz el mensaje más urgente, incluye un descuento del 10%..."
                                className="block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                                disabled={refinando}
                              />
                              <button
                                onClick={handleRefinar}
                                disabled={refinando || !refinarTexto.trim()}
                                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50"
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
                                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 mb-1">I1 - T. RESPUESTA</span>
                                    <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{(metricas.tiempo_respuesta_ms / 1000).toFixed(1)}s</span>
                                    {(metricas.tiempo_respuesta_ms / 1000) <= 30 ? (
                                      <span className="text-[10px] font-bold text-violet-600 mt-1">✓ Óptimo (≤30s)</span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-red-600 mt-1">✗ Lento (&gt;30s)</span>
                                    )}
                                  </div>
                                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 mb-1">I2 - ANONIMIZACIÓN</span>
                                    <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{Number(metricas.tasa_anonimizacion).toFixed(2)}%</span>
                                    {metricas.tasa_anonimizacion >= 99.5 ? (
                                      <span className="text-[10px] font-bold text-violet-600 mt-1">✓ Seguro (≥99.5%)</span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-red-600 mt-1">✗ Riesgo (&lt;99.5%)</span>
                                    )}
                                  </div>
                                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 mb-1">I3 - PRECISIÓN SEG.</span>
                                    <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{Number(metricas.precision_segmento).toFixed(1)}%</span>
                                    {metricas.precision_segmento >= 85 ? (
                                      <span className="text-[10px] font-bold text-violet-600 mt-1">✓ Alta (≥85%)</span>
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
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:justify-between rounded-b-2xl">
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
                      onClick={() => handleEnviarAprobacion(campanaView.campana_id)}
                      className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-violet-600 text-base font-medium text-white hover:bg-violet-700 focus:outline-none sm:w-auto sm:text-sm"
                    >
                      <Send className="-ml-1 mr-2 h-4 w-4" />
                      Enviar a Aprobación
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
