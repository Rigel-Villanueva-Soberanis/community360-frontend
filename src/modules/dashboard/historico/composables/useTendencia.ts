import { computed, onMounted, ref } from 'vue'
import { analiticaApi } from '../../api/analitica.api'
import { useRecurso } from '@/core/utils/useRecurso'
import { aFechaApi } from '@/core/utils/fechas'

export const MAX_DIAS = 366
const DIA_MS = 86_400_000

export const PRESETS = [
  { dias: 30, texto: '30 días' },
  { dias: 90, texto: '90 días' },
  { dias: MAX_DIAS, texto: '1 año' },
] as const

const FECHA_API = /^\d{4}-\d{2}-\d{2}$/

/** Días entre dos fechas AAAA-MM-DD (negativo si hasta < desde). */
export function diasEntre(desde: string, hasta: string): number {
  return Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / DIA_MS)
}

/** Mismo criterio que el backend: hasta ≥ desde y como máximo 366 días de diferencia. */
export function validarRango(desde: string, hasta: string): string {
  if (!FECHA_API.test(desde) || !FECHA_API.test(hasta)) return 'Elige las dos fechas.'
  const d = diasEntre(desde, hasta)
  if (Number.isNaN(d)) return 'Elige fechas válidas.'
  if (d < 0) return 'La fecha final no puede ser anterior a la inicial.'
  if (d > MAX_DIAS) return `El rango máximo es de ${MAX_DIAS} días.`
  return ''
}

/** H5 (REST): interacciones y sentimiento promedio por día en el rango elegido. */
export function useTendencia() {
  const hoy = new Date()
  const hasta = ref(aFechaApi(hoy))
  const desde = ref(aFechaApi(new Date(hoy.getTime() - MAX_DIAS * DIA_MS)))
  const errorRango = ref('')

  const recurso = useRecurso((s) => analiticaApi.tendenciaDiaria(desde.value, hasta.value, s))

  async function aplicar(): Promise<void> {
    errorRango.value = validarRango(desde.value, hasta.value)
    if (!errorRango.value) await recurso.cargar()
  }

  function usarPreset(dias: number): void {
    const fin = new Date()
    hasta.value = aFechaApi(fin)
    desde.value = aFechaApi(new Date(fin.getTime() - dias * DIA_MS))
    void aplicar()
  }

  const dias = computed(() => recurso.datos.value ?? [])
  onMounted(aplicar)

  return { desde, hasta, errorRango, dias, ...recurso, aplicar, usarPreset }
}
