/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 * See LICENSE.md.
 */
import type { StreamLinkRecord } from "@/types/records";
export type StreamHealthTone = "success" | "warning" | "danger" | "muted";
const states: Record<string,string>={ok:"Online",lento:"Lento",instavel:"Instável",offline:"Offline",bloqueado:"Bloqueado",geobloqueado:"Geobloqueado",autenticacao:"Requer autenticação",limite_excedido:"Limite excedido",desconhecido:"Desconhecido"};
const protocols: Record<string,string>={hls:"HLS",dash:"MPEG-DASH",http:"HTTP",audio:"Áudio",rtmp:"RTMP",rtsp:"RTSP",udp:"UDP",outro:"Outro"};
export const qualityLabel=(v?:string)=>v==="FHD"?"Full HD":v==="Audio"?"Áudio":v||"Desconhecida";
export const protocolLabel=(v?:string)=>protocols[v||""]||"Tipo desconhecido";
export const streamStateLabel=(v?:string)=>v?states[v]||"Desconhecido":"Sem teste";
export function streamStateTone(v?:string):StreamHealthTone{if(v==="ok")return"success";if(["lento","instavel","limite_excedido"].includes(v||""))return"warning";if(["offline","bloqueado","geobloqueado","autenticacao"].includes(v||""))return"danger";return"muted";}
export function formatTestDate(v?:string){if(!v)return"Nunca testado";const d=new Date(v);return Number.isNaN(d.getTime())?"Data desconhecida":new Intl.DateTimeFormat("pt-PT",{dateStyle:"short",timeStyle:"short"}).format(d);}
export const requiresBackend=(l:Pick<StreamLinkRecord,"tipo"|"referrer"|"user_agent">)=>Boolean(l.referrer||l.user_agent||["rtmp","rtsp","udp"].includes(l.tipo||""));
