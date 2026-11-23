<!-- Mediário | Fase 8E: gestão completa dos providers no frontend. -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  loadProviderAdminSettings,
  removeProviderCredential,
  replaceProviderCredential,
  saveProviderAdminSettings,
  testProviderConnection,
  type ManagedProvider,
  type ProviderAdminSettings,
} from "@/domain/providers/providerAdminClient";
import { writeAuditLog } from "@/domain/providers/audit";

const providers = ref<ProviderAdminSettings[]>([]);
const credentials = ref<Record<ManagedProvider, string>>({ tmdb: "", omdb: "" });
const loading = ref(false);
const busy = ref("");
const error = ref("");
const message = ref("");

async function load(): Promise<void> {
  loading.value = true; error.value = "";
  try { providers.value = await loadProviderAdminSettings(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

async function save(item: ProviderAdminSettings): Promise<void> {
  busy.value = `${item.provider}-settings`; error.value = ""; message.value = "";
  try {
    const saved = await saveProviderAdminSettings(item);
    providers.value = providers.value.map((value) => value.provider === saved.provider ? saved : value);
    message.value = `Configuração de ${saved.label} guardada.`;
    await writeAuditLog({ entidade: "app_settings", entidade_nome: saved.label, acao: "editar", origem: "interface", sucesso: true, detalhes: { provider: saved.provider, campos_operacionais_alterados: true } });
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { busy.value = ""; }
}

async function replaceCredential(item: ProviderAdminSettings): Promise<void> {
  const credential = credentials.value[item.provider].trim();
  if (!credential) { error.value = "Introduz uma nova chave antes de guardar."; return; }
  busy.value = `${item.provider}-credential`; error.value = ""; message.value = "";
  try {
    const saved = await replaceProviderCredential(item.provider, credential);
    credentials.value[item.provider] = "";
    providers.value = providers.value.map((value) => value.provider === saved.provider ? saved : value);
    message.value = `Credencial de ${saved.label} substituída.`;
    await writeAuditLog({ entidade: "app_settings", entidade_nome: saved.label, acao: "editar", origem: "interface", sucesso: true, detalhes: { provider: saved.provider, credencial_alterada: true } });
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { credentials.value[item.provider] = ""; busy.value = ""; }
}

async function removeCredential(item: ProviderAdminSettings): Promise<void> {
  if (!window.confirm(`Remover a credencial de ${item.label}?`)) return;
  busy.value = `${item.provider}-remove`; error.value = ""; message.value = "";
  try {
    const saved = await removeProviderCredential(item.provider);
    providers.value = providers.value.map((value) => value.provider === saved.provider ? saved : value);
    message.value = `Credencial de ${saved.label} removida.`;
    await writeAuditLog({ entidade: "app_settings", entidade_nome: saved.label, acao: "editar", origem: "interface", sucesso: true, detalhes: { provider: saved.provider, credencial_removida: true } });
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { busy.value = ""; }
}

async function testConnection(item: ProviderAdminSettings): Promise<void> {
  busy.value = `${item.provider}-test`; error.value = ""; message.value = "";
  try {
    const result = await testProviderConnection(item.provider);
    message.value = result.message;
    await writeAuditLog({ entidade: "app_settings", entidade_nome: item.label, acao: "sincronizar", origem: "interface", sucesso: result.ok, detalhes: { provider: item.provider, operacao: "teste_ligacao", teste_ok: result.ok } });
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { busy.value = ""; }
}

onMounted(load);
</script>

<template>
  <section class="provider-admin" aria-labelledby="provider-admin-title">
    <div class="tmdb-operations-header"><div><p class="eyebrow">Scrapers e APIs</p><h3 id="provider-admin-title">Configuração dos providers</h3></div><button class="button button-secondary" type="button" :disabled="loading || Boolean(busy)" @click="load">Atualizar</button></div>
    <p>As credenciais existentes nunca são devolvidas ao browser. O campo permite apenas substituir ou remover a chave.</p>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <div v-if="message" class="form-alert form-alert-success" role="status">{{ message }}</div>
    <div class="provider-admin-grid">
      <article v-for="item in providers" :key="item.provider" class="provider-admin-card">
        <header><div><h4>{{ item.label }}</h4><span :class="item.credential_configured ? 'status-success' : 'status-warning'">{{ item.credential_configured ? `Configurado · ${item.credential_masked}` : "Não configurado" }}</span></div><label class="check-field"><input v-model="item.enabled" type="checkbox" /> Ativo</label></header>
        <div class="provider-admin-fields"><label class="form-field"><span>Idioma principal</span><input v-model.trim="item.language" maxlength="10" /></label><label class="form-field"><span>Idioma alternativo</span><input v-model.trim="item.fallback_language" maxlength="10" /></label><label class="form-field"><span>Timeout (segundos)</span><input v-model.number="item.timeout_seconds" type="number" min="5" max="60" /></label><label class="form-field"><span>Pedidos por minuto</span><input v-model.number="item.requests_per_minute" type="number" min="1" max="40" /></label><label class="form-field"><span>Repetições</span><input v-model.number="item.retries" type="number" min="0" max="5" /></label></div>
        <div class="form-actions"><button class="button button-primary" type="button" :disabled="Boolean(busy)" @click="save(item)">Guardar configuração</button><button class="button button-secondary" type="button" :disabled="Boolean(busy) || !item.credential_configured" @click="testConnection(item)">Testar ligação</button></div>
        <div class="provider-credential-editor"><label class="form-field"><span>{{ item.credential_configured ? "Substituir chave" : "Introduzir chave" }}</span><input v-model="credentials[item.provider]" type="password" autocomplete="new-password" spellcheck="false" /></label><div class="form-actions"><button class="button button-secondary" type="button" :disabled="Boolean(busy) || !credentials[item.provider]" @click="replaceCredential(item)">Guardar nova chave</button><button v-if="item.credential_configured" class="button button-danger" type="button" :disabled="Boolean(busy)" @click="removeCredential(item)">Remover chave</button></div></div>
      </article>
    </div>
  </section>
</template>
