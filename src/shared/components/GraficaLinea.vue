<script setup lang="ts">
import { computed } from 'vue'
import Chart from 'primevue/chart'
import TablaAlterna from './TablaAlterna.vue'
import { CATEGORICA } from '@/shared/utils/paleta'
import { decimal, entero } from '@/shared/utils/formato'
import { GRILLA, RAYA, degradadoArea } from '@/shared/utils/estiloGraficas'
import type { Chart as ChartJS } from 'chart.js'

const props = withDefaults(
  defineProps<{
    etiquetas: string[]
    valores: number[]
    descripcion: string
    medida: string
    color?: string
    min?: number
    max?: number
    decimales?: number
    alto?: string
  }>(),
  { color: CATEGORICA[0], decimales: 0, alto: '14rem' },
)

const formato = (n: number) => (props.decimales === 0 ? entero(n) : decimal(n, props.decimales))

const indiceMax = computed(() => {
  let m = 0
  props.valores.forEach((v, i) => {
    if (v > (props.valores[m] ?? -Infinity)) m = i
  })
  return m
})

const datos = computed(() => ({
  labels: props.etiquetas,
  datasets: [
    {
      label: props.medida,
      data: props.valores,
      borderColor: props.color,
      borderWidth: 3,
      borderCapStyle: 'round' as const,
      borderJoinStyle: 'round' as const,
      tension: 0.35,
      // Solo se marcan el punto más alto y el último; el resto aparece al pasar el cursor.
      pointRadius: (c: { dataIndex: number }) =>
        c.dataIndex === indiceMax.value || c.dataIndex === props.valores.length - 1 ? 5 : 0,
      pointHoverRadius: 6,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: props.color,
      pointBorderWidth: 3,
      fill: true,
      backgroundColor: (c: { chart: ChartJS }) => degradadoArea(c.chart, props.color),
    },
  ],
}))

const opciones = computed(() => ({
  maintainAspectRatio: false,
  animation: { duration: 350 },
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (c: { parsed: { y: number } }) => `${props.medida}: ${formato(c.parsed.y)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { color: '#d5dbe4' },
      ticks: { color: '#94a3b8', maxTicksLimit: 8, maxRotation: 0 },
    },
    y: {
      min: props.min,
      max: props.max,
      beginAtZero: props.min === undefined,
      border: { display: false, dash: RAYA },
      // La línea del cero (sentimiento neutro) se marca más fuerte y continua.
      grid: {
        ...GRILLA,
        color: (c: { tick?: { value: number } }) =>
          c.tick?.value === 0 && props.min !== undefined && props.min < 0
            ? '#cbd5e1'
            : GRILLA.color,
      },
      ticks: { color: '#94a3b8', precision: props.decimales === 0 ? 0 : undefined },
    },
  },
}))

const filas = computed(() => props.etiquetas.map((e, i) => [e, formato(props.valores[i] ?? 0)]))
</script>

<template>
  <div class="linea">
    <div class="linea__lienzo" :style="{ height: alto }" role="img" :aria-label="descripcion">
      <Chart type="line" :data="datos" :options="opciones" class="linea__chart" />
    </div>
    <TablaAlterna :columnas="['Fecha', medida]" :filas="filas" />
  </div>
</template>

<style scoped>
.linea {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.linea__lienzo {
  position: relative;
  width: 100%;
}
.linea__chart {
  width: 100%;
  height: 100%;
}
</style>
