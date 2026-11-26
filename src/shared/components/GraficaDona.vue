<script setup lang="ts">
import { computed } from 'vue'
import Chart from 'primevue/chart'
import LeyendaSerie from './LeyendaSerie.vue'
import TablaAlterna from './TablaAlterna.vue'
import { colorDe, etiquetaLegible } from '@/shared/utils/paleta'
import { entero, porcentaje } from '@/shared/utils/formato'

export interface PuntoDona {
  etiqueta: string
  valor: number
  total: number
}

const props = defineProps<{
  items: PuntoDona[]
  /** Descripción para lectores de pantalla. */
  descripcion: string
  /** Color de cada porción; por defecto, el de la entidad. */
  color?: (etiqueta: string) => string
}>()

const colorDeItem = (e: string) => (props.color ?? colorDe)(e)

const datos = computed(() => ({
  labels: props.items.map((i) => etiquetaLegible(i.etiqueta)),
  datasets: [
    {
      data: props.items.map((i) => i.valor),
      backgroundColor: props.items.map((i) => colorDeItem(i.etiqueta)),
      borderColor: '#ffffff', // 2 px de separación entre porciones
      borderWidth: 2,
      hoverOffset: 6,
    },
  ],
}))

const opciones = computed(() => ({
  maintainAspectRatio: false,
  cutout: '62%',
  animation: { duration: 350 },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (c: { label: string; parsed: number; dataIndex: number }) =>
          `${c.label}: ${porcentaje(c.parsed)} (${entero(props.items[c.dataIndex]?.total ?? 0)})`,
      },
    },
  },
}))

const leyenda = computed(() =>
  props.items.map((i) => ({
    etiqueta: etiquetaLegible(i.etiqueta),
    color: colorDeItem(i.etiqueta),
    texto: `${porcentaje(i.valor)} · ${entero(i.total)}`,
  })),
)
const filas = computed(() =>
  props.items.map((i) => [etiquetaLegible(i.etiqueta), porcentaje(i.valor), entero(i.total)]),
)
</script>

<template>
  <div class="dona">
    <div class="dona__fila">
      <div class="dona__lienzo" role="img" :aria-label="descripcion">
        <Chart type="doughnut" :data="datos" :options="opciones" class="dona__chart" />
      </div>
      <LeyendaSerie :items="leyenda" class="dona__leyenda" />
    </div>
    <TablaAlterna :columnas="['Categoría', 'Porcentaje', 'Cantidad']" :filas="filas" />
  </div>
</template>

<style scoped>
.dona {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.dona__fila {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}
.dona__lienzo {
  position: relative;
  width: 11rem;
  height: 11rem;
  flex: none;
  margin: 0 auto;
}
.dona__chart {
  width: 100%;
  height: 100%;
}
.dona__leyenda {
  flex: 1 1 10rem;
}
</style>
