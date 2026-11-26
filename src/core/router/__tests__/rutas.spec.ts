import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { instalarGuard } from '../guard'
import { rutas } from '../index'
import { sesionApi } from '@/core/auth/sesion.api'

vi.mock('@/core/auth/sesion.api', () => ({ sesionApi: { me: vi.fn(), logout: vi.fn() } }))

function nuevo() {
  const r = createRouter({ history: createMemoryHistory(), routes: rutas })
  instalarGuard(r)
  return r
}

/** Prueba la tabla de rutas REAL de la aplicación (no una de mentira). */
describe('rutas protegidas de la aplicación', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it.each(['/', '/dashboard', '/auditoria', '/sin-permiso', '/cualquier-cosa'])(
    'sin sesión, %s lleva a /login',
    async (ruta) => {
      vi.mocked(sesionApi.me).mockRejectedValue(new Error('401'))
      const r = nuevo()
      await r.push(ruta)
      expect(r.currentRoute.value.path).toBe('/login')
    },
  )

  it('/ redirige al dashboard cuando hay sesión', async () => {
    vi.mocked(sesionApi.me).mockResolvedValue({ id: 2, nombreUsuario: 'ana', rol: 'analista' })
    const r = nuevo()
    await r.push('/')
    expect(r.currentRoute.value.path).toBe('/dashboard')
  })

  it('analista: /auditoria → /sin-permiso', async () => {
    vi.mocked(sesionApi.me).mockResolvedValue({ id: 2, nombreUsuario: 'ana', rol: 'analista' })
    const r = nuevo()
    await r.push('/auditoria')
    expect(r.currentRoute.value.path).toBe('/sin-permiso')
  })

  it('administrador: /auditoria permitido', async () => {
    vi.mocked(sesionApi.me).mockResolvedValue({
      id: 1,
      nombreUsuario: 'admin',
      rol: 'administrador',
    })
    const r = nuevo()
    await r.push('/auditoria')
    expect(r.currentRoute.value.path).toBe('/auditoria')
  })

  it('una dirección inexistente con sesión cae en "no encontrado" dentro del layout', async () => {
    vi.mocked(sesionApi.me).mockResolvedValue({
      id: 1,
      nombreUsuario: 'admin',
      rol: 'administrador',
    })
    const r = nuevo()
    await r.push('/no-existe')
    expect(r.currentRoute.value.meta.titulo).toBe('No encontrado')
  })
})
