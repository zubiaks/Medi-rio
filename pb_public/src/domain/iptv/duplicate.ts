/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 * See LICENSE.md.
 */
import { iptvChannelRepository } from "@/domain/repositories";
export interface ChannelDuplicateResult{blocked:boolean;warning:boolean;message:string;recordId?:string;}
const esc=(v:string)=>v.replaceAll("\\","\\\\").replaceAll('"','\\"');
export async function checkChannelDuplicate(data:{id?:string;tvg_id?:string;url_stream:string;nome:string;pais?:string}):Promise<ChannelDuplicateResult>{const exclusions=data.id?` && id != "${data.id}"`:"";if(data.tvg_id?.trim()){const r=await iptvChannelRepository.list({page:1,perPage:1,filter:`tvg_id = "${esc(data.tvg_id.trim())}"${exclusions}`});if(r.items[0])return{blocked:true,warning:false,message:"Já existe um canal com o mesmo tvg-id.",recordId:r.items[0].id};}const u=await iptvChannelRepository.list({page:1,perPage:1,filter:`url_stream = "${esc(data.url_stream.trim())}"${exclusions}`});if(u.items[0])return{blocked:true,warning:false,message:"Já existe um canal com o mesmo endereço principal.",recordId:u.items[0].id};const parts=[`nome ~ "${esc(data.nome.trim())}"`];if(data.pais)parts.push(`pais = "${data.pais}"`);const n=await iptvChannelRepository.list({page:1,perPage:1,filter:`${parts.join(" && ")}${exclusions}`});return n.items[0]?{blocked:false,warning:true,message:"Encontrámos um canal com nome e país semelhantes.",recordId:n.items[0].id}:{blocked:false,warning:false,message:""};}
