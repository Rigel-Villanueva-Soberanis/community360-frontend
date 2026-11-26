<script setup lang="ts">
import Message from 'primevue/message'
import Button from 'primevue/button'
import EstadoConexion from '../envivo/components/EstadoConexion.vue'
import IndicadoresResumen from '../envivo/components/IndicadoresResumen.vue'
import DonaPlataforma from '../envivo/components/DonaPlataforma.vue'
import BarrasTipo from '../envivo/components/BarrasTipo.vue'
import ActividadHeatmap from '../envivo/components/ActividadHeatmap.vue'
import SentimientoTema from '../envivo/components/SentimientoTema.vue'
import EtiquetasTop from '../envivo/components/EtiquetasTop.vue'
import RegistroEventos from '../envivo/components/RegistroEventos.vue'
import { useMetricas } from '../envivo/composables/useMetricas'
import UsuariosEstatus from '../historico/components/UsuariosEstatus.vue'
import UsuariosPlataforma from '../historico/components/UsuariosPlataforma.vue'
import UsuariosEdad from '../historico/components/UsuariosEdad.vue'
import UsuariosPais from '../historico/components/UsuariosPais.vue'
import TendenciaDiaria from '../historico/components/TendenciaDiaria.vue'
import { useHistoricos } from '../historico/composables/useHistoricos'
import { useTendencia } from '../historico/composables/useTendencia'

const vivo = useMetricas()
const { estatus, plataforma, edad, pais } = useHistoricos()
const tendencia = useTendencia()
</script>

<template>
  <div class="dashboard">
    <section class="dashboard__seccion" aria-labelledby="titulo-envivo">
      <div class="dashboard__cabecera">
        <h2 id="titulo-envivo" class="dashboard__encabezado">
          En vivo <small>se actualiza solo por WebSocket</small>
        </h2>
        <EstadoConexion
          :estado="vivo.estado.value"
          :ultimo-mensaje-utc="vivo.ultimoMensajeUtc.value"
        />
      </div>

      <Message v-if="vivo.errorInicial.value" severity="error" :closable="false">
        {{ vivo.errorInicial.value }}
        <Button label="Reintentar" size="small" text @click="vivo.reintentarRespaldo()" />
      </Message>

      <template v-if="vivo.snapshot.value">
        <IndicadoresResumen :resumen="vivo.snapshot.value.resumen" />
        <div class="dashboard__rejilla">
          <DonaPlataforma :items="vivo.snapshot.value.porPlataforma" />
          <BarrasTipo :items="vivo.snapshot.value.porTipo" />
          <SentimientoTema :items="vivo.snapshot.value.sentimientoPorTema" />
          <EtiquetasTop :items="vivo.snapshot.value.etiquetasTop" />
        </div>
        <div class="dashboard__rejilla dashboard__rejilla--ancha">
          <ActividadHeatmap :celdas="vivo.snapshot.value.actividadPorHora" />
          <RegistroEventos :eventos="vivo.eventos.value" />
        </div>
      </template>
      <p v-else-if="!vivo.errorInicial.value" class="dashboard__cargando">Cargando indicadores…</p>
    </section>

    <section class="dashboard__seccion" aria-labelledby="titulo-historico">
      <h2 id="titulo-historico" class="dashboard__encabezado">
        Histórico <small>consultas a la API REST · datos de TiDB</small>
      </h2>
      <div class="dashboard__rejilla">
        <UsuariosEstatus :recurso="estatus" />
        <UsuariosPlataforma :recurso="plataforma" />
        <UsuariosEdad :recurso="edad" />
        <UsuariosPais :recurso="pais" />
      </div>
      <TendenciaDiaria :tendencia="tendencia" />
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 90rem;
  margin: 0 auto;
}
.dashboard__seccion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.dashboard__cabecera {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.dashboard__encabezado {
  margin: 0;
  font-size: 1.2rem;
}
.dashboard__encabezado small {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--c360-texto-suave);
  margin-left: 0.5rem;
}
.dashboard__rejilla {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: 1rem;
}
.dashboard__rejilla--ancha {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 26rem), 1fr));
}
.dashboard__cargando {
  color: var(--c360-texto-suave);
}
</style>
