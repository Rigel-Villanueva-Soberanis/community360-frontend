<script setup lang="ts">
import TarjetaGrafica from '@/shared/components/TarjetaGrafica.vue'
import GraficaBarras from '@/shared/components/GraficaBarras.vue'
import type { useRecurso } from '@/core/utils/useRecurso'
import type { PuntoSerie } from '../../types/metricas.types'

const props = defineProps<{ recurso: ReturnType<typeof useRecurso<PuntoSerie[]>> }>()
</script>

<template>
  <TarjetaGrafica
    titulo="Usuarios por plataforma"
    subtitulo="Histórico · plataforma principal"
    definicion="Conteo de usuarios por su plataforma principal: COUNT(usuario) agrupado por plataforma."
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
      color-por-entidad
      descripcion="Gráfica de barras: cantidad de usuarios por plataforma"
    />
  </TarjetaGrafica>
</template>
