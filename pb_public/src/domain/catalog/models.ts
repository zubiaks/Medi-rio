/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
export interface TitleFormData {
  titulo:string; tituloOriginal:string; midiaId:string; tipoId:string; estadoId:string; ano:number|null;
  dataLancamento:string; classificacaoEtaria:string; sinopse:string; tagline:string; notasPessoais:string;
  duracaoMin:number|null; paginas:number|null; horasJogadas:number|null; paisIds:string[]; idiomaIds:string[];
  generoIds:string[]; tagIds:string[]; plataformaIds:string[]; companhiaIds:string[]; categoriaFonteIds:string[];
  rating:number|null; tmdbId:number|null; tipoTmdb:""|"movie"|"tv"; imdbId:string; adulto:boolean; canonico:boolean;
  posterFile:File|null; backdropFile:File|null; logoFile:File|null;
  posterUrl:string; backdropUrl:string; logoUrl:string;
  removePoster:boolean; removeBackdrop:boolean; removeLogo:boolean;
}
export type TitleValidationErrors=Record<string,string>;
export const createEmptyTitleForm=():TitleFormData=>({titulo:"",tituloOriginal:"",midiaId:"",tipoId:"",estadoId:"",ano:null,dataLancamento:"",classificacaoEtaria:"",sinopse:"",tagline:"",notasPessoais:"",duracaoMin:null,paginas:null,horasJogadas:null,paisIds:[],idiomaIds:[],generoIds:[],tagIds:[],plataformaIds:[],companhiaIds:[],categoriaFonteIds:[],rating:null,tmdbId:null,tipoTmdb:"",imdbId:"",adulto:false,canonico:false,posterFile:null,backdropFile:null,logoFile:null,posterUrl:"",backdropUrl:"",logoUrl:"",removePoster:false,removeBackdrop:false,removeLogo:false});
