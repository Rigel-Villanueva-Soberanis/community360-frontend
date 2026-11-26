const LOCAL = 'es-MX'

/** Convierte una fecha ISO (la API la manda en UTC) a Date. Si no trae zona, se interpreta como UTC. */
export function aFecha(iso: string): Date {
  const tieneZona = /(Z|[+-]\d{2}:?\d{2})$/.test(iso)
  return new Date(tieneZona ? iso : `${iso}Z`)
}

export function formatearFechaHora(iso: string | null | undefined): string {
  if (!iso) return '—'
  const f = aFecha(iso)
  return Number.isNaN(f.getTime())
    ? '—'
    : f.toLocaleString(LOCAL, { dateStyle: 'medium', timeStyle: 'short' })
}

export function formatearHora(iso: string | null | undefined): string {
  if (!iso) return '—'
  const f = aFecha(iso)
  return Number.isNaN(f.getTime()) ? '—' : f.toLocaleTimeString(LOCAL, { timeStyle: 'medium' })
}

/** AAAA-MM-DD en UTC, el formato que esperan los filtros de fecha de la API. */
export function aFechaApi(fecha: Date): string {
  return fecha.toISOString().slice(0, 10)
}
