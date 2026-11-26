<script setup lang="ts">
import { computed } from 'vue'
import type { EstadoConexion } from '../composables/useTiempoReal'
import { formatearHora } from '@/core/utils/fechas'

const props = defineProps<{ estado: EstadoConexion; ultimoMensajeUtc: string | null }>()

const info = computed(() => {
  switch (props.estado) {
    case 'en_vivo':
      return { texto: 'En vivo', clase: 'ok', icono: 'pi pi-circle-fill' }
    case 'conectando':
      return { texto: 'Conectando…', clase: 'espera', icono: 'pi pi-spin pi-spinner' }
    case 'reconectando':
      return { texto: 'Reconectando…', clase: 'espera', icono: 'pi pi-spin pi-spinner' }
    default:
      return { texto: 'Desconectado', clase: 'error', icono: 'pi pi-times-circle' }
  }
})
</script>

<template>
  <p class="estado" :class="`estado--${info.clase}`" role="status">
    <i :class="info.icono" aria-hidden="true" />
    <strong>{{ info.texto }}</strong>
    <small v-if="ultimoMensajeUtc">último mensaje {{ formatearHora(ultimoMensajeUtc) }}</small>
  </p>
</template>

<style scoped>
.estado {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.85rem;
  border: 1px solid transparent;
}
.estado small {
  color: var(--c360-texto-suave);
}
.estado--ok {
  background: #e8f6e8;
  border-color: #b7e0b7;
  color: #066106;
}
.estado--espera {
  background: #fff5db;
  border-color: #f3d98a;
  color: #7a5200;
}
.estado--error {
  background: #fdeaea;
  border-color: #f2b8b8;
  color: #9c2323;
}
.estado i {
  font-size: 0.7rem;
}
</style>
