/**
 * Ficheiro: src/domain/live/linkValidation.ts
 * Tipo: Validação TypeScript pura.
 * Função: Valida e normaliza formulários da coleção stream_links.
 */
import type { StreamLinkRecord } from "@/types/records";
export interface StreamLinkFormData { url:string;rotulo:string;tipo:NonNullable<StreamLinkRecord["tipo"]>;qualidade:NonNullable<StreamLinkRecord["qualidade"]>;prioridade:number|null;ativo:boolean;referrer:string;user_agent:string; }
export type StreamLinkFormErrors=Partial<Record<keyof StreamLinkFormData,string>>;
const protocols:Record<NonNullable<StreamLinkRecord["tipo"]>,string[]>={hls:["http:","https:"],dash:["http:","https:"],http:["http:","https:"],audio:["http:","https:"],rtmp:["rtmp:","rtmps:"],rtsp:["rtsp:"],udp:["udp:","rtp:"],outro:["http:","https:","rtmp:","rtmps:","rtsp:","udp:","rtp:"]};
export function createLinkForm(link?:StreamLinkRecord|null):StreamLinkFormData{return{url:link?.url||"",rotulo:link?.rotulo||"",tipo:link?.tipo||"hls",qualidade:link?.qualidade||"Desconhecida",prioridade:link?.prioridade??10,ativo:link?.ativo!==false,referrer:link?.referrer||"",user_agent:link?.user_agent||""}}
export function validateStreamLinkForm(v:StreamLinkFormData):StreamLinkFormErrors{const e:StreamLinkFormErrors={};if(!v.url.trim())e.url="Indica o endereço do stream.";else{try{const u=new URL(v.url.trim());if(!protocols[v.tipo].includes(u.protocol))e.url=`O protocolo não corresponde ao tipo ${v.tipo.toUpperCase()}.`;}catch{e.url="O endereço do stream não é válido."}}if(v.url.length>2000)e.url="O endereço não pode exceder 2000 caracteres.";if(v.rotulo.length>200)e.rotulo="O rótulo não pode exceder 200 caracteres.";if(v.referrer){try{const u=new URL(v.referrer);if(!["http:","https:"].includes(u.protocol))throw 0}catch{e.referrer="O referrer deve começar por http:// ou https://."}}if(v.referrer.length>2000)e.referrer="O referrer não pode exceder 2000 caracteres.";if(v.user_agent.length>500)e.user_agent="O user agent não pode exceder 500 caracteres.";if(v.prioridade===null||!Number.isInteger(v.prioridade)||v.prioridade<0)e.prioridade="A prioridade deve ser um número inteiro igual ou superior a zero.";return e}
export const linkFormHasErrors=(e:StreamLinkFormErrors)=>Object.keys(e).length>0;
