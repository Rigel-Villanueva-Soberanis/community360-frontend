import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'
import { api, configurarHttp, obtener } from '../cliente'
import { aMapa, erroresDe, estadoDe, mensajeDe } from '../errores'

vi.mock('@/core/utils/avisos', () => ({ avisar: vi.fn() }))
import { avisar } from '@/core/utils/avisos'

const original = api.defaults.adapter

function responder(estado: number, cuerpo: unknown) {
  api.defaults.adapter = (async (config: InternalAxiosRequestConfig) => {
    const r = { data: cuerpo, status: estado, statusText: '', headers: {}, config } as AxiosResponse
    if (estado >= 200 && estado < 300) return r
    throw new AxiosError('fallo', String(estado), config, null, r)
  }) as AxiosAdapter
}

describe('cliente http', () => {
  const alSesionInvalida = vi.fn()
  beforeEach(() => {
    vi.clearAllMocks()
    configurarHttp({ alSesionInvalida })
  })
  afterEach(() => {
    api.defaults.adapter = original
  })

  it('devuelve solo `datos` sin la envoltura', async () => {
    responder(200, { exito: true, datos: { total: 5 }, errores: null })
    expect(await obtener<{ total: number }>('/api/algo')).toEqual({ total: 5 })
  })

  it('manda la cookie de sesión (withCredentials) y no pone el token en cabeceras', () => {
    expect(api.defaults.withCredentials).toBe(true)
    expect(JSON.stringify(api.defaults.headers)).not.toMatch(/authorization/i)
  })

  it('401 en una ruta protegida avisa a la sesión', async () => {
    responder(401, { exito: false, errores: null })
    await expect(obtener('/api/analitica/h1')).rejects.toBeTruthy()
    expect(alSesionInvalida).toHaveBeenCalledOnce()
  })

  it.each(['/api/auth/login', '/api/auth/me'])('401 en %s es normal y no redirige', async (url) => {
    responder(401, { exito: false, mensaje: 'Usuario o contraseña incorrectos.', errores: null })
    await expect(obtener(url)).rejects.toBeTruthy()
    expect(alSesionInvalida).not.toHaveBeenCalled()
  })

  it('403, 429 y 5xx muestran un aviso y relanzan el error', async () => {
    for (const estado of [403, 429, 503]) {
      vi.mocked(avisar).mockClear()
      responder(estado, { exito: false, errores: null })
      await expect(obtener('/api/x')).rejects.toBeTruthy()
      expect(avisar).toHaveBeenCalledOnce()
    }
  })

  it('sin respuesta (API apagada) avisa servicio no disponible', async () => {
    api.defaults.adapter = (async (config: InternalAxiosRequestConfig) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config)
    }) as AxiosAdapter
    await expect(obtener('/api/x')).rejects.toBeTruthy()
    expect(avisar).toHaveBeenCalledWith('error', expect.stringContaining('Servicio no disponible'))
  })
})

describe('errores', () => {
  it('aMapa conserva el primer mensaje de cada campo', () => {
    expect(
      aMapa([
        { campo: 'texto', mensaje: 'Obligatorio' },
        { campo: 'texto', mensaje: 'Muy largo' },
        { campo: 'fecha', mensaje: 'No puede ser futura' },
      ]),
    ).toEqual({ texto: 'Obligatorio', fecha: 'No puede ser futura' })
    expect(aMapa(null)).toEqual({})
  })

  it('lee errores, estado y mensaje de un AxiosError 422', async () => {
    responder(422, {
      exito: false,
      mensaje: 'Datos no válidos',
      errores: [{ campo: 'texto', mensaje: 'Obligatorio' }],
    })
    const e = await obtener('/api/x').catch((x) => x)
    expect(erroresDe(e)).toEqual({ texto: 'Obligatorio' })
    expect(estadoDe(e)).toBe(422)
    expect(mensajeDe(e)).toBe('Datos no válidos')
    expect(mensajeDe(new Error('x'), 'Genérico')).toBe('Genérico')
  })
})
