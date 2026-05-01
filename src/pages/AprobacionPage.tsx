import { useState, useEffect } from 'react';
import { CheckSquare, Loader2, Search, X, Check, XCircle, Clock, AlertCircle, Rocket, Gem, RotateCcw, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../config';

interface CampanaResumen {
  id?: string;
  campana_id?: string;
  dimension: string;
  estado?: string;
  created_at: string;
  usuario_id: string;
  usuarios?: {
    nombre: string;
  };
  segmento_generado?: any;
  tiempo_respuesta_ms?: number;
  logs?: any[]; // added via detailed fetch
}

interface CampanaDetalle extends CampanaResumen {
  instruccion_original: string;
  mensaje_generado: string;
  comentario_rechazo?: string;
}

export default function AprobacionPage() {
  const [activeTab, setActiveTab] = useState<'pendientes' | 'historial'>('pendientes');
  
  const [campanas, setCampanas] = useState<CampanaResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [selectedCampana, setSelectedCampana] = useState<CampanaDetalle | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [procesandoModal, setProcesandoModal] = useState(false);

  const fetchCampanas = async (tab: 'pendientes' | 'historial') => {
    setLoading(true);
    setError(null);
    setCampanas([]);

    try {
      const token = localStorage.getItem('access_token');
      const endpoint = tab === 'pendientes' ? '/aprobacion/pendientes' : '/aprobacion/historial';
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Error al obtener campañas');
      }

      const data = await res.json();
      
      const dataNormalizada = data.map((item: any) => ({
        ...item,
        id: item.id || item.campana_id,
        estado: item.estado || (tab === 'pendientes' ? 'pendiente_aprobacion' : 'desconocido')
      }));

      // Fetch details for metrics (I1, I2, I3)
      const detallados = await Promise.all(dataNormalizada.map(async (d: any) => {
        try {
          const detailRes = await fetch(`${API_URL}/aprobacion/${d.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            return { ...d, logs: detailData.logs, instruccion_original: detailData.instruccion_original };
          }
        } catch (e) {}
        return d;
      }));
      
      setCampanas(detallados);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampanas(activeTab);
  }, [activeTab]);

  const handleVerDetalle = (campanaId: string) => {
    const item = campanas.find(c => c.id === campanaId);
    if (item) {
      setSelectedCampana(item as CampanaDetalle);
      setMotivoRechazo('');
    }
  };

  const handleAprobar = async () => {
    if (!selectedCampana) return;
    setProcesandoModal(true);
    try {
      const token = localStorage.getItem('access_token');
      const realId = selectedCampana.id;
      const res = await fetch(`${API_URL}/aprobacion/${realId}/aprobar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comentario: motivoRechazo || null })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Error al aprobar');
      }

      setSelectedCampana(null);
      fetchCampanas(activeTab);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcesandoModal(false);
    }
  };

  const handleRechazar = async () => {
    if (!selectedCampana || !motivoRechazo.trim()) return;
    setProcesandoModal(true);
    try {
      const token = localStorage.getItem('access_token');
      const realId = selectedCampana.id;
      const res = await fetch(`${API_URL}/aprobacion/${realId}/rechazar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comentario: motivoRechazo })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Error al rechazar');
      }

      setSelectedCampana(null);
      fetchCampanas(activeTab);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcesandoModal(false);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return 'Hace menos de 1h';
    return `Hace ${diffHrs}h`;
  };

  const getDimensionIcon = (dim: string) => {
    if (dim === 'onboarding') return <Rocket className="w-5 h-5 text-emerald-500 mr-2" />;
    if (dim === 'fidelizacion') return <Gem className="w-5 h-5 text-amber-500 mr-2" />;
    if (dim === 'reactivacion') return <RotateCcw className="w-5 h-5 text-violet-500 mr-2" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-amber-100 rounded-lg">
          <CheckSquare className="h-6 w-6 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Aprobación de Campañas
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px px-6">
            <button
              onClick={() => setActiveTab('pendientes')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pendientes'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center">
                <Clock className="w-4 h-4 mr-2" />
                Pendientes ({activeTab === 'pendientes' ? campanas.length : '-'})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'historial'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center">
                <Search className="w-4 h-4 mr-2" />
                Aprobadas / Rechazadas
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 min-h-[400px]">
          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-lg flex items-center text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 mr-2" /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-amber-500 h-10 w-10 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Cargando campañas...</p>
            </div>
          ) : campanas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
              <CheckCircle2 className="h-16 w-16 text-gray-200 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No hay campañas en esta sección</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campanas.map((c) => {
                const metricas = c.logs && c.logs.length > 0 ? c.logs[c.logs.length - 1] : null;
                const i1 = metricas ? metricas.tiempo_respuesta_ms : c.tiempo_respuesta_ms;
                const i2 = metricas ? metricas.tasa_anonimizacion : null;
                const i3 = metricas ? metricas.precision_segmento : null;
                
                return (
                  <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center capitalize mb-1">
                        {getDimensionIcon(c.dimension)} {c.dimension} · {c.segmento_generado?.objetivo_campana || c.segmento_generado?.perfil_inactividad || 'Campaña general'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Por: {c.usuarios?.nombre || 'Sistema (auto)'} · {getTimeAgo(c.created_at)}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                          Audiencia: {c.segmento_generado?.tamanio_audiencia || 0} clientes
                        </span>
                        {metricas && (
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <span className="font-semibold mr-1">Métricas:</span>
                            <span className="flex items-center">I1 {(i1/1000) <= 30 ? <Check className="w-3 h-3 text-emerald-500 ml-0.5"/> : <X className="w-3 h-3 text-red-500 ml-0.5"/>}</span>
                            <span className="flex items-center">I2 {i2 >= 99.5 ? <Check className="w-3 h-3 text-emerald-500 ml-0.5"/> : <X className="w-3 h-3 text-red-500 ml-0.5"/>}</span>
                            <span className="flex items-center">I3 {i3 >= 85 ? <Check className="w-3 h-3 text-emerald-500 ml-0.5"/> : <X className="w-3 h-3 text-amber-500 ml-0.5"/>}</span>
                          </div>
                        )}
                        {activeTab === 'historial' && (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.estado === 'aprobada' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {c.estado?.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <button
                        onClick={() => handleVerDetalle(c.id!)}
                        className="inline-flex items-center px-5 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                      >
                        {activeTab === 'pendientes' ? 'Revisar y decidir →' : 'Ver Detalle'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETALLE DE APROBACIÓN */}
      {selectedCampana && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedCampana(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              
              {/* Modal Header */}
              <div className="bg-amber-600 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center">
                  {activeTab === 'pendientes' ? '✓ Aprobación' : 'Historial'} {'>'} {selectedCampana.dimension.charAt(0).toUpperCase() + selectedCampana.dimension.slice(1)}
                </h3>
                <button onClick={() => setSelectedCampana(null)} className="text-amber-100 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 px-6 pt-5 pb-6">
                
                {/* 1. INFORMACIÓN DE LA CAMPAÑA */}
                <div className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-bold text-xs text-gray-600 dark:text-gray-400 tracking-wider">
                    INFORMACIÓN DE LA CAMPAÑA
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-y-3 text-sm">
                    <div className="text-gray-500 dark:text-gray-400 font-medium">Creada por:</div>
                    <div className="text-gray-900 dark:text-gray-100 font-medium">{selectedCampana.usuarios?.nombre || 'Sistema (auto)'}</div>
                    <div className="text-gray-500 dark:text-gray-400 font-medium">Fecha:</div>
                    <div className="text-gray-900 dark:text-gray-100">{new Date(selectedCampana.created_at).toLocaleString()}</div>
                    <div className="text-gray-500 dark:text-gray-400 font-medium">Dimensión:</div>
                    <div className="text-gray-900 dark:text-gray-100 capitalize">{selectedCampana.dimension}</div>
                    <div className="text-gray-500 dark:text-gray-400 font-medium">Objetivo:</div>
                    <div className="text-gray-900 dark:text-gray-100 capitalize">{selectedCampana.segmento_generado?.objetivo_campana || selectedCampana.segmento_generado?.perfil_inactividad || 'General'}</div>
                    <div className="text-gray-500 dark:text-gray-400 font-medium">Estado:</div>
                    <div className="text-gray-900 dark:text-gray-100 font-semibold">{selectedCampana.estado?.replace('_', ' ').toUpperCase()}</div>
                  </div>
                </div>

                {/* 1.5 MOTIVO DE RECHAZO (SI APLICA) */}
                {selectedCampana.estado === 'rechazada' && selectedCampana.comentario_rechazo && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-sm p-4">
                    <h4 className="text-sm font-bold text-red-800 mb-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" /> Motivo de Rechazo
                    </h4>
                    <p className="text-sm text-red-700">
                      {selectedCampana.comentario_rechazo}
                    </p>
                  </div>
                )}

                {/* 2. INSTRUCCIÓN ORIGINAL */}
                <div className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-bold text-xs text-gray-600 dark:text-gray-400 tracking-wider">
                    INSTRUCCIÓN ORIGINAL
                  </div>
                  <div className="p-4 text-sm text-gray-800 dark:text-gray-200 italic border-l-4 border-amber-400 bg-amber-50/30">
                    "{selectedCampana.instruccion_original || 'Generación automática por el sistema.'}"
                  </div>
                </div>

                {/* 3. SEGMENTO Y MENSAJE (SIDE-BY-SIDE) */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SEGMENTO */}
                  <div className="bg-white dark:bg-gray-800 border border-indigo-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200 font-bold text-xs text-indigo-800 tracking-wider flex justify-between items-center">
                      <span>SEGMENTO</span>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">{selectedCampana.segmento_generado?.tamanio_audiencia || 0} clientes</span>
                    </div>
                    <div className="p-4 flex-grow">
                      <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2 mb-4 font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                        {Object.entries(selectedCampana.segmento_generado?.criterios || selectedCampana.segmento_generado || {}).map(([key, val]) => {
                          if (key === 'tamanio_audiencia' || key === 'perfil_inactividad' || key === 'objetivo_campana' || key === 'tono' || key === 'productos_recomendados') return null;
                          return <li key={key}>• {key}: {JSON.stringify(val)}</li>;
                        })}
                      </ul>
                      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center">
                        <span className="mr-2">Tono:</span> <span className="capitalize text-indigo-700">{selectedCampana.segmento_generado?.tono || 'No definido'}</span>
                      </div>
                    </div>
                  </div>

                  {/* MENSAJE */}
                  <div className="bg-white dark:bg-gray-800 border border-emerald-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200 font-bold text-xs text-emerald-800 tracking-wider">
                      MENSAJE
                    </div>
                    <div className="p-5 flex-grow text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed bg-green-50/10">
                      {selectedCampana.mensaje_generado}
                    </div>
                  </div>
                </div>

                {/* 4. MÉTRICAS DE LA EJECUCIÓN */}
                <div className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-bold text-xs text-gray-600 dark:text-gray-400 tracking-wider">
                    MÉTRICAS DE LA EJECUCIÓN
                  </div>
                  <div className="p-5">
                    {selectedCampana.logs && selectedCampana.logs.length > 0 ? (
                      (() => {
                        const metricas = selectedCampana.logs[selectedCampana.logs.length - 1];
                        return (
                          <div className="flex justify-around items-center text-sm font-medium">
                            <div className="flex flex-col items-center text-center">
                              <span className="text-gray-500 dark:text-gray-400 mb-1">I1: Respuesta</span> 
                              <div className="flex items-center">
                                <span className="text-gray-900 dark:text-gray-100 text-xl font-bold">{(metricas.tiempo_respuesta_ms / 1000).toFixed(1)}s</span>
                                {(metricas.tiempo_respuesta_ms / 1000) <= 30 ? <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-2"/> : <AlertCircle className="w-5 h-5 text-red-500 ml-2"/>}
                              </div>
                            </div>
                            <div className="w-px h-12 bg-gray-200"></div>
                            <div className="flex flex-col items-center text-center">
                              <span className="text-gray-500 dark:text-gray-400 mb-1">I2: Anonimización</span> 
                              <div className="flex items-center">
                                <span className="text-gray-900 dark:text-gray-100 text-xl font-bold">{Number(metricas.tasa_anonimizacion).toFixed(2)}%</span>
                                {metricas.tasa_anonimizacion >= 99.5 ? <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-2"/> : <AlertCircle className="w-5 h-5 text-red-500 ml-2"/>}
                              </div>
                            </div>
                            <div className="w-px h-12 bg-gray-200"></div>
                            <div className="flex flex-col items-center text-center">
                              <span className="text-gray-500 dark:text-gray-400 mb-1">I3: Precisión</span> 
                              <div className="flex items-center">
                                <span className="text-gray-900 dark:text-gray-100 text-xl font-bold">{Number(metricas.precision_segmento).toFixed(1)}%</span>
                                {metricas.precision_segmento >= 85 ? <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-2"/> : <AlertCircle className="w-5 h-5 text-amber-500 ml-2"/>}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center italic">Métricas técnicas no disponibles para esta campaña.</p>
                    )}
                  </div>
                </div>

                {/* 5. ACCIONES (COMENTARIO Y BOTONES) */}
                {activeTab === 'pendientes' && (
                  <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Comentario (opcional, requerido si rechaza):</label>
                    <textarea
                      value={motivoRechazo}
                      onChange={(e) => setMotivoRechazo(e.target.value)}
                      placeholder="Escribe un comentario o motivo de rechazo..."
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner focus:ring-amber-500 focus:border-amber-500 sm:text-sm p-4 mb-5 bg-white dark:bg-gray-800"
                      rows={3}
                    />
                    
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handleRechazar}
                        disabled={procesandoModal || !motivoRechazo.trim()}
                        className="inline-flex items-center justify-center px-8 py-3 border border-red-300 shadow-sm text-base font-bold rounded-xl text-red-700 bg-white dark:bg-gray-800 hover:bg-red-50 focus:outline-none disabled:opacity-50 transition-colors w-[48%]"
                      >
                        {procesandoModal ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <XCircle className="w-5 h-5 mr-2" />} 
                        ✗ RECHAZAR
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleAprobar}
                        disabled={procesandoModal}
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent shadow-md text-base font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none disabled:opacity-50 transition-colors w-[48%]"
                      >
                        {procesandoModal ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Check className="w-5 h-5 mr-2" />} 
                        ✓ APROBAR CAMPAÑA
                      </button>
                    </div>
                  </div>
                )}
                
                {activeTab === 'historial' && (
                  <div className="flex justify-center pt-6 border-t border-gray-300 dark:border-gray-600">
                     <button
                      type="button"
                      onClick={() => setSelectedCampana(null)}
                      className="inline-flex justify-center px-10 py-3 rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900"
                    >
                      Cerrar Vista
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
