<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import PantallaVacia from '@/shared/components/PantallaVacia.vue'
import TarjetaColeccion, { type TemaTarjeta } from '../components/TarjetaColeccion.vue'
import TablaDocumentos from '../components/TablaDocumentos.vue'
import { useAuditoria } from '../composables/useAuditoria'
import { ESTADOS_REVISION, OPERACIONES_API, type Coleccion } from '../types/auditoria.types'
import { entero } from '@/shared/utils/formato'

const a = useAuditoria()

const PESTANAS: {
  clave: Coleccion
  texto: string
  resumen: string
  ayuda: string
  icono: string
  tema: TemaTarjeta
}[] = [
  {
    clave: 'cuarentena',
    texto: 'Cuarentena',
    resumen: 'cuarentena',
    icono: 'pi pi-exclamation-triangle',
    tema: 'azul',
    ayuda:
      'Interacciones cuyo usuario no existe, aisladas para revisarlas. Nunca incluyen ubicación.',
  },
  {
    clave: 'diario',
    texto: 'Diario de cambios',
    resumen: 'diario_cambios',
    icono: 'pi pi-sync',
    tema: 'indigo',
    ayuda:
      'Qué campos geográficos se quitaron por falta de consentimiento (no guarda el valor borrado).',
  },
  {
    clave: 'carga',
    texto: 'Bitácora de carga',
    resumen: 'bitacora_carga',
    icono: 'pi pi-cloud-upload',
    tema: 'cyan',
    ayuda: 'Resumen de cada corrida del proceso de limpieza y carga (ETL).',
  },
  {
    clave: 'api',
    texto: 'Bitácora de la API',
    resumen: 'bitacora_api',
    icono: 'pi pi-code',
    tema: 'gris',
    ayuda: 'Altas, modificaciones, bajas y rechazos de interacciones hechos por la API.',
  },
]
const conteo = (clave: string) => a.resumen.datos.value?.[clave]
const actual = computed(() => PESTANAS.find((p) => p.clave === a.coleccion.value))
</script>

