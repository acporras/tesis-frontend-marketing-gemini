import { Network, Database, ChevronRight, Lock } from 'lucide-react';

export default function EsquemasPage() {
  const schema = [
    { name: 'cliente_id_anonimizado', type: 'VARCHAR(64)', required: true, description: 'Hash único SHA-256 del cliente' },
    { name: 'fecha_apertura_cuenta', type: 'TIMESTAMPTZ', required: false, description: 'Fecha de ingreso al banco' },
    { name: 'fecha_ultima_transaccion', type: 'TIMESTAMPTZ', required: false, description: 'Última actividad detectada' },
    { name: 'canal_principal', type: 'VARCHAR(20)', required: false, description: 'app_movil, web, agencia, etc.' },
    { name: 'productos_activos', type: 'JSONB', required: false, description: 'Lista de productos que posee el cliente' },
    { name: 'score_crediticio', type: 'INTEGER', required: false, description: 'Puntaje crediticio interno' },
    { name: 'operaciones_ultimo_mes', type: 'INTEGER', required: false, description: 'Volumen transaccional 30d' },
    { name: 'dimension_ciclo_vida', type: 'VARCHAR(20)', required: false, description: 'onboarding, fidelizacion, reactivacion' },
    { name: 'datos_adicionales', type: 'JSONB', required: false, description: 'Campos dinámicos de importación' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Network className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Esquemas de Datos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Visualización del modelo base de ingesta y generación.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">Dataset General (Principal)</h2>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-200 px-2 py-1 rounded flex items-center">
            <Lock className="w-3 h-3 mr-1" /> Solo Lectura
          </span>
        </div>
        <div className="p-6">
          <div className="pl-2 border-l-2 border-gray-200 dark:border-gray-700 space-y-4">
            {schema.map((field) => (
              <div key={field.name} className="flex items-start group">
                <ChevronRight className="w-5 h-5 text-gray-300 mr-2 mt-0.5 group-hover:text-indigo-400 transition-colors" />
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{field.name}</span>
                    <span className="text-xs font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Requerido</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{field.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-400">
              La funcionalidad para modificar el esquema, agregar o eliminar atributos estará disponible en futuras versiones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
