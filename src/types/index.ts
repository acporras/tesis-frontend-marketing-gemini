export type Rol = 'analista' | 'coordinador'

export type DimensionCampana = 'onboarding' | 'fidelizacion' | 'reactivacion'

export type EstadoCampana =
  | 'borrador'
  | 'pendiente_aprobacion'
  | 'aprobada'
  | 'ejecutada'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: Rol
  activo?: boolean
}

export interface Campana {
  id: string
  usuario_id: string
  dimension: DimensionCampana
  instruccion_original: string
  segmento_generado: Record<string, unknown> | null
  mensaje_generado: string | null
  estado: EstadoCampana
  tiempo_respuesta_ms: number | null
  aprobado_por?: string | null
  aprobado_at?: string | null
  created_at: string
}

export interface ResultadoCampana {
  campana_id: string
  segmento: Record<string, unknown>
  tamanio_audiencia: number
  mensaje: string
  metricas: {
    tiempo_respuesta_ms: number    // I1
    tasa_anonimizacion: number     // I2
    precision_segmento: number     // I3
  }
}

export interface IndicadorMetrica {
  valor: number
  cumple_umbral: boolean
}

export interface MetricasIndicadores {
  I1: IndicadorMetrica   // Tiempo de respuesta ≤ 30 000 ms
  I2: IndicadorMetrica   // Tasa de anonimización ≥ 99.5%
  I3: IndicadorMetrica   // Precisión de segmento ≥ 85%
}
