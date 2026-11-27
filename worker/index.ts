import { reenviar, type EntornoProxy } from '../server/proxy'

/**
 * Worker de Cloudflare: solo atiende /api/* y /ws (lo define "run_worker_first" en wrangler.jsonc) y los reenvía
 * al backend en Render. Todo lo demás (la aplicación Vue) lo sirve Cloudflare directamente desde dist/.
 */
export default {
  fetch(request: Request, env: EntornoProxy): Promise<Response> {
    return reenviar(request, env)
  },
}
