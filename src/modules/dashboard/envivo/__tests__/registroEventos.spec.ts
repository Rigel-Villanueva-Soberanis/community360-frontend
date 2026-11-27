import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import RegistroEventos from '../components/RegistroEventos.vue'
import type { EventoRegistrado } from '../../types/metricas.types'

function eventos(n: number): EventoRegistrado[] {
  return Array.from({ length: n }, (_, i) => ({
    id: n - i, // el primero es el más nuevo
    tipo: 'interaccion.creada' as const,
    fechaUtc: '2026-11-27T16:00:00Z',
    datos: {
      idInteraccion: `I00${String(n - i).padStart(5, '0')}`,
      plataforma: 'Discord',
      tipo: 'comentario',
      sentimiento: 0.5,
    } as EventoRegistrado['datos'],
  }))
}
const montar = (n: number) =>
  mount(RegistroEventos, { props: { eventos: eventos(n) }, global: { plugins: [PrimeVue] } })

describe('RegistroEventos', () => {
  it('sin eventos muestra «Sin eventos nuevos»', () => {
    expect(montar(0).text()).toContain('Sin eventos nuevos')
  })
  it('con 5 o menos no muestra el botón «Ver todos»', () => {
    const w = montar(5)
    expect(w.findAll('li')).toHaveLength(5)
    expect(w.text()).not.toContain('Ver todos')
  })
  it('con más de 5 muestra solo los 5 más nuevos y un botón «Ver todos (N)» que abre la lista completa', async () => {
    const w = montar(12)
    const tarjeta = w.findAll('li')
    expect(tarjeta).toHaveLength(5)
    expect(tarjeta[0]!.text()).toContain('I0000012') // el más nuevo va primero
    expect(tarjeta[4]!.text()).toContain('I0000008')
    const boton = w.findAll('button').find((b) => b.text().includes('Ver todos (12)'))!
    await boton.trigger('click')
    await flushPromises()
    const dialogo = document.body.querySelector('[role="dialog"]')!
    expect(dialogo.querySelectorAll('li')).toHaveLength(12)
  })
})
