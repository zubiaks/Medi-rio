<!-- Mediário | ZIP 11A: confirmação de reposição da palavra-passe. -->
<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const password = ref("");
const confirmation = ref("");
const error = ref("");
const done = ref(false);

async function submit(): Promise<void> {
  error.value = "";
  if (password.value.length < 10) {
    error.value = "A palavra-passe deve ter pelo menos 10 caracteres.";
    return;
  }
  if (password.value !== confirmation.value) {
    error.value = "As palavras-passe não coincidem.";
    return;
  }
  const token = typeof route.query.token === "string" ? route.query.token : "";
  if (!token) {
    error.value = "A ligação de recuperação é inválida ou está incompleta.";
    return;
  }
  try {
    await auth.confirmPasswordReset(token, password.value, confirmation.value);
    done.value = true;
  } catch {
    error.value = "A ligação expirou ou já foi utilizada.";
  }
}
</script>

<template>
  <main class="auth-page"><section class="auth-card" aria-labelledby="reset-title">
    <div><p class="eyebrow">Segurança</p><h1 id="reset-title">Nova palavra-passe</h1></div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <div v-if="done" class="form-alert form-alert-success" role="status">Palavra-passe alterada com sucesso.</div>
    <form v-if="!done" class="auth-form" @submit.prevent="submit"><label class="form-field"><span>Nova palavra-passe</span><input v-model="password" type="password" autocomplete="new-password" minlength="10" required /></label><label class="form-field"><span>Confirmar palavra-passe</span><input v-model="confirmation" type="password" autocomplete="new-password" minlength="10" required /></label><button class="button button-primary" type="submit">Guardar palavra-passe</button></form>
    <button v-else class="button button-primary" type="button" @click="router.replace({ name: 'login' })">Ir para o início de sessão</button>
  </section></main>
</template>
