import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import AuditoriaView from '../views/AuditoriaView.vue'
import { auditoriaApi } from '../api/auditoria.api'
import {
  columnasClave,
  columnasDe,
  etiquetaCampo,
  formatearValor,
  textoCelda,
} from '../composables/useAuditoria'

vi.mock('../api/auditoria.api', () => ({
  auditoriaApi: {
    resumen: vi.fn(),
    cuarentena: vi.fn(),
    diarioCambios: vi.fn(),
    bitacoraCarga: vi.fn(),
    bitacoraApi: vi.fn(),
  },
}))

const pagina = (items: Record<string, unknown>[], totalPaginas = 1, total = items.length) => ({
  items,
  pagina: 1,
  tamano: 20,
  total,
  totalPaginas,
})

function montar() {
  // attachTo: el modal (Dialog) se pinta en <body>, fuera del componente.
  return mount(AuditoriaView, { global: { plugins: [PrimeVue] }, attachTo: document.body })
}

const modal = () => document.body.querySelector('[role=dialog]')

describe('utilidades', () => {
  it('une las columnas de todos los documentos con las preferidas primero', () => {
    expect(
      columnasDe([
        { zeta: 1, motivo: 'x' },
        { id_interaccion: 'I1', alfa: 2 },
      ]),
    ).toEqual(['id_interaccion', 'motivo', 'zeta', 'alfa'])
    expect(columnasDe([])).toEqual([])
  })
  it('columnasClave muestra pocas columnas, solo valores cortos y las preferidas primero', () => {
    const docs = [
      {
        zeta: 1,
        motivo: 'm',
        id_interaccion: 'I1',
        detalle: { a: 1 },
        lista: ['x'],
        estado_revision: 'p',
        fecha: 'f',
        extra: 'e',
      },
    ]
    const clave = columnasClave(docs)
    expect(clave).toEqual(['id_interaccion', 'motivo', 'estado_revision', 'fecha'])
    expect(clave).not.toContain('detalle')
    expect(clave).not.toContain('lista')
    expect(columnasClave([])).toEqual([])
  })
  it('etiquetaCampo da nombres legibles y escribe con espacios los desconocidos', () => {
    expect(etiquetaCampo('estado_revision')).toBe('Estado de revisión')
    expect(etiquetaCampo('id_interaccion')).toBe('Interacción')
    expect(etiquetaCampo('campo_nuevo_raro')).toBe('Campo nuevo raro')
    expect(etiquetaCampo('otroCampo')).toBe('Otro campo')
  })
  it('formatearValor: Sí/No, fechas con formato y guion si no hay valor', () => {
    expect(formatearValor(true)).toBe('Sí')
    expect(formatearValor(false)).toBe('No')
    expect(formatearValor(null)).toBe('—')
    const fecha = formatearValor('2026-11-01T10:00:00Z')
    expect(fecha).toContain('2026')
    expect(fecha).not.toContain('T10')
    expect(formatearValor('2026-99-99T10:00:00Z')).toBe('2026-99-99T10:00:00Z') // fecha inválida: se deja tal cual
    expect(formatearValor('hola')).toBe('hola')
  })
  it('textoCelda siempre devuelve texto', () => {
    expect(textoCelda(null)).toBe('—')
    expect(textoCelda('')).toBe('—')
    expect(textoCelda(3)).toBe('3')
    expect(textoCelda(false)).toBe('false')
    expect(textoCelda(['id_ciudad', 'latitud'])).toBe('["id_ciudad","latitud"]')
  })
})

