/**
 * MediÃ¡rio
 * Copyright Â© 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
import type { TitleFormData } from "./models";
export interface ExistingTitleImages { poster?:string; backdrop?:string; logo?:string }
export function isSafeImageUrl(value:string):boolean{if(!value.trim())return true;try{const u=new URL(value);return u.protocol==="http:"||u.protocol==="https:"}catch{return false}}
export function applyTitleImages(payload:Record<string,unknown>,form:TitleFormData,mode:"create"|"update"){
 const result={...payload};
 const defs=[["poster",form.posterFile,form.removePoster,"poster_url",form.posterUrl],["backdrop",form.backdropFile,form.removeBackdrop,"backdrop_url",form.backdropUrl],["logo",form.logoFile,form.removeLogo,"logo_url",form.logoUrl]] as const;
 for(const[fileField,file,remove,urlField,url]of defs){if(file)result[fileField]=file;else if(mode==="update"&&remove)result[fileField]=null;result[urlField]=url.trim()}
 return result;
}
