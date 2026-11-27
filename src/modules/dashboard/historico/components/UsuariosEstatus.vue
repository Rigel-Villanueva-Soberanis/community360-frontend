<script setup lang="ts">
import TarjetaGrafica from '@/shared/components/TarjetaGrafica.vue'
import GraficaDona from '@/shared/components/GraficaDona.vue'
import { COLOR_ESTATUS, COLOR_OTROS } from '@/shared/utils/paleta'
import type { useRecurso } from '@/core/utils/useRecurso'
import type { PuntoSerie } from '../../types/metricas.types'

const props = defineProps<{ recurso: ReturnType<typeof useRecurso<PuntoSerie[]>> }>()
const color = (e: string) => COLOR_ESTATUS[e.trim().toLowerCase()] ?? COLOR_OTROS
</script>

<template>
  <TarjetaGrafica
    titulo="Usuarios por estatus"
    subtitulo="Histórico · todos los usuarios"
    definicion="Porcentaje de usuarios según su estatus. Los porcentajes llevan 1 decimal y suman exactamente 100."
    :cargando="props.recurso.cargando.value"
    :error="props.recurso.error.value"
    :vacio="(props.recurso.datos.value?.length ?? 0) === 0"
    mensajeVacio="Todavía no hay usuarios cargados."
    @reintentar="props.recurso.cargar()"
  >
    <GraficaDona
      v-if="props.recurso.datos.value"
      :items="props.recurso.datos.value"
      :color="color"
      descripcion="Gráfica de dona: porcentaje de usuarios activos, en riesgo e inactivos"
    />
  </TarjetaGrafica>
</template>
