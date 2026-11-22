/** Histórico local e exportação de relatórios M3U. */
import type { M3uImportMode } from "./m3uImportPlan";
const KEY="mediario-iptv-m3u-history";
const LIMIT=20;
export interface M3uImportHistoryEntry { id:string;date:string;fileName:string;mode:M3uImportMode;durationMs:number;imported:number;updated:number;unchanged:number;skipped:number;failed:number;categoriesCreated:number;internalDuplicates:number;sourcesAdded:number;failures:{name:string;message:string}[] }
export function getM3uImportHistory():M3uImportHistoryEntry[]{try{const v=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(v)?v.slice(0,LIMIT):[]}catch{return[]}}
export function addM3uImportHistory(entry:M3uImportHistoryEntry){const next=[entry,...getM3uImportHistory()].slice(0,LIMIT);localStorage.setItem(KEY,JSON.stringify(next));return next}
export function clearM3uImportHistory(){localStorage.removeItem(KEY)}
function safe(value:string){return value.replace(/[?&](token|key|password|username|user|auth)=[^&]*/gi,"$1=REDACTED")}
export function reportCsv(entry:M3uImportHistoryEntry){const rows=[["ficheiro","data","modo","duracao_ms","criados","atualizados","inalterados","ignorados","falhados","fontes","categorias"],[safe(entry.fileName),entry.date,entry.mode,String(entry.durationMs),String(entry.imported),String(entry.updated),String(entry.unchanged),String(entry.skipped),String(entry.failed),String(entry.sourcesAdded),String(entry.categoriesCreated)]];return rows.map(r=>r.map(v=>`"${v.replaceAll('"','""')}"`).join(",")).join("\n")}
export function downloadM3uReport(entry:M3uImportHistoryEntry|undefined,format:"json"|"csv"){if(!entry)return;const body=format==="json"?JSON.stringify(entry,null,2):reportCsv(entry);const url=URL.createObjectURL(new Blob([body],{type:format==="json"?"application/json":"text/csv"}));const a=document.createElement("a");a.href=url;a.download=`m3u-report-${entry.id}.${format}`;a.click();URL.revokeObjectURL(url)}
