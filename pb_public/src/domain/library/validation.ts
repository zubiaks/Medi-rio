import type { LibraryCopyForm } from "./records";
export type LibraryCopyErrors=Partial<Record<keyof LibraryCopyForm,string>>;
export function createLibraryCopyForm(value?:Partial<LibraryCopyForm>):LibraryCopyForm{return{titulo:value?.titulo||"",localizacao:value?.localizacao||"",emprestado:Boolean(value?.emprestado)}}
export function validateLibraryCopyForm(value:LibraryCopyForm):LibraryCopyErrors{const errors:LibraryCopyErrors={};if(!value.titulo)errors.titulo="Seleciona um título do catálogo.";if(value.localizacao.length>200)errors.localizacao="A localização não pode exceder 200 caracteres.";return errors}
export const hasLibraryCopyErrors=(value:LibraryCopyErrors)=>Object.keys(value).length>0;
