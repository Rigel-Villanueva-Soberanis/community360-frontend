import { obtener, publicar } from '@/core/http/cliente'

export interface UsuarioActualDto {
  id: number
  nombreUsuario: string
  rol: string
}

/**
 * Llamadas de sesión que necesita el núcleo (guard y cierre de sesión).
 * El inicio de sesión vive en modules/auth/api/auth.api.ts.
 */
export const sesionApi = {
  me: () => obtener<UsuarioActualDto>('/api/auth/me'),
  logout: () => publicar<object>('/api/auth/logout'),
}
