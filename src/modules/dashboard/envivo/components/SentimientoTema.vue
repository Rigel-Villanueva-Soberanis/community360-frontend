<script setup lang="ts">
import { computed } from 'vue'
import TarjetaGrafica from '@/shared/components/TarjetaGrafica.vue'
import GraficaBarras from '@/shared/components/GraficaBarras.vue'
import type { PuntoSerie } from '../../types/metricas.types'

const props = defineProps<{ items: PuntoSerie[] }>()

/**
 * Las barras nacen en el borde izquierdo (el cero) mientras todos los temas sean positivos. Si alguno es negativo,
 * el eje se abre hacia la izquierda lo justo (en pasos de 0.25) para mostrarlo sin esconder el signo.
 */
const minimo = computed(() => {
  const menor = Math.min(0, ...props.items.map((i) => i.valor))
  return menor < 0 ? Math.max(-1, Math.floor(menor / 0.25) * 0.25) : 0
})
</script>

<template>
  <TarjetaGrafica
    titulo="Sentimiento por tema"
    subtitulo="En vivo · promedio de −1 a 1"
    definicion="Promedio del sentimiento de las interacciones de cada tema. Los valores positivos indican un tono favorable y los negativos, uno desfavorable."
    :vacio="items.length === 0"
    mensaje-vacio="Todavía no hay interacciones."
  >
    <GraficaBarras
      :items="items"
      medida="Sentimiento promedio"
      horizontal
      :decimales="2"
      :min="minimo"
      :max="1"
      :alto="`${Math.max(10, items.length * 2.2)}rem`"
      descripcion="Gráfica de barras horizontales: sentimiento promedio por tema, de menos uno a uno"
    />
  </TarjetaGrafica>
</template>
