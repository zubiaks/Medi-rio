<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BaseMetricCard from "@/components/base/BaseMetricCard.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import type { AvailabilityRecord } from "@/types/records";
import { availabilityRepository } from "@/domain/repositories";

const items = ref<AvailabilityRecord[]>([]);
const total = ref(0);
const streaming = ref(0);
const purchases = ref(0);
const loading = ref(true);
const errorMessage = ref("");

async function loadVod(): Promise<void> {
  loading.value = true;
  errorMessage.value = "";

  try {
    const [page, streamingCount, purchaseCount] = await Promise.all([
      availabilityRepository.list({
        page: 1,
        perPage: 24,
        filter: "ativo = true",
        sort: "provider_nome",
        expand: "titulo,pais",
      }),
      availabilityRepository.count('ativo = true && tipo = "streaming"'),
      availabilityRepository.count('ativo = true && tipo = "compra"'),
    ]);

    items.value = page.items;
    total.value = page.totalItems;
    streaming.value = streamingCount;
    purchases.value = purchaseCount;
  } catch (error) {
    console.error("[VOD] Não foi possível carregar disponibilidades:", error);
    errorMessage.value = error instanceof Error
      ? error.message
      : "Erro desconhecido ao carregar VOD.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadVod);
</script>

<template>
  <BasePageHeader
    eyebrow="Video on demand"
    title="VOD"
    description="Onde ver, alugar ou comprar os conteúdos do catálogo."
  >
    <template #actions>
      <button class="button button-primary" type="button">
        ＋ Disponibilidade
      </button>
    </template>
  </BasePageHeader>

  <section class="stats-grid compact-stats">
    <BaseMetricCard
      icon="▶"
      label="Ofertas ativas"
      :value="total"
      detail="todas as modalidades"
    />
    <BaseMetricCard
      icon="◉"
      label="Streaming"
      :value="streaming"
      detail="subscrição ou gratuito"
      tone="cyan"
    />
    <BaseMetricCard
      icon="€"
      label="Comprar"
      :value="purchases"
      detail="lojas e plataformas"
      tone="amber"
    />
    <BaseMetricCard
      icon="⌁"
      label="Providers"
      value="—"
      detail="a configurar"
      tone="pink"
    />
  </section>

  <section v-if="loading" class="page-loading" aria-live="polite">
    <span class="loader" />
    <p>A carregar disponibilidades…</p>
  </section>

  <BaseEmptyState
    v-else-if="errorMessage"
    icon="!"
    title="Não foi possível carregar VOD"
    :description="errorMessage"
  >
    <button class="button button-secondary" type="button" @click="loadVod">
      Voltar a tentar
    </button>
  </BaseEmptyState>

  <div v-else-if="items.length" class="vod-grid">
    <article v-for="item in items" :key="item.id" class="vod-card">
      <div class="vod-poster poster-placeholder">▶</div>
      <div class="vod-info">
        <span class="provider-pill">{{ item.provider_nome }}</span>
        <h3>{{ item.expand?.titulo?.titulo || "Título" }}</h3>
        <p>
          {{ item.tipo }} · {{ item.qualidade || "qualidade desconhecida" }}
        </p>
        <a
          v-if="item.url"
          class="button button-primary"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir provider
        </a>
      </div>
    </article>
  </div>

  <BaseEmptyState
    v-else
    icon="▶"
    title="Ainda não existem disponibilidades VOD"
    description="Liga títulos a serviços de streaming, aluguer, compra, bibliotecas ou broadcast."
  />
</template>
