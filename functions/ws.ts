import { reenviar, type EntornoProxy } from '../server/proxy'

// Reenvía el canal WebSocket /ws. Cloudflare mantiene la conexión abierta entre el navegador y la API.
export const onRequest = ({
  request,
  env,
}: {
  request: Request
  env: EntornoProxy
}): Promise<Response> => reenviar(request, env)
