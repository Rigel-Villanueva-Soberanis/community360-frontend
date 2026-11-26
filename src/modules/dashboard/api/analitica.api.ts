import { obtener } from '@/core/http/cliente'
import type { CeldaHeatmap, PuntoSerie, Resumen, TendenciaDia } from '../types/metricas.types'

const base = '/api/analitica'

/** Los 11 endpoints de solo lectura. Datos reales de TiDB; nada simulado. */
export const analiticaApi = {
  // En vivo (I1–I9): también llegan por WebSocket; REST sirve para la carga inicial.
  resumen: (signal?: AbortSignal) => obtener<Resumen>(`${base}/resumen`, { signal }),
  porPlataforma: (signal?: AbortSignal) =>
    obtener<PuntoSerie[]>(`${base}/interacciones-por-plataforma`, { signal }),
  porTipo: (signal?: AbortSignal) =>
    obtener<PuntoSerie[]>(`${base}/interacciones-por-tipo`, { signal }),
  actividadPorHora: (signal?: AbortSignal) =>
    obtener<CeldaHeatmap[]>(`${base}/actividad-por-hora`, { signal }),
  sentimientoPorTema: (signal?: AbortSignal) =>
    obtener<PuntoSerie[]>(`${base}/sentimiento-por-tema`, { signal }),
  etiquetasTop: (signal?: AbortSignal) =>
    obtener<PuntoSerie[]>(`${base}/etiquetas-top`, { signal }),

  // Históricos (H1–H5)
  usuariosPorEstatus: (signal?: AbortSignal) =>
    obtener<PuntoSerie[]>(`${base}/usuarios-por-estatus`, { signal }),
  usuariosPorPlataforma: (signal?: AbortSignal) =>
    obtener<PuntoSerie[]>(`${base}/usuarios-por-plataforma`, { signal }),
  usuariosPorRangoEdad: (signal?: AbortSignal) =>
    obtener<PuntoSerie[]>(`${base}/usuarios-por-rango-edad`, { signal }),
  usuariosPorPais: (signal?: AbortSignal) =>
    obtener<PuntoSerie[]>(`${base}/usuarios-por-pais`, { signal }),
  tendenciaDiaria: (desde: string, hasta: string, signal?: AbortSignal) =>
    obtener<TendenciaDia[]>(`${base}/tendencia-diaria`, { params: { desde, hasta }, signal }),
}
