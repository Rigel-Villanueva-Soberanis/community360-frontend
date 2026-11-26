<script setup lang="ts">
import { RouterLink } from 'vue-router'
import PantallaVacia from './PantallaVacia.vue'
</script>

<template>
  <PantallaVacia
    icono="pi pi-lock"
    titulo="No tienes permiso para ver esta página"
    detalle="Tu rol no incluye este apartado. Si crees que es un error, contacta al administrador."
  >
    <RouterLink to="/dashboard">Volver al dashboard</RouterLink>
  </PantallaVacia>
</template>
