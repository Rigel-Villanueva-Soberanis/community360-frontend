<script setup lang="ts">
defineProps<{ columnas: string[]; filas: string[][]; resumen?: string }>()
</script>

<template>
  <details class="tabla-alterna">
    <summary>{{ resumen ?? 'Ver tabla de datos' }}</summary>
    <div class="tabla-alterna__scroll">
      <table>
        <thead>
          <tr>
            <th v-for="c in columnas" :key="c" scope="col">{{ c }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(f, i) in filas" :key="i">
            <td v-for="(celda, j) in f" :key="j">{{ celda }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </details>
</template>

<style scoped>
.tabla-alterna {
  font-size: 0.85rem;
  border-top: 1px solid var(--c360-borde);
  padding-top: 0.75rem;
}
.tabla-alterna summary {
  cursor: pointer;
  color: var(--c360-primario);
  font-weight: 700;
  font-size: 0.8rem;
  width: fit-content;
}
.tabla-alterna__scroll {
  max-height: 14rem;
  overflow: auto;
  margin-top: 0.5rem;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  text-align: left;
  padding: 0.3rem 0.5rem;
  border-bottom: 1px solid var(--c360-borde);
  font-variant-numeric: tabular-nums;
}
</style>
