<script setup lang="ts">
import { formatearHora } from '@/core/utils/fechas'
import { decimal } from '@/shared/utils/formato'
import type { EventoRegistrado } from '../../types/metricas.types'

defineProps<{ evento: EventoRegistrado }>()

const TEXTO = {
  'interaccion.creada': { texto: 'Nueva interacción', icono: 'pi pi-plus-circle', clase: 'creada' },
  'interaccion.modificada': {
    texto: 'Interacción modificada',
    icono: 'pi pi-pencil',
    clase: 'modificada',
  },
  'interaccion.eliminada': {
    texto: 'Interacción eliminada',
    icono: 'pi pi-trash',
    clase: 'eliminada',
  },
} as const
</script>

<template>
  <li class="evento" :class="`evento--${TEXTO[evento.tipo].clase}`">
    <i :class="TEXTO[evento.tipo].icono" aria-hidden="true" />
    <div class="evento__texto">
      <strong>{{ TEXTO[evento.tipo].texto }}</strong>
      <span>{{ evento.datos.idInteraccion }} · {{ evento.datos.plataforma }} · {{ evento.datos.tipo }}</span>
      <span v-if="evento.datos.sentimiento !== null"
        >sentimiento {{ decimal(evento.datos.sentimiento, 2) }}</span
      >
    </div>
    <time :datetime="evento.fechaUtc">{{ formatearHora(evento.fechaUtc) }}</time>
  </li>
</template>

<style scoped>
.evento {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.6rem;
  border-radius: 0.5rem;
  border-left: 3px solid var(--c360-borde);
  background: #f8fafc;
  font-size: 0.85rem;
}
.evento__texto {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.evento__texto span {
  color: var(--c360-texto-suave);
}
.evento time {
  font-variant-numeric: tabular-nums;
  color: var(--c360-texto-suave);
  font-size: 0.8rem;
}
.evento--creada {
  border-left-color: #0ca30c;
}
.evento--modificada {
  border-left-color: #2a78d6;
}
.evento--eliminada {
  border-left-color: #d03b3b;
}
</style>
