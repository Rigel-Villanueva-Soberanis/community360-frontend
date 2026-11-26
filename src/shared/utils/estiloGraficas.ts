/**
 * Estilo común de las gráficas de barras y líneas: degradados suaves, extremos redondeados, cuadrícula punteada,
 * pista de fondo y valor sobre cada barra. Solo cambia la apariencia: los datos y los colores por entidad no cambian.
 */
import type { Chart, Plugin } from 'chart.js'

/** Mezcla un color #rrggbb con blanco (f = 0 deja el color, f = 1 lo vuelve blanco). */
export function aclarar(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * f))
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/** Degradado de una barra: más claro en la punta y el color pleno en la base (o a la izquierda en horizontales). */
export function degradadoBarra(
  chart: Chart,
  color: string,
  horizontal: boolean,
): string | CanvasGradient {
  const area = chart.chartArea
  if (!area) return color // primer dibujo, todavía sin medidas
  const g = horizontal
    ? chart.ctx.createLinearGradient(area.left, 0, area.right, 0)
    : chart.ctx.createLinearGradient(0, area.bottom, 0, area.top)
  g.addColorStop(0, color)
  g.addColorStop(1, aclarar(color, 0.38))
  return g
}

/** Relleno bajo una línea: el color con transparencia que se desvanece hacia abajo. */
export function degradadoArea(chart: Chart, color: string): string | CanvasGradient {
  const area = chart.chartArea
  if (!area) return 'transparent'
  const g = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom)
  g.addColorStop(0, `${color}59`) // ~35 % de opacidad
  g.addColorStop(1, `${color}00`)
  return g
}

export const GRILLA = { color: '#e9edf3', lineWidth: 1 }
export const RAYA = [4, 4]

type Barra = { x: number; y: number; base: number; width: number; height: number }

/** Pista gris clara detrás de cada barra, para que se vea el "largo total" disponible. */
export function pistaBarras(horizontal: boolean): Plugin {
  return {
    id: 'pistaBarras',
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea: a } = chart
      const meta = chart.getDatasetMeta(0)
      if (!a || !meta) return
      ctx.save()
      ctx.fillStyle = 'rgba(148, 163, 184, 0.14)'
      for (const el of meta.data) {
        const b = el.getProps(['x', 'y', 'base', 'width', 'height'], true) as unknown as Barra
        ctx.beginPath()
        if (horizontal)
          ctx.roundRect(a.left, b.y - b.height / 2, a.right - a.left, b.height, b.height / 2)
        else ctx.roundRect(b.x - b.width / 2, a.top, b.width, a.bottom - a.top, [8, 8, 0, 0])
        ctx.fill()
      }
      ctx.restore()
    },
  }
}

/** Escribe el valor en la punta de cada barra (arriba en verticales, al final en horizontales). */
export function valoresEnBarras(horizontal: boolean, formato: (n: number) => string): Plugin {
  return {
    id: 'valoresEnBarras',
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      const meta = chart.getDatasetMeta(0)
      const datos = chart.data.datasets[0]?.data as number[] | undefined
      if (!meta || !datos) return
      ctx.save()
      ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
      ctx.fillStyle = '#334155'
      meta.data.forEach((el, i) => {
        const v = datos[i]
        if (typeof v !== 'number') return
        const b = el.getProps(['x', 'y', 'base'], true) as unknown as {
          x: number
          y: number
          base: number
        }
        if (horizontal) {
          // Positivo: junto a la punta. Negativo: al otro lado del cero, para no chocar con el nombre del tema.
          const negativo = b.x < b.base // posiciones en pantalla: la punta queda a la izquierda de la base
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(formato(v), (negativo ? b.base : b.x) + 6, b.y)
        } else {
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(formato(v), b.x, b.y - 4)
        }
      })
      ctx.restore()
    },
  }
}
