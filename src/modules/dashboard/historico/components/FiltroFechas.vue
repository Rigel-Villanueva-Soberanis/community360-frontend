<script setup lang="ts">
import Button from 'primevue/button'
import { computed } from 'vue'
import { aFechaApi } from '@/core/utils/fechas'
import { PRESETS, diasEntre } from '../composables/useTendencia'

defineProps<{ error: string; cargando: boolean }>()
const desde = defineModel<string>('desde', { required: true })
const hasta = defineModel<string>('hasta', { required: true })

/** Rango rápido en uso: el que termina hoy y dura justo esos días. Si se edita una fecha a mano, ninguno queda marcado. */
const presetActivo = computed(
  () =>
    PRESETS.find(
      (p) =>
        hasta.value === aFechaApi(new Date()) && diasEntre(desde.value, hasta.value) === p.dias,
    )?.dias ?? null,
)
const emit = defineEmits<{ aplicar: []; preset: [dias: number] }>()
</script>

<template>
  <form class="filtro" novalidate @submit.prevent="emit('aplicar')">
    <div class="filtro__campo">
      <label for="f-desde">Desde</label>
      <input id="f-desde" v-model="desde" type="date" :max="hasta" required />
    </div>
    <div class="filtro__campo">
      <label for="f-hasta">Hasta</label>
      <input id="f-hasta" v-model="hasta" type="date" :min="desde" required />
    </div>
    <Button type="submit" label="Aplicar" icon="pi pi-check" size="small" :loading="cargando" />
    <div class="filtro__presets" role="group" aria-label="Rangos rápidos">
      <Button
        v-for="p in PRESETS"
        :key="p.dias"
        :label="`Últimos ${p.texto}`"
        size="small"
        :severity="presetActivo === p.dias ? 'primary' : 'secondary'"
        :outlined="presetActivo !== p.dias"
        :icon="presetActivo === p.dias ? 'pi pi-check' : undefined"
        :class="{ 'filtro__preset--activo': presetActivo === p.dias }"
        :aria-pressed="presetActivo === p.dias"
        @click="emit('preset', p.dias)"
      />
    </div>
    <p v-if="error" class="filtro__error" role="alert">{{ error }}</p>
  </form>
</template>

<style scoped>
.filtro {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
}
.filtro__campo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
}
.filtro__campo label {
  font-weight: 600;
}
.filtro__campo input {
  font: inherit;
  padding: 0.4rem 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.4rem;
  background: #fff;
  color: var(--c360-texto);
}
.filtro__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.filtro__error {
  flex-basis: 100%;
  margin: 0;
  color: #b3261e;
  font-size: 0.85rem;
}
</style>
