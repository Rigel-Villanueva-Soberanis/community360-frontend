import { obtener } from '@/core/http/cliente'
import type { Paginado } from '@/core/types/api'
import type { Documento, FiltroAuditoria, ResumenAuditoria } from '../types/auditoria.types'

const base = '/api/auditoria'

/** Solo lectura y solo administrador. Los filtros son valores de listas fijas; el backend los valida de nuevo. */
export const auditoriaApi = {
  resumen: (signal?: AbortSignal) => obtener<ResumenAuditoria>(`${base}/resumen`, { signal }),
  cuarentena: (f: FiltroAuditoria, signal?: AbortSignal) =>
    obtener<Paginado<Documento>>(`${base}/cuarentena`, {
      params: { estadoRevision: f.estadoRevision, pagina: f.pagina, tamano: f.tamano },
      signal,
    }),
  diarioCambios: (f: FiltroAuditoria, signal?: AbortSignal) =>
    obtener<Paginado<Documento>>(`${base}/diario-cambios`, {
      params: { pagina: f.pagina, tamano: f.tamano },
      signal,
    }),
  bitacoraCarga: (signal?: AbortSignal) =>
    obtener<Documento[]>(`${base}/bitacora-carga`, { signal }),
  bitacoraApi: (f: FiltroAuditoria, signal?: AbortSignal) =>
    obtener<Paginado<Documento>>(`${base}/bitacora-api`, {
      params: { operacion: f.operacion, pagina: f.pagina, tamano: f.tamano },
      signal,
    }),
}
