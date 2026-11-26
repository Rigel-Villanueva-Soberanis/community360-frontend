<script setup lang="ts">
import { computed } from 'vue'
import {
  CAMPOS_CON_NOMBRES,
  etiquetaCampo,
  formatearValor,
  textoCelda,
} from '../composables/useAuditoria'

/**
 * Muestra cualquier valor de un documento de forma legible, sin JSON:
 * texto → texto; lista de textos → etiquetas; objeto → filas «campo: valor»; lista de objetos → bloques numerados.
 * Todo se escribe con {{ }} (se escapa): un texto con HTML se ve como texto.
 */
const props = withDefaults(defineProps<{ valor: unknown; nivel?: number; campo?: string }>(), {
  nivel: 0,
  campo: '',
})

/** En listas de nombres de campo («campos eliminados») cada etiqueta se muestra con su nombre legible. */
const texto = (x: unknown) =>
  CAMPOS_CON_NOMBRES.includes(props.campo) && typeof x === 'string'
    ? etiquetaCampo(x)
    : formatearValor(x)

const NIVEL_MAX = 4
const esObjeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const tipo = computed<'vacio' | 'simple' | 'etiquetas' | 'bloques' | 'objeto' | 'plano'>(() => {
  const v = props.valor
  if (v === null || v === undefined || v === '') return 'vacio'
  if (props.nivel >= NIVEL_MAX && typeof v === 'object') return 'plano' // demasiado profundo: se resume en una línea
  if (Array.isArray(v)) {
    if (v.length === 0) return 'vacio'
    return v.every((x) => typeof x !== 'object' || x === null) ? 'etiquetas' : 'bloques'
  }
  return esObjeto(v) ? (Object.keys(v).length ? 'objeto' : 'vacio') : 'simple'
})

const lista = computed(() => (Array.isArray(props.valor) ? props.valor : []))
const campos = computed(() => (esObjeto(props.valor) ? Object.entries(props.valor) : []))
</script>

<template>
  <span v-if="tipo === 'vacio'" class="vacio">—</span>
  <span v-else-if="tipo === 'simple'" :title="textoCelda(valor)">{{ formatearValor(valor) }}</span>
  <span v-else-if="tipo === 'plano'">{{ textoCelda(valor) }}</span>

  <ul v-else-if="tipo === 'etiquetas'" class="chips">
    <li v-for="(x, i) in lista" :key="i">{{ texto(x) }}</li>
  </ul>

  <ol v-else-if="tipo === 'bloques'" class="bloques">
    <li v-for="(x, i) in lista" :key="i">
      <ValorLegible :valor="x" :nivel="nivel + 1" />
    </li>
  </ol>

  <dl v-else class="sub" :class="{ 'sub--anidado': nivel > 0, 'sub--apilado': nivel > 1 }">
    <div v-for="[clave, v] in campos" :key="clave" class="sub__fila">
      <dt>{{ etiquetaCampo(clave) }}</dt>
      <dd><ValorLegible :valor="v" :nivel="nivel + 1" :campo="clave" /></dd>
    </div>
  </dl>
</template>

<style scoped>
.vacio {
  color: var(--c360-texto-suave, #6b7280);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.chips li {
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: #eaf2fc;
  color: #1d4f91;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}
.bloques {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: bloque;
}
.bloques > li {
  position: relative;
  counter-increment: bloque;
  padding: 0.5rem 0.65rem 0.5rem 2rem;
  border: 1px solid var(--c360-borde);
  border-radius: 0.5rem;
  background: #fafbfd;
}
.bloques > li::before {
  content: counter(bloque);
  position: absolute;
  left: 0.6rem;
  top: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--c360-texto-suave, #6b7280);
}
.sub {
  margin: 0;
  display: grid;
  gap: 0.35rem;
}
.sub--anidado {
  padding-left: 0.75rem;
  border-left: 3px solid #dbe6f5;
}
.sub__fila {
  display: grid;
  grid-template-columns: minmax(6rem, 9rem) minmax(0, 1fr);
  gap: 0.6rem;
}
/* Desde el segundo nivel el nombre va arriba del valor: así no se aprieta el texto. */
.sub--apilado .sub__fila {
  grid-template-columns: minmax(0, 1fr);
  gap: 0.05rem;
}
.sub--apilado dt {
  font-size: 0.78rem;
}
.sub dt {
  font-weight: 600;
  color: var(--c360-texto-suave, #6b7280);
  overflow-wrap: anywhere;
}
.sub dd {
  margin: 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
@media (max-width: 640px) {
  .sub__fila {
    grid-template-columns: 1fr;
    gap: 0.1rem;
  }
}
</style>
