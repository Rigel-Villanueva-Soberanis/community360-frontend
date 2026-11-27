import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MapaCalor from '../components/MapaCalor.vue'
import TarjetaGrafica from '../components/TarjetaGrafica.vue'
import GraficaDona from '../components/GraficaDona.vue'
import PrimeVue from 'primevue/config'
import { colorDe, CATEGORICA, COLOR_OTROS, etiquetaLegible, reiniciarPaleta } from '../utils/paleta'

const stubs = { Chart: true }

describe('MapaCalor', () => {
  it('pinta 7 filas × 24 columnas y el total accesible coincide con los datos', () => {
    const w = mount(MapaCalor, {
      props: {
        celdas: [
          { dia: 2, hora: 9, total: 3 },
          { dia: 1, hora: 23, total: 1 },
        ],
      },
    })
    expect(w.findAll('tbody tr')).toHaveLength(7)
    expect(w.findAll('td.calor__celda')).toHaveLength(7 * 24)
    expect(w.find('table').attributes('aria-label')).toContain('Total: 4')
    const lunes9 = w.findAll('tbody tr')[0]!.findAll('td')[9]!
    expect(lunes9.attributes('title')).toContain('lunes 09:00: 3')
  })
  it('la celda más alta usa el tono más oscuro y las vacías un gris neutro', () => {
    const w = mount(MapaCalor, {
      props: {
        celdas: [
          { dia: 2, hora: 0, total: 6 },
          { dia: 2, hora: 1, total: 1 },
        ],
      },
    })
    const celdas = w.findAll('tbody tr')[0]!.findAll('td')
    expect(celdas[0]!.attributes('style')).toContain('rgb(18, 60, 115)')
    expect(celdas[2]!.attributes('style')).toContain('rgb(241, 243, 246)')
    expect(celdas[1]!.attributes('style')).not.toBe(celdas[0]!.attributes('style'))
  })
  it('sin datos no falla (todo 0)', () => {
    const w = mount(MapaCalor, { props: { celdas: [] } })
    expect(w.text()).toContain('Menos')
  })
})

describe('TarjetaGrafica', () => {
  const montar = (props: Record<string, unknown>) =>
    mount(TarjetaGrafica, {
      props: { titulo: 'T', ...props },
      slots: { default: '<p id="cuerpo">dato</p>' },
      global: { plugins: [PrimeVue] },
    })
  it('muestra el contenido, el vacío o el error según el estado', async () => {
    expect(montar({}).find('#cuerpo').exists()).toBe(true)
    expect(montar({ vacio: true, mensajeVacio: 'Nada aún' }).text()).toContain('Nada aún')
    const e = montar({ error: 'Falló' })
    expect(e.find('[role=alert]').text()).toContain('Falló')
    await e
      .findAll('button')
      .find((b) => b.text().includes('Reintentar'))!
      .trigger('click')
    expect(e.emitted('reintentar')).toHaveLength(1)
  })
  it('la definición matemática se muestra al pulsar ℹ', async () => {
    const w = montar({ definicion: 'N = COUNT(x)' })
    expect(w.text()).not.toContain('N = COUNT(x)')
    await w.find('button[aria-label^="Ver definición"]').trigger('click')
    expect(w.text()).toContain('N = COUNT(x)')
  })
})

describe('GraficaDona', () => {
  it('leyenda con porcentaje y cantidad, y tabla alternativa', () => {
    const w = mount(GraficaDona, {
      props: {
        items: [
          { etiqueta: 'en_riesgo', valor: 33.3, total: 10 },
          { etiqueta: 'activo', valor: 66.7, total: 20 },
        ],
        descripcion: 'x',
      },
      global: { plugins: [PrimeVue], stubs },
    })
    expect(w.text()).toContain('En riesgo')
    expect(w.text()).toContain('33.3 %')
    expect(w.findAll('details tbody tr')).toHaveLength(2)
  })
  it('un texto con HTML se muestra como texto, no se interpreta', () => {
    const w = mount(GraficaDona, {
      props: {
        items: [{ etiqueta: '<img src=x onerror=alert(1)>', valor: 100, total: 1 }],
        descripcion: 'x',
      },
      global: { plugins: [PrimeVue], stubs },
    })
    expect(w.find('img').exists()).toBe(false)
    expect(w.text()).toContain('<img src=x onerror=alert(1)>')
  })
})

describe('paleta', () => {
  it('el color sigue a la entidad, no a la posición', () => {
    reiniciarPaleta()
    expect(colorDe('Instagram')).toBe(CATEGORICA[3])
    expect(colorDe('instagram ')).toBe(CATEGORICA[3])
    expect(colorDe('Telegram')).toBe(CATEGORICA[0])
  })
  it('del noveno en adelante es gris, nunca un tono inventado', () => {
    reiniciarPaleta()
    const colores = ['a', 'b', 'c', 'd', 'e', 'f'].map(colorDe)
    expect(colores[colores.length - 1]).toBe(COLOR_OTROS)
    expect(colorDe('Otros')).toBe(COLOR_OTROS)
  })
  it('etiquetas legibles', () => {
    expect(etiquetaLegible('en_riesgo')).toBe('En riesgo')
    expect(etiquetaLegible('')).toBe('')
  })
})
