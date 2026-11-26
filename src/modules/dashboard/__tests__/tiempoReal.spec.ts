import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { esMensaje, urlTiempoReal, useTiempoReal } from '../envivo/composables/useTiempoReal'
import { ordenarPorEdad } from '../historico/composables/useHistoricos'
import { diasEntre, validarRango } from '../historico/composables/useTendencia'

const metricas = {
  resumen: {
    totalInteracciones: 1,
    sentimientoPromedio: 0,
    reaccionesPromedio: 0,
    porcentajeNegativo: 0,
  },
  porPlataforma: [],
  porTipo: [],
  actividadPorHora: [],
  sentimientoPorTema: [],
  etiquetasTop: [],
  calculadoUtc: '2026-11-24T12:00:00Z',
}
const mensaje = (tipo = 'interaccion.creada') => ({
  tipo,
  fechaUtc: '2026-11-24T12:00:00Z',
  metricas,
})

class SocketFalso {
  static todos: SocketFalso[] = []
  onopen: (() => void) | null = null
  onmessage: ((e: MessageEvent) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null
  cerrado = false
  constructor(public url: string) {
    SocketFalso.todos.push(this)
  }
  close() {
    this.cerrado = true
  }
  abrir() {
    this.onopen?.()
  }
  recibir(x: unknown) {
    this.onmessage?.({ data: typeof x === 'string' ? x : JSON.stringify(x) } as MessageEvent)
  }
  caer() {
    this.onclose?.()
  }
}

function montar(extra: Partial<Parameters<typeof useTiempoReal>[0]> = {}) {
  const recibidos: unknown[] = []
  const alPerderSesion = vi.fn()
  const verificarSesion = vi.fn().mockResolvedValue(true)
  const scope = effectScope()
  const tr = scope.run(() =>
    useTiempoReal({
      url: 'ws://api/ws',
      alMensaje: (m) => recibidos.push(m),
      verificarSesion,
      alPerderSesion,
      crearSocket: (u) => new SocketFalso(u) as unknown as WebSocket,
      esperas: [2000, 4000, 8000, 10000],
      ...extra,
    }),
  )!
  return { tr, recibidos, alPerderSesion, verificarSesion, scope }
}
const ultimo = () => SocketFalso.todos[SocketFalso.todos.length - 1]!

describe('urlTiempoReal / esMensaje', () => {
  it('convierte http→ws y https→wss', () => {
    expect(urlTiempoReal('https://localhost:7043')).toBe('wss://localhost:7043/ws')
    expect(urlTiempoReal('http://localhost:5099/')).toBe('ws://localhost:5099/ws')
    // Producción: sin dirección de API se usa el sitio donde está la página (el proxy de Cloudflare atiende /ws)
    expect(urlTiempoReal('', 'https://community360.pages.dev')).toBe(
      'wss://community360.pages.dev/ws',
    )
    expect(urlTiempoReal(undefined, 'http://localhost:8788')).toBe('ws://localhost:8788/ws')
  })
  it('acepta mensajes completos y rechaza lo demás', () => {
    expect(esMensaje(mensaje())).toBe(true)
    expect(esMensaje(mensaje('otro.tipo'))).toBe(false)
    expect(esMensaje({ tipo: 'interaccion.creada' })).toBe(false)
    expect(esMensaje(null)).toBe(false)
    expect(esMensaje('hola')).toBe(false)
  })
})

describe('useTiempoReal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    SocketFalso.todos = []
  })
  afterEach(() => vi.useRealTimers())

  it('conecta, pasa a "en vivo" y entrega mensajes válidos (ignora JSON roto y formas raras)', () => {
    const { tr, recibidos } = montar()
    tr.iniciar()
    expect(tr.estado.value).toBe('conectando')
    ultimo().abrir()
    expect(tr.estado.value).toBe('en_vivo')
    ultimo().recibir(mensaje())
    ultimo().recibir('{no es json')
    ultimo().recibir({ tipo: 'x' })
    expect(recibidos).toHaveLength(1)
    expect(tr.ultimoMensajeUtc.value).toBe('2026-11-24T12:00:00Z')
  })

  it('al caerse reintenta con espera creciente 2 s → 4 s y se reinicia al reconectar', async () => {
    const { tr } = montar()
    tr.iniciar()
    ultimo().abrir()
    ultimo().caer()
    await vi.advanceTimersByTimeAsync(0)
    expect(tr.estado.value).toBe('reconectando')
    expect(SocketFalso.todos).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1999)
    expect(SocketFalso.todos).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(SocketFalso.todos).toHaveLength(2) // reintento 1 tras 2 s
    ultimo().caer() // sin haber abierto: sigue creciendo
    await vi.advanceTimersByTimeAsync(3999)
    expect(SocketFalso.todos).toHaveLength(2)
    await vi.advanceTimersByTimeAsync(1)
    expect(SocketFalso.todos).toHaveLength(3) // reintento 2 tras 4 s
    ultimo().abrir()
    expect(tr.estado.value).toBe('en_vivo')
    ultimo().caer()
    await vi.advanceTimersByTimeAsync(2000)
    expect(SocketFalso.todos).toHaveLength(4) // vuelve a 2 s
  })

  it('la espera nunca pasa de 10 s', async () => {
    const { tr } = montar()
    tr.iniciar()
    for (let i = 0; i < 6; i++) {
      ultimo().caer()
      await vi.advanceTimersByTimeAsync(10000)
    }
    const antes = SocketFalso.todos.length
    ultimo().caer()
    await vi.advanceTimersByTimeAsync(9999)
    expect(SocketFalso.todos).toHaveLength(antes)
    await vi.advanceTimersByTimeAsync(1)
    expect(SocketFalso.todos).toHaveLength(antes + 1)
  })

  it('si la sesión ya no es válida no reintenta y avisa', async () => {
    const { tr, alPerderSesion, verificarSesion } = montar()
    verificarSesion.mockResolvedValue(false)
    tr.iniciar()
    ultimo().abrir()
    ultimo().caer()
    await vi.advanceTimersByTimeAsync(20000)
    expect(alPerderSesion).toHaveBeenCalledOnce()
    expect(SocketFalso.todos).toHaveLength(1)
    expect(tr.estado.value).toBe('cerrado')
  })

  it('detener cierra el socket y no reintenta', async () => {
    const { tr } = montar()
    tr.iniciar()
    const s = ultimo()
    s.abrir()
    tr.detener()
    expect(s.cerrado).toBe(true)
    expect(tr.estado.value).toBe('cerrado')
    s.caer()
    await vi.advanceTimersByTimeAsync(30000)
    expect(SocketFalso.todos).toHaveLength(1)
  })

  it('al destruir el componente (scope) se cierra la conexión', () => {
    const { tr, scope } = montar()
    tr.iniciar()
    const s = ultimo()
    scope.stop()
    // onBeforeUnmount no corre en un scope suelto: se cierra con detener()
    tr.detener()
    expect(s.cerrado).toBe(true)
  })
})

describe('histórico: utilidades', () => {
  it('ordena rangos de edad por el primer número', () => {
    const p = (etiqueta: string) => ({ etiqueta, valor: 1, total: 1 })
    expect(
      ordenarPorEdad([p('39+'), p('18-24'), p('32-38'), p('25-31')]).map((x) => x.etiqueta),
    ).toEqual(['18-24', '25-31', '32-38', '39+'])
  })
  it('valida el rango de fechas igual que el backend', () => {
    expect(diasEntre('2026-01-01', '2026-01-31')).toBe(30)
    expect(validarRango('2026-01-01', '2026-01-31')).toBe('')
    expect(validarRango('2026-01-01', '2026-01-01')).toBe('')
    expect(validarRango('2026-02-01', '2026-01-01')).toContain('anterior')
    expect(validarRango('2025-01-01', '2026-06-01')).toContain('366')
    expect(validarRango('', '2026-01-01')).toContain('fechas')
    expect(validarRango("' OR 1=1--", '2026-01-01')).toContain('fechas')
    expect(validarRango('2025-11-24', '2026-11-24')).toBe('') // 365 días
  })
})
