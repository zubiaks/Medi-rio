/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
export const qualityLabel=(value?:string)=>({desconhecida:"Desconhecida",sd:"SD",hd:"HD",fhd:"Full HD","4k":"4K","8k":"8K",audio:"Áudio"}[String(value||"").toLowerCase()]||value||"—");
export const typeLabel=(value?:string)=>({streaming:"Streaming",aluguer:"Aluguer",compra:"Compra",gratuito:"Gratuito",biblioteca:"Biblioteca",fisico:"Físico",outro:"Outro"}[value||""]||value||"—");
export function money(value?:number, currency="EUR"){if(value===undefined||value===null)return "";try{return new Intl.NumberFormat("pt-PT",{style:"currency",currency}).format(value)}catch{return `${value.toFixed(2)} ${currency}`}}
export const isExpired=(value?:string)=>Boolean(value&&new Date(value).getTime()<new Date(new Date().toISOString().slice(0,10)).getTime());


