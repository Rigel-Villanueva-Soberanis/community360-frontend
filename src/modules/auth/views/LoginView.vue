<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { MAX_CONTRASENA, MAX_USUARIO, useLogin } from '../composables/useLogin'

const { formulario, errores, mensaje, cargando, iniciarSesion } = useLogin()
</script>

<template>
  <main class="login">
    <form class="login__tarjeta" novalidate @submit.prevent="iniciarSesion">
      <header class="login__cabecera">
        <i class="pi pi-users" aria-hidden="true" />
        <h1>COMMUNITY 360</h1>
        <p>Inicia sesión para ver el dashboard de la comunidad.</p>
      </header>

      <Message v-if="mensaje" severity="error" role="alert" :closable="false">{{
        mensaje
      }}</Message>

      <div class="login__campo">
        <label for="usuario">Usuario</label>
        <InputText
          id="usuario"
          v-model="formulario.nombreUsuario"
          autocomplete="username"
          :maxlength="MAX_USUARIO"
          :invalid="!!errores.nombreUsuario"
          :disabled="cargando"
          autofocus
          fluid
        />
        <small v-if="errores.nombreUsuario" class="login__error">{{ errores.nombreUsuario }}</small>
      </div>

      <div class="login__campo">
        <label for="contrasena">Contraseña</label>
        <Password
          v-model="formulario.contrasena"
          input-id="contrasena"
          :pt="{ pcInputText: { root: { autocomplete: 'current-password' } } }"
          :feedback="false"
          toggle-mask
          :maxlength="MAX_CONTRASENA"
          :invalid="!!errores.contrasena"
          :disabled="cargando"
          fluid
        />
        <small v-if="errores.contrasena" class="login__error">{{ errores.contrasena }}</small>
      </div>

      <Button type="submit" label="Entrar" icon="pi pi-sign-in" :loading="cargando" fluid />
    </form>
  </main>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
}
.login__tarjeta {
  width: 100%;
  max-width: 24rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.75rem;
  background: var(--c360-tarjeta);
  border: 1px solid var(--c360-borde);
  border-radius: 0.75rem;
  box-shadow: 0 4px 20px rgb(0 0 0 / 0.06);
}
.login__cabecera {
  text-align: center;
}
.login__cabecera i {
  font-size: 2rem;
  color: var(--c360-primario);
}
.login__cabecera h1 {
  margin: 0.25rem 0;
  font-size: 1.5rem;
}
.login__cabecera p {
  margin: 0;
  color: var(--c360-texto-suave);
  font-size: 0.9rem;
}
.login__campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.login__campo label {
  font-weight: 600;
  font-size: 0.9rem;
}
.login__error {
  color: #c0392b;
}
</style>
