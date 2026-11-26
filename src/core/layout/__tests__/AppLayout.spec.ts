import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppLayout from '../AppLayout.vue'
import { useSesionStore } from '@/core/auth/sesion.store'
import { sesionApi } from '@/core/auth/sesion.api'

vi.mock('@/core/auth/sesion.api', () => ({
  sesionApi: { me: vi.fn(), logout: vi.fn().mockResolvedValue({}) },
}))

const vista = { template: '<p>vista</p>' }

async function montar(rol: string) {
  setActivePinia(createPinia())
  useSesionStore().establecer({ id: 1, nombreUsuario: 'rigel', rol })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', component: vista },
      {
        path: '/',
        component: AppLayout,
        children: [
          { path: 'dashboard', component: vista, meta: { titulo: 'Dashboard' } },
          { path: 'auditoria', component: vista, meta: { titulo: 'Auditoría' } },
        ],
      },
    ],
  })
  await router.push('/dashboard')
  const w = mount({ template: '<RouterView />' }, { global: { plugins: [router, PrimeVue] } })
  await flushPromises()
  return { w, router }
}

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('el administrador ve Dashboard y Auditoría', async () => {
    const { w } = await montar('administrador')
    const textos = w.findAll('.menu__opcion').map((o) => o.text())
    expect(textos).toEqual(['Dashboard', 'Auditoría'])
  })

  it('el analista solo ve Dashboard', async () => {
    const { w } = await montar('analista')
    expect(w.findAll('.menu__opcion').map((o) => o.text())).toEqual(['Dashboard'])
  })

  it('muestra usuario, rol y el título de la ruta', async () => {
    const { w } = await montar('analista')
    expect(w.text()).toContain('rigel')
    expect(w.text()).toContain('analista')
    expect(w.find('.app__titulo').text()).toBe('Dashboard')
  })

  it('Cerrar sesión llama a la API, limpia la sesión y va a /login', async () => {
    const { w, router } = await montar('administrador')
    await w
      .findAll('button')
      .find((b) => b.text().includes('Cerrar sesión'))!
      .trigger('click')
    await flushPromises()
    expect(sesionApi.logout).toHaveBeenCalledOnce()
    expect(useSesionStore().autenticado).toBe(false)
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('el menú se puede plegar a solo iconos, se recuerda y se puede volver a desplegar', async () => {
    const { w } = await montar('administrador')
    expect(w.find('.app').classes()).not.toContain('app--plegado')
    expect(w.find('.menu').classes()).not.toContain('menu--compacto')

    const boton = () => w.find('button.app__plegar')
    expect(boton().attributes('aria-label')).toBe('Plegar menú')
    expect(boton().attributes('aria-expanded')).toBe('true')

    await boton().trigger('click')
    expect(w.find('.app').classes()).toContain('app--plegado')
    expect(w.find('.menu').classes()).toContain('menu--compacto')
    expect(boton().attributes('aria-label')).toBe('Desplegar menú')
    expect(boton().attributes('aria-expanded')).toBe('false')
    expect(localStorage.getItem('c360.menuPlegado')).toBe('1')
    // plegado: cada opción sigue teniendo su nombre (para lectores de pantalla y para el tooltip)
    expect(w.findAll('.menu__opcion').map((o) => o.attributes('title'))).toEqual([
      'Dashboard',
      'Auditoría',
    ])
    expect(w.findAll('.menu__opcion').map((o) => o.text())).toEqual(['Dashboard', 'Auditoría'])

    await boton().trigger('click')
    expect(w.find('.app').classes()).not.toContain('app--plegado')
    expect(localStorage.getItem('c360.menuPlegado')).toBe('0')
  })

  it('arranca plegado si así se dejó la última vez', async () => {
    localStorage.setItem('c360.menuPlegado', '1')
    const { w } = await montar('analista')
    expect(w.find('.app').classes()).toContain('app--plegado')
  })
})
