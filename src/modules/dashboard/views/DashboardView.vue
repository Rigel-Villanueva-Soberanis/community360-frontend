<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Message from 'primevue/message'
import Button from 'primevue/button'
import EstadoConexion from '../envivo/components/EstadoConexion.vue'
import { useMetricas } from '../envivo/composables/useMetricas'
import { ofrecerVivo } from '../envivo/composables/contextoVivo'

/**
 * Contenedor de las páginas del dashboard (Resumen, Interacciones, Usuarios, Tendencia).
 * La conexión en vivo se abre una sola vez aquí, así no se corta ni se repite al cambiar de página.
 */
const vivo = useMetricas()
ofrecerVivo(vivo)

const route = useRoute()
const esEnVivo = computed(() => route.meta.enVivo === true)
</script>

<template>
  <div class="dashboard">
    <Teleport v-if="esEnVivo" defer to="#c360-estado-encabezado">
      <EstadoConexion
        :estado="vivo.estado.value"
        :ultimo-mensaje-utc="vivo.ultimoMensajeUtc.value"
      />
    </Teleport>
    <Message v-if="esEnVivo && vivo.errorInicial.value" severity="error" :closable="false">
      {{ vivo.errorInicial.value }}
      <Button label="Reintentar" size="small" text @click="vivo.reintentarRespaldo()" />
    </Message>
    <RouterView />
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  /* alto de la pantalla menos el encabezado y los márgenes: las páginas llenan todo el espacio */
  min-height: calc(100dvh - 7rem);
}
</style>
