/**
 * Ficheiro: src/domain/repositories.ts
 * Tipo: Registo central de repositórios PocketBase.
 *
 * Função:
 * Disponibiliza instâncias tipadas e reutilizáveis para as coleções
 * utilizadas pelos módulos Catálogo, VOD, Podcasts, TV e Biblioteca.
 *
 * Responsabilidades:
 * - associar cada interface TypeScript à coleção PocketBase;
 * - evitar a criação repetida de repositórios em páginas e componentes;
 * - manter os nomes das coleções centralizados.
 *
 * Não contém:
 * - regras de negócio;
 * - filtros específicos das páginas;
 * - transformação ou validação de records.
 *
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 * See LICENSE.md.
 */
import type {
  AvailabilityRecord,
  ChannelRecord,
  NamedRecord,
  PodcastEpisodeRecord,
  StreamLinkRecord,
  StreamRecord,
  TitleRecord,
  TvCategoryRecord,
} from "@/types/records";

import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";

/** Catálogo principal de títulos. */
export const titleRepository =
  new PocketBaseRepository<TitleRecord>("titulos");

/** Podcasts, rádios, webcams e streams genéricos. */
export const streamRepository =
  new PocketBaseRepository<StreamRecord>("streams");

/** Episódios sincronizados de podcasts RSS e Atom. */
export const episodeRepository =
  new PocketBaseRepository<PodcastEpisodeRecord>(
    "podcast_episodios",
  );

/** Canais de televisão e IPTV. */
export const channelRepository =
  new PocketBaseRepository<ChannelRecord>("canais_tv");

/** Links principais e alternativos de canais e streams. */
export const streamLinkRepository =
  new PocketBaseRepository<StreamLinkRecord>(
    "stream_links",
  );

/** Categorias específicas dos canais de televisão. */
export const tvCategoryRepository =
  new PocketBaseRepository<TvCategoryRecord>(
    "categorias_tv",
  );

/** Países utilizados em títulos, canais e streams. */
export const countryRepository =
  new PocketBaseRepository<NamedRecord>("paises");

/** Idiomas utilizados em títulos, canais e streams. */
export const languageRepository =
  new PocketBaseRepository<NamedRecord>("idiomas");

/** Tags partilhadas entre os vários domínios. */
export const tagRepository =
  new PocketBaseRepository<NamedRecord>("tags");

/** Ofertas e disponibilidades VOD dos títulos. */
export const availabilityRepository =
  new PocketBaseRepository<AvailabilityRecord>(
    "disponibilidades",
  );

/**
 * Exemplares físicos.
 *
 * Ainda não tem uma interface própria porque o módulo Biblioteca
 * será tipado durante a respetiva migração.
 */
export const exemplarRepository =
  new PocketBaseRepository("exemplares");