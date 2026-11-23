<!-- Mediário | ZIP 11A: início de sessão e recuperação. -->
<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const email = ref("");
const password = ref("");
const error = ref("");
const message = ref("");
const resetMode = ref(false);

async function submit(): Promise<void> {
  error.value = "";
  message.value = "";
  try {
    await auth.login(email.value, password.value);
    const redirect = typeof route.query.redirect === "string"
      ? route.query.redirect
      : "/";
    await router.replace(redirect);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  }
}

async function reset(): Promise<void> {
  error.value = "";
  message.value = "";
  if (!email.value.trim()) {
    error.value = "Indica o email da conta.";
    return;
  }
  try {
    await auth.requestPasswordReset(email.value);
    message.value = "Se existir uma conta com este email, serão enviadas instruções de recuperação.";
  } catch {
    message.value = "Se existir uma conta com este email, serão enviadas instruções de recuperação.";
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card" aria-labelledby="login-title">
      <div><p class="eyebrow">Mediário</p><h1 id="login-title">{{ resetMode ? "Recuperar acesso" : "Iniciar sessão" }}</h1><p>{{ resetMode ? "Recebe uma ligação segura para definir uma nova palavra-passe." : "Entra com a conta da instalação." }}</p></div>
      <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
      <div v-if="message" class="form-alert form-alert-success" role="status">{{ message }}</div>
      <form v-if="!resetMode" class="auth-form" @submit.prevent="submit">
        <label class="form-field"><span>Email</span><input v-model.trim="email" type="email" autocomplete="email" required autofocus /></label>
        <label class="form-field"><span>Palavra-passe</span><input v-model="password" type="password" autocomplete="current-password" required minlength="8" /></label>
        <button class="button button-primary" type="submit" :disabled="auth.busy.value">{{ auth.busy.value ? "A entrar…" : "Entrar" }}</button>
      </form>
      <form v-else class="auth-form" @submit.prevent="reset">
        <label class="form-field"><span>Email</span><input v-model.trim="email" type="email" autocomplete="email" required autofocus /></label>
        <button class="button button-primary" type="submit">Enviar instruções</button>
      </form>
      <button class="button button-secondary" type="button" @click="resetMode = !resetMode; error = ''; message = ''">{{ resetMode ? "Voltar ao início de sessão" : "Esqueci-me da palavra-passe" }}</button>
    </section>
  </main>
</template>
