<script setup lang="ts">
import TendenciaDiaria from '../historico/components/TendenciaDiaria.vue'
import { useTendencia } from '../historico/composables/useTendencia'

const tendencia = useTendencia()
</script>

<template>
  <TendenciaDiaria :tendencia="tendencia" />
</template>
