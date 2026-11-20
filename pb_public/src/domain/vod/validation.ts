/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
import type{VodFormData,VodValidationErrors}from"./models";
function safeUrl(v:string){if(!v.trim())return true;try{const u=new URL(v);return u.protocol==="http:"||u.protocol==="https:"}catch{return false}}
export function validateVodForm(f:VodFormData):VodValidationErrors{const e:VodValidationErrors={};if(!f.tituloId)e.tituloId="Seleciona um título.";if(!f.providerNome.trim())e.providerNome="Indica o provider.";if(!safeUrl(f.url))e.url="Usa uma URL HTTP ou HTTPS válida.";if(f.preco!==null&&f.preco<0)e.preco="O preço não pode ser negativo.";if(f.preco!==null&&!/^[A-Za-z]{3}$/.test(f.moeda.trim()))e.moeda="Usa um código de moeda ISO 4217 com três letras, por exemplo EUR.";if(f.dataInicio&&f.dataFim&&f.dataFim<f.dataInicio)e.dataFim="A data final não pode ser anterior à data inicial.";return e}
