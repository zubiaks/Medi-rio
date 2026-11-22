/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbSeasons.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / temporadas e episódios TMDB
 * Finalidade: Pré-visualizar e importar temporadas e episódios sem duplicados.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import { pb } from "@/infrastructure/pocketbase/client";
import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";
import type { BaseRecord, TitleRecord } from "@/types/records";

export interface TmdbEpisode { id: number; episode_number: number; name: string; overview: string; air_date: string; runtime: number; vote_average: number; thumbnail_url: string }
export interface TmdbSeason { id: number; season_number: number; name: string; overview: string; air_date: string; poster_url: string; episodes: TmdbEpisode[] }
interface SeasonRecord extends BaseRecord { titulo: string; numero: number; tmdb_id?: number }
interface EpisodeRecord extends BaseRecord { temporada: string; numero: number; tmdb_id?: number }

const seasonRepository = new PocketBaseRepository<SeasonRecord>("temporadas");
const episodeRepository = new PocketBaseRepository<EpisodeRecord>("episodios");

export async function loadTmdbSeason(tmdbId: number, season: number): Promise<TmdbSeason> {
  return pb.send(`/api/mediario/providers/tmdb/season/${tmdbId}/${season}`, { method: "GET" });
}

export async function importTmdbSeason(title: TitleRecord, value: TmdbSeason): Promise<{ seasonCreated: boolean; episodesCreated: number; episodesUpdated: number }> {
  const existing = await seasonRepository.list({ page: 1, perPage: 1, filter: `titulo = "${title.id}" && numero = ${value.season_number}` });
  const seasonPayload = { titulo: title.id, numero: value.season_number, nome: value.name, ano: value.air_date ? Number(value.air_date.slice(0, 4)) : null, sinopse: value.overview, data_estreia: value.air_date, poster_url: value.poster_url, tmdb_id: value.id, n_episodios: value.episodes.length, especial: value.season_number === 0, metadata_extra: { provider: "tmdb" } };
  const season = existing.items[0] ? await seasonRepository.update(existing.items[0].id, seasonPayload) : await seasonRepository.create(seasonPayload);
  let episodesCreated = 0;
  let episodesUpdated = 0;
  for (const episode of value.episodes) {
    const found = await episodeRepository.list({ page: 1, perPage: 1, filter: `temporada = "${season.id}" && numero = ${episode.episode_number}` });
    const payload = { temporada: season.id, numero: episode.episode_number, titulo: episode.name || `Episódio ${episode.episode_number}`, duracao_min: episode.runtime || null, sinopse: episode.overview, data_exibicao: episode.air_date, rating: episode.vote_average || null, thumbnail: "", tmdb_id: episode.id };
    if (found.items[0]) { await episodeRepository.update(found.items[0].id, payload); episodesUpdated += 1; }
    else { await episodeRepository.create(payload); episodesCreated += 1; }
  }
  return { seasonCreated: !existing.items[0], episodesCreated, episodesUpdated };
}
