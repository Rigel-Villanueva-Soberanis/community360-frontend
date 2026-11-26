<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from 'primevue/button'

const props = defineProps<{
  titulo: string
  /** Valor ya formateado para mostrar. */
  valor: string
  /** Valor crudo: cuando cambia, la tarjeta parpadea un instante para que se note la actualización en vivo. */
  clave: number | string
  detalle?: string
  definicion?: string
}>()

const cambio = ref(false)
const verDefinicion = ref(false)
let t: ReturnType<typeof setTimeout> | undefined
watch(
  () => props.clave,
  (nueva, vieja) => {
    if (vieja === undefined || nueva === vieja) return
    cambio.value = true
    clearTimeout(t)
    t = setTimeout(() => (cambio.value = false), 1200)
  },
)
</script>

<template>
  <article class="kpi" :class="{ 'kpi--cambio': cambio }">
    <header class="kpi__cabecera">
      <h3 class="kpi__titulo">{{ titulo }}</h3>
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
    <p class="kpi__valor" aria-live="polite">{{ valor }}</p>
    <p v-if="detalle" class="kpi__detalle">{{ detalle }}</p>
    <p v-if="definicion && verDefinicion" class="kpi__definicion">{{ definicion }}</p>
  </article>
</template>

<style scoped>
.kpi {
  background: var(--c360-tarjeta);
  border: 1px solid var(--c360-borde);
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  transition:
    box-shadow 0.4s ease,
    border-color 0.4s ease;
  min-width: 0;
}
.kpi--cambio {
  border-color: var(--c360-primario);
  box-shadow: 0 0 0 3px rgb(42 120 214 / 0.18);
}
.kpi__cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
}
.kpi__titulo {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--c360-texto-suave);
}
.kpi__valor {
  margin: 0.2rem 0 0;
  font-size: 1.9rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.kpi__detalle {
  margin: 0.3rem 0 0;
  font-size: 0.8rem;
  color: var(--c360-texto-suave);
}
.kpi__definicion {
  margin: 0.6rem 0 0;
  padding: 0.5rem 0.65rem;
  background: #f1f5fb;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  line-height: 1.4;
}
</style>
