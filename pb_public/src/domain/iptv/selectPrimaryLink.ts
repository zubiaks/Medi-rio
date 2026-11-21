/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 * See LICENSE.md.
 */
import type { ChannelRecord,StreamLinkRecord } from "@/types/records";
import { requiresBackend } from "./format";
export interface SelectedStreamSource{source:"stream_link"|"channel_fallback";linkId?:string;channelId:string;url:string;label:string;type:NonNullable<StreamLinkRecord["tipo"]>;quality?:StreamLinkRecord["qualidade"];priority:number;state?:StreamLinkRecord["ultimo_estado"];requiresBackend:boolean;}
const order:Record<string,number>={ok:0,lento:1,instavel:2,desconhecido:3,limite_excedido:4,autenticacao:5,geobloqueado:6,bloqueado:7,offline:8};
export function inferStreamType(url:string):NonNullable<StreamLinkRecord["tipo"]>{const v=url.toLowerCase();if(v.startsWith("rtmp"))return"rtmp";if(v.startsWith("rtsp"))return"rtsp";if(v.startsWith("udp")||v.startsWith("rtp"))return"udp";if(/\\.m3u8(?:$|[?#])/.test(v))return"hls";if(/\\.mpd(?:$|[?#])/.test(v))return"dash";if(/\\.(mp3|aac|m4a|ogg|opus)(?:$|[?#])/.test(v))return"audio";return"http";}
function normalized(channel:ChannelRecord,l:StreamLinkRecord):SelectedStreamSource{const type=l.tipo||inferStreamType(l.url);return{source:"stream_link",linkId:l.id,channelId:channel.id,url:l.url.trim(),label:l.rotulo?.trim()||`Fonte ${l.prioridade??1000}`,type,quality:l.qualidade,priority:Math.max(0,Math.trunc(l.prioridade??1000)),state:l.ultimo_estado,requiresBackend:requiresBackend({...l,tipo:type})};}
export function selectPrimaryLink(channel:ChannelRecord,links:StreamLinkRecord[]){const active=links.filter(l=>l.ativo!==false&&l.url?.trim()).map(l=>normalized(channel,l)).sort((a,b)=>a.priority-b.priority||(order[a.state||"desconhecido"]-order[b.state||"desconhecido"]));if(active.length)return{selected:active[0],alternatives:active.slice(1)};const url=channel.url_stream?.trim();if(!url)return{selected:null,alternatives:[]};const type=inferStreamType(url);return{selected:{source:"channel_fallback" as const,channelId:channel.id,url,label:"Stream principal do canal",type,quality:channel.qualidade,priority:9999,requiresBackend:requiresBackend({tipo:type})},alternatives:[]};}
