import axios from 'axios'
import type { Campana, ResultadoCampana, MetricasIndicadores } from '../types'
import { API_URL } from '../config'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Adjunta el token de autorización en cada petición si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirige al login automáticamente si el token expira (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Onboarding ────────────────────────────────────────────────────────────────

export async function generarCampanaOnboarding(
  instruccion: string,
  tipoCampana: string,
): Promise<ResultadoCampana> {
  const { data } = await api.post<ResultadoCampana>('/onboarding/generar', {
    instruccion,
    tipo_campana: tipoCampana,
  })
  return data
}

// ── Fidelización ──────────────────────────────────────────────────────────────

export async function generarCampanaFidelizacion(
  instruccion: string,
  objetivo: string,
  filtros: Record<string, unknown> = {},
): Promise<ResultadoCampana> {
  const { data } = await api.post<ResultadoCampana>('/fidelizacion/generar', {
    instruccion,
    objetivo,
    filtros,
  })
  return data
}

// ── Reactivación ──────────────────────────────────────────────────────────────

export async function obtenerDetectadosReactivacion(): Promise<Campana[]> {
  const { data } = await api.get<Campana[]>('/reactivacion/detectados')
  return data
}

// ── Aprobación ────────────────────────────────────────────────────────────────

export async function obtenerPendientesAprobacion(): Promise<Campana[]> {
  const { data } = await api.get<Campana[]>('/aprobacion/pendientes')
  return data
}

export async function procesarAprobacion(
  campanaId: string,
  accion: 'aprobar' | 'rechazar',
  comentario?: string,
): Promise<Campana> {
  const { data } = await api.post<Campana>(`/aprobacion/${campanaId}`, {
    accion,
    comentario,
  })
  return data
}

// ── Métricas ──────────────────────────────────────────────────────────────────

export async function obtenerMetricas(): Promise<MetricasIndicadores> {
  const { data } = await api.get<MetricasIndicadores>('/metricas/indicadores')
  return data
}

export default api
