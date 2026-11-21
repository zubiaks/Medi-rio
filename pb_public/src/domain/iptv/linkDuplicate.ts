/**
 * Ficheiro: src/domain/iptv/linkDuplicate.ts
 * Tipo: Serviço de domínio.
 * Função: Impede URLs repetidos no mesmo canal TV.
 */
import { streamLinkRepository } from "@/domain/repositories";
const esc=(v:string)=>v.replaceAll("\\","\\\\").replaceAll('"','\\"');
export async function findDuplicateLink(channelId:string,url:string,excludeId?:string){const exclude=excludeId?` && id != "${excludeId}"`:"";const result=await streamLinkRepository.list({page:1,perPage:1,filter:`canal_tv = "${channelId}" && url = "${esc(url.trim())}"${exclude}`});return result.items[0]||null;}
