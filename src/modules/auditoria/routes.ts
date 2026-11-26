import type { RouteRecordRaw } from 'vue-router'

export const rutasAuditoria: RouteRecordRaw[] = [
  {
    path: 'auditoria',
    component: () => import('./views/AuditoriaView.vue'),
    meta: { permiso: 'auditoria.ver', titulo: 'Auditoría' },
  },
]
