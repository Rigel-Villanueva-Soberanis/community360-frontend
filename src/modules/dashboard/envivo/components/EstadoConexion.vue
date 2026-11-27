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
      return { texto: 'Cargando…', clase: 'espera', icono: 'pi pi-spin pi-spinner' }
    case 'reconectando':
      return { texto: 'Actualizando…', clase: 'espera', icono: 'pi pi-spin pi-spinner' }
    default:
      return { texto: 'Sin actualización en vivo', clase: 'error', icono: 'pi pi-times-circle' }
  }
})
</script>

<template>
  <p class="estado" :class="`estado--${info.clase}`" role="status">
    <i :class="info.icono" aria-hidden="true" />
    <span class="estado__texto">
      <strong>{{ info.texto }}</strong>
      <small v-if="ultimoMensajeUtc">actualizado {{ formatearHora(ultimoMensajeUtc) }}</small>
    </span>
  </p>
</template>

<style scoped>
.estado {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  border: 1px solid transparent;
}
.estado__texto {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  line-height: 1.2;
}
.estado small {
  color: var(--c360-texto-suave);
  font-size: 0.8rem;
  line-height: inherit;
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
