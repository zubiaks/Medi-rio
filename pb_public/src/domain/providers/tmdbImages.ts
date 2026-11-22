/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbImages.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Cliente e serviço de domínio TypeScript
 * Domínio: Providers / imagens TMDB
 * Finalidade: Carregar e selecionar imagens externas sem descarregar ficheiros.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import { pb } from "@/infrastructure/pocketbase/client";
import { titleRepository } from "@/domain/repositories";
import type { TitleRecord } from "@/types/records";
import type { TmdbDetailType } from "./tmdbClient";

export type TmdbImageKind = "poster" | "backdrop" | "logo";
export interface TmdbImage { file_path: string; url: string; preview_url: string; language: string; width: number; height: number; vote_average: number }
export interface TmdbImagesResponse { posters: TmdbImage[]; backdrops: TmdbImage[]; logos: TmdbImage[] }

export async function loadTmdbImages(type: TmdbDetailType, id: number): Promise<TmdbImagesResponse> {
  return pb.send(`/api/mediario/providers/tmdb/images/${type}/${id}`, { method: "GET" });
}

export function selectTmdbImagePayload(kind: TmdbImageKind, image: TmdbImage): Record<string, string> {
  return { [`${kind}_url`]: image.url };
}

export async function applyTmdbImages(title: TitleRecord, selected: Partial<Record<TmdbImageKind, TmdbImage>>): Promise<Record<string, string>> {
  const payload = Object.entries(selected).reduce<Record<string, string>>((result, [kind, image]) => {
    if (image) Object.assign(result, selectTmdbImagePayload(kind as TmdbImageKind, image));
    return result;
  }, {});
  if (!Object.keys(payload).length) throw new Error("Seleciona pelo menos uma imagem.");
  await titleRepository.update(title.id, payload);
  return payload;
}
