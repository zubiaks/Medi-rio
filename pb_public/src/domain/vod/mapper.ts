/**
 * MediÃ¡rio
 * Copyright Â© 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
import type { AvailabilityRecord } from "@/types/records";
import { createEmptyVodForm, type VodFormData, type VodQuality, type VodType, VOD_QUALITIES, VOD_TYPES } from "./models";
const date=(v?:string)=>v?.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]||"";
const quality=(v?:string):VodQuality=>{const normalized=(v||"").trim().toLowerCase();return VOD_QUALITIES.includes(normalized as Exclude<VodQuality,"">)?normalized as VodQuality:""};
export function mapAvailabilityToForm(r:AvailabilityRecord):VodFormData{const f=createEmptyVodForm();f.tituloId=r.titulo||"";f.providerNome=r.provider_nome||"";f.tipo=VOD_TYPES.includes(r.tipo as VodType)?r.tipo as VodType:"outro";f.url=r.url||"";f.paisId=r.pais||"";f.qualidade=quality(r.qualidade);f.preco=typeof r.preco==="number"&&r.preco>=0?r.preco:null;f.moeda=(r.moeda||"EUR").toUpperCase();f.incluidoSubscricao=r.incluido_subscricao===true;f.dataInicio=date(r.data_inicio);f.dataFim=date(r.data_fim);f.ativo=r.ativo!==false;return f}
export function mapVodFormToPayload(f:VodFormData):Record<string,unknown>{return{titulo:f.tituloId,provider_nome:f.providerNome.trim(),tipo:f.tipo,url:f.url.trim(),pais:f.paisId,qualidade:f.qualidade,preco:f.preco,moeda:f.moeda.trim().toUpperCase(),incluido_subscricao:f.incluidoSubscricao,data_inicio:f.dataInicio||"",data_fim:f.dataFim||"",ativo:f.ativo}}
