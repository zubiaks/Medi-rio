/**
 * Ficheiro: src/domain/repositories.ts
 * Tipo: Registo central de repositórios PocketBase.
 *
 * Função:
 * Disponibiliza instâncias tipadas e reutilizáveis para as coleções
 * utilizadas pelos módulos Catálogo, VOD, Podcasts, IPTV e Biblioteca.
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
  IptvCategoryRecord,
  IptvChannelRecord,
  IptvSourceRecord,
  NamedRecord,
  PodcastEpisodeRecord,
  StreamRecord,
  TitleRecord,
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

/** Canais IPTV. */
export const iptvChannelRepository =
  new PocketBaseRepository<IptvChannelRecord>("canais_tv");

/** Fontes principais e alternativas de canais IPTV. */
export const iptvSourceRepository =
  new PocketBaseRepository<IptvSourceRecord>("stream_links");

/** Categorias específicas dos canais IPTV. */
export const iptvCategoryRepository =
  new PocketBaseRepository<IptvCategoryRecord>("categorias_tv");

/**
 * Aliases legados temporários.
 *
 * Preservam compatibilidade com módulos ainda não migrados sem criar
 * instâncias adicionais dos repositórios PocketBase.
 */
export const channelRepository = iptvChannelRepository;
export const streamLinkRepository = iptvSourceRepository;
export const tvCategoryRepository = iptvCategoryRepository;

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
