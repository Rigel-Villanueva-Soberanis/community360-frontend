import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { normalizarRol, type Rol } from './permisos'
import { sesionApi } from './sesion.api'

export interface UsuarioSesion {
  id: number
  nombreUsuario: string
  rol: Rol
}

/**
 * Estado de la sesión. Guarda SOLO quién eres (nombre y rol), nunca el token: el token vive en una cookie
 * HttpOnly. Al recargar la página, `cargar()` pregunta a /api/auth/me quién eres.
 */
export const useSesionStore = defineStore('sesion', () => {
  const usuario = ref<UsuarioSesion | null>(null)
  const cargada = ref(false)

  const autenticado = computed(() => usuario.value !== null)
  const rol = computed(() => usuario.value?.rol ?? null)

  function establecer(datos: { id: number; nombreUsuario: string; rol: string }): void {
    const r = normalizarRol(datos.rol)
    usuario.value = r ? { id: datos.id, nombreUsuario: datos.nombreUsuario, rol: r } : null
    cargada.value = true
  }

  function limpiar(): void {
    usuario.value = null
    cargada.value = true
    try {
      sessionStorage.removeItem('c360.ultimosEventos') // los eventos en vivo no sobreviven al cierre de sesión
    } catch {
      /* sin almacenamiento disponible */
    }
  }

  /** Recupera la sesión desde la cookie (una vez por carga de página). 401 o red caída = sin sesión. */
  async function cargar(): Promise<void> {
    try {
      establecer(await sesionApi.me())
    } catch {
      limpiar()
    }
  }

  /** Cierra la sesión en la API (revoca el token) y limpia el estado aunque la API no responda. */
  async function cerrar(): Promise<void> {
    try {
      await sesionApi.logout()
    } catch {
      /* si la API no responde igual se limpia la sesión local */
    }
    limpiar()
  }

  return { usuario, cargada, autenticado, rol, establecer, limpiar, cargar, cerrar }
})
