/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbCredits.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / créditos TMDB
 * Finalidade: Resolver pessoas e criar créditos sem duplicados.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";
import type { BaseRecord, TitleRecord } from "@/types/records";
import type { TmdbDetails } from "./tmdbClient";

interface PersonRecord extends BaseRecord { nome: string; tmdb_id?: number }
interface FunctionRecord extends BaseRecord { nome: string; slug: string; departamento?: string }
interface CreditRecord extends BaseRecord { provider_credit_id?: string }

export type CreditGroup = "cast" | "directors" | "writers";
export interface CreditPreview { group: CreditGroup; label: string; values: string[] }

const peopleRepository = new PocketBaseRepository<PersonRecord>("pessoas");
const functionsRepository = new PocketBaseRepository<FunctionRecord>("funcoes_credito");
const creditsRepository = new PocketBaseRepository<CreditRecord>("creditos");

function escapeFilter(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function slugify(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function buildCreditPreview(details: TmdbDetails): CreditPreview[] {
  const credits = details.credits || { cast: [], crew: [] };
  return [
    { group: "cast", label: "Elenco", values: credits.cast.map((item) => `${item.name}${item.character ? ` — ${item.character}` : ""}`) },
    { group: "directors", label: "Realização", values: credits.crew.filter((item) => item.job === "Director").map((item) => item.name) },
    { group: "writers", label: "Argumento", values: credits.crew.filter((item) => ["Writer", "Screenplay", "Teleplay", "Creator"].includes(item.job)).map((item) => `${item.name} — ${item.job}`) },
  ].filter((item) => item.values.length) as CreditPreview[];
}

async function resolvePerson(item: { id: number; name: string; profile_url: string; popularity: number; department: string }): Promise<PersonRecord> {
  const found = await peopleRepository.list({ page: 1, perPage: 1, filter: `tmdb_id = ${item.id}` });
  if (found.items[0]) return found.items[0];
  return peopleRepository.create({ nome: item.name, tmdb_id: item.id, foto_url: item.profile_url, popularidade: item.popularity, departamento: item.department, ativo: true });
}

async function resolveFunction(name: string, department: string): Promise<FunctionRecord> {
  const slug = slugify(name);
  const found = await functionsRepository.list({ page: 1, perPage: 1, filter: `slug = "${escapeFilter(slug)}"` });
  if (found.items[0]) return found.items[0];
  return functionsRepository.create({ nome: name, slug, departamento: department, ordem: 0, ativo: true });
}

export async function importTmdbCredits(title: TitleRecord, details: TmdbDetails, groups: CreditGroup[]): Promise<{ created: number; skipped: number }> {
  const credits = details.credits || { cast: [], crew: [] };
  const items: Array<{ person: any; job: string; department: string; character: string; order: number; creditId: string }> = [];
  if (groups.includes("cast")) credits.cast.forEach((item) => items.push({ person: item, job: "Ator", department: "Acting", character: item.character, order: item.order, creditId: item.credit_id }));
  if (groups.includes("directors")) credits.crew.filter((item) => item.job === "Director").forEach((item) => items.push({ person: item, job: "Realizador", department: item.department, character: "", order: 0, creditId: item.credit_id }));
  if (groups.includes("writers")) credits.crew.filter((item) => ["Writer", "Screenplay", "Teleplay", "Creator"].includes(item.job)).forEach((item) => items.push({ person: item, job: item.job, department: item.department, character: "", order: 0, creditId: item.credit_id }));

  let created = 0;
  let skipped = 0;
  for (const item of items) {
    const existing = item.creditId ? await creditsRepository.list({ page: 1, perPage: 1, filter: `provider = "tmdb" && provider_credit_id = "${escapeFilter(item.creditId)}"` }) : null;
    if (existing?.items[0]) { skipped += 1; continue; }
    const person = await resolvePerson(item.person);
    const role = await resolveFunction(item.job, item.department);
    await creditsRepository.create({ titulo: title.id, pessoa: person.id, funcao: role.id, personagem_nome: item.character, departamento: item.department, ordem: item.order, creditado: true, voz: false, provider: "tmdb", provider_credit_id: item.creditId, metadata_extra: { tmdb_person_id: item.person.id } });
    created += 1;
  }
  return { created, skipped };
}
