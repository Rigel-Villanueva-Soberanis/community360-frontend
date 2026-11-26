<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import {
  camposOrdenados,
  etiquetaCampo,
  formatearValor,
  tonoEstado,
} from '../composables/useAuditoria'
import ValorLegible from './ValorLegible.vue'
import type { Documento } from '../types/auditoria.types'

const props = defineProps<{
  documento: Documento | null
  etiqueta: string
  icono?: string
  tema?: string
}>()
const emit = defineEmits<{ cerrar: [] }>()

const visible = computed({
  get: () => props.documento !== null,
  set: (v: boolean) => {
    if (!v) emit('cerrar')
  },
})

const texto = (v: unknown) => (typeof v === 'string' && v !== '' ? v : '')
const primero = (claves: string[]) =>
  claves.find((c) => props.documento && texto(props.documento[c]) !== '')

/* Campos destacados arriba: identificador, usuario y estado (los que existan). */
const claveId = computed(() => primero(['id_interaccion', 'id', 'carga_id']))
const claveEstado = computed(() => primero(['estado_revision', 'operacion']))
const hayUsuario = computed(() => primero(['id_usuario']) !== undefined)
const motivo = computed(() => texto(props.documento?.motivo))
const mensaje = computed(() => texto(props.documento?.texto))
const carga = computed(() => (claveId.value === 'carga_id' ? '' : texto(props.documento?.carga_id)))

const identificador = computed(() => (claveId.value ? texto(props.documento?.[claveId.value]) : ''))
const titulo = computed(() => props.etiqueta)

const USADOS = new Set([
  'id_interaccion',
  'id',
  'id_usuario',
  'estado_revision',
  'operacion',
  'motivo',
  'texto',
])
const esFecha = (c: string) => /fecha|aislado|inicio|^fin$|_en$|hora/.test(c)
const esCompleja = (v: unknown) => typeof v === 'object' && v !== null

/* El resto de campos, en tres grupos: fechas, datos simples y contenido anidado (listas y objetos). */
const resto = computed(() => {
  if (!props.documento) return []
  return camposOrdenados(props.documento).filter(
    (c) => !USADOS.has(c) && !(c === 'carga_id' && (carga.value || claveId.value === 'carga_id')),
  )
})
const fechas = computed(() =>
  resto.value.filter((c) => esFecha(c) && !esCompleja(props.documento?.[c])),
)
const datos = computed(() =>
  resto.value.filter((c) => !esFecha(c) && !esCompleja(props.documento?.[c])),
)
const anidados = computed(() => resto.value.filter((c) => esCompleja(props.documento?.[c])))

