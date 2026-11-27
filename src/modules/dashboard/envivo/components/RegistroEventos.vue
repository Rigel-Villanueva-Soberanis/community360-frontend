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
    :vacio="eventos.length === 0"
    mensaje-vacio="Sin eventos nuevos"
  >
    <div class="eventos">
      <ol class="eventos__lista" aria-live="polite">
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
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1 1 auto;
  min-height: 0;
}
.eventos__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.eventos__lista--modal {
  max-height: 60vh;
  overflow-y: auto;
}
.eventos__mas {
  align-self: flex-start;
}
</style>
