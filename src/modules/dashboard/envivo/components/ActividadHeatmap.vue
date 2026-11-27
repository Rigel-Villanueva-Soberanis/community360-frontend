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
    subtitulo="En vivo · por día y hora"
    definicion="Cantidad de interacciones según el día de la semana y la hora. Mide la actividad de la comunidad; no usa la ubicación de ninguna persona."
    :vacio="vacio"
    mensaje-vacio="Todavía no hay interacciones."
  >
    <MapaCalor :celdas="celdas" />
  </TarjetaGrafica>
</template>
