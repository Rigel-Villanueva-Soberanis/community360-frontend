<script setup lang="ts">
import TarjetaGrafica from '@/shared/components/TarjetaGrafica.vue'
import GraficaBarras from '@/shared/components/GraficaBarras.vue'
import type { useRecurso } from '@/core/utils/useRecurso'
import type { PuntoSerie } from '../../types/metricas.types'

const props = defineProps<{ recurso: ReturnType<typeof useRecurso<PuntoSerie[]>> }>()
</script>

<template>
  <TarjetaGrafica
    titulo="Usuarios por país"
    subtitulo="Histórico · solo usuarios con consentimiento"
    definicion="Conteo de usuarios por país, contando únicamente a quienes dieron consentimiento de datos geográficos (consentimiento = “sí”). Quienes no lo dieron nunca aparecen en esta gráfica."
    :cargando="props.recurso.cargando.value"
    :error="props.recurso.error.value"
    :vacio="(props.recurso.datos.value?.length ?? 0) === 0"
    mensajeVacio="Todavía no hay usuarios con consentimiento."
    @reintentar="props.recurso.cargar()"
  >
    <GraficaBarras
      v-if="props.recurso.datos.value"
      :items="props.recurso.datos.value"
      medida="Usuarios"
      horizontal
      descripcion="Gráfica de barras horizontales: usuarios con consentimiento por país"
      :alto="`${Math.max(10, props.recurso.datos.value.length * 2.2)}rem`"
    />
  </TarjetaGrafica>
</template>
