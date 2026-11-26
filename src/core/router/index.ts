import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { instalarGuard, RUTA_INICIO } from './guard'
import { rutasAuth } from '@/modules/auth/routes'
import { rutasDashboard } from '@/modules/dashboard/routes'
import { rutasAuditoria } from '@/modules/auditoria/routes'

/** Rutas dentro del layout (menú lateral + encabezado). */
const rutasConLayout: RouteRecordRaw[] = [
  ...rutasDashboard,
  ...rutasAuditoria,
  {
    path: 'sin-permiso',
    component: () => import('@/shared/components/SinPermiso.vue'),
    meta: { titulo: 'Sin permiso' },
  },
]

export const rutas: RouteRecordRaw[] = [
  ...rutasAuth,
  {
    path: '/',
    component: () => import('@/core/layout/AppLayout.vue'),
    redirect: RUTA_INICIO,
    children: [
      ...rutasConLayout,
      {
        path: ':pathMatch(.*)*',
        component: () => import('@/shared/components/NoEncontrado.vue'),
        meta: { titulo: 'No encontrado' },
      },
    ],
  },
]

const router = createRouter({ history: createWebHistory(), routes: rutas })
instalarGuard(router)

export default router
