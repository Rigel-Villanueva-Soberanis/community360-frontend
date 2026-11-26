<script setup lang="ts">
import { RouterLink } from 'vue-router'
import PantallaVacia from './PantallaVacia.vue'
</script>

<template>
  <PantallaVacia
    icono="pi pi-search"
    titulo="Página no encontrada"
    detalle="La dirección no existe."
  >
    <RouterLink to="/dashboard">Volver al dashboard</RouterLink>
  </PantallaVacia>
</template>
