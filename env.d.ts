/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Vacía en producción (mismo origen, atiende el proxy de Cloudflare). En desarrollo: https://localhost:7043 */
  readonly VITE_API_URL?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}

// PrimeVue no publica tipos para su bus de eventos del Toast; lo usamos para avisar desde fuera de los componentes.
declare module 'primevue/toasteventbus' {
  import type { ToastMessageOptions } from 'primevue/toast'
  const ToastEventBus: {
    emit(evento: 'add', mensaje: ToastMessageOptions): void
    emit(evento: 'remove', mensaje: ToastMessageOptions): void
    emit(evento: 'remove-group' | 'remove-all-groups', grupo?: string): void
  }
  export default ToastEventBus
}
