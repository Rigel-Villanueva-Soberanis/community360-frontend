/** Error de un campo (422) tal como lo devuelve la API. */
export interface ErrorDetalle {
  campo: string
  mensaje: string
}

/** Envoltura de TODAS las respuestas de la API. */
export interface ApiResponse<T> {
  exito: boolean
  mensaje?: string | null
  datos: T
  errores: ErrorDetalle[] | null
}

/** Respuesta paginada de los listados. */
export interface Paginado<T> {
  items: T[]
  pagina: number
  tamano: number
  total: number
  totalPaginas: number
}
