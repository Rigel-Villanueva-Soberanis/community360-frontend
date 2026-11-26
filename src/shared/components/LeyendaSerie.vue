<script setup lang="ts">
export interface ItemLeyenda {
  etiqueta: string
  color: string
  texto?: string
}
defineProps<{ items: ItemLeyenda[] }>()
</script>

<template>
  <ul class="leyenda">
    <li v-for="i in items" :key="i.etiqueta" class="leyenda__item">
      <span class="leyenda__color" :style="{ background: i.color }" aria-hidden="true" />
      <span class="leyenda__etiqueta">{{ i.etiqueta }}</span>
      <span v-if="i.texto" class="leyenda__valor">{{ i.texto }}</span>
    </li>
  </ul>
</template>

<style scoped>
.leyenda {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.875rem;
}
.leyenda__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.leyenda__color {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 0.2rem;
  flex: none;
}
.leyenda__etiqueta {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.leyenda__valor {
  font-variant-numeric: tabular-nums;
  color: var(--c360-texto-suave);
}
</style>
