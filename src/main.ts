import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import { Tema } from './core/tema'

import App from './App.vue'
import router from './core/router'
import { configurarHttp } from './core/http/cliente'
import { useSesionStore } from './core/auth/sesion.store'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, { theme: { preset: Tema, options: { darkModeSelector: false } } })
app.use(ToastService)
app.use(ConfirmationService)

// Si la API responde 401 en una petición protegida (sesión vencida o revocada), se limpia la sesión y se manda al login.
configurarHttp({
  alSesionInvalida: () => {
    useSesionStore().limpiar()
    const actual = router.currentRoute.value
    if (!actual.meta.publica)
      void router.replace({ path: '/login', query: { redirect: actual.fullPath } })
  },
})

app.mount('#app')
