import { onScopeDispose, ref, shallowRef } from 'vue'
import { isAxiosError } from 'axios'
import { mensajeDe } from '@/core/http/errores'

/**
 * Carga un dato de la API con estados de carga, error y "reintentar".
 * Si se vuelve a pedir mientras hay otra petición en curso, la vieja se cancela (gana siempre la última).
 */
export function useRecurso<T>(cargador: (signal: AbortSignal) => Promise<T>) {
  const datos = shallowRef<T | null>(null)
  const cargando = ref(false)
  const error = ref('')
  let control: AbortController | null = null

  async function cargar(): Promise<void> {
    control?.abort()
    const actual = new AbortController()
    control = actual
    cargando.value = true
    error.value = ''
    try {
      const resultado = await cargador(actual.signal)
      if (control === actual) datos.value = resultado
    } catch (e) {
      if (control !== actual || (isAxiosError(e) && e.code === 'ERR_CANCELED')) return
      error.value = mensajeDe(e, 'No se pudo cargar la información.')
    } finally {
      if (control === actual) cargando.value = false
    }
  }

  onScopeDispose(() => control?.abort())

  return { datos, cargando, error, cargar }
}
