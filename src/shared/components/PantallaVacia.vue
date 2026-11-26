<script setup lang="ts">
defineProps<{ icono?: string; titulo: string; detalle?: string }>()
</script>

<template>
  <div class="vacia">
    <i :class="icono ?? 'pi pi-inbox'" aria-hidden="true" />
    <h2>{{ titulo }}</h2>
    <p v-if="detalle">{{ detalle }}</p>
    <slot />
  </div>
</template>

<style scoped>
.vacia {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--c360-texto-suave);
}
.vacia i {
  font-size: 2.5rem;
}
.vacia h2 {
  margin: 0;
  color: var(--c360-texto);
  font-size: 1.25rem;
}
.vacia p {
  margin: 0;
  max-width: 32rem;
}
</style>
