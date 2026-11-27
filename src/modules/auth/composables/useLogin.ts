import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '../api/auth.api'
import { sesionApi } from '@/core/auth/sesion.api'
import { useSesionStore } from '@/core/auth/sesion.store'
import { erroresDe, estadoDe } from '@/core/http/errores'
import { rutaSegura } from '@/core/router/guard'

export const MAX_USUARIO = 50
export const MAX_CONTRASENA = 100

/** Lógica de la pantalla de login: valida, llama a la API, recupera la sesión y navega. */
export function useLogin() {
  const sesion = useSesionStore()
  const router = useRouter()
  const route = useRoute()

  const formulario = reactive({ nombreUsuario: '', contrasena: '' })
  const errores = ref<Record<string, string>>({})
  const mensaje = ref('')
  const cargando = ref(false)

  function validar(): boolean {
    const e: Record<string, string> = {}
    // La contraseña no se recorta: los espacios pueden ser parte de ella.
    if (!formulario.nombreUsuario.trim()) e.nombreUsuario = 'Escribe tu usuario.'
    else if (formulario.nombreUsuario.length > MAX_USUARIO)
      e.nombreUsuario = `Máximo ${MAX_USUARIO} caracteres.`
    if (!formulario.contrasena) e.contrasena = 'Escribe tu contraseña.'
    else if (formulario.contrasena.length > MAX_CONTRASENA)
      e.contrasena = `Máximo ${MAX_CONTRASENA} caracteres.`
    errores.value = e
    return Object.keys(e).length === 0
  }

  async function iniciarSesion(): Promise<void> {
    mensaje.value = ''
    if (cargando.value || !validar()) return
    cargando.value = true
    try {
      await authApi.login({
        nombreUsuario: formulario.nombreUsuario.trim(),
        contrasena: formulario.contrasena,
      })
      // La API ya puso la cookie. Se pregunta quién eres (y de paso se confirma que el navegador la guardó).
      sesion.establecer(await sesionApi.me())
      if (!sesion.autenticado) throw new Error('rol-desconocido')
      await router.replace(rutaSegura(route.query.redirect))
    } catch (error) {
      sesion.limpiar()
      formulario.contrasena = ''
      const estado = estadoDe(error)
      if (estado === 401) mensaje.value = 'Usuario o contraseña incorrectos.'
      else if (estado === 429)
        mensaje.value = 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.'
      else if (estado === 422 || estado === 400) {
        errores.value = erroresDe(error)
        mensaje.value = 'Revisa los datos ingresados.'
      } else if (estado === undefined)
        mensaje.value = 'No se pudo iniciar sesión. Revisa tu conexión e inténtalo de nuevo.'
      else mensaje.value = 'No se pudo iniciar sesión. Inténtalo más tarde.'
    } finally {
      cargando.value = false
    }
  }

  return { formulario, errores, mensaje, cargando, iniciarSesion }
}
