import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { instalarGuard, rutaSegura } from '../guard'
import { useSesionStore } from '@/core/auth/sesion.store'
import { sesionApi } from '@/core/auth/sesion.api'

vi.mock('@/core/auth/sesion.api', () => ({ sesionApi: { me: vi.fn(), logout: vi.fn() } }))

const vista = { template: '<p/>' }

function nuevoRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', component: vista, meta: { publica: true } },
      { path: '/dashboard', component: vista, meta: { permiso: 'dashboard.ver' } },
      { path: '/auditoria', component: vista, meta: { permiso: 'auditoria.ver' } },
      { path: '/sin-permiso', component: vista },
    ],
  })
  instalarGuard(router)
  return router
}

describe('guard de rutas', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('sin sesión manda a /login y recuerda a dónde iba', async () => {
    vi.mocked(sesionApi.me).mockRejectedValue(new Error('401'))
    const r = nuevoRouter()
    await r.push('/auditoria')
    expect(r.currentRoute.value.path).toBe('/login')
    expect(r.currentRoute.value.query.redirect).toBe('/auditoria')
  })

  it('con sesión (cookie válida) entra al dashboard', async () => {
    vi.mocked(sesionApi.me).mockResolvedValue({ id: 1, nombreUsuario: 'ana', rol: 'analista' })
    const r = nuevoRouter()
    await r.push('/dashboard')
    expect(r.currentRoute.value.path).toBe('/dashboard')
    expect(useSesionStore().usuario?.rol).toBe('analista')
  })

  it('el analista no entra a /auditoria: va a /sin-permiso', async () => {
    vi.mocked(sesionApi.me).mockResolvedValue({ id: 2, nombreUsuario: 'ana', rol: 'analista' })
    const r = nuevoRouter()
    await r.push('/auditoria')
    expect(r.currentRoute.value.path).toBe('/sin-permiso')
  })

  it('el administrador sí entra a /auditoria', async () => {
    vi.mocked(sesionApi.me).mockResolvedValue({
      id: 1,
      nombreUsuario: 'admin',
      rol: 'Administrador',
    })
    const r = nuevoRouter()
    await r.push('/auditoria')
    expect(r.currentRoute.value.path).toBe('/auditoria')
  })

  it('un rol desconocido se queda sin sesión', async () => {
    vi.mocked(sesionApi.me).mockResolvedValue({ id: 9, nombreUsuario: 'x', rol: 'invitado' })
    const r = nuevoRouter()
    await r.push('/dashboard')
    expect(r.currentRoute.value.path).toBe('/login')
  })

  it('con sesión, /login lleva al dashboard', async () => {
    vi.mocked(sesionApi.me).mockResolvedValue({
      id: 1,
      nombreUsuario: 'admin',
      rol: 'administrador',
    })
    const r = nuevoRouter()
    await r.push('/login')
    expect(r.currentRoute.value.path).toBe('/dashboard')
  })

  it('pregunta a /me una sola vez por carga de página', async () => {
    vi.mocked(sesionApi.me).mockResolvedValue({
      id: 1,
      nombreUsuario: 'admin',
      rol: 'administrador',
    })
    const r = nuevoRouter()
    await r.push('/dashboard')
    await r.push('/auditoria')
    expect(sesionApi.me).toHaveBeenCalledOnce()
  })
})

describe('rutaSegura', () => {
  it.each([
    ['/auditoria', '/auditoria'],
    ['/dashboard?x=1', '/dashboard?x=1'],
    ['https://sitio-malo.com', '/dashboard'],
    ['//sitio-malo.com', '/dashboard'],
    ['/\\sitio-malo.com', '/dashboard'],
    [undefined, '/dashboard'],
    [['/a'], '/dashboard'],
  ])('%s → %s', (entrada, esperado) => {
    expect(rutaSegura(entrada)).toBe(esperado)
  })
})
