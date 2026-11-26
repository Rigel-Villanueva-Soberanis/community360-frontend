import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/core/types/api'
import { avisar } from '@/core/utils/avisos'

/**
 * Cliente HTTP ÚNICO de la aplicación. Regla: las vistas nunca llaman axios; pasan por api/ → este archivo.
 *
 * La sesión viaja en una cookie HttpOnly que el navegador manda solo (withCredentials). El token nunca pasa
 * por JavaScript ni se guarda en localStorage: un XSS no podría robarlo.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

export interface ManejadoresHttp {
  /** Se llama cuando una petición protegida responde 401 (sesión vencida o revocada). */
  alSesionInvalida?: () => void
}

let manejadores: ManejadoresHttp = {}

export function configurarHttp(nuevos: ManejadoresHttp): void {
  manejadores = nuevos
}

/** En estas rutas un 401 es una respuesta normal (credenciales malas / no hay sesión), no una sesión vencida. */
const SIN_REDIRECCION_401 = ['/api/auth/login', '/api/auth/me', '/api/auth/logout']

export function manejarError(error: AxiosError<ApiResponse<unknown>>): void {
  const estado = error.response?.status
  const url = error.config?.url ?? ''

  if (error.code === 'ERR_CANCELED') return
  if (!error.response) {
    avisar('error', 'Servicio no disponible. Revisa tu conexión.')
  } else if (estado === 401) {
    if (!SIN_REDIRECCION_401.some((r) => url.startsWith(r))) manejadores.alSesionInvalida?.()
  } else if (estado === 403) {
    avisar('warn', 'No tienes permiso para realizar esta acción.')
  } else if (estado === 429) {
    avisar('warn', 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.')
  } else if (estado !== undefined && estado >= 500) {
    avisar('error', 'Servicio no disponible. Intenta más tarde.')
  }
}

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: AxiosError<ApiResponse<unknown>>) => {
    manejarError(error)
    return Promise.reject(error) // siempre se relanza: los formularios leen errores[] de la respuesta
  },
)

/** GET que devuelve directamente `datos` (sin la envoltura). */
export async function obtener<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const r = await api.get<ApiResponse<T>>(url, config)
  return r.data.datos
}

export async function publicar<T>(
  url: string,
  cuerpo?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const r = await api.post<ApiResponse<T>>(url, cuerpo, config)
  return r.data.datos
}

export async function reemplazar<T>(
  url: string,
  cuerpo?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const r = await api.put<ApiResponse<T>>(url, cuerpo, config)
  return r.data.datos
}

export async function eliminar<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const r = await api.delete<ApiResponse<T>>(url, config)
  return r.data.datos
}
