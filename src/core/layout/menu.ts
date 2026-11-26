import type { Permiso } from '@/core/auth/permisos'

export interface OpcionMenu {
  texto: string
  icono: string
  ruta: string
  permiso: Permiso
}

/** Cada opción lleva su permiso; AppMenu muestra solo las que el rol puede ver. */
export const MENU: OpcionMenu[] = [
  { texto: 'Dashboard', icono: 'pi pi-chart-bar', ruta: '/dashboard', permiso: 'dashboard.ver' },
  { texto: 'Auditoría', icono: 'pi pi-shield', ruta: '/auditoria', permiso: 'auditoria.ver' },
]