describe('AuditoriaView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auditoriaApi.resumen).mockResolvedValue({
      cuarentena: 793,
      diario_cambios: 171,
      bitacora_carga: 1,
      bitacora_api: 0,
    })
    vi.mocked(auditoriaApi.cuarentena).mockResolvedValue(
      pagina(
        [
          {
            id_interaccion: 'I0000001',
            motivo: 'id_usuario sin usuario en el dataset',
            estado_revision: 'pendiente',
          },
        ],
        3,
        55,
      ),
    )
    vi.mocked(auditoriaApi.diarioCambios).mockResolvedValue(
      pagina([{ tabla: 'usuario', id: 'U1', campos_eliminados: ['id_ciudad'] }]),
    )
    vi.mocked(auditoriaApi.bitacoraCarga).mockResolvedValue([{ carga_id: 'c1', inicio: 'a' }])
    vi.mocked(auditoriaApi.bitacoraApi).mockResolvedValue(
      pagina([{ operacion: 'alta', id_interaccion: 'I9' }]),
    )
  })

  it('muestra el resumen de las 4 colecciones y la cuarentena', async () => {
    const w = montar()
    await flushPromises()
    const t = w.text()
    expect(t).toContain('793')
    expect(t).toContain('171')
    expect(t).toContain('I0000001')
    expect(t).toContain('Página 1 de 3')
  })

  it('cambiar de pestaña consulta otra colección', async () => {
    const w = montar()
    await flushPromises()
    await w.find('#tab-diario').trigger('click')
    await flushPromises()
    expect(auditoriaApi.diarioCambios).toHaveBeenCalled()
    expect(w.text()).toContain('Tabla') // columna clave; la lista de campos eliminados queda para el modal
    await w.find('#tab-carga').trigger('click')
    await flushPromises()
    expect(auditoriaApi.bitacoraCarga).toHaveBeenCalled()
  })

  it('el filtro de estado manda solo valores de la lista y vuelve a la página 1', async () => {
    const w = montar()
    await flushPromises()
    await w.find('select#f-estado').setValue('descartada')
    await flushPromises()
    expect(
      vi.mocked(auditoriaApi.cuarentena).mock.calls[
        vi.mocked(auditoriaApi.cuarentena).mock.calls.length - 1
      ]![0],
    ).toMatchObject({ estadoRevision: 'descartada', pagina: 1 })
    const opciones = w.findAll('select#f-estado option').map((o) => o.text())
    expect(opciones).toEqual(['Todos', 'pendiente', 'descartada', 'recuperada'])
  })

  it('paginación: siguiente pide la página 2 y anterior está desactivada en la 1', async () => {
    const w = montar()
    await flushPromises()
    const botones = w.findAll('nav[aria-label=Paginación] button')
    expect(botones[0]!.attributes('disabled')).toBeDefined()
    await botones[1]!.trigger('click')
    await flushPromises()
    expect(
      vi.mocked(auditoriaApi.cuarentena).mock.calls[
        vi.mocked(auditoriaApi.cuarentena).mock.calls.length - 1
      ]![0],
    ).toMatchObject({ pagina: 2 })
  })

  it('un texto con HTML o inyección se ve como texto y no se ejecuta', async () => {
    vi.mocked(auditoriaApi.cuarentena).mockResolvedValue(
      pagina([{ id_interaccion: 'I1', texto: "<img src=x onerror=alert(1)>'; DROP TABLE x;--" }]),
    )
    const w = montar()
    await flushPromises()
    expect(w.find('img').exists()).toBe(false)
    expect(w.text()).toContain('<img src=x onerror=alert(1)>')
    await w.find('button[aria-label^="Ver más del documento"]').trigger('click')
    await flushPromises()
    expect(modal()?.textContent).toContain('<img src=x onerror=alert(1)>')
    expect(document.body.querySelector('[role=dialog] img')).toBeNull()
    w.unmount()
  })

  it('identificadores y estados se ven como etiquetas de color', async () => {
    vi.mocked(auditoriaApi.cuarentena).mockResolvedValue(
      pagina([
        { id_interaccion: 'I1', id_usuario: 'U1', motivo: 'x', estado_revision: 'pendiente' },
        { id_interaccion: 'I2', id_usuario: 'U2', motivo: 'y', estado_revision: 'recuperada' },
      ]),
    )
    const w = montar()
    await flushPromises()
    expect(w.findAll('.chip--id').map((c) => c.text())).toEqual(['I1', 'I2'])
    expect(w.findAll('.chip--usuario').map((c) => c.text())).toEqual(['U1', 'U2'])
    const estados = w.findAll('.chip--estado')
    expect(estados.map((c) => c.text())).toEqual(['pendiente', 'recuperada'])
    expect(estados[0]!.classes()).toContain('tono--ambar')
    expect(estados[1]!.classes()).toContain('tono--verde')
    w.unmount()
  })

  it('la pestaña activa muestra cuántos documentos tiene', async () => {
    const w = montar()
    await flushPromises()
    expect(w.find('#tab-cuarentena .auditoria__cuenta').text()).toBe('793')
    expect(w.find('#tab-diario .auditoria__cuenta').exists()).toBe(false)
    w.unmount()
  })

  it('el diario muestra los campos eliminados con nombres legibles', async () => {
    const w = montar()
    await flushPromises()
    await w.find('#tab-diario').trigger('click')
    await flushPromises()
    await w.find('button[aria-label^="Ver más del documento U1"]').trigger('click')
    await flushPromises()
    const chips = [...document.body.querySelectorAll('[role=dialog] .chips li')].map(
      (l) => l.textContent,
    )
    expect(chips).toEqual(['Ciudad'])
    w.unmount()
  })

  it('la tabla muestra solo lo importante y el ojo abre un modal con todo el documento', async () => {
    vi.mocked(auditoriaApi.cuarentena).mockResolvedValue(
      pagina([
        {
          id_interaccion: 'I7',
          motivo: 'sin usuario',
          estado_revision: 'pendiente',
          aislado_en: '2026-11-01',
          carga_id: 'c9',
          hecho_por: 'etl',
          registro_original: { id_usuario: 'U9999', tema: 'arte', etiquetas: ['Arte', 'Aviso'] },
        },
      ]),
    )
    const w = montar()
    await flushPromises()
    const encabezados = w.findAll('th').map((t) => t.text())
    expect(encabezados).toContain('Motivo')
    expect(encabezados).toContain('Estado de revisión')
    expect(encabezados).not.toContain('Hecho por')
    expect(encabezados).not.toContain('Registro original')
    expect(encabezados.join()).not.toContain('_') // nombres legibles, no nombres de campo
    expect(modal()).toBeNull()

    await w.find('button[aria-label^="Ver más del documento I7"]').trigger('click')
    await flushPromises()
    const texto = modal()?.textContent ?? ''
    for (const campo of ['Hecho por', 'Carga', 'Registro original', 'U9999', 'Arte', 'Aviso'])
      expect(texto).toContain(campo)
    // se lee como datos, no como JSON
    expect(texto).not.toMatch(/[{}[\]]|"id_usuario"|_/)
    expect(document.body.querySelector('[role=dialog] pre')).toBeNull()
    expect(document.body.querySelectorAll('[role=dialog] .chips li').length).toBe(2)

    ;(document.body.querySelector('.p-dialog-close-button') as HTMLElement).click()
    await flushPromises()
    await new Promise((r) => setTimeout(r, 400))
    expect(modal()).toBeNull()
    w.unmount()
  })

  it('si la API falla muestra el error y permite reintentar', async () => {
    vi.mocked(auditoriaApi.cuarentena).mockRejectedValueOnce(new Error('x'))
    const w = montar()
    await flushPromises()
    expect(w.find('[role=alert]').exists()).toBe(true)
    const reintentar = w.findAll('button').find((b) => b.text().includes('Reintentar'))!
    await reintentar.trigger('click')
    await flushPromises()
    expect(w.text()).toContain('I0000001')
  })

  it('es de solo lectura: no hay formularios ni botones de crear, editar o borrar', async () => {
    const w = montar()
    await flushPromises()
    expect(w.find('form').exists()).toBe(false)
    expect(w.find('textarea').exists()).toBe(false)
    expect(w.text()).not.toMatch(/eliminar|borrar|editar|guardar|crear/i)
  })
})
