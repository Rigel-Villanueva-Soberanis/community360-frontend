import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import FiltroFechas from '../components/FiltroFechas.vue'
import { aFechaApi } from '@/core/utils/fechas'

const DIA = 86_400_000
const montar = (desde: string, hasta: string) =>
  mount(FiltroFechas, {
    props: { desde, hasta, error: '', cargando: false },
    global: { plugins: [PrimeVue] },
  })
const marcados = (w: ReturnType<typeof montar>) =>
  w
    .findAll('.filtro__presets button')
    .filter((b) => b.attributes('aria-pressed') === 'true')
    .map((b) => b.text())

describe('FiltroFechas · rango rápido activo', () => {
  const hoy = new Date()
  const hasta = aFechaApi(hoy)

  it('marca «Últimos 30 días» cuando el rango termina hoy y dura 30 días', () => {
    const w = montar(aFechaApi(new Date(hoy.getTime() - 30 * DIA)), hasta)
    expect(marcados(w)).toEqual(['Últimos 30 días'])
  })

  it('marca «Últimos 1 año» (366 días)', () => {
    const w = montar(aFechaApi(new Date(hoy.getTime() - 366 * DIA)), hasta)
    expect(marcados(w)).toEqual(['Últimos 1 año'])
  })

  it('no marca ninguno si las fechas se editaron a mano', () => {
    const w = montar(aFechaApi(new Date(hoy.getTime() - 45 * DIA)), hasta)
    expect(marcados(w)).toEqual([])
    const w2 = montar(aFechaApi(new Date(hoy.getTime() - 90 * DIA)), '2026-01-01')
    expect(marcados(w2)).toEqual([])
  })

  it('el botón activo se ve relleno y los demás con borde', () => {
    const w = montar(aFechaApi(new Date(hoy.getTime() - 90 * DIA)), hasta)
    const [b30, b90] = w.findAll('.filtro__presets button')
    expect(b90!.classes()).toContain('filtro__preset--activo')
    expect(b90!.classes()).not.toContain('p-button-outlined')
    expect(b30!.classes()).toContain('p-button-outlined')
  })
})
