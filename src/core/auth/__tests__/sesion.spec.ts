import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { normalizarRol, puede } from '../permisos'
import { useSesionStore } from '../sesion.store'
import { sesionApi } from '../sesion.api'

vi.mock('../sesion.api', () => ({ sesionApi: { me: vi.fn(), logout: vi.fn() } }))

describe('permisos', () => {
  it('normaliza el rol (mayúsculas, espacios, acentos)', () => {
    expect(normalizarRol(' Administrador ')).toBe('administrador')
    expect(normalizarRol('ANALISTA')).toBe('analista')
    expect(normalizarRol('root')).toBeNull()
    expect(normalizarRol(null)).toBeNull()
  })

  it('matriz de permisos', () => {
    expect(puede('administrador', 'auditoria.ver')).toBe(true)
    expect(puede('analista', 'auditoria.ver')).toBe(false)
    expect(puede('analista', 'dashboard.ver')).toBe(true)
    expect(puede(null, 'dashboard.ver')).toBe(false)
  })
})

describe('store de sesión', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('cerrar limpia la sesión aunque la API falle', async () => {
    const s = useSesionStore()
    s.establecer({ id: 1, nombreUsuario: 'admin', rol: 'administrador' })
    expect(s.autenticado).toBe(true)
    vi.mocked(sesionApi.logout).mockRejectedValue(new Error('red'))
    await s.cerrar()
    expect(s.autenticado).toBe(false)
  })

  it('no guarda nada en localStorage ni sessionStorage', () => {
    const s = useSesionStore()
    s.establecer({ id: 1, nombreUsuario: 'admin', rol: 'administrador' })
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })
})
