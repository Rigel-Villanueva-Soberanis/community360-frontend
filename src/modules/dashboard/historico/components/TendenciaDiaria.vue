<script setup lang="ts">
import { computed } from 'vue'
import TarjetaGrafica from '@/shared/components/TarjetaGrafica.vue'
import GraficaLinea from '@/shared/components/GraficaLinea.vue'
import FiltroFechas from './FiltroFechas.vue'
import { CATEGORICA } from '@/shared/utils/paleta'
import type { useTendencia } from '../composables/useTendencia'

const props = defineProps<{ tendencia: ReturnType<typeof useTendencia> }>()
const t = props.tendencia

const etiquetas = computed(() => t.dias.value.map((d) => d.fecha))
const totales = computed(() => t.dias.value.map((d) => d.total))
const sentimientos = computed(() => t.dias.value.map((d) => d.sentimiento))
</script>

<template>
  <div class="tendencia">
    <FiltroFechas
      v-model:desde="t.desde.value"
      v-model:hasta="t.hasta.value"
      :error="t.errorRango.value"
      :cargando="t.cargando.value"
      @aplicar="t.aplicar()"
      @preset="t.usarPreset($event)"
    />
    <TarjetaGrafica
      titulo="Tendencia diaria"
      subtitulo="Histórico · por día"
      definicion="Para cada día del rango: cuántas interacciones hubo y el sentimiento promedio de ese día. El rango incluye el día final y abarca como máximo 366 días. Son dos gráficas porque las dos medidas tienen escalas distintas."
      :cargando="t.cargando.value"
      :error="t.error.value"
      :vacio="etiquetas.length === 0"
      mensaje-vacio="No hay interacciones en este rango de fechas."
      @reintentar="t.aplicar()"
    >
      <div class="tendencia__graficas">
        <div>
          <h4>Interacciones por día</h4>
          <GraficaLinea
            :etiquetas="etiquetas"
            :valores="totales"
            medida="Interacciones"
            :color="CATEGORICA[0]"
            alto="14rem"
            descripcion="Gráfica de líneas: cantidad de interacciones por día"
          />
        </div>
        <div>
          <h4>Sentimiento promedio por día</h4>
          <GraficaLinea
            :etiquetas="etiquetas"
            :valores="sentimientos"
            medida="Sentimiento promedio"
            :color="CATEGORICA[1]"
            alto="14rem"
            :min="-1"
            :max="1"
            :decimales="2"
            descripcion="Gráfica de líneas: sentimiento promedio por día, de menos uno a uno"
          />
        </div>
      </div>
    </TarjetaGrafica>
  </div>
</template>

<style scoped>
.tendencia {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.tendencia > :deep(.tarjeta) {
  flex: 1 1 auto;
}
.tendencia__graficas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  flex: 1 1 auto;
  min-height: 0;
}
.tendencia__graficas > div {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
@media (max-width: 899px) {
  .tendencia__graficas {
    grid-template-columns: minmax(0, 1fr);
  }
}
.tendencia__graficas h4 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
}
</style>
