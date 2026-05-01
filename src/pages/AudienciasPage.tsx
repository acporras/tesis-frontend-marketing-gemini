import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderUp, Plus, FileText, Archive, Calendar, Users, Target } from 'lucide-react';
import { API_URL } from '../config';

export default function AudienciasPage() {
  const [audiencias, setAudiencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudiencias = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/audiencias?estado=activa`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar audiencias');
      const data = await res.json();
      setAudiencias(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudiencias();
  }, []);

  const archivar = async (id: string) => {
    if (!confirm('¿Seguro que deseas archivar esta audiencia?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${API_URL}/audiencias/${id}/archivar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAudiencias();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FolderUp className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Audiencias Importadas
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestiona tus listas de clientes para campañas puntuales
            </p>
          </div>
        </div>
        <Link 
          to="/audiencias/importar" 
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          IMPORTAR NUEVA AUDIENCIA
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Mis audiencias</h2>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : audiencias.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-dashed rounded-xl p-12 text-center flex flex-col items-center">
            <FolderUp className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Aún no tienes audiencias importadas</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">Sube tu primer archivo CSV, Excel o JSON para crear campañas focalizadas a segmentos específicos.</p>
            <Link to="/audiencias/importar" className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100">
              Comenzar a importar
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {audiencias.map((aud) => (
              <div key={aud.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className="mt-1 mr-4 text-indigo-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{aud.nombre}</h3>
                      {aud.descripcion && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{aud.descripcion}</p>}
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-3 space-x-4">
                        <span className="flex items-center"><Users className="w-4 h-4 mr-1.5" /> {aud.total_registros.toLocaleString()} registros</span>
                        <span className="flex items-center uppercase"><Target className="w-4 h-4 mr-1.5" /> {aud.formato_origen}</span>
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {formatDate(aud.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <button className="text-sm px-3 py-1.5 font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors">
                        Usar en campaña
                      </button>
                      <button 
                        onClick={() => archivar(aud.id)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" 
                        title="Archivar"
                      >
                        <Archive className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
