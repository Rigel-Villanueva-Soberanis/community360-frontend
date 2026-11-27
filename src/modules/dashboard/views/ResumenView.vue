<script setup lang="ts">
import IndicadoresResumen from '../envivo/components/IndicadoresResumen.vue'
import ActividadHeatmap from '../envivo/components/ActividadHeatmap.vue'
import RegistroEventos from '../envivo/components/RegistroEventos.vue'
import { usarVivo } from '../envivo/composables/contextoVivo'

const vivo = usarVivo()
</script>

<template>
  <div v-if="vivo.snapshot.value" class="pagina">
    <IndicadoresResumen :resumen="vivo.snapshot.value.resumen" />
    <div class="pagina__rejilla">
      <ActividadHeatmap :celdas="vivo.snapshot.value.actividadPorHora" />
      <RegistroEventos :eventos="vivo.eventos.value" />
    </div>
  </div>
  <p v-else-if="!vivo.errorInicial.value" class="pagina__cargando">Cargando indicadores…</p>
</template>
