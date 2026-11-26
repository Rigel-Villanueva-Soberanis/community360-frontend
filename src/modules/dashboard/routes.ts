import type { RouteRecordRaw } from 'vue-router'

export const rutasDashboard: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    component: () => import('./views/DashboardView.vue'),
    meta: { permiso: 'dashboard.ver', titulo: 'Dashboard' },
  },
]
