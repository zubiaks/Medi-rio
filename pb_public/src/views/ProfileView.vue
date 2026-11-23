<!-- Mediário | ZIP 11A: perfil e alteração de palavra-passe. -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import BasePageHeader from "@/components/base/BasePageHeader.vue";

const auth = useAuth();
const name = ref(auth.user.value?.nome || "");
const avatar = ref<File | null>(null);
const oldPassword = ref("");
const password = ref("");
const confirmation = ref("");
const busy = ref(false);
const error = ref("");
const message = ref("");
const roleLabel = computed(() => ({
  admin: "Administrador",
  editor: "Editor",
  utilizador: "Utilizador",
  leitor: "Leitor",
})[auth.user.value?.role || "leitor"]);

function selectAvatar(event: Event): void {
  avatar.value = (event.target as HTMLInputElement).files?.[0] || null;
}

async function saveProfile(): Promise<void> {
  busy.value = true; error.value = ""; message.value = "";
  try {
    const form = new FormData();
    form.append("nome", name.value.trim());
    if (avatar.value) form.append("avatar", avatar.value);
    await auth.updateProfile(form);
    avatar.value = null;
    message.value = "Perfil atualizado.";
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { busy.value = false; }
}

async function savePassword(): Promise<void> {
  error.value = ""; message.value = "";
  if (password.value.length < 10) { error.value = "A nova palavra-passe deve ter pelo menos 10 caracteres."; return; }
  if (password.value !== confirmation.value) { error.value = "As palavras-passe não coincidem."; return; }
  busy.value = true;
  try {
    await auth.changePassword(oldPassword.value, password.value, confirmation.value);
    oldPassword.value = ""; password.value = ""; confirmation.value = "";
    message.value = "Palavra-passe atualizada.";
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { busy.value = false; }
}
</script>

<template>
  <BasePageHeader eyebrow="Conta" title="Perfil" description="Dados pessoais, função e segurança da sessão." />
  <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div><div v-if="message" class="form-alert form-alert-success" role="status">{{ message }}</div>
  <div class="profile-grid">
    <section class="panel"><h2>Dados da conta</h2><dl class="profile-facts"><div><dt>Email</dt><dd>{{ auth.user.value?.email }}</dd></div><div><dt>Função</dt><dd>{{ roleLabel }}</dd></div><div><dt>Estado</dt><dd>{{ auth.user.value?.estado }}</dd></div><div><dt>Último acesso</dt><dd>{{ auth.user.value?.ultimo_acesso ? new Date(auth.user.value.ultimo_acesso).toLocaleString('pt-PT') : '—' }}</dd></div></dl><form class="auth-form" @submit.prevent="saveProfile"><label class="form-field"><span>Nome</span><input v-model.trim="name" maxlength="120" /></label><label class="form-field"><span>Avatar</span><input type="file" accept="image/jpeg,image/png,image/webp" @change="selectAvatar" /></label><button class="button button-primary" type="submit" :disabled="busy">Guardar perfil</button></form></section>
    <section class="panel"><h2>Alterar palavra-passe</h2><form class="auth-form" @submit.prevent="savePassword"><label class="form-field"><span>Palavra-passe atual</span><input v-model="oldPassword" type="password" autocomplete="current-password" required /></label><label class="form-field"><span>Nova palavra-passe</span><input v-model="password" type="password" autocomplete="new-password" minlength="10" required /></label><label class="form-field"><span>Confirmar</span><input v-model="confirmation" type="password" autocomplete="new-password" minlength="10" required /></label><button class="button button-primary" type="submit" :disabled="busy">Alterar palavra-passe</button></form></section>
  </div>
</template>
