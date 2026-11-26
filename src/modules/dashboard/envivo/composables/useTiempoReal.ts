import { onBeforeUnmount, ref } from 'vue'
import type { MensajeTiempoReal, TipoEvento } from '../../types/metricas.types'

export type EstadoConexion = 'conectando' | 'en_vivo' | 'reconectando' | 'cerrado'

export const ESPERAS_MS = [2000, 4000, 8000, 10000] as const
const TIPOS: readonly TipoEvento[] = [
  'conexion.establecida',
  'interaccion.creada',
  'interaccion.modificada',
  'interaccion.eliminada',
]

/**
 * http(s)://host → ws(s)://host/ws.
 * Sin dirección de API (producción: el proxy de Cloudflare atiende /api y /ws en el mismo sitio) se usa el origen de la página.
 */
export function urlTiempoReal(
  apiUrl: string | undefined,
  origen: string = window.location.origin,
): string {
  const base = apiUrl?.trim() ? apiUrl : origen
  return `${base.replace(/\/+$/, '').replace(/^http/i, 'ws')}/ws`
}

/** Solo se aceptan mensajes con la forma esperada; cualquier otra cosa se ignora. */
export function esMensaje(x: unknown): x is MensajeTiempoReal {
  if (typeof x !== 'object' || x === null) return false
  const m = x as Record<string, unknown>
  const met = m.metricas as Record<string, unknown> | undefined
  return (
    typeof m.tipo === 'string' &&
    (TIPOS as readonly string[]).includes(m.tipo) &&
    typeof m.fechaUtc === 'string' &&
    typeof met === 'object' &&
    met !== null &&
    typeof met.resumen === 'object' &&
    Array.isArray(met.porPlataforma) &&
    Array.isArray(met.porTipo) &&
    Array.isArray(met.actividadPorHora) &&
    Array.isArray(met.sentimientoPorTema) &&
    Array.isArray(met.etiquetasTop)
  )
}

export interface OpcionesTiempoReal {
  url: string
  alMensaje: (mensaje: MensajeTiempoReal) => void
  /** Se llama al perder la conexión: devuelve false si la sesión ya no es válida (no se reintenta). */
  verificarSesion: () => Promise<boolean>
  alPerderSesion: () => void
  crearSocket?: (url: string) => WebSocket
  esperas?: readonly number[]
}

/**
 * Conexión al canal /ws. La sesión viaja en la cookie HttpOnly (el navegador la manda solo).
 * Si se cae, reintenta con espera creciente (2, 4, 8 y 10 s); antes de cada reintento revisa que la
 * sesión siga siendo válida.
 */
export function useTiempoReal(opciones: OpcionesTiempoReal) {
  const estado = ref<EstadoConexion>('conectando')
  const ultimoMensajeUtc = ref<string | null>(null)
  const esperas = opciones.esperas ?? ESPERAS_MS
  let socket: WebSocket | null = null
  let temporizador: ReturnType<typeof setTimeout> | null = null
  let intentos = 0
  let detenido = true

  function abrir(): void {
    if (detenido) return
    const s = (opciones.crearSocket ?? ((u) => new WebSocket(u)))(opciones.url)
    socket = s

    s.onopen = () => {
      intentos = 0
      estado.value = 'en_vivo'
    }
    s.onmessage = (e: MessageEvent) => {
      let json: unknown
      try {
        json = JSON.parse(String(e.data))
      } catch {
        return // mensaje que no es JSON: se ignora
      }
      if (!esMensaje(json)) return
      ultimoMensajeUtc.value = json.fechaUtc
      opciones.alMensaje(json)
    }
    s.onclose = () => {
      if (socket !== s || detenido) return
      socket = null
      void reintentar()
    }
    s.onerror = () => {
      /* el cierre llega enseguida con onclose */
    }
  }

  async function reintentar(): Promise<void> {
    estado.value = 'reconectando'
    if (!(await opciones.verificarSesion())) {
      detenerInterno()
      opciones.alPerderSesion()
      return
    }
    if (detenido) return
    const espera = esperas[Math.min(intentos, esperas.length - 1)] ?? 10000
    intentos++
    temporizador = setTimeout(abrir, espera)
  }

  function detenerInterno(): void {
    detenido = true
    if (temporizador) clearTimeout(temporizador)
    temporizador = null
    const s = socket
    socket = null
    if (s) {
      s.onclose = null
      s.onmessage = null
      try {
        s.close(1000)
      } catch {
        /* ya cerrado */
      }
    }
    estado.value = 'cerrado'
  }

  function iniciar(): void {
    if (!detenido) return
    detenido = false
    intentos = 0
    estado.value = 'conectando'
    abrir()
  }

  onBeforeUnmount(detenerInterno)

  return { estado, ultimoMensajeUtc, iniciar, detener: detenerInterno }
}
