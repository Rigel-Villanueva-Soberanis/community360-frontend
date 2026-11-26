import type { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'
import type { Permiso } from '@/core/auth/permisos'
import { puede } from '@/core/auth/permisos'
import { useSesionStore } from '@/core/auth/sesion.store'

declare module 'vue-router' {
  interface RouteMeta {
    /** Ruta abierta (login). El resto exige sesión. */
    publica?: boolean
    /** Permiso necesario además de tener sesión. */
    permiso?: Permiso
    /** Título que se muestra en el encabezado y en la pestaña. */
    titulo?: string
  }
}

export const RUTA_INICIO = '/dashboard'

/**
 * Solo se aceptan rutas internas como destino tras el login (evita que un enlace ?redirect=https://sitio-malo
 * mande al usuario fuera de la aplicación).
 */
export function rutaSegura(destino: unknown): string {
  if (typeof destino !== 'string') return RUTA_INICIO
  if (!destino.startsWith('/') || destino.startsWith('//') || destino.includes('\\'))
    return RUTA_INICIO
  return destino
}

export async function revisarAcceso(to: RouteLocationNormalized): Promise<true | RouteLocationRaw> {
  const sesion = useSesionStore()
  if (!sesion.cargada) await sesion.cargar()

  if (to.meta.publica) {
    // Quien ya tiene sesión no necesita el login.
    return to.path === '/login' && sesion.autenticado ? RUTA_INICIO : true
  }
  if (!sesion.autenticado) {
    return { path: '/login', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } }
  }
  if (to.meta.permiso && !puede(sesion.rol, to.meta.permiso)) return '/sin-permiso'
  return true
}

export function instalarGuard(router: Router): void {
  router.beforeEach(revisarAcceso)
  router.afterEach((to) => {
    document.title = to.meta.titulo ? `${to.meta.titulo} · COMMUNITY 360` : 'COMMUNITY 360'
  })
}
