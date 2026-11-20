/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
import type { AvailabilityRecord, ChannelRecord, PodcastEpisodeRecord, StreamRecord, TitleRecord } from "@/types/records";
import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";

export const titleRepository = new PocketBaseRepository<TitleRecord>("titulos");
export const streamRepository = new PocketBaseRepository<StreamRecord>("streams");
export const episodeRepository = new PocketBaseRepository<PodcastEpisodeRecord>("podcast_episodios");
export const channelRepository = new PocketBaseRepository<ChannelRecord>("canais_tv");
export const availabilityRepository = new PocketBaseRepository<AvailabilityRecord>("disponibilidades");
export const exemplarRepository = new PocketBaseRepository("exemplares");
