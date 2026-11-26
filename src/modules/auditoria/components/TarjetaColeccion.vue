<script setup lang="ts">
export type TemaTarjeta = 'azul' | 'indigo' | 'cyan' | 'gris'

defineProps<{
  titulo: string
  /** Valor ya formateado para mostrar. */
  valor: string
  detalle?: string
  icono: string
  tema: TemaTarjeta
}>()
</script>

<template>
  <article class="tarjeta" :class="`tarjeta--${tema}`">
    <span class="tarjeta__esquina" aria-hidden="true" />
    <header class="tarjeta__cabecera">
      <h3 class="tarjeta__titulo">{{ titulo }}</h3>
      <span class="tarjeta__icono" aria-hidden="true"><i :class="icono" /></span>
    </header>
    <p class="tarjeta__valor">{{ valor }}</p>
    <p v-if="detalle" class="tarjeta__detalle">{{ detalle }}</p>
  </article>
</template>

<style scoped>
.tarjeta {
  --borde: #bfdbfe;
  --pastilla-fondo: #eff6ff;
  --pastilla-texto: #1d4ed8;
  --icono-fondo: #dbeafe;
  --icono-texto: #2563eb;
  --num-a: #2563eb;
  --num-b: #4338ca;
  --esquina: rgb(96 165 250 / 0.22);
  position: relative;
  overflow: hidden;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.1rem 1.25rem;
  background: var(--c360-tarjeta);
  border: 1px solid var(--borde);
  border-radius: 1rem;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.05);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
.tarjeta:hover {
  box-shadow: 0 10px 22px -12px rgb(15 23 42 / 0.25);
}
.tarjeta--indigo {
  --borde: #c7d2fe;
  --pastilla-fondo: #eef2ff;
  --pastilla-texto: #4338ca;
  --icono-fondo: #e0e7ff;
  --icono-texto: #4f46e5;
  --num-a: #4f46e5;
  --num-b: #9333ea;
  --esquina: rgb(167 139 250 / 0.22);
}
.tarjeta--cyan {
  --borde: #a5f3fc;
  --pastilla-fondo: #ecfeff;
  --pastilla-texto: #155e75;
  --icono-fondo: #cffafe;
  --icono-texto: #0e7490;
  --num-a: #0e7490;
  --num-b: #0d9488;
  --esquina: rgb(34 211 238 / 0.2);
}
.tarjeta--gris {
  --borde: #e2e8f0;
  --pastilla-fondo: #f1f5f9;
  --pastilla-texto: #334155;
  --icono-fondo: #f1f5f9;
  --icono-texto: #475569;
  --num-a: #334155;
  --num-b: #334155;
  --esquina: rgb(251 191 36 / 0.16);
}
.tarjeta__esquina {
  position: absolute;
  top: 0;
  right: 0;
  width: 6rem;
  height: 6rem;
  border-bottom-left-radius: 100%;
  background: linear-gradient(135deg, var(--esquina), transparent);
  pointer-events: none;
}
.tarjeta__cabecera {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.tarjeta__titulo {
  margin: 0;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--borde);
  background: var(--pastilla-fondo);
  color: var(--pastilla-texto);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.tarjeta__icono {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 0.55rem;
  background: var(--icono-fondo);
  color: var(--icono-texto);
}
.tarjeta__valor {
  position: relative;
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  background: linear-gradient(90deg, var(--num-a), var(--num-b));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.tarjeta__detalle {
  position: relative;
  margin: -0.45rem 0 0;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--c360-texto-suave);
}
</style>
