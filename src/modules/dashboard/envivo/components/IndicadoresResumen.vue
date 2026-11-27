<script setup lang="ts">
import { computed } from 'vue'
import KpiTarjeta from '@/shared/components/KpiTarjeta.vue'
import { decimal, entero, porcentaje } from '@/shared/utils/formato'
import type { Resumen } from '../../types/metricas.types'

const props = defineProps<{ resumen: Resumen }>()

const r = computed(() => props.resumen)
/** El signo se muestra siempre en el sentimiento (+0.25 / −0.40) para leerlo de un vistazo. */
const sentimiento = computed(
  () => `${r.value.sentimientoPromedio > 0 ? '+' : ''}${decimal(r.value.sentimientoPromedio, 2)}`,
)
const lectura = computed(() => {
  const s = r.value.sentimientoPromedio
  if (r.value.totalInteracciones === 0) return 'Sin interacciones'
  return s > 0.05 ? 'Tono positivo' : s < -0.05 ? 'Tono negativo' : 'Tono neutral'
})
</script>

<template>
  <div class="kpis">
    <KpiTarjeta
      titulo="Total de interacciones"
      :valor="entero(r.totalInteracciones)"
      :clave="r.totalInteracciones"
      definicion="Cantidad total de interacciones guardadas. Si no hay ninguna, vale 0."
    />
    <KpiTarjeta
      titulo="Sentimiento promedio"
      :valor="sentimiento"
      :clave="r.sentimientoPromedio"
      :detalle="`${lectura} · escala de −1 a 1`"
      definicion="Promedio del sentimiento de todas las interacciones (de −1 a 1). Si no hay interacciones, vale 0."
    />
    <KpiTarjeta
      titulo="Reacciones por interacción"
      :valor="decimal(r.reaccionesPromedio, 2)"
      :clave="r.reaccionesPromedio"
      definicion="Promedio de reacciones que recibe cada interacción. Si no hay interacciones, vale 0."
    />
    <KpiTarjeta
      titulo="Interacciones negativas"
      :valor="porcentaje(r.porcentajeNegativo)"
      :clave="r.porcentajeNegativo"
      definicion="Porcentaje de interacciones con sentimiento menor que cero. Si no hay interacciones, vale 0."
    />
  </div>
</template>

<style scoped>
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
  gap: 1rem;
}
</style>
