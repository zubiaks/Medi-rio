/**
 * MediÃ¡rio
 * Copyright Â© 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
export const VOD_TYPES = ["streaming", "aluguer", "compra", "gratuito", "broadcast", "biblioteca", "fisico", "outro"] as const;
export type VodType = (typeof VOD_TYPES)[number];
export const VOD_QUALITIES = ["desconhecida", "sd", "hd", "fhd", "4k", "8k", "audio"] as const;
export type VodQuality = "" | (typeof VOD_QUALITIES)[number];
export interface VodFormData { tituloId:string; providerNome:string; tipo:VodType; url:string; paisId:string; qualidade:VodQuality; preco:number|null; moeda:string; incluidoSubscricao:boolean; dataInicio:string; dataFim:string; ativo:boolean }
export type VodValidationErrors = Record<string,string>;
export const createEmptyVodForm = ():VodFormData => ({tituloId:"",providerNome:"",tipo:"streaming",url:"",paisId:"",qualidade:"",preco:null,moeda:"EUR",incluidoSubscricao:true,dataInicio:"",dataFim:"",ativo:true});
