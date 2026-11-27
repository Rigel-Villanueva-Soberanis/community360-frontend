import type { RouteRecordRaw } from 'vue-router'

/** El dashboard se divide en páginas del menú para que nadie tenga que desplazarse de más. */
export const rutasDashboard: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    component: () => import('./views/DashboardView.vue'),
    redirect: '/dashboard/resumen',
    meta: { permiso: 'dashboard.ver', titulo: 'Dashboard' },
    children: [
      {
        path: 'resumen',
        component: () => import('./views/ResumenView.vue'),
        meta: { titulo: 'Resumen', enVivo: true },
      },
      {
        path: 'interacciones',
        component: () => import('./views/InteraccionesView.vue'),
        meta: { titulo: 'Interacciones', enVivo: true },
      },
      {
        path: 'usuarios',
        component: () => import('./views/UsuariosView.vue'),
        meta: { titulo: 'Usuarios' },
      },
      {
        path: 'tendencia',
        component: () => import('./views/TendenciaView.vue'),
        meta: { titulo: 'Tendencia' },
      },
    ],
  },
]
