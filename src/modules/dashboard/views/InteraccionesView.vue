<script setup lang="ts">
import DonaPlataforma from '../envivo/components/DonaPlataforma.vue'
import BarrasTipo from '../envivo/components/BarrasTipo.vue'
import SentimientoTema from '../envivo/components/SentimientoTema.vue'
import EtiquetasTop from '../envivo/components/EtiquetasTop.vue'
import { usarVivo } from '../envivo/composables/contextoVivo'

const vivo = usarVivo()
</script>

<template>
  <div v-if="vivo.snapshot.value" class="pagina__rejilla">
    <DonaPlataforma :items="vivo.snapshot.value.porPlataforma" />
    <BarrasTipo :items="vivo.snapshot.value.porTipo" />
    <SentimientoTema :items="vivo.snapshot.value.sentimientoPorTema" />
    <EtiquetasTop :items="vivo.snapshot.value.etiquetasTop" />
  </div>
  <p v-else-if="!vivo.errorInicial.value" class="pagina__cargando">Cargando indicadores…</p>
</template>
