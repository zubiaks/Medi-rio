/**
 * Ficheiro: src/domain/iptv/filterOptions.ts
 * Tipo: Transformação TypeScript pura.
 * Função: Gera filtros exclusivamente com valores realmente usados.
 */
import type { ChannelRecord, NamedRecord, TvCategoryRecord } from "@/types/records";
export interface UsedFilterOption { value:string; label:string; count:number }
function count(channels:ChannelRecord[],field:"pais"|"categoria"){const map=new Map<string,number>();for(const item of channels){const id=item[field];if(id)map.set(id,(map.get(id)||0)+1)}return map}
function clean(items:UsedFilterOption[]){return items.filter(x=>x.value&&x.label.trim()&&x.count>0).sort((a,b)=>a.label.localeCompare(b.label,"pt-PT"))}
export function usedCountries(channels:ChannelRecord[],lookups:NamedRecord[]){const map=count(channels,"pais");return clean(lookups.map(x=>({value:x.id,label:x.nome||x.codigo||"",count:map.get(x.id)||0})))}
export function usedCategories(channels:ChannelRecord[],lookups:TvCategoryRecord[]){const map=count(channels,"categoria");return clean(lookups.map(x=>({value:x.id,label:x.nome||"",count:map.get(x.id)||0})))}
export function usedQualities(channels:ChannelRecord[]){const map=new Map<string,number>();for(const item of channels){const value=item.qualidade||"Desconhecida";map.set(value,(map.get(value)||0)+1)}return clean([...map].map(([value,count])=>({value,label:value==="FHD"?"Full HD":value,count})))}
