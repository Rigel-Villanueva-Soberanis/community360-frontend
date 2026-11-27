<script setup lang="ts">
import TarjetaGrafica from '@/shared/components/TarjetaGrafica.vue'
import GraficaBarras from '@/shared/components/GraficaBarras.vue'
import type { PuntoSerie } from '../../types/metricas.types'

defineProps<{ items: PuntoSerie[] }>()
</script>

<template>
  <TarjetaGrafica
    titulo="Etiquetas más usadas"
    subtitulo="En vivo · top 10"
    definicion="Las 10 etiquetas que más se repiten en las interacciones."
    :vacio="items.length === 0"
    mensaje-vacio="Todavía no hay etiquetas."
  >
    <GraficaBarras
      :items="items"
      medida="Usos"
      horizontal
      :alto="`${Math.max(10, items.length * 2.2)}rem`"
      descripcion="Gráfica de barras horizontales: etiquetas más usadas"
    />
  </TarjetaGrafica>
</template>
