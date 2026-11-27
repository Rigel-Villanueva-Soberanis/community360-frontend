<script setup lang="ts">
import TarjetaGrafica from '@/shared/components/TarjetaGrafica.vue'
import GraficaDona from '@/shared/components/GraficaDona.vue'
import type { PuntoSerie } from '../../types/metricas.types'

defineProps<{ items: PuntoSerie[] }>()
</script>

<template>
  <TarjetaGrafica
    titulo="Participación por plataforma"
    subtitulo="En vivo · interacciones"
    definicion="Porcentaje de las interacciones que corresponde a cada plataforma. Los porcentajes llevan 1 decimal y suman exactamente 100."
    :vacio="items.length === 0"
    mensaje-vacio="Todavía no hay interacciones."
  >
    <GraficaDona
      :items="items"
      descripcion="Gráfica de dona: porcentaje de interacciones por plataforma"
    />
  </TarjetaGrafica>
</template>
