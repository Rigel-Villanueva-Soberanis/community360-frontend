import { onMounted, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { analiticaApi } from '../../api/analitica.api'
import { useTiempoReal } from './useTiempoReal'
import { urlTiempoReal } from './useTiempoReal'
import { useSesionStore } from '@/core/auth/sesion.store'
import { sesionApi } from '@/core/auth/sesion.api'
import { estadoDe, mensajeDe } from '@/core/http/errores'
import type {
  EventoRegistrado,
  MensajeTiempoReal,
  SnapshotMetricas,
} from '../../types/metricas.types'

export const MAX_EVENTOS = 50
const CLAVE_EVENTOS = 'c360.ultimosEventos'

/**
 * Los últimos eventos se guardan en sessionStorage (solo id, plataforma, tipo y sentimiento; nunca texto ni
 * ubicación ni token) para que sobrevivan a recargar la página. Se borran al cerrar la pestaña o la sesión.
 */
function leerEventos(): EventoRegistrado[] {
  try {
    const crudo = sessionStorage.getItem(CLAVE_EVENTOS)
    const lista = crudo ? (JSON.parse(crudo) as EventoRegistrado[]) : []
    return Array.isArray(lista) ? lista.slice(0, MAX_EVENTOS) : []
  } catch {
    return []
  }
}
function guardarEventos(lista: EventoRegistrado[]): void {
  try {
    sessionStorage.setItem(CLAVE_EVENTOS, JSON.stringify(lista))
  } catch {
    /* sin almacenamiento disponible: la lista solo vive en memoria */
  }
}

/**
 * Indicadores en vivo (I1–I9). El servidor manda el conjunto COMPLETO ya recalculado en cada cambio, y la
 * pantalla REEMPLAZA lo que tenía (nunca suma ni resta): así las modificaciones y las bajas quedan bien reflejadas.
 */
export function useMetricas() {
  const sesion = useSesionStore()
  const router = useRouter()

  const snapshot = shallowRef<SnapshotMetricas | null>(null)
  const eventos = ref<EventoRegistrado[]>(leerEventos())
  const errorInicial = ref('')
  let contador = eventos.value.reduce((mayor, e) => Math.max(mayor, e.id), 0)

  function alMensaje(m: MensajeTiempoReal): void {
    snapshot.value = m.metricas
    errorInicial.value = ''
    if (m.tipo !== 'conexion.establecida' && m.datos) {
      contador++
      eventos.value = [
        { id: contador, tipo: m.tipo, fechaUtc: m.fechaUtc, datos: m.datos },
        ...eventos.value,
      ].slice(0, MAX_EVENTOS)
      guardarEventos(eventos.value)
    }
  }

  const conexion = useTiempoReal({
    url: urlTiempoReal(import.meta.env.VITE_API_URL),
    alMensaje,
    // Solo un 401 significa "sesión perdida". Si la API está apagada o no responde, se sigue reintentando.
    verificarSesion: async () => {
      try {
        sesion.establecer(await sesionApi.me())
        return sesion.autenticado
      } catch (e) {
        if (estadoDe(e) === 401) {
          sesion.limpiar()
          return false
        }
        return true
      }
    },
    alPerderSesion: () => {
      void router.replace({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath },
      })
    },
  })

  /** Respaldo: si el canal tarda o falla, la primera pantalla sale con una consulta REST (solo si aún no hay datos). */
  async function cargarRespaldo(): Promise<void> {
    try {
      const [resumen, porPlataforma, porTipo, actividadPorHora, sentimientoPorTema, etiquetasTop] =
        await Promise.all([
          analiticaApi.resumen(),
          analiticaApi.porPlataforma(),
          analiticaApi.porTipo(),
          analiticaApi.actividadPorHora(),
          analiticaApi.sentimientoPorTema(),
          analiticaApi.etiquetasTop(),
        ])
      if (snapshot.value === null) {
        snapshot.value = {
          resumen,
          porPlataforma,
          porTipo,
          actividadPorHora,
          sentimientoPorTema,
          etiquetasTop,
          calculadoUtc: new Date().toISOString(),
        }
      }
    } catch (e) {
      if (snapshot.value === null)
        errorInicial.value = mensajeDe(e, 'No se pudieron cargar los indicadores.')
    }
  }

  onMounted(() => {
    conexion.iniciar()
    void cargarRespaldo()
  })

  return {
    snapshot,
    eventos,
    errorInicial,
    estado: conexion.estado,
    ultimoMensajeUtc: conexion.ultimoMensajeUtc,
    reintentarRespaldo: cargarRespaldo,
  }
}
