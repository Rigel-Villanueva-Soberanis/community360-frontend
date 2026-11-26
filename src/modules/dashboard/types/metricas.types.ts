/** Forma común de dona, barras y rankings: etiqueta + valor (+ cuántas filas lo componen). */
export interface PuntoSerie {
  etiqueta: string
  valor: number
  total: number
}

/** I1 a I4. Con cero interacciones todo es 0. */
export interface Resumen {
  totalInteracciones: number
  sentimientoPromedio: number
  reaccionesPromedio: number
  porcentajeNegativo: number
}

/** Mapa de calor (I7). dia: 1 = domingo … 7 = sábado; hora 0–23; todo en UTC. */
export interface CeldaHeatmap {
  dia: number
  hora: number
  total: number
}

/** H5. fecha llega como AAAA-MM-DD. */
export interface TendenciaDia {
  fecha: string
  total: number
  sentimiento: number
}

/** I1 a I9 juntos: lo que manda el WebSocket en cada mensaje. */
export interface SnapshotMetricas {
  resumen: Resumen
  porPlataforma: PuntoSerie[]
  porTipo: PuntoSerie[]
  actividadPorHora: CeldaHeatmap[]
  sentimientoPorTema: PuntoSerie[]
  etiquetasTop: PuntoSerie[]
  calculadoUtc: string
}

export type TipoEvento =
  'conexion.establecida' | 'interaccion.creada' | 'interaccion.modificada' | 'interaccion.eliminada'

/** Resumen de la interacción que cambió. Por privacidad nunca trae texto ni ubicación. */
export interface ResumenInteraccion {
  idInteraccion: string
  plataforma: string
  tipo: string
  sentimiento: number | null
}

/** Cada mensaje del canal /ws trae las métricas ya recalculadas por el servidor. */
export interface MensajeTiempoReal {
  tipo: TipoEvento
  fechaUtc: string
  usuario?: string
  datos?: ResumenInteraccion
  metricas: SnapshotMetricas
}

export interface EventoRegistrado {
  id: number
  tipo: Exclude<TipoEvento, 'conexion.establecida'>
  fechaUtc: string
  datos: ResumenInteraccion
}
