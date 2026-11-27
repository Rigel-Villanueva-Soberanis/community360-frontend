<script setup lang="ts">
import TarjetaGrafica from '@/shared/components/TarjetaGrafica.vue'
import GraficaBarras from '@/shared/components/GraficaBarras.vue'
import type { PuntoSerie } from '../../types/metricas.types'

defineProps<{ items: PuntoSerie[] }>()
</script>

<template>
  <TarjetaGrafica
    titulo="Interacciones por tipo"
    subtitulo="En vivo · conteo"
    definicion="Cantidad de interacciones de cada tipo. La suma de todos los tipos es igual al total."
    :vacio="items.length === 0"
    mensaje-vacio="Todavía no hay interacciones."
  >
    <GraficaBarras
      :items="items"
      medida="Interacciones"
      descripcion="Gráfica de barras: cantidad de interacciones por tipo"
    />
  </TarjetaGrafica>
</template>
