<script setup lang="ts">
import { computed } from 'vue'
import Chart from './ChartSuave.vue'
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

const ROJO = '#d03b3b'
const VERDE = '#0ca30c'
/** Solo las series que bajan de cero (sentimiento) resaltan los tramos negativos. */
const conNegativos = computed(() => props.min !== undefined && props.min < 0)
const hayNegativos = computed(() => props.valores.some((v) => v < 0))

/** Color de la línea: en series con negativos, verde arriba del cero y rojo abajo; en las demás, el color recibido. */
const colorLinea = computed(() => (conNegativos.value ? VERDE : props.color))

/** Eje ajustado a los datos (sin dejar de mostrar el cero) para que las bajadas se noten más. */
const limites = computed(() => {
  if (!conNegativos.value) return { min: props.min, max: props.max }
  const menor = Math.min(...props.valores, 0)
  const mayor = Math.max(...props.valores, 0)
  return {
    min: Math.max(props.min ?? -1, Math.min(-0.2, Math.floor(menor * 5) / 5 - 0.1)),
    max: Math.min(props.max ?? 1, Math.max(0.2, Math.ceil(mayor * 5) / 5 + 0.1)),
  }
})

function colorPorCero(chart: ChartJS): string | CanvasGradient {
  const area = chart.chartArea
  const y = chart.scales.y
  if (!area || !y) return VERDE
  const t = Math.min(1, Math.max(0, (y.getPixelForValue(0) - area.top) / (area.bottom - area.top)))
  const g = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom)
  g.addColorStop(0, VERDE)
  g.addColorStop(t, VERDE)
  g.addColorStop(t, ROJO)
  g.addColorStop(1, ROJO)
  return g
}

const datos = computed(() => ({
  labels: props.etiquetas,
  datasets: [
    {
      label: props.medida,
      data: props.valores,
      borderColor: colorLinea.value,
      borderWidth: 3,
      borderCapStyle: 'round' as const,
      borderJoinStyle: 'round' as const,
      tension: 0.35,
      // Solo se marcan el punto más alto y el último; el resto aparece al pasar el cursor.
      pointRadius: (c: { dataIndex: number }) =>
        c.dataIndex === indiceMax.value || c.dataIndex === props.valores.length - 1 ? 5 : 0,
      pointHoverRadius: 6,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: (c: { dataIndex: number }) =>
        (props.valores[c.dataIndex] ?? 0) < 0 && conNegativos.value ? ROJO : colorLinea.value,
      pointBorderWidth: 3,
      ...(conNegativos.value
        ? {
            // Relleno hacia el cero: verde arriba y rojo abajo, para que se note cuándo el ánimo es negativo.
            fill: { target: 'origin', above: `${VERDE}26`, below: `${ROJO}33` },
            // La línea cambia de verde a rojo justo al cruzar el cero.
            borderColor: (c: { chart: ChartJS }) => colorPorCero(c.chart),
          }
        : {
            fill: true,
            backgroundColor: (c: { chart: ChartJS }) => degradadoArea(c.chart, props.color),
          }),
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
      min: limites.value.min,
      max: limites.value.max,
      beginAtZero: props.min === undefined,
      border: { display: false, dash: RAYA },
      // La línea del cero (sentimiento neutro) se marca más fuerte y continua.
      grid: {
        ...GRILLA,
        color: (c: { tick?: { value: number } }) =>
          c.tick?.value === 0 && conNegativos.value ? '#64748b' : GRILLA.color,
        lineWidth: (c: { tick?: { value: number } }) =>
          c.tick?.value === 0 && conNegativos.value ? 2 : GRILLA.lineWidth,
      },
      ticks: { color: '#94a3b8', precision: props.decimales === 0 ? 0 : undefined },
    },
  },
}))

const leyendaNegativa = computed(() => conNegativos.value && hayNegativos.value)

const filas = computed(() => props.etiquetas.map((e, i) => [e, formato(props.valores[i] ?? 0)]))
</script>

<template>
  <div class="linea">
    <div class="linea__lienzo" :style="{ minHeight: alto }" role="img" :aria-label="descripcion">
      <Chart type="line" :data="datos" :options="opciones" class="linea__chart" />
    </div>
    <p v-if="leyendaNegativa" class="linea__aviso">
      <i class="pi pi-arrow-down" aria-hidden="true" /> En rojo, los tramos por debajo de cero (sentimiento
      negativo).
    </p>
    <TablaAlterna :columnas="['Fecha', medida]" :filas="filas" />
  </div>
</template>

<style scoped>
.linea {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1 1 auto;
  min-height: 0;
}
.linea__aviso {
  margin: 0;
  font-size: 0.8rem;
  color: #9c2323;
}
.linea__lienzo {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
}
.linea__lienzo > .linea__chart {
  position: absolute !important; /* PrimeVue fuerza "relative" en línea; así la gráfica no empuja la altura de su tarjeta */
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
