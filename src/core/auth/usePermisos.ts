import { computed } from 'vue'
import { puede as tienePermiso, type Permiso } from './permisos'
import { useSesionStore } from './sesion.store'

/** Para usar en las vistas: `const { puede } = usePermisos()` y `v-if="puede('auditoria.ver')"`. */
export function usePermisos() {
  const sesion = useSesionStore()
  const rol = computed(() => sesion.rol)
  return { rol, puede: (permiso: Permiso) => tienePermiso(sesion.rol, permiso) }
}
