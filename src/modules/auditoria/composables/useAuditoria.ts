import { computed, onMounted, ref, watch } from 'vue'
import { auditoriaApi } from '../api/auditoria.api'
import { useRecurso } from '@/core/utils/useRecurso'
import type { Paginado } from '@/core/types/api'
import type { Coleccion, Documento, EstadoRevision, OperacionApi } from '../types/auditoria.types'

export const TAMANO_PAGINA = 20

/** Orden preferido de columnas (las demás van después, en el orden en que aparecen). */
const PREFERIDAS = [
  'id_interaccion',
  'id_usuario',
  'operacion',
  'tabla',
  'id',
  'motivo',
  'campos_eliminados',
  'estado_revision',
  'carga_id',
  'hecho_por',
  'fecha',
  'fecha_utc',
  'aislado_en',
  'inicio',
  'fin',
]

/** Une los campos de todos los documentos de la página (no todos traen los mismos) con las preferidas primero. */
export function columnasDe(docs: Documento[]): string[] {
  const todas = new Set<string>()
  for (const d of docs) for (const k of Object.keys(d)) todas.add(k)
  const primero = PREFERIDAS.filter((c) => todas.has(c))
  return [...primero, ...[...todas].filter((c) => !primero.includes(c))]
}

export const MAX_COLUMNAS_CLAVE = 4

/**
 * Las columnas importantes que se ven en la tabla: las preferidas primero, solo valores cortos (texto, número, booleano)
 * y como máximo MAX_COLUMNAS_CLAVE. Todo lo demás (incluidos objetos y listas) se ve en el detalle del documento.
 */
export function columnasClave(docs: Documento[], max = MAX_COLUMNAS_CLAVE): string[] {
  const esSimple = (c: string) =>
    docs.every((d) => d[c] === null || d[c] === undefined || typeof d[c] !== 'object')
  return columnasDe(docs).filter(esSimple).slice(0, max)
}

/** Todos los campos de un documento en orden de lectura: las preferidas primero y luego el resto. */
export function camposOrdenados(doc: Documento): string[] {
  return columnasDe([doc])
}

const ETIQUETAS: Record<string, string> = {
  id: 'Código',
  id_interaccion: 'Interacción',
  id_usuario: 'Usuario',
  id_ciudad: 'Ciudad',
  alias: 'Alias',
  operacion: 'Operación',
  tabla: 'Tabla',
  motivo: 'Motivo',
  campos_eliminados: 'Campos eliminados',
  estado_revision: 'Estado de revisión',
  carga_id: 'Carga',
  hecho_por: 'Hecho por',
  fecha: 'Fecha',
  fecha_utc: 'Fecha',
  fecha_hora: 'Fecha y hora',
  aislado_en: 'Aislado el',
  inicio: 'Inicio',
  fin: 'Fin',
  plataforma: 'Plataforma',
  tipo: 'Tipo',
  tema: 'Tema',
  texto: 'Texto',
  sentimiento: 'Sentimiento',
  idioma: 'Idioma',
  dispositivo: 'Dispositivo',
  etiquetas: 'Etiquetas',
  reacciones_recibidas: 'Reacciones recibidas',
  registro_original: 'Registro original',
  latitud: 'Latitud',
  longitud: 'Longitud',
}

/** Color de la etiqueta de un estado u operación (pendiente → ámbar, recuperada → verde…). */
const TONOS_ESTADO: Record<string, string> = {
  pendiente: 'ambar',
  descartada: 'gris',
  recuperada: 'verde',
  alta: 'verde',
  modificacion: 'azul',
  baja: 'rojo',
  rechazo: 'ambar',
}
export const tonoEstado = (v: unknown): string => TONOS_ESTADO[String(v)] ?? 'gris'

/** Campos cuya lista contiene nombres de otros campos (se escriben con su nombre legible). */
export const CAMPOS_CON_NOMBRES: readonly string[] = ['campos_eliminados']

