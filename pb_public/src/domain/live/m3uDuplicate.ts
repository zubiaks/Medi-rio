/** Ficheiro: src/domain/live/m3uDuplicate.ts | Deteta duplicados da importação M3U. */
import type { ChannelRecord } from "@/types/records";import type { M3uItem } from "./m3u";import { normalizeM3uName } from "./m3u";
export type DuplicateKind="tvg_id"|"url"|"name"|null;
export function findM3uDuplicate(item:M3uItem,channels:ChannelRecord[]):{kind:DuplicateKind;channel?:ChannelRecord}{if(item.tvgId){const c=channels.find(x=>x.tvg_id===item.tvgId);if(c)return{kind:"tvg_id",channel:c}}const byUrl=channels.find(x=>x.url_stream===item.url);if(byUrl)return{kind:"url",channel:byUrl};const name=normalizeM3uName(item.name);const byName=channels.find(x=>normalizeM3uName(x.nome)===name);return byName?{kind:"name",channel:byName}:{kind:null}}
