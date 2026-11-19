import type { RecordModel } from "pocketbase";
export interface LookupRecord extends RecordModel { nome:string; ordem?:number; ativo?:boolean; ativa?:boolean; midia?:string; }
export interface LookupOption { id:string; label:string; order:number; parentId?:string; }
export interface CatalogLookups { midias:LookupOption[]; tipos:LookupOption[]; estados:LookupOption[]; generos:LookupOption[]; tags:LookupOption[]; idiomas:LookupOption[]; paises:LookupOption[]; plataformas:LookupOption[]; companhias:LookupOption[]; categoriasFonte:LookupOption[]; }