<template>
  <div class="auditoria">
    <section class="auditoria__resumen" aria-label="Documentos por colección">
      <TarjetaColeccion
        v-for="p in PESTANAS"
        :key="p.clave"
        :titulo="p.texto"
        :valor="conteo(p.resumen) === undefined ? '—' : entero(conteo(p.resumen)!)"
        :icono="p.icono"
        :tema="p.tema"
        detalle="documentos"
      />
    </section>
    <p v-if="a.resumen.error.value" class="auditoria__error" role="alert">
      {{ a.resumen.error.value }}
      <Button label="Reintentar" size="small" text @click="a.resumen.cargar()" />
    </p>

    <section class="auditoria__panel">
      <div class="auditoria__pestanas" role="tablist" aria-label="Colección">
        <button
          v-for="p in PESTANAS"
          :id="`tab-${p.clave}`"
          :key="p.clave"
          type="button"
          role="tab"
          class="auditoria__pestana"
          :class="{ 'auditoria__pestana--activa': a.coleccion.value === p.clave }"
          :aria-selected="a.coleccion.value === p.clave"
          @click="a.coleccion.value = p.clave"
        >
          {{ p.texto }}
          <span
            v-if="a.coleccion.value === p.clave && conteo(p.resumen) !== undefined"
            class="auditoria__cuenta"
            >{{ entero(conteo(p.resumen)!) }}</span
          >
        </button>
      </div>

      <div role="tabpanel" class="auditoria__contenido">
        <div class="auditoria__barra">
          <p class="auditoria__ayuda">
            <span class="auditoria__ayuda-icono" aria-hidden="true"
              ><i class="pi pi-info-circle"
            /></span>
            <span>{{ actual?.ayuda }}</span>
          </p>

          <div v-if="a.coleccion.value === 'cuarentena'" class="auditoria__filtros">
            <label for="f-estado"
              ><i class="pi pi-filter" aria-hidden="true" />Estado de revisión</label
            >
            <select id="f-estado" v-model="a.estadoRevision.value">
              <option value="">Todos</option>
              <option v-for="e in ESTADOS_REVISION" :key="e" :value="e">{{ e }}</option>
            </select>
          </div>
          <div v-if="a.coleccion.value === 'api'" class="auditoria__filtros">
            <label for="f-operacion"><i class="pi pi-filter" aria-hidden="true" />Operación</label>
            <select id="f-operacion" v-model="a.operacion.value">
              <option value="">Todas</option>
              <option v-for="o in OPERACIONES_API" :key="o" :value="o">{{ o }}</option>
            </select>
          </div>
        </div>

        <p v-if="a.lista.error.value" class="auditoria__error" role="alert">
          {{ a.lista.error.value }}
          <Button label="Reintentar" size="small" text @click="a.lista.cargar()" />
        </p>
        <p
          v-else-if="a.lista.cargando.value && a.items.value.length === 0"
          class="auditoria__cargando"
        >
          Cargando…
        </p>
        <PantallaVacia
          v-else-if="a.items.value.length === 0"
          titulo="Sin documentos"
          detalle="No hay documentos para este filtro."
        />
        <template v-else>
          <TablaDocumentos
            :columnas="a.columnas.value"
            :items="a.items.value"
            :etiqueta="actual?.texto ?? ''"
            :icono="actual?.icono"
            :tema="actual?.tema"
          />
          <nav class="auditoria__paginas" aria-label="Paginación">
            <Button
              icon="pi pi-angle-left"
              label="Anterior"
              size="small"
              outlined
              :disabled="a.pagina.value <= 1"
              @click="a.irAPagina(a.pagina.value - 1)"
            />
            <span
              >Página {{ a.pagina.value }} de {{ a.totalPaginas.value }} ·
              {{ entero(a.lista.datos.value?.total ?? 0) }} documentos</span
            >
            <Button
              icon="pi pi-angle-right"
              icon-pos="right"
              label="Siguiente"
              size="small"
              outlined
              :disabled="a.pagina.value >= a.totalPaginas.value"
              @click="a.irAPagina(a.pagina.value + 1)"
            />
          </nav>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.auditoria {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 108rem;
  margin: 0 auto;
}
.auditoria__resumen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
  gap: 1rem;
}
.auditoria__panel {
  background: var(--c360-tarjeta);
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.04);
  overflow: hidden;
  min-width: 0;
}
.auditoria__pestanas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}
.auditoria__pestana {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  background: none;
  cursor: pointer;
  color: #475569;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}
.auditoria__pestana:hover {
  background: #f8fafc;
  color: #2563eb;
}
.auditoria__pestana:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
.auditoria__pestana--activa,
.auditoria__pestana--activa:hover {
  color: #1d4ed8;
  font-weight: 700;
  border-color: #bfdbfe;
  background: linear-gradient(90deg, #eff6ff, #eef2ff);
}
.auditoria__cuenta {
  padding: 0.05rem 0.5rem;
  border-radius: 999px;
  background: #2563eb;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
}
.auditoria__contenido {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.auditoria__barra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  margin: 1.1rem 1.25rem;
  padding: 0.85rem 1rem;
  border: 1px solid rgb(219 234 254 / 0.8);
  border-radius: 0.75rem;
  background: linear-gradient(90deg, rgb(239 246 255 / 0.6), rgb(238 242 255 / 0.3), transparent);
}
.auditoria__ayuda {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.45;
}
.auditoria__ayuda-icono {
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 0.5rem;
  background: #dbeafe;
  color: #2563eb;
}
.auditoria__filtros {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.78rem;
}
.auditoria__filtros label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 700;
  color: #334155;
  white-space: nowrap;
}
.auditoria__filtros label i {
  color: #2563eb;
  font-size: 0.75rem;
}
.auditoria__filtros select {
  font: inherit;
  font-weight: 600;
  min-width: 10rem;
  padding: 0.4rem 0.7rem;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  background: #fff;
  color: #1e293b;
  cursor: pointer;
}
.auditoria__filtros select:focus-visible {
  outline: 2px solid rgb(59 130 246 / 0.45);
  outline-offset: 1px;
  border-color: #3b82f6;
}
.auditoria__paginas {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid #f1f5f9;
  font-size: 0.82rem;
  color: #475569;
}
.auditoria__error {
  color: #b3261e;
  margin: 0 1.25rem 1rem;
}
.auditoria__cargando {
  color: var(--c360-texto-suave);
  margin: 0 1.25rem 1.25rem;
}
@media (max-width: 640px) {
  .auditoria__barra,
  .auditoria__pestanas {
    margin-inline: 0.75rem;
  }
  .auditoria__pestanas {
    margin: 0;
    padding-inline: 0.75rem;
  }
}
</style>
