<!-- Mediário | Menu reutilizável da sessão. -->
<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
const auth = useAuth();
const router = useRouter();
async function signOut(): Promise<void> {
  auth.logout();
  await router.replace({ name: "login" });
}
</script>
<template>
  <div v-if="auth.authenticated.value" class="auth-session-menu">
    <RouterLink class="button button-secondary" :to="{ name: 'profile' }">
      {{ auth.user.value?.nome || auth.user.value?.email }}
    </RouterLink>
    <button class="button button-secondary" type="button" @click="signOut">Terminar sessão</button>
  </div>
</template>
