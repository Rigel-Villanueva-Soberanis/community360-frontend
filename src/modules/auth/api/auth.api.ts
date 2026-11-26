import { publicar } from '@/core/http/cliente'

export interface LoginPeticion {
  nombreUsuario: string
  contrasena: string
}

/**
 * La API también devuelve `token` en el cuerpo, pero NO se declara aquí a propósito: la sesión viaja en una
 * cookie HttpOnly y el frontend no debe tocar ni guardar el token.
 */
export interface LoginRespuesta {
  nombreUsuario: string
  rol: string
  expiraUtc: string
}

export const authApi = {
  login: (peticion: LoginPeticion) => publicar<LoginRespuesta>('/api/auth/login', peticion),
}
