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
    definicion="I5 · 100 · nₖ / N, donde nₖ son las interacciones de la plataforma k y N el total. Los porcentajes llevan 1 decimal y, con el método del mayor residuo, suman exactamente 100.0."
    :vacio="items.length === 0"
    mensaje-vacio="Todavía no hay interacciones."
  >
    <GraficaDona
      :items="items"
      descripcion="Gráfica de dona: porcentaje de interacciones por plataforma"
    />
  </TarjetaGrafica>
</template>
