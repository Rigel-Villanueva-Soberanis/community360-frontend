<script setup lang="ts">
import { computed } from 'vue'
import Chart from 'primevue/chart'
import TablaAlterna from './TablaAlterna.vue'
import { CATEGORICA, colorDe, etiquetaLegible } from '@/shared/utils/paleta'
import { decimal, entero } from '@/shared/utils/formato'
import {
  GRILLA,
  RAYA,
  degradadoBarra,
  pistaBarras,
  valoresEnBarras,
} from '@/shared/utils/estiloGraficas'
import type { Chart as ChartJS } from 'chart.js'

export interface PuntoBarra {
  etiqueta: string
  valor: number
  total?: number
}

const props = withDefaults(
  defineProps<{
    items: PuntoBarra[]
    descripcion: string
    /** Nombre de la medida (eje y tabla), p. ej. "Usuarios". */
    medida: string
    horizontal?: boolean
    /** true: cada barra toma el color de su entidad; false: un solo color (una sola serie). */
    colorPorEntidad?: boolean
    /** Decimales de los valores (0 para conteos). */
    decimales?: number
    min?: number
    max?: number
    alto?: string
  }>(),
  { horizontal: false, colorPorEntidad: false, decimales: 0, alto: '15rem' },
)

const formato = (n: number) => (props.decimales === 0 ? entero(n) : decimal(n, props.decimales))

const datos = computed(() => ({
  labels: props.items.map((i) => etiquetaLegible(i.etiqueta)),
  datasets: [
    {
      label: props.medida,
      data: props.items.map((i) => i.valor),
      // Degradado por barra: el color de la entidad (o el azul base) de más claro a pleno.
      backgroundColor: (ctx: { chart: ChartJS; dataIndex: number }) => {
        const item = props.items[ctx.dataIndex]
        const c = props.colorPorEntidad && item ? colorDe(item.etiqueta) : CATEGORICA[0]
        return degradadoBarra(ctx.chart, c, props.horizontal)
      },
      borderRadius: props.horizontal
        ? 8
        : { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
      borderSkipped: false,
      maxBarThickness: props.horizontal ? 16 : 34,
    },
  ],
}))

const ejeValor = computed(() => ({
  beginAtZero: props.min === undefined,
  min: props.min,
  max: props.max,
  border: { display: false, dash: RAYA },
  grid: GRILLA,
  ticks: { color: '#94a3b8', precision: props.decimales === 0 ? 0 : undefined },
}))
/** En horizontales, un nombre largo se parte en dos renglones para que no se corte contra el borde. */
function partir(texto: string): string | string[] {
  if (texto.length <= 15 || !texto.includes(' ')) return texto
  const mitad = texto.length / 2
  let corte = -1
  for (let i = 0; i < texto.length; i++) {
    if (texto[i] === ' ' && (corte < 0 || Math.abs(i - mitad) < Math.abs(corte - mitad))) corte = i
  }
  return [texto.slice(0, corte), texto.slice(corte + 1)]
}
const ejeCategoria = computed(() => ({
  border: { color: '#d5dbe4' },
  grid: { display: false },
  ticks: {
    color: '#334155',
    // En horizontales cada barra lleva su nombre: nunca se omite una etiqueta por falta de espacio.
    autoSkip: !props.horizontal,
    font: { weight: 600 as const, size: props.horizontal ? 11 : 12 },
    callback(this: { getLabelForValue(v: number): string }, valor: string | number) {
      const t = this.getLabelForValue(Number(valor))
      return props.horizontal ? partir(t) : t
    },
  },
}))

// Espacio para que el valor escrito junto a cada barra no se corte.
const holgura = computed(() =>
  props.horizontal
    ? { right: 40, left: props.min !== undefined && props.min < 0 ? 40 : 0 }
    : { top: 20 },
)
const plugins = computed(() => [
  pistaBarras(props.horizontal),
  valoresEnBarras(props.horizontal, formato),
])

const opciones = computed(() => ({
  maintainAspectRatio: false,
  indexAxis: props.horizontal ? ('y' as const) : ('x' as const),
  animation: { duration: 350 },
  layout: { padding: holgura.value },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (c: { parsed: { x: number; y: number } }) =>
          `${props.medida}: ${formato(props.horizontal ? c.parsed.x : c.parsed.y)}`,
      },
    },
  },
  scales: props.horizontal
    ? { x: ejeValor.value, y: ejeCategoria.value }
    : { x: ejeCategoria.value, y: ejeValor.value },
}))

const filas = computed(() =>
  props.items.map((i) => [etiquetaLegible(i.etiqueta), formato(i.valor)]),
)
</script>

<template>
  <div class="barras">
    <div class="barras__lienzo" :style="{ minHeight: alto }" role="img" :aria-label="descripcion">
      <Chart
        type="bar"
        :data="datos"
        :options="opciones"
        :plugins="plugins"
        class="barras__chart"
      />
    </div>
    <TablaAlterna :columnas="['Categoría', medida]" :filas="filas" />
  </div>
</template>

<style scoped>
.barras {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1 1 auto;
  min-height: 0;
}
.barras__lienzo {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
}
.barras__lienzo > .barras__chart {
  position: absolute !important; /* PrimeVue fuerza "relative" en línea; así la gráfica no empuja la altura de su tarjeta */
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
