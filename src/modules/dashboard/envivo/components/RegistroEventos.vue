<script setup lang="ts">
import TarjetaGrafica from '@/shared/components/TarjetaGrafica.vue'
import { formatearHora } from '@/core/utils/fechas'
import { decimal } from '@/shared/utils/formato'
import type { EventoRegistrado } from '../../types/metricas.types'

defineProps<{ eventos: EventoRegistrado[] }>()

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
  <TarjetaGrafica
    titulo="Últimos eventos"
    subtitulo="Llegan por WebSocket · sin texto ni ubicación"
    :vacio="eventos.length === 0"
    mensaje-vacio="Esperando cambios… envía una interacción desde Postman."
  >
    <ol class="eventos" aria-live="polite">
      <li
        v-for="e in eventos"
        :key="e.id"
        class="eventos__item"
        :class="`eventos__item--${TEXTO[e.tipo].clase}`"
      >
        <i :class="TEXTO[e.tipo].icono" aria-hidden="true" />
        <div class="eventos__texto">
          <strong>{{ TEXTO[e.tipo].texto }}</strong>
          <span>{{ e.datos.idInteraccion }} · {{ e.datos.plataforma }} · {{ e.datos.tipo }}</span>
          <span v-if="e.datos.sentimiento !== null"
            >sentimiento {{ decimal(e.datos.sentimiento, 2) }}</span
          >
        </div>
        <time :datetime="e.fechaUtc">{{ formatearHora(e.fechaUtc) }}</time>
      </li>
    </ol>
  </TarjetaGrafica>
</template>

<style scoped>
.eventos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 22rem;
  overflow: auto;
}
.eventos__item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.6rem;
  border-radius: 0.5rem;
  border-left: 3px solid var(--c360-borde);
  background: #f8fafc;
  font-size: 0.85rem;
}
.eventos__texto {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.eventos__texto span {
  color: var(--c360-texto-suave);
}
.eventos__item time {
  font-variant-numeric: tabular-nums;
  color: var(--c360-texto-suave);
  font-size: 0.8rem;
}
.eventos__item--creada {
  border-left-color: #0ca30c;
}
.eventos__item--modificada {
  border-left-color: #2a78d6;
}
.eventos__item--eliminada {
  border-left-color: #d03b3b;
}
</style>
