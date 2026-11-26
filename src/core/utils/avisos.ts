import ToastEventBus from 'primevue/toasteventbus'

export type Severidad = 'success' | 'info' | 'warn' | 'error'

const ultimos = new Map<string, number>()
const ESPERA_MS = 3000

/** Muestra un aviso (Toast). Evita repetir el mismo texto durante 3 segundos (varias peticiones fallando a la vez). */
export function avisar(severidad: Severidad, texto: string, titulo?: string): void {
  const clave = `${severidad}|${texto}`
  const ahora = Date.now()
  if (ahora - (ultimos.get(clave) ?? 0) < ESPERA_MS) return
  ultimos.set(clave, ahora)
  ToastEventBus.emit('add', { severity: severidad, summary: titulo, detail: texto, life: 5000 })
}
