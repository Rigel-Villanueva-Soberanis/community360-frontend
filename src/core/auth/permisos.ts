export type Rol = 'administrador' | 'analista'

const TODOS: readonly Rol[] = ['administrador', 'analista']

/** Quién puede qué. El backend SIEMPRE valida (403): ocultar opciones es comodidad, no seguridad. */
export const PERMISOS = {
  'dashboard.ver': TODOS,
  'auditoria.ver': ['administrador'],
} as const satisfies Record<string, readonly Rol[]>

export type Permiso = keyof typeof PERMISOS

/** Convierte el rol que manda la API a uno conocido; si no lo conoce devuelve null (sin permisos). */
export function normalizarRol(rol: string | null | undefined): Rol | null {
  const r = (rol ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
  return (TODOS as readonly string[]).includes(r) ? (r as Rol) : null
}

export function puede(rol: Rol | null, permiso: Permiso): boolean {
  return !!rol && (PERMISOS[permiso] as readonly Rol[]).includes(rol)
}
