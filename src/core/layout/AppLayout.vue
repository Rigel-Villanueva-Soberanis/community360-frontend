<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import AppMenu from './AppMenu.vue'
import { useSesionStore } from '@/core/auth/sesion.store'

const sesion = useSesionStore()
const route = useRoute()
const router = useRouter()
const menuAbierto = ref(false)

/** Menú plegado (solo iconos) en pantallas anchas. Se recuerda en este navegador; si no hay almacenamiento, no pasa nada. */
const CLAVE_PLEGADO = 'c360.menuPlegado'
function leerPlegado(): boolean {
  try {
    return localStorage.getItem(CLAVE_PLEGADO) === '1'
  } catch {
    return false
  }
}
const plegado = ref(leerPlegado())
function alternarPlegado() {
  plegado.value = !plegado.value
  try {
    localStorage.setItem(CLAVE_PLEGADO, plegado.value ? '1' : '0')
  } catch {
    /* sin almacenamiento: el estado vale solo para esta sesión */
  }
}

const iniciales = computed(() => (sesion.usuario?.nombreUsuario ?? '?').slice(0, 2).toUpperCase())

async function salir() {
  await sesion.cerrar()
  await router.replace('/login')
}
</script>

<template>
  <div class="app" :class="{ 'app--plegado': plegado }">
    <aside class="app__lateral" :class="{ 'app__lateral--abierto': menuAbierto }">
      <div class="app__marca">
        <span class="app__logo" aria-hidden="true"><i class="pi pi-users" /></span>
        <span class="app__marca-texto">COMMUNITY 360</span>
      </div>
      <AppMenu :compacto="plegado" @navegar="menuAbierto = false" />
    </aside>
    <div v-if="menuAbierto" class="app__velo" @click="menuAbierto = false" />

    <div class="app__contenido">
      <header class="app__encabezado">
        <Button
          class="app__hamburguesa"
          icon="pi pi-bars"
          text
          rounded
          aria-label="Abrir menú"
          @click="menuAbierto = !menuAbierto"
        />
        <Button
          class="app__plegar"
          :icon="plegado ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'"
          text
          rounded
          severity="secondary"
          :aria-label="plegado ? 'Desplegar menú' : 'Plegar menú'"
          :aria-expanded="!plegado"
          @click="alternarPlegado"
        />
        <h1 class="app__titulo">{{ route.meta.titulo }}</h1>
        <div class="app__usuario">
          <span class="app__avatar" aria-hidden="true">{{ iniciales }}</span>
          <span class="app__nombre"
            ><strong>{{ sesion.usuario?.nombreUsuario }}</strong>
            <small>{{ sesion.usuario?.rol }}</small></span
          >
          <Button
            label="Cerrar sesión"
            icon="pi pi-sign-out"
            severity="secondary"
            outlined
            size="small"
            @click="salir"
          />
        </div>
      </header>
      <main class="app__principal"><RouterView /></main>
    </div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
  --ancho-menu: 240px;
}
.app--plegado {
  --ancho-menu: 76px;
}
.app__lateral {
  position: fixed;
  inset: 0 auto 0 0;
  width: 240px;
  background: var(--c360-tarjeta);
  border-right: 1px solid var(--c360-borde);
  z-index: 20;
  transform: translateX(-100%);
  transition: transform 0.2s ease;
}
.app__lateral--abierto {
  transform: translateX(0);
}
.app__marca {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  height: 4rem;
  padding: 0 1.25rem;
  border-bottom: 1px solid var(--c360-borde);
  overflow: hidden;
  white-space: nowrap;
}
.app__logo {
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #4f46e5 60%, #22d3ee);
  box-shadow: 0 6px 14px -6px rgb(37 99 235 / 0.6);
}
.app__marca-texto {
  font-weight: 800;
  letter-spacing: 0.02em;
  background: linear-gradient(90deg, #1d4ed8, #4f46e5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.app__velo {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.35);
  z-index: 10;
}
.app__contenido {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.app__encabezado {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 4rem;
  padding: 0 1rem;
  background: var(--c360-tarjeta);
  border-bottom: 1px solid var(--c360-borde);
}
.app__plegar {
  display: none;
}
.app__titulo {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.app__usuario {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.app__avatar {
  display: none;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6, #4f46e5);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.18);
}
.app__nombre {
  display: none;
  flex-direction: column;
  line-height: 1.2;
  text-align: right;
}
.app__nombre small {
  color: #2563eb;
  font-weight: 500;
  text-transform: capitalize;
}
.app__principal {
  padding: 1rem;
  flex: 1;
}

@media (min-width: 900px) {
  .app__lateral {
    transform: none;
    width: var(--ancho-menu);
    transition: width 0.2s ease;
  }
  .app__velo,
  .app__hamburguesa {
    display: none;
  }
  .app__plegar {
    display: inline-flex;
  }
  .app__contenido {
    margin-left: var(--ancho-menu);
    transition: margin-left 0.2s ease;
  }
  .app__encabezado {
    padding: 0 1.5rem 0 1rem;
  }
  .app__nombre {
    display: flex;
  }
  .app__avatar {
    display: grid;
  }
  .app__principal {
    padding: 1.5rem;
  }
  .app--plegado .app__marca {
    justify-content: center;
    padding: 0;
  }
  .app--plegado .app__marca-texto {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .app__lateral,
  .app__contenido {
    transition: none;
  }
}
</style>
