<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'

defineProps<{
  titulo: string
  subtitulo?: string
  /** Definición matemática del indicador (el maestro pide que esté documentada). */
  definicion?: string
  cargando?: boolean
  error?: string
  vacio?: boolean
  mensajeVacio?: string
}>()
const emit = defineEmits<{ reintentar: [] }>()

const verDefinicion = ref(false)
</script>

<template>
  <section class="tarjeta" :aria-busy="cargando ? 'true' : 'false'">
    <header class="tarjeta__cabecera">
      <div class="tarjeta__textos">
        <h3 class="tarjeta__titulo">{{ titulo }}</h3>
        <p v-if="subtitulo" class="tarjeta__subtitulo">{{ subtitulo }}</p>
      </div>
      <Button
        v-if="definicion"
        icon="pi pi-info-circle"
        text
        rounded
        size="small"
        severity="secondary"
        :aria-expanded="verDefinicion"
        :aria-label="`Ver definición de ${titulo}`"
        @click="verDefinicion = !verDefinicion"
      />
    </header>

    <p v-if="definicion && verDefinicion" class="tarjeta__definicion">{{ definicion }}</p>

    <div v-if="error" class="tarjeta__estado tarjeta__estado--error" role="alert">
      <i class="pi pi-exclamation-triangle" aria-hidden="true" />
      <span>{{ error }}</span>
      <Button label="Reintentar" size="small" outlined @click="emit('reintentar')" />
    </div>
    <div v-else-if="cargando && vacio !== false" class="tarjeta__estado">
      <Skeleton width="100%" height="9rem" />
    </div>
    <div v-else-if="vacio" class="tarjeta__estado">
      <i class="pi pi-inbox" aria-hidden="true" />
      <span>{{ mensajeVacio ?? 'Todavía no hay datos.' }}</span>
    </div>
    <slot v-else />
  </section>
</template>

<style scoped>
.tarjeta {
  background: var(--c360-tarjeta);
  border: 1px solid var(--c360-borde);
  border-radius: 1rem;
  padding: 1.1rem 1.25rem;
  box-shadow:
    0 1px 3px rgb(0 0 0 / 0.02),
    0 4px 20px -2px rgb(15 23 42 / 0.05);
  transition: box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}
.tarjeta:hover {
  box-shadow: 0 8px 30px -4px rgb(15 23 42 / 0.08);
}
.tarjeta__cabecera {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}
.tarjeta__titulo {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}
.tarjeta__subtitulo {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: var(--c360-texto-suave);
}
.tarjeta__definicion {
  margin: 0;
  padding: 0.6rem 0.75rem;
  background: #f1f5fb;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  line-height: 1.4;
}
.tarjeta__estado {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  min-height: 9rem;
  color: var(--c360-texto-suave);
  text-align: center;
  flex-wrap: wrap;
}
.tarjeta__estado--error {
  color: #b3261e;
}
</style>
