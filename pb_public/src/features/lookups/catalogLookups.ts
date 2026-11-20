/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
import{pb}from"@/infrastructure/pocketbase/client";import type{CatalogLookups,LookupOption,LookupRecord}from"@/types/lookups";
let cache:CatalogLookups|null=null;const map=(r:LookupRecord[],parent=""):LookupOption[]=>r.filter(x=>x.ativo!==false&&x.ativa!==false).map(x=>({id:x.id,label:x.nome,order:Number(x.ordem??999999),parentId:parent?String(x[parent]||""):undefined})).sort((a,b)=>a.order-b.order||a.label.localeCompare(b.label,"pt"));async function get(c:string,p=""){return map(await pb.collection(c).getFullList<LookupRecord>({sort:"ordem,nome"}),p)}
export async function loadCatalogLookups(force=false):Promise<CatalogLookups>{if(cache&&!force)return cache;const[midias,tipos,estados,generos,tags,idiomas,paises,plataformas,companhias,categoriasFonte]=await Promise.all([get("midias"),get("tipos_titulo","midia"),get("estados"),get("generos"),get("tags"),get("idiomas"),get("paises"),get("plataformas"),get("companhias"),get("categorias_fonte")]);return cache={midias,tipos,estados,generos,tags,idiomas,paises,plataformas,companhias,categoriasFonte};}