/** Nombre legible de un campo: "estado_revision" → "Estado de revisión"; los desconocidos se escriben con espacios. */
export function etiquetaCampo(campo: string): string {
  const conocida = ETIQUETAS[campo]
  if (conocida) return conocida
  const texto = campo
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .toLowerCase()
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : campo
}

const ISO_FECHA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/
const formatoFecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' })

/** Valor listo para leer: fechas con formato, Sí/No, guion si está vacío. Siempre texto (nunca HTML). */
export function formatearValor(valor: unknown): string {
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
  if (typeof valor === 'string' && ISO_FECHA.test(valor)) {
    const f = new Date(valor)
    if (!Number.isNaN(f.getTime())) return formatoFecha.format(f)
  }
  if (typeof valor === 'string' && valor !== '') return limpiarTexto(valor)
  return textoCelda(valor)
}

/** Motivos que escribe el proceso de carga, dichos en lenguaje de todos los días. */
const MOTIVOS: Record<string, string> = {
  'id_usuario sin usuario en el dataset': 'El usuario no existe',
  'consentimiento_datos = no': 'El usuario no dio su consentimiento',
  'usuario sin consentimiento': 'El usuario no dio su consentimiento',
}
const PALABRAS: Record<string, string> = { modificacion: 'modificación' }

/** Texto para personas: sin guiones bajos ni nombres internos («arte_comisiones» → «arte comisiones»). */
export function limpiarTexto(texto: string): string {
  const k = texto.trim().toLowerCase()
  return MOTIVOS[k] ?? PALABRAS[k] ?? texto.replace(/_/g, ' ')
}

/** Lo que se muestra en una celda: siempre texto (nunca HTML). */
export function textoCelda(valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return '—'
  if (typeof valor === 'string') return valor
  if (typeof valor === 'number' || typeof valor === 'boolean') return String(valor)
  return JSON.stringify(valor)
}

/** Auditoría (Couchbase): resumen + cuatro colecciones, con filtros de lista fija y paginación. */
export function useAuditoria() {
  const coleccion = ref<Coleccion>('cuarentena')
  const estadoRevision = ref<EstadoRevision | ''>('')
  const operacion = ref<OperacionApi | ''>('')
  const pagina = ref(1)

  const resumen = useRecurso((s) => auditoriaApi.resumen(s))

  const lista = useRecurso<Paginado<Documento>>(async (s) => {
    const f = { pagina: pagina.value, tamano: TAMANO_PAGINA }
    switch (coleccion.value) {
      case 'cuarentena':
        return auditoriaApi.cuarentena(
          { ...f, estadoRevision: estadoRevision.value || undefined },
          s,
        )
      case 'diario':
        return auditoriaApi.diarioCambios(f, s)
      case 'api':
        return auditoriaApi.bitacoraApi({ ...f, operacion: operacion.value || undefined }, s)
      default: {
        // La bitácora de cargas no está paginada: se adapta a la misma forma.
        const docs = await auditoriaApi.bitacoraCarga(s)
        return { items: docs, pagina: 1, tamano: docs.length, total: docs.length, totalPaginas: 1 }
      }
    }
  })

  const items = computed(() => lista.datos.value?.items ?? [])
  const columnas = computed(() => columnasClave(items.value))
  const totalPaginas = computed(() => Math.max(1, lista.datos.value?.totalPaginas ?? 1))

  // Cambiar de colección o de filtro vuelve a la página 1; cambiar de página solo recarga.
  watch([coleccion, estadoRevision, operacion], () => {
    pagina.value = 1
    void lista.cargar()
  })
  watch(pagina, () => void lista.cargar())

  function irAPagina(n: number): void {
    pagina.value = Math.min(Math.max(1, n), totalPaginas.value)
  }

  onMounted(() => {
    void resumen.cargar()
    void lista.cargar()
  })

  return {
    coleccion,
    estadoRevision,
    operacion,
    pagina,
    resumen,
    lista,
    items,
    columnas,
    totalPaginas,
    irAPagina,
  }
}
