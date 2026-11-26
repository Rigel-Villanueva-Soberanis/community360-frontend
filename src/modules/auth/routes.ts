import type { RouteRecordRaw } from 'vue-router'

export const rutasAuth: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('./views/LoginView.vue'),
    meta: { publica: true, titulo: 'Iniciar sesión' },
  },
]
