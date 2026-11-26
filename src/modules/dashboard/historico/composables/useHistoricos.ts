import { onMounted } from 'vue'
import { analiticaApi } from '../../api/analitica.api'
import { useRecurso } from '@/core/utils/useRecurso'
import type { PuntoSerie } from '../../types/metricas.types'

/** "18-24", "25-31", "39+": se ordenan por el primer número, no alfabéticamente. */
export function ordenarPorEdad(items: PuntoSerie[]): PuntoSerie[] {
  const n = (e: string) => Number.parseInt(e, 10)
  return [...items].sort(
    (a, b) =>
      (Number.isNaN(n(a.etiqueta)) ? 999 : n(a.etiqueta)) -
      (Number.isNaN(n(b.etiqueta)) ? 999 : n(b.etiqueta)),
  )
}

/**
 * Históricos H1–H4 (REST). Cada gráfica carga por separado: si una falla, las demás siguen
 * mostrándose y solo esa ofrece "Reintentar".
 */
export function useHistoricos() {
  const estatus = useRecurso((s) => analiticaApi.usuariosPorEstatus(s))
  const plataforma = useRecurso((s) => analiticaApi.usuariosPorPlataforma(s))
  const edad = useRecurso(async (s) => ordenarPorEdad(await analiticaApi.usuariosPorRangoEdad(s)))
  const pais = useRecurso((s) => analiticaApi.usuariosPorPais(s))

  const cargarTodo = () =>
    Promise.all([estatus.cargar(), plataforma.cargar(), edad.cargar(), pais.cargar()])
  onMounted(cargarTodo)

  return { estatus, plataforma, edad, pais, cargarTodo }
}
