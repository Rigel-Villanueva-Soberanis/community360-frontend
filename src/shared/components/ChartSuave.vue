<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Chart as ChartJS, ChartData, ChartOptions, ChartType, Plugin } from 'chart.js'

/**
 * Envoltura mínima de Chart.js. A diferencia del componente de PrimeVue (que destruye y vuelve a crear la gráfica
 * en cada cambio de datos, y por eso "parpadea" al llegar una actualización en vivo), esta crea la gráfica UNA vez
 * y, cuando cambian los datos, solo los actualiza: las barras, líneas y porciones se mueven suavemente a su nuevo valor.
 */
const props = defineProps<{
  type: ChartType
  data: object
  options?: object
  plugins?: Plugin[]
}>()

const lienzo = ref<HTMLCanvasElement | null>(null)
let grafica: ChartJS | null = null
let desmontado = false

function sincronizarDatos(destino: ChartData, origen: ChartData): void {
  destino.labels = origen.labels
  const nuevos = origen.datasets
  // Se conservan los datasets existentes (misma posición) para que Chart.js anime desde los valores anteriores.
  nuevos.forEach((ds, i) => {
    const actual = destino.datasets[i]
    if (actual) Object.assign(actual, ds)
    else destino.datasets.push(ds)
  })
  destino.datasets.length = nuevos.length
}

onMounted(async () => {
  try {
    const { default: Chart } = await import('chart.js/auto')
    if (desmontado || !lienzo.value) return
    grafica = new Chart(lienzo.value, {
      type: props.type,
      data: props.data as ChartData,
      options: props.options as ChartOptions,
      plugins: props.plugins,
    })
  } catch {
    grafica = null // sin canvas disponible (por ejemplo en pruebas): no hay nada que dibujar
  }
})

watch(
  () => [props.data, props.options] as const,
  ([data, options]) => {
    if (!grafica) return
    sincronizarDatos(grafica.data, data as ChartData)
    if (options) grafica.options = options as ChartOptions
    grafica.update()
  },
  { deep: true },
)

watch(
  () => props.type,
  () => {
    // Un cambio de tipo es raro; se reconstruye por completo.
    grafica?.destroy()
    grafica = null
    void import('chart.js/auto').then(({ default: Chart }) => {
      if (desmontado || !lienzo.value) return
      grafica = new Chart(lienzo.value, {
        type: props.type,
        data: props.data as ChartData,
        options: props.options as ChartOptions,
        plugins: props.plugins,
      })
    })
  },
)

onBeforeUnmount(() => {
  desmontado = true
  grafica?.destroy()
  grafica = null
})
</script>

<template>
  <div class="chart-suave"><canvas ref="lienzo" /></div>
</template>

<style scoped>
.chart-suave {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
