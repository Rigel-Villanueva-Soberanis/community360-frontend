import { isAxiosError } from 'axios'
import type { ApiResponse, ErrorDetalle } from '@/core/types/api'

/** errores[{campo,mensaje}] → { campo: mensaje } (si un campo trae varios, se queda el primero). */
export function aMapa(errores: ErrorDetalle[] | null | undefined): Record<string, string> {
  const mapa: Record<string, string> = {}
  for (const e of errores ?? []) if (!(e.campo in mapa)) mapa[e.campo] = e.mensaje
  return mapa
}

function cuerpo(error: unknown): ApiResponse<unknown> | undefined {
  return isAxiosError<ApiResponse<unknown>>(error) ? error.response?.data : undefined
}

/** Errores por campo de una respuesta 422 (vacío si el error no es de validación). */
export function erroresDe(error: unknown): Record<string, string> {
  return aMapa(cuerpo(error)?.errores)
}

/** Código HTTP del error, o undefined si no hubo respuesta (red caída, API apagada). */
export function estadoDe(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined
}

/** Mensaje legible para el usuario: el de la API si lo trae, si no uno genérico. */
export function mensajeDe(
  error: unknown,
  porDefecto = 'No se pudo completar la operación.',
): string {
  const c = cuerpo(error)
  if (c?.mensaje) return c.mensaje
  const primero = c?.errores?.[0]
  if (primero) return primero.mensaje
  if (isAxiosError(error) && !error.response) return 'Servicio no disponible. Revisa tu conexión.'
  return porDefecto
}
