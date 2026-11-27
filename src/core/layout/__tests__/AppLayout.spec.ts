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
          { path: 'dashboard/resumen', component: vista, meta: { titulo: 'Resumen' } },
          { path: 'dashboard/interacciones', component: vista, meta: { titulo: 'Interacciones' } },
          { path: 'dashboard/usuarios', component: vista, meta: { titulo: 'Usuarios' } },
          { path: 'dashboard/tendencia', component: vista, meta: { titulo: 'Tendencia' } },
          { path: 'auditoria', component: vista, meta: { titulo: 'Auditoría' } },
        ],
      },
    ],
  })
  await router.push('/dashboard/resumen')
  const w = mount({ template: '<RouterView />' }, { global: { plugins: [router, PrimeVue] } })
  await flushPromises()
  return { w, router }
}

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('el administrador ve las páginas del dashboard y Auditoría', async () => {
    const { w } = await montar('administrador')
    const textos = w.findAll('.menu__opcion').map((o) => o.text())
    expect(textos).toEqual(['Resumen', 'Interacciones', 'Usuarios', 'Tendencia', 'Auditoría'])
  })

  it('el analista solo ve las páginas del dashboard', async () => {
    const { w } = await montar('analista')
    expect(w.findAll('.menu__opcion').map((o) => o.text())).toEqual([
      'Resumen',
      'Interacciones',
      'Usuarios',
      'Tendencia',
    ])
  })

  it('muestra usuario, rol y el título de la ruta', async () => {
    const { w } = await montar('analista')
    expect(w.text()).toContain('rigel')
    expect(w.text()).toContain('analista')
    expect(w.find('.app__titulo').text()).toBe('Resumen')
  })

  it('Cerrar sesión pide confirmación y, al confirmar, llama a la API, limpia la sesión y va a /login', async () => {
    const { w, router } = await montar('administrador')
    await w
      .findAll('button')
      .find((b) => b.text().includes('Cerrar sesión'))!
      .trigger('click')
    await flushPromises()
    // Todavía no se cerró: solo se abrió el aviso de confirmación.
    expect(sesionApi.logout).not.toHaveBeenCalled()
    const dialogo = document.body.querySelector('[role="dialog"]')
    expect(dialogo?.textContent).toContain('¿Seguro que quieres cerrar tu sesión?')
    const confirmar = [...dialogo!.querySelectorAll('button')].find(
      (b) => b.textContent?.includes('Cerrar sesión') && b.classList.contains('p-button-danger'),
    )!
    confirmar.click()
    await flushPromises()
    expect(sesionApi.logout).toHaveBeenCalledOnce()
    expect(useSesionStore().autenticado).toBe(false)
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('Cancelar en el aviso no cierra la sesión', async () => {
    const { w } = await montar('administrador')
    await w
      .findAll('button')
      .find((b) => b.text().includes('Cerrar sesión'))!
      .trigger('click')
    await flushPromises()
    const cancelar = [...document.body.querySelectorAll('[role="dialog"] button')].find((b) =>
      b.textContent?.includes('Cancelar'),
    ) as HTMLButtonElement
    cancelar.click()
    await flushPromises()
    expect(sesionApi.logout).not.toHaveBeenCalled()
    expect(useSesionStore().autenticado).toBe(true)
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
      'Resumen',
      'Interacciones',
      'Usuarios',
      'Tendencia',
      'Auditoría',
    ])
    expect(w.findAll('.menu__opcion').map((o) => o.text())).toEqual([
      'Resumen',
      'Interacciones',
      'Usuarios',
      'Tendencia',
      'Auditoría',
    ])

    await boton().trigger('click')
    expect(w.find('.app').classes()).not.toContain('app--plegado')
    expect(localStorage.getItem('c360.menuPlegado')).toBe('0')
  })

  it('arranca plegado si así se dejó la última vez', async () => {
    localStorage.setItem('c360.menuPlegado', '1')
    const { w } = await montar('analista')
    expect(w.find('.app').classes()).toContain('app--plegado')
  })

  it('el menú agrupa las opciones: «Dashboard» arriba y «Administración» para el administrador', async () => {
    const { w } = await montar('administrador')
    expect(w.findAll('.menu__grupo-texto').map((g) => g.text())).toEqual([
      'Dashboard',
      'Administración',
    ])
    const { w: w2 } = await montar('analista')
    expect(w2.findAll('.menu__grupo-texto').map((g) => g.text())).toEqual(['Dashboard'])
  })

  it('la opción de la página actual queda marcada', async () => {
    const { w, router } = await montar('administrador')
    expect(w.find('.menu__opcion--activa').text()).toBe('Resumen')
    await router.push('/dashboard/usuarios')
    await flushPromises()
    expect(w.find('.menu__opcion--activa').text()).toBe('Usuarios')
    expect(w.find('.app__titulo').text()).toBe('Usuarios')
  })
})
