import { reenviar, type EntornoProxy } from '../../server/proxy'

// Reenvía /api/* a la API en Render (cualquier método).
export const onRequest = ({
  request,
  env,
}: {
  request: Request
  env: EntornoProxy
}): Promise<Response> => reenviar(request, env)
