<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import TarjetaGrafica from '@/shared/components/TarjetaGrafica.vue'
import EventoItem from './EventoItem.vue'
import type { EventoRegistrado } from '../../types/metricas.types'

/** En la tarjeta solo se ven los más nuevos; el resto (hasta los últimos 50) se abre con «Ver todos». */
const VISIBLES = 5

const props = defineProps<{ eventos: EventoRegistrado[] }>()

const recientes = computed(() => props.eventos.slice(0, VISIBLES))
const hayMas = computed(() => props.eventos.length > VISIBLES)
const verTodos = ref(false)
</script>

<template>
  <TarjetaGrafica
    titulo="Últimos eventos"
    subtitulo="Se actualiza al instante · sin texto ni ubicación"
  >
    <div class="eventos">
      <p v-if="eventos.length === 0" class="eventos__vacio" role="status">
        <i class="pi pi-inbox" aria-hidden="true" />
        <span>Sin eventos nuevos</span>
      </p>
      <ol v-else class="eventos__lista" aria-live="polite">
        <EventoItem v-for="e in recientes" :key="e.id" :evento="e" />
      </ol>
      <Button
        v-if="hayMas"
        class="eventos__mas"
        :label="`Ver todos (${eventos.length})`"
        icon="pi pi-list"
        text
        size="small"
        @click="verTodos = true"
      />
    </div>
    <Dialog
      v-model:visible="verTodos"
      modal
      :draggable="false"
      :header="`Últimos eventos (${eventos.length})`"
      :style="{ width: '32rem', maxWidth: '95vw' }"
    >
      <ol class="eventos__lista eventos__lista--modal">
        <EventoItem v-for="e in eventos" :key="e.id" :evento="e" />
      </ol>
    </Dialog>
  </TarjetaGrafica>
</template>

<style scoped>
.eventos {
  /* Alto reservado para 5 eventos y el botón «Ver todos»: la tarjeta (y la del mapa de calor, que comparte fila)
     no crece ni salta conforme van llegando eventos. */
  min-height: 18rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1 1 auto;
}
.eventos__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.eventos__vacio {
  margin: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--c360-texto-suave);
}
.eventos__lista--modal {
  min-height: 0;
  max-height: 60vh;
  overflow-y: auto;
}
.eventos__mas {
  align-self: flex-start;
}
</style>
