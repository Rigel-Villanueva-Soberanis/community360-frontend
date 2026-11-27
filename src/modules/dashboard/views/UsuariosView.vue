<script setup lang="ts">
import UsuariosEstatus from '../historico/components/UsuariosEstatus.vue'
import UsuariosPlataforma from '../historico/components/UsuariosPlataforma.vue'
import UsuariosEdad from '../historico/components/UsuariosEdad.vue'
import UsuariosPais from '../historico/components/UsuariosPais.vue'
import { useHistoricos } from '../historico/composables/useHistoricos'

const { estatus, plataforma, edad, pais } = useHistoricos()
</script>

<template>
  <div class="pagina__rejilla">
    <UsuariosEstatus :recurso="estatus" />
    <UsuariosPlataforma :recurso="plataforma" />
    <UsuariosEdad :recurso="edad" />
    <UsuariosPais :recurso="pais" />
  </div>
</template>
