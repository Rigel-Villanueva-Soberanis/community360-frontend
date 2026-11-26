<script setup lang="ts">
import TarjetaGrafica from '@/shared/components/TarjetaGrafica.vue'
import GraficaBarras from '@/shared/components/GraficaBarras.vue'
import type { useRecurso } from '@/core/utils/useRecurso'
import type { PuntoSerie } from '../../types/metricas.types'

const props = defineProps<{ recurso: ReturnType<typeof useRecurso<PuntoSerie[]>> }>()
</script>

<template>
  <TarjetaGrafica
    titulo="Usuarios por rango de edad"
    subtitulo="Histórico"
    definicion="Conteo de usuarios por rango de edad: COUNT(usuario) agrupado por rango (18-24, 25-31, 32-38 y 39+)."
    :cargando="props.recurso.cargando.value"
    :error="props.recurso.error.value"
    :vacio="(props.recurso.datos.value?.length ?? 0) === 0"
    mensajeVacio="Todavía no hay usuarios cargados."
    @reintentar="props.recurso.cargar()"
  >
    <GraficaBarras
      v-if="props.recurso.datos.value"
      :items="props.recurso.datos.value"
      medida="Usuarios"
      descripcion="Gráfica de barras: cantidad de usuarios por rango de edad"
    />
  </TarjetaGrafica>
</template>
