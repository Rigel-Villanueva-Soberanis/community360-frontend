import type { Permiso } from '@/core/auth/permisos'

export interface OpcionMenu {
  texto: string
  icono: string
  ruta: string
  permiso: Permiso
  /** Las opciones con el mismo grupo se muestran juntas, con el nombre del grupo encima. */
  grupo?: string
}

/** Cada opción lleva su permiso; AppMenu muestra solo las que el rol puede ver. */
export const MENU: OpcionMenu[] = [
  {
    texto: 'Resumen',
    icono: 'pi pi-home',
    ruta: '/dashboard/resumen',
    permiso: 'dashboard.ver',
    grupo: 'Dashboard',
  },
  {
    texto: 'Interacciones',
    icono: 'pi pi-comments',
    ruta: '/dashboard/interacciones',
    permiso: 'dashboard.ver',
    grupo: 'Dashboard',
  },
  {
    texto: 'Usuarios',
    icono: 'pi pi-users',
    ruta: '/dashboard/usuarios',
    permiso: 'dashboard.ver',
    grupo: 'Dashboard',
  },
  {
    texto: 'Tendencia',
    icono: 'pi pi-chart-line',
    ruta: '/dashboard/tendencia',
    permiso: 'dashboard.ver',
    grupo: 'Dashboard',
  },
  {
    texto: 'Auditoría',
    icono: 'pi pi-shield',
    ruta: '/auditoria',
    permiso: 'auditoria.ver',
    grupo: 'Administración',
  },
]
