import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createMemoryHistory, createRouter } from 'vue-router'
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import LoginView from '../views/LoginView.vue'
import { authApi } from '../api/auth.api'
import { sesionApi } from '@/core/auth/sesion.api'
import { useSesionStore } from '@/core/auth/sesion.store'

vi.mock('../api/auth.api', () => ({ authApi: { login: vi.fn() } }))
vi.mock('@/core/auth/sesion.api', () => ({ sesionApi: { me: vi.fn(), logout: vi.fn() } }))

const vista = { template: '<p/>' }

function errorHttp(estado: number, cuerpo: unknown = { exito: false, errores: null }) {
  const config = {} as InternalAxiosRequestConfig
  return new AxiosError('x', String(estado), config, null, {
    status: estado,
    data: cuerpo,
    config,
  } as AxiosResponse)
}

async function montar(destino = '/login') {
  setActivePinia(createPinia())
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', component: LoginView },
      { path: '/dashboard', component: vista },
      { path: '/auditoria', component: vista },
    ],
  })
  await router.push(destino)
  const w = mount({ template: '<RouterView />' }, { global: { plugins: [router, PrimeVue] } })
  await flushPromises()
  return { w, router }
}

async function escribir(
  w: Awaited<ReturnType<typeof montar>>['w'],
  usuario: string,
  clave: string,
) {
  await w.find('#usuario').setValue(usuario)
  await w.find('#contrasena').setValue(clave)
  await w.find('form').trigger('submit')
  await flushPromises()
}

describe('LoginView', () => {
  beforeEach(() => vi.clearAllMocks())

  it('campos vacíos: muestra errores y no llama a la API', async () => {
    const { w } = await montar()
    await escribir(w, '', '')
    expect(w.text()).toContain('Escribe tu usuario.')
    expect(w.text()).toContain('Escribe tu contraseña.')
    expect(authApi.login).not.toHaveBeenCalled()
  })

  it('login correcto: manda nombreUsuario/contrasena, recupera la sesión y va al dashboard', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      nombreUsuario: 'admin',
      rol: 'administrador',
      expiraUtc: '',
    })
    vi.mocked(sesionApi.me).mockResolvedValue({
      id: 1,
      nombreUsuario: 'admin',
      rol: 'administrador',
    })
    const { w, router } = await montar()
    await escribir(w, ' admin ', ' clave con espacios ')
    expect(authApi.login).toHaveBeenCalledWith({
      nombreUsuario: 'admin',
      contrasena: ' clave con espacios ',
    })
    expect(useSesionStore().usuario?.rol).toBe('administrador')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('respeta ?redirect= interno', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      nombreUsuario: 'admin',
      rol: 'administrador',
      expiraUtc: '',
    })
    vi.mocked(sesionApi.me).mockResolvedValue({
      id: 1,
      nombreUsuario: 'admin',
      rol: 'administrador',
    })
    const { w, router } = await montar('/login?redirect=/auditoria')
    await escribir(w, 'admin', 'x')
    expect(router.currentRoute.value.path).toBe('/auditoria')
  })

  it('ignora un ?redirect= hacia otro sitio', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      nombreUsuario: 'admin',
      rol: 'administrador',
      expiraUtc: '',
    })
    vi.mocked(sesionApi.me).mockResolvedValue({
      id: 1,
      nombreUsuario: 'admin',
      rol: 'administrador',
    })
    const { w, router } = await montar('/login?redirect=https://sitio-malo.com')
    await escribir(w, 'admin', 'x')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('401: mensaje genérico, borra la contraseña y no hay sesión', async () => {
    vi.mocked(authApi.login).mockRejectedValue(errorHttp(401))
    const { w, router } = await montar()
    await escribir(w, 'admin', 'mala')
    expect(w.text()).toContain('Usuario o contraseña incorrectos.')
    expect((w.find('#contrasena').element as HTMLInputElement).value).toBe('')
    expect((w.find('#usuario').element as HTMLInputElement).value).toBe('admin')
    expect(useSesionStore().autenticado).toBe(false)
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('429: avisa que espere', async () => {
    vi.mocked(authApi.login).mockRejectedValue(errorHttp(429))
    const { w } = await montar()
    await escribir(w, 'admin', 'x')
    expect(w.text()).toContain('Demasiados intentos')
  })

  it('422: muestra el error del campo que manda la API', async () => {
    vi.mocked(authApi.login).mockRejectedValue(
      errorHttp(422, {
        exito: false,
        errores: [{ campo: 'nombreUsuario', mensaje: 'Máximo 50 caracteres.' }],
      }),
    )
    const { w } = await montar()
    await escribir(w, 'admin', 'x')
    expect(w.text()).toContain('Máximo 50 caracteres.')
  })

  it('API apagada: mensaje de conexión', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'))
    const { w } = await montar()
    await escribir(w, 'admin', 'x')
    expect(w.text()).toContain(
      'No se pudo iniciar sesión. Revisa tu conexión e inténtalo de nuevo.',
    )
  })

  it('si el navegador no guardó la cookie (/me da 401) no entra', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      nombreUsuario: 'admin',
      rol: 'administrador',
      expiraUtc: '',
    })
    vi.mocked(sesionApi.me).mockRejectedValue(errorHttp(401))
    const { w, router } = await montar()
    await escribir(w, 'admin', 'x')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(useSesionStore().autenticado).toBe(false)
  })

  it('el campo de contraseña está oculto y con autocomplete correcto', async () => {
    const { w } = await montar()
    const c = w.find('#contrasena')
    expect(c.attributes('type')).toBe('password')
    expect(c.attributes('autocomplete')).toBe('current-password')
    expect(w.find('#usuario').attributes('autocomplete')).toBe('username')
  })
})
