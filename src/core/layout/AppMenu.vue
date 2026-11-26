<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { usePermisos } from '@/core/auth/usePermisos'
import { MENU } from './menu'

defineProps<{ compacto?: boolean }>()
const emit = defineEmits<{ navegar: [] }>()
const { puede } = usePermisos()
const opciones = computed(() => MENU.filter((o) => puede(o.permiso)))
</script>

<template>
  <nav class="menu" :class="{ 'menu--compacto': compacto }" aria-label="Menú principal">
    <RouterLink
      v-for="o in opciones"
      :key="o.ruta"
      :to="o.ruta"
      class="menu__opcion"
      active-class="menu__opcion--activa"
      :title="compacto ? o.texto : undefined"
      @click="emit('navegar')"
    >
      <i :class="o.icono" aria-hidden="true" />
      <span class="menu__texto">{{ o.texto }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.menu {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem;
}
.menu__opcion {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem;
  border-radius: 0.75rem;
  color: #475569;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}
.menu__opcion i {
  font-size: 1.05rem;
  color: #94a3b8;
  flex-shrink: 0;
  transition: color 0.15s ease;
}
.menu__opcion:hover {
  background: #eef4fd;
  color: #2563eb;
}
.menu__opcion:hover i {
  color: #2563eb;
}
.menu__opcion--activa,
.menu__opcion--activa:hover {
  background: linear-gradient(90deg, #2563eb, #4f46e5);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 6px 14px -6px rgb(37 99 235 / 0.55);
}
.menu__opcion--activa i,
.menu__opcion--activa:hover i {
  color: #fff;
}
.menu__opcion:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Menú plegado: solo iconos, y solo en pantallas anchas (en celular el menú es un cajón y siempre va completo).
   El texto sigue disponible para lectores de pantalla. */
@media (min-width: 900px) {
  .menu--compacto {
    align-items: center;
  }
  .menu--compacto .menu__opcion {
    justify-content: center;
    padding: 0.7rem;
    width: 2.9rem;
    height: 2.9rem;
  }
  .menu--compacto .menu__texto {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
}
</style>
