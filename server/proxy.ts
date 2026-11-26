/**
 * Proxy de Cloudflare Pages hacia la API en Render.
 *
 * El navegador solo habla con el sitio de Pages (mismo origen), así la cookie de sesión HttpOnly + SameSite=Strict
 * sigue funcionando aunque la API viva en otro dominio. Esta función reenvía /api/* y /ws a BACKEND_URL.
 *
 * Variables del proyecto en Cloudflare Pages (Settings → Variables and Secrets):
 *   BACKEND_URL   https://community360-api.onrender.com   (sin barra final)
 *   PROXY_SECRET  mismo valor que Proxy__Secreto en Render (opcional; permite contar los intentos de login por IP real)
 */
export interface EntornoProxy {
  BACKEND_URL?: string
  PROXY_SECRET?: string
}

/** Cabeceras que Cloudflare añade y que no deben viajar al backend. */
const CABECERAS_CF = /^(cf-|x-forwarded-|x-real-ip|true-client-ip|x-proxy-secret$|x-cliente-ip$)/i

export function urlDestino(backend: string | undefined, solicitud: URL): URL | null {
  if (!backend) return null
  try {
    const base = new URL(backend)
    if (base.protocol !== 'https:' && base.protocol !== 'http:') return null
    return new URL(solicitud.pathname + solicitud.search, base.origin)
  } catch {
    return null
  }
}

function falla(estado: number, mensaje: string): Response {
  return new Response(JSON.stringify({ exito: false, mensaje, datos: null, errores: null }), {
    status: estado,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

export async function reenviar(request: Request, env: EntornoProxy): Promise<Response> {
  const destino = urlDestino(env.BACKEND_URL, new URL(request.url))
  if (!destino) return falla(500, 'El proxy no está configurado (falta BACKEND_URL).')

  const cabeceras = new Headers()
  for (const [nombre, valor] of request.headers)
    if (!CABECERAS_CF.test(nombre)) cabeceras.set(nombre, valor)
  cabeceras.delete('host')
  const ip = request.headers.get('cf-connecting-ip')
  if (env.PROXY_SECRET && ip) {
    cabeceras.set('X-Proxy-Secret', env.PROXY_SECRET)
    cabeceras.set('X-Cliente-IP', ip)
  }

  const conCuerpo = request.method !== 'GET' && request.method !== 'HEAD'
  try {
    return await fetch(destino, {
      method: request.method,
      headers: cabeceras,
      body: conCuerpo ? request.body : undefined,
      redirect: 'manual',
    })
  } catch {
    return falla(
      502,
      'El servidor no respondió. Si estaba en reposo, espera unos segundos y reintenta.',
    )
  }
}
