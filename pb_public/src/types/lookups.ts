/**
 * MediÃ¡rio
 * Copyright Â© 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
import type { RecordModel } from "pocketbase";
export interface LookupRecord extends RecordModel { nome:string; ordem?:number; ativo?:boolean; ativa?:boolean; midia?:string; }
export interface LookupOption { id:string; label:string; order:number; parentId?:string; }
export interface CatalogLookups { midias:LookupOption[]; tipos:LookupOption[]; estados:LookupOption[]; generos:LookupOption[]; tags:LookupOption[]; idiomas:LookupOption[]; paises:LookupOption[]; plataformas:LookupOption[]; companhias:LookupOption[]; categoriasFonte:LookupOption[]; }
