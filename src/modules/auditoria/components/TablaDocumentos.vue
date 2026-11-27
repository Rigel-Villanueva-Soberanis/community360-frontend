<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import { etiquetaCampo, formatearValor, tonoEstado } from '../composables/useAuditoria'
import DetalleDocumento from './DetalleDocumento.vue'
import type { Documento } from '../types/auditoria.types'

defineProps<{
  columnas: string[]
  items: Documento[]
  etiqueta: string
  icono?: string
  tema?: string
}>()

/** Documento que se muestra completo en el modal (null = cerrado). */
const seleccionado = ref<Documento | null>(null)

const MAX = 60
const corto = (v: unknown) => {
  const t = formatearValor(v)
  return t.length > MAX ? `${t.slice(0, MAX)}…` : t
}

type Forma = 'id' | 'usuario' | 'estado' | null
const FORMAS: Record<string, Forma> = {
  id_interaccion: 'id',
  id: 'id',
  carga_id: 'id',
  id_usuario: 'usuario',
  estado_revision: 'estado',
  operacion: 'estado',
}
/** Cómo se dibuja una celda: etiqueta de color para identificadores y estados; texto normal para lo demás. */
const forma = (c: string, v: unknown): Forma =>
  typeof v === 'string' && v !== '' ? (FORMAS[c] ?? null) : null

/** Nombre de la fila del documento para el lector de pantalla. */
const identificador = (doc: Documento) => {
  const clave = ['id_interaccion', 'id', 'carga_id', 'id_usuario'].find((c) => doc[c])
  return clave ? formatearValor(doc[clave]) : ''
}
</script>

<template>
  <div class="tabla">
    <div class="tabla__scroll">
      <table :aria-label="etiqueta">
        <thead>
          <tr>
            <th v-for="(c, n) in columnas" :key="c" scope="col" :class="{ tabla__sec: n >= 2 }">
              {{ etiquetaCampo(c) }}
            </th>
            <th scope="col" class="tabla__ver"><span class="oculto">Ver más</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(doc, i) in items" :key="i">
            <!-- {{ }} escapa el contenido: un texto con <script> se ve como texto -->
            <td
              v-for="(c, n) in columnas"
              :key="c"
              :title="formatearValor(doc[c])"
              :class="{ tabla__sec: n >= 2 }"
            >
              <span v-if="forma(c, doc[c]) === 'id'" class="chip chip--id">{{
                corto(doc[c])
              }}</span>
              <span v-else-if="forma(c, doc[c]) === 'usuario'" class="chip chip--usuario"
                ><i class="chip__punto" />{{ corto(doc[c]) }}</span
              >
              <span
                v-else-if="forma(c, doc[c]) === 'estado'"
                class="chip chip--estado"
                :class="`tono--${tonoEstado(doc[c])}`"
                ><i class="chip__punto" />{{ corto(doc[c]) }}</span
              >
              <template v-else>{{ corto(doc[c]) }}</template>
            </td>
            <td class="tabla__ver">
              <Button
                icon="pi pi-eye"
                text
                rounded
                size="small"
                severity="secondary"
                aria-haspopup="dialog"
                :aria-label="`Ver más del registro ${identificador(doc) || i + 1}`"
                @click="seleccionado = doc"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <DetalleDocumento
      :documento="seleccionado"
      :etiqueta="etiqueta"
      :icono="icono"
      :tema="tema"
      @cerrar="seleccionado = null"
    />
  </div>
</template>

<style scoped>
.tabla__scroll {
  position: relative;
  overflow-x: auto;
  border-top: 1px solid #f1f5f9;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}
th,
td {
  text-align: left;
  padding: 0.8rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  max-width: 24rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
th {
  padding-block: 0.85rem;
  background: #f4f7fe;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
td {
  color: #1e293b;
  font-weight: 500;
}
tbody tr {
  transition: background 0.15s ease;
}
tbody tr:hover {
  background: rgb(239 246 255 / 0.6);
}
tbody tr:last-child td {
  border-bottom: 0;
}
.tabla__ver {
  width: 3.5rem;
  padding: 0.4rem 0.9rem;
  text-align: right;
}
.tabla__ver :deep(.p-button) {
  width: 2rem;
  height: 2rem;
  border-radius: 0.55rem;
  background: #eff6ff;
  color: #2563eb;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}
.tabla__ver :deep(.p-button:hover) {
  background: #2563eb;
  color: #fff;
}
.oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

/* Etiquetas de color para identificadores y estados. */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 100%;
  font-size: 0.75rem;
  white-space: nowrap;
}
.chip--id {
  padding: 0.2rem 0.6rem;
  border-radius: 0.4rem;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace;
  font-weight: 700;
}
.chip--usuario {
  padding: 0.15rem 0.65rem;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f1f5f9;
  color: #334155;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace;
  font-weight: 600;
}
.chip--usuario .chip__punto {
  background: #6366f1;
}
.chip--estado {
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  border: 1px solid;
  font-weight: 700;
}
.chip__punto {
  width: 0.45rem;
  height: 0.45rem;
  flex-shrink: 0;
  border-radius: 999px;
  background: currentColor;
}
.tono--ambar {
  color: #b45309;
  background: linear-gradient(90deg, #fffbeb, #fff7ed);
  border-color: #fcd34d;
}
.tono--verde {
  color: #047857;
  background: linear-gradient(90deg, #ecfdf5, #f0fdf4);
  border-color: #6ee7b7;
}
.tono--azul {
  color: #1d4ed8;
  background: linear-gradient(90deg, #eff6ff, #eef2ff);
  border-color: #93c5fd;
}
.tono--rojo {
  color: #b91c1c;
  background: linear-gradient(90deg, #fef2f2, #fff1f2);
  border-color: #fca5a5;
}
.tono--gris {
  color: #475569;
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* En pantallas angostas solo se ven las 2 primeras columnas; lo demás está en el modal. */
@media (max-width: 640px) {
  .tabla__sec {
    display: none;
  }
}
</style>
