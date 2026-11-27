import { inject, provide, type InjectionKey } from 'vue'
import type { useMetricas } from './useMetricas'

export type Vivo = ReturnType<typeof useMetricas>
const CLAVE: InjectionKey<Vivo> = Symbol('indicadores-en-vivo')

/** El contenedor del dashboard abre UNA sola conexión en vivo y la comparte con las páginas «en vivo». */
export const ofrecerVivo = (vivo: Vivo): void => provide(CLAVE, vivo)

export function usarVivo(): Vivo {
  const vivo = inject(CLAVE)
  if (!vivo) throw new Error('Esta página debe mostrarse dentro del dashboard.')
  return vivo
}
