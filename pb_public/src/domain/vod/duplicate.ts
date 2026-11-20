import type { AvailabilityRecord } from "@/types/records";
import type { VodFormData } from "./models";
const normalize=(v:string)=>v.trim().toLocaleLowerCase("pt-PT");
export function duplicateFilter(form:VodFormData,currentId=""){const parts=[`titulo = "${form.tituloId}"`,`tipo = "${form.tipo}"`];parts.push(form.paisId?`pais = "${form.paisId}"`:`pais = ""`);if(currentId)parts.push(`id != "${currentId}"`);return parts.join(" && ")}
export function sameProvider(items:AvailabilityRecord[],form:VodFormData){return items.find(item=>normalize(item.provider_nome)===normalize(form.providerNome));}
