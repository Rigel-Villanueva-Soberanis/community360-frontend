<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { usePermisos } from '@/core/auth/usePermisos'
import { MENU } from './menu'

defineProps<{ compacto?: boolean }>()
const emit = defineEmits<{ navegar: [] }>()
const { puede } = usePermisos()
const opciones = computed(() => MENU.filter((o) => puede(o.permiso)))
/** Nombre del grupo solo en la primera opción de cada grupo. */
const encabezado = (i: number) =>
  opciones.value[i]?.grupo && opciones.value[i]?.grupo !== opciones.value[i - 1]?.grupo
    ? opciones.value[i]?.grupo
    : ''
</script>

<template>
  <nav class="menu" :class="{ 'menu--compacto': compacto }" aria-label="Menú principal">
    <template v-for="(o, i) in opciones" :key="o.ruta">
      <p v-if="encabezado(i)" class="menu__grupo" :class="{ 'menu__grupo--primero': i === 0 }">
        <span class="menu__grupo-texto">{{ encabezado(i) }}</span>
      </p>
      <RouterLink
        :to="o.ruta"
        class="menu__opcion"
        active-class="menu__opcion--activa"
        :title="compacto ? o.texto : undefined"
        @click="emit('navegar')"
      >
        <i :class="o.icono" aria-hidden="true" />
        <span class="menu__texto">{{ o.texto }}</span>
      </RouterLink>
    </template>
  </nav>
</template>

<style scoped>
.menu {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem;
}
.menu__grupo {
  margin: 0.9rem 0.9rem 0.2rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}
.menu__grupo--primero {
  margin-top: 0.2rem;
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
  /* Plegado: el nombre del grupo se vuelve una línea fina de separación */
  .menu--compacto .menu__grupo {
    width: 1.6rem;
    height: 1px;
    margin: 0.6rem 0;
    background: #e2e8f0;
  }
  .menu--compacto .menu__grupo--primero {
    display: none;
  }
  .menu--compacto .menu__grupo-texto {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
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
