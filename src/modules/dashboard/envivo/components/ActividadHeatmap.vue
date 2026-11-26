<script setup lang="ts">
import { computed } from 'vue'
import TarjetaGrafica from '@/shared/components/TarjetaGrafica.vue'
import MapaCalor from '@/shared/components/MapaCalor.vue'
import type { CeldaHeatmap } from '../../types/metricas.types'

const props = defineProps<{ celdas: CeldaHeatmap[] }>()
const vacio = computed(() => props.celdas.every((c) => c.total === 0))
</script>

<template>
  <TarjetaGrafica
    titulo="Actividad por día y hora"
    subtitulo="En vivo · horas en UTC"
    definicion="I7 · A(d, h) = COUNT(interacciones ocurridas el día de la semana d a la hora h). Todas las horas están en UTC, tal como se guardan. Es una medida de actividad de la comunidad, no usa la ubicación de ninguna persona."
    :vacio="vacio"
    mensaje-vacio="Todavía no hay interacciones."
  >
    <MapaCalor :celdas="celdas" />
  </TarjetaGrafica>
</template>
