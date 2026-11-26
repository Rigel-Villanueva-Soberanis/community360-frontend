/**
 * Colores de las gráficas. El color sigue a la ENTIDAD (Instagram siempre es el mismo), no a su posición en el
 * ranking: así no cambian cuando una gráfica se actualiza en vivo.
 *
 * Categóricos: 8 tonos en orden fijo, validados contra daltonismo (CVD ΔE ≥ 9 entre vecinos). Algunos tienen
 * contraste menor a 3:1 sobre blanco, por eso SIEMPRE hay leyenda con texto y una tabla alternativa.
 */
export const CATEGORICA = [
  '#2a78d6', // azul
  '#eb6834', // naranja
  '#1baf7a', // aqua
  '#eda100', // amarillo
  '#e87ba4', // magenta
  '#008300', // verde
  '#6250d6', // violeta
  '#e34948', // rojo
] as const

export const COLOR_OTROS = '#8a8f98'

/** Estado de un usuario: colores de estado (bueno / advertencia / crítico), siempre acompañados de texto. */
export const COLOR_ESTATUS: Record<string, string> = {
  activo: '#0ca30c',
  en_riesgo: '#fab219',
  inactivo: '#d03b3b',
}

/** Una sola tonalidad, de claro a oscuro, para magnitudes (mapa de calor). */
export const SECUENCIAL = [
  '#e8f1fb',
  '#c4dcf5',
  '#93bfec',
  '#5e9ee0',
  '#2a78d6',
  '#1b57a3',
  '#123c73',
]

/** Plataformas conocidas con su posición fija; las demás entidades toman la siguiente libre. */
const asignados = new Map<string, string>()
;['telegram', 'discord', 'tiktok', 'instagram', 'facebook'].forEach((p, i) =>
  asignados.set(p, CATEGORICA[i]!),
)

const clave = (etiqueta: string) => etiqueta.trim().toLowerCase()

export function colorDe(etiqueta: string): string {
  const k = clave(etiqueta)
  if (k === 'otros' || k === 'otro') return COLOR_OTROS
  const existente = asignados.get(k)
  if (existente) return existente
  const siguiente = CATEGORICA[asignados.size]
  const color = siguiente ?? COLOR_OTROS // del noveno en adelante: gris, nunca un tono inventado
  asignados.set(k, color)
  return color
}

/** Nombre legible: `en_riesgo` → `En riesgo`. */
export function etiquetaLegible(texto: string): string {
  const t = texto.replace(/_/g, ' ').trim()
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t
}

/** Para pruebas. */
export function reiniciarPaleta(): void {
  asignados.clear()
  ;['telegram', 'discord', 'tiktok', 'instagram', 'facebook'].forEach((p, i) =>
    asignados.set(p, CATEGORICA[i]!),
  )
}
