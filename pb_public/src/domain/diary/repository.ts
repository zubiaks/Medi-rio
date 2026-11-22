/**
 * Projeto: Mediário
 * Ficheiro: src/domain/diary/repository.ts
 * Tipo: Registo de repositórios PocketBase
 * Domínio: Diário e avaliações
 *
 * Finalidade:
 * Centraliza as coleções usadas pelo Diário e impede consultas directas ao
 * PocketBase nas vistas e componentes.
 */
import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";
import type { NamedRecord } from "@/types/records";
import type {
  DiaryEntryRecord,
  EpisodeRecord,
  ReviewRecord,
  SeasonRecord,
} from "./records";

export const diaryEntryRepository =
  new PocketBaseRepository<DiaryEntryRecord>("visualizacoes");

export const reviewRepository =
  new PocketBaseRepository<ReviewRecord>("reviews");

export const seasonRepository =
  new PocketBaseRepository<SeasonRecord>("temporadas");

export const diaryEpisodeRepository =
  new PocketBaseRepository<EpisodeRecord>("episodios");

export const diaryPlatformRepository =
  new PocketBaseRepository<NamedRecord>("plataformas");
