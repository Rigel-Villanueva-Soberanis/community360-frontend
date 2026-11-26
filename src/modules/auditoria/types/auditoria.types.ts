/** Los documentos de Couchbase se devuelven tal como están guardados: sus campos varían por colección. */
export type Documento = Record<string, unknown>

/** Conteo de documentos por colección: cuarentena, diario_cambios, bitacora_carga, bitacora_api. */
export type ResumenAuditoria = Record<string, number>

export type EstadoRevision = 'pendiente' | 'descartada' | 'recuperada'
export type OperacionApi = 'alta' | 'modificacion' | 'baja' | 'rechazo'

export const ESTADOS_REVISION: readonly EstadoRevision[] = ['pendiente', 'descartada', 'recuperada']
export const OPERACIONES_API: readonly OperacionApi[] = ['alta', 'modificacion', 'baja', 'rechazo']

export type Coleccion = 'cuarentena' | 'diario' | 'carga' | 'api'

export interface FiltroAuditoria {
  estadoRevision?: EstadoRevision
  operacion?: OperacionApi
  pagina?: number
  tamano?: number
}