const copiado = ref(false)
async function copiarCarga() {
  try {
    await navigator.clipboard?.writeText(carga.value)
    copiado.value = true
    setTimeout(() => (copiado.value = false), 1600)
  } catch {
    /* sin permiso para el portapapeles: no pasa nada */
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissable-mask
    :draggable="false"
    :style="{ width: 'min(48rem, 94vw)' }"
    :pt="{
      root: { class: 'detalle' },
      header: { class: 'detalle__cabecera' },
      content: { class: 'detalle__cuerpo' },
      footer: { class: 'detalle__pie' },
    }"
  >
    <template #header>
      <span class="detalle__icono" :class="`detalle__icono--${tema ?? 'azul'}`" aria-hidden="true">
        <i :class="icono ?? 'pi pi-file'" />
      </span>
      <span class="detalle__titulos">
        <span class="detalle__titulo"
          >{{ titulo }}
          <template v-if="identificador"
            ><span class="detalle__sep">·</span>
            <span class="detalle__id">{{ identificador }}</span></template
          ></span
        >
        <span class="detalle__subtitulo">Detalle completo del registro</span>
      </span>
    </template>

    <div v-if="documento" class="detalle__contenido">
      <!-- Identificadores principales -->
      <div v-if="claveId || hayUsuario || claveEstado" class="detalle__ids">
        <div v-if="claveId" class="detalle__ficha">
          <span class="detalle__rotulo">{{ etiquetaCampo(claveId) }}</span>
          <span class="chip chip--id">{{ identificador }}</span>
        </div>
        <div v-if="hayUsuario" class="detalle__ficha">
          <span class="detalle__rotulo">Usuario</span>
          <span class="chip chip--usuario"
            ><i class="chip__punto" />{{ formatearValor(documento.id_usuario) }}</span
          >
        </div>
        <div v-if="claveEstado" class="detalle__ficha">
          <span class="detalle__rotulo">{{ etiquetaCampo(claveEstado) }}</span>
          <span class="chip chip--estado" :class="`tono--${tonoEstado(documento[claveEstado])}`"
            ><i class="chip__punto" />{{ formatearValor(documento[claveEstado]) }}</span
          >
        </div>
      </div>

      <!-- Motivo (alerta destacada) -->
      <div v-if="motivo" class="detalle__alerta">
        <span class="detalle__alerta-icono" aria-hidden="true"
          ><i class="pi pi-info-circle"
        /></span>
        <div>
          <div class="detalle__rotulo detalle__rotulo--ambar">Motivo</div>
          <div class="detalle__alerta-texto">{{ motivo }}</div>
        </div>
      </div>

      <!-- Texto de la interacción -->
      <section v-if="mensaje" class="detalle__tarjeta">
        <h3 class="detalle__h3"><i class="pi pi-comment" aria-hidden="true" />Texto</h3>
        <blockquote class="detalle__cita">{{ mensaje }}</blockquote>
        <p class="detalle__nota">
          Longitud: <strong>{{ mensaje.length }}</strong> caracteres
        </p>
      </section>

      <!-- Fechas y datos -->
      <div v-if="fechas.length || datos.length" class="detalle__rejilla">
        <section v-if="fechas.length" class="detalle__tarjeta">
          <h3 class="detalle__h3"><i class="pi pi-clock" aria-hidden="true" />Fechas</h3>
          <dl class="detalle__lista">
            <div v-for="c in fechas" :key="c" class="detalle__fila">
              <dt>{{ etiquetaCampo(c) }}</dt>
              <dd><ValorLegible :valor="documento[c]" :campo="c" /></dd>
            </div>
          </dl>
        </section>
        <section v-if="datos.length" class="detalle__tarjeta">
          <h3 class="detalle__h3"><i class="pi pi-list" aria-hidden="true" />Datos</h3>
          <dl class="detalle__lista">
            <div v-for="c in datos" :key="c" class="detalle__fila">
              <dt>{{ etiquetaCampo(c) }}</dt>
              <dd><ValorLegible :valor="documento[c]" :campo="c" /></dd>
            </div>
          </dl>
        </section>
      </div>

      <!-- Listas y objetos anidados -->
      <section v-for="c in anidados" :key="c" class="detalle__tarjeta">
        <h3 class="detalle__h3">
          <i class="pi pi-sitemap" aria-hidden="true" />{{ etiquetaCampo(c) }}
        </h3>
        <ValorLegible :valor="documento[c]" :campo="c" />
      </section>

      <!-- Carga -->
      <div v-if="carga" class="detalle__carga">
        <span class="detalle__carga-texto"
          ><strong>Carga:</strong> <span class="detalle__mono">{{ carga }}</span></span
        >
        <Button
          :icon="copiado ? 'pi pi-check' : 'pi pi-copy'"
          text
          rounded
          size="small"
          severity="secondary"
          :aria-label="copiado ? 'Identificador copiado' : 'Copiar identificador de carga'"
          @click="copiarCarga"
        />
      </div>
    </div>

    <template #footer>
      <Button label="Cerrar" severity="secondary" outlined @click="visible = false" />
    </template>
  </Dialog>
</template>

<!-- Sin «scoped»: el modal se dibuja fuera del componente (teleport al body). Todo va bajo .detalle. -->
<style>
.detalle {
  border: 1px solid #e2e8f0;
  border-radius: 1.4rem;
  overflow: hidden;
  box-shadow:
    0 25px 60px -15px rgb(15 23 42 / 0.28),
    0 0 0 1px rgb(226 232 240 / 0.8);
}
.detalle .detalle__cabecera {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.1rem 1.5rem;
  background: linear-gradient(90deg, #f8fafc, #fff 50%, rgb(239 246 255 / 0.6));
  border-bottom: 1px solid #f1f5f9;
}
.detalle .detalle__cabecera .p-dialog-header-actions {
  margin-left: auto;
}
.detalle .detalle__cabecera .p-dialog-close-button {
  width: 2.1rem;
  height: 2.1rem;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  color: #94a3b8;
  background: #fff;
}
.detalle .detalle__cabecera .p-dialog-close-button:hover {
  color: #334155;
  background: #f1f5f9;
}
.detalle .detalle__cuerpo {
  padding: 1.4rem 1.5rem;
  background: #fff;
}
.detalle .detalle__pie {
  padding: 0.9rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}
.detalle__icono {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: 0.9rem;
  border: 1px solid transparent;
  font-size: 1.05rem;
}
.detalle__icono--azul {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
}
.detalle__icono--indigo {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #4f46e5;
}
.detalle__icono--cyan {
  background: #ecfeff;
  border-color: #a5f3fc;
  color: #0e7490;
}
.detalle__icono--gris {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}
.detalle__titulos {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.detalle__titulo {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}
.detalle__sep {
  color: #94a3b8;
  font-weight: 400;
  margin: 0 0.15rem;
}
.detalle__id,
.detalle__mono {
  font-family: ui-monospace, 'JetBrains Mono', SFMono-Regular, Menlo, Consolas, monospace;
}
.detalle__id {
  color: #1d4ed8;
  font-size: 1rem;
  font-weight: 600;
}
.detalle__subtitulo {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.1rem;
}

.detalle__contenido {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.detalle__ids {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 0.75rem;
  padding: 0.9rem;
  border: 1px solid rgb(226 232 240 / 0.7);
  border-radius: 1rem;
  background: rgb(248 250 252 / 0.8);
}
.detalle__ficha {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  padding: 0.75rem 0.9rem;
  background: #fff;
  border: 1px solid rgb(226 232 240 / 0.8);
  border-radius: 0.8rem;
  box-shadow: 0 2px 10px rgb(0 0 0 / 0.04);
  min-width: 0;
}
.detalle__rotulo {
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
}
.detalle__rotulo--ambar {
  color: #92400e;
}

.detalle__alerta {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  background: rgb(245 158 11 / 0.1);
  border: 1px solid rgb(253 230 138 / 0.9);
  border-radius: 1rem;
}
.detalle__alerta-icono {
  width: 1.9rem;
  height: 1.9rem;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 0.55rem;
  background: #f59e0b;
  color: #fff;
}
.detalle__alerta-texto {
  margin-top: 0.15rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: #451a03;
  overflow-wrap: anywhere;
}

.detalle__tarjeta {
  padding: 1rem 1.1rem;
  background: #fff;
  border: 1px solid rgb(226 232 240 / 0.9);
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgb(0 0 0 / 0.04);
  min-width: 0;
}
.detalle .detalle__tarjeta {
  font-size: 0.8rem;
  color: #1e293b;
}
.detalle__h3 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.7rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
}
.detalle__h3 i {
  color: #2563eb;
  font-size: 0.8rem;
}
.detalle__cita {
  margin: 0;
  padding: 0.9rem 1rem;
  font-size: 0.98rem;
  line-height: 1.6;
  font-style: italic;
  color: #1e293b;
  background: rgb(248 250 252 / 0.8);
  border: 1px solid #f1f5f9;
  border-radius: 0.75rem;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
.detalle__nota {
  margin: 0.6rem 0 0;
  font-size: 0.74rem;
  color: #94a3b8;
}
.detalle__nota strong {
  color: #334155;
  font-weight: 600;
}
.detalle__rejilla {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
  align-items: start;
}
.detalle__lista {
  margin: 0;
  display: flex;
  flex-direction: column;
}
.detalle__fila {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.8rem;
}
.detalle__fila:first-child {
  padding-top: 0;
}
.detalle__fila:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}
.detalle__fila dt {
  color: #64748b;
  font-size: 0.76rem;
  flex-shrink: 0;
}
.detalle__fila dd {
  margin: 0;
  font-weight: 600;
  color: #1e293b;
  text-align: right;
  overflow-wrap: anywhere;
  min-width: 0;
}
.detalle__carga {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.5rem 0.5rem 0.9rem;
  background: #f8fafc;
  border: 1px solid rgb(226 232 240 / 0.8);
  border-radius: 0.8rem;
  font-size: 0.78rem;
  color: #475569;
}
.detalle__carga-texto {
  min-width: 0;
  overflow-wrap: anywhere;
}

/* Etiquetas de color (las mismas que en la tabla) */
.detalle .chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 100%;
  padding: 0.2rem 0.65rem;
  border-radius: 0.45rem;
  border: 1px solid transparent;
  font-size: 0.8rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.detalle .chip--id {
  font-family: ui-monospace, 'JetBrains Mono', SFMono-Regular, Menlo, Consolas, monospace;
  color: #1d4ed8;
  background: #eff6ff;
  border-color: rgb(191 219 254 / 0.7);
}
.detalle .chip--usuario {
  font-family: ui-monospace, 'JetBrains Mono', SFMono-Regular, Menlo, Consolas, monospace;
  color: #1e293b;
  background: #f1f5f9;
}
.detalle .chip--estado {
  border-radius: 999px;
  padding: 0.25rem 0.8rem;
  font-size: 0.76rem;
  font-weight: 600;
}
.detalle .chip__punto {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}
.detalle .chip--usuario .chip__punto {
  background: #2563eb;
}
.detalle .tono--ambar {
  color: #b45309;
  background: #fffbeb;
  border-color: #fde68a;
}
.detalle .tono--verde {
  color: #047857;
  background: #ecfdf5;
  border-color: #a7f3d0;
}
.detalle .tono--azul {
  color: #1d4ed8;
  background: #eff6ff;
  border-color: #bfdbfe;
}
.detalle .tono--rojo {
  color: #be123c;
  background: #fff1f2;
  border-color: #fecdd3;
}
.detalle .tono--gris {
  color: #475569;
  background: #f1f5f9;
  border-color: #cbd5e1;
}
@media (max-width: 640px) {
  .detalle .detalle__cabecera,
  .detalle .detalle__cuerpo,
  .detalle .detalle__pie {
    padding-inline: 1rem;
  }
  .detalle__fila {
    flex-direction: column;
    gap: 0.15rem;
  }
  .detalle__fila dd {
    text-align: left;
  }
}
</style>
