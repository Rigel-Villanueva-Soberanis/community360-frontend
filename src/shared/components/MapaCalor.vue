<script setup lang="ts">
import { computed } from 'vue'
import { SECUENCIAL } from '@/shared/utils/paleta'
import { entero } from '@/shared/utils/formato'

export interface CeldaCalor {
  dia: number
  hora: number
  total: number
}

const props = defineProps<{ celdas: CeldaCalor[] }>()

/** dia: 1 = domingo … 7 = sábado (lo que manda la API). Se muestra de lunes a domingo. */
const DIAS = [
  { dia: 2, corto: 'Lun', largo: 'lunes' },
  { dia: 3, corto: 'Mar', largo: 'martes' },
  { dia: 4, corto: 'Mié', largo: 'miércoles' },
  { dia: 5, corto: 'Jue', largo: 'jueves' },
  { dia: 6, corto: 'Vie', largo: 'viernes' },
  { dia: 7, corto: 'Sáb', largo: 'sábado' },
  { dia: 1, corto: 'Dom', largo: 'domingo' },
] as const
const HORAS = Array.from({ length: 24 }, (_, h) => h)

const matriz = computed(() => {
  const m = new Map<string, number>()
  for (const c of props.celdas) m.set(`${c.dia}-${c.hora}`, c.total)
  return m
})
const maximo = computed(() => Math.max(0, ...props.celdas.map((c) => c.total)))
const total = computed(() => props.celdas.reduce((a, c) => a + c.total, 0))

const valor = (dia: number, hora: number) => matriz.value.get(`${dia}-${hora}`) ?? 0

/** Sin actividad = gris muy claro; el resto se reparte en 6 tonos de la misma tonalidad azul (1 = poco, 6 = el máximo). */
const NIVELES = SECUENCIAL.length - 1
function nivel(v: number): number {
  if (v <= 0 || maximo.value <= 0) return -1
  return Math.max(1, Math.ceil((v / maximo.value) * NIVELES))
}
const color = (v: number) => (nivel(v) < 0 ? '#f1f3f6' : SECUENCIAL[nivel(v)]!)
const hora2 = (h: number) => String(h).padStart(2, '0')
const pasos = computed(() =>
  SECUENCIAL.slice(1).map((c, i) => ({
    color: c,
    hasta: Math.ceil(((i + 1) / NIVELES) * maximo.value),
  })),
)
</script>

<template>
  <div class="calor">
    <div class="calor__scroll">
      <table
        class="calor__tabla"
        :aria-label="`Mapa de calor de actividad por día y hora. Total: ${total} interacciones.`"
      >
        <colgroup>
          <col class="calor__col-dia" />
          <col v-for="h in HORAS" :key="h" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col"><span class="visualmente-oculto">Día</span></th>
            <th v-for="h in HORAS" :key="h" scope="col" class="calor__hora">
              <span v-if="h % 3 === 0">{{ hora2(h) }}</span>
              <span v-else class="visualmente-oculto">{{ hora2(h) }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in DIAS" :key="d.dia">
            <th scope="row" class="calor__dia">{{ d.corto }}</th>
            <td
              v-for="h in HORAS"
              :key="h"
              class="calor__celda"
              :style="{ background: color(valor(d.dia, h)) }"
              :title="`${d.largo} ${hora2(h)}:00: ${entero(valor(d.dia, h))} interacciones`"
            >
              <span class="visualmente-oculto">{{ valor(d.dia, h) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="calor__leyenda" aria-label="Escala de color">
      <span>Menos</span>
      <span class="calor__muestra" style="background: #f1f3f6" title="0" />
      <span
        v-for="p in pasos"
        :key="p.color"
        class="calor__muestra"
        :style="{ background: p.color }"
        :title="`hasta ${p.hasta}`"
      />
      <span>Más{{ maximo > 0 ? ` (máx. ${entero(maximo)})` : '' }}</span>
    </div>
  </div>
</template>

<style scoped>
.calor {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}
.calor__scroll {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  position: relative; /* contiene los textos ocultos (absolute) para que no ensanchen la página */
  overflow-x: auto;
}
.calor__tabla {
  border-collapse: separate;
  border-spacing: 2px;
  width: 100%;
  min-width: 30rem;
  max-width: 54rem; /* en pantallas muy grandes el mapa deja de crecer y se centra */
  margin-inline: auto;
  table-layout: fixed;
}
.calor__col-dia {
  width: 2.6rem;
}
.calor__dia {
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--c360-texto-suave);
}
.calor__hora {
  font-size: 0.65rem;
  font-weight: 400;
  color: var(--c360-texto-suave);
  text-align: left;
  overflow: visible;
  white-space: nowrap;
}
.calor__celda {
  border-radius: 6px;
  padding: 0;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
}
.calor__celda::before {
  content: '';
  display: block;
  padding-top: 100%; /* alto = ancho: cada celda es un cuadrado */
}
.calor__celda:hover {
  transform: scale(1.18);
  box-shadow: 0 0 0 2px #7aa8e6;
  position: relative;
  z-index: 1;
}
.calor__leyenda {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.6rem;
  font-size: 0.75rem;
  color: var(--c360-texto-suave);
  flex-wrap: wrap;
}
.calor__muestra {
  width: 1rem;
  height: 1rem;
  border-radius: 4px;
  display: inline-block;
}
.visualmente-oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
