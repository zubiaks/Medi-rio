/**
 * Diagnóstico puro das tarefas, fontes e registos incompletos.
 */
import type { ExternalSourceRecord, SyncJobRecord } from "@/domain/providers/records";
import type { TitleRecord } from "@/types/records";

export interface MaintenanceIssue {
  id: string;
  severity: "informação" | "aviso" | "erro";
  category: string;
  title: string;
  description: string;
  entityId?: string;
}

export function detectStuckJobs(
  jobs: SyncJobRecord[],
  now = new Date(),
  thresholdMinutes = 60,
): MaintenanceIssue[] {
  const threshold = thresholdMinutes * 60_000;
  return jobs
    .filter((job) => job.estado === "em_execucao")
    .filter((job) => now.getTime() - new Date(job.iniciado_em).getTime() > threshold)
    .map((job) => ({
      id: `job-${job.id}`,
      severity: "aviso" as const,
      category: "Sincronização",
      title: `Tarefa ${job.provider} possivelmente bloqueada`,
      description: `Em execução há mais de ${thresholdMinutes} minutos.`,
      entityId: job.id,
    }));
}

export function detectIncompleteSources(
  sources: ExternalSourceRecord[],
): MaintenanceIssue[] {
  return sources.flatMap((source) => {
    const issues: MaintenanceIssue[] = [];
    if (!source.external_url) {
      issues.push({
        id: `source-url-${source.id}`,
        severity: "informação",
        category: "Fonte externa",
        title: `${source.provider}: endereço externo em falta`,
        description: `A fonte ${source.external_id} não tem ligação externa.`,
        entityId: source.id,
      });
    }
    return issues;
  });
}

export function detectIncompleteTitles(titles: TitleRecord[]): MaintenanceIssue[] {
  return titles.flatMap((title) => {
    const missing = [
      !title.titulo && "título",
      !title.midia && "tipo de média",
      !title.ano && "ano",
      !title.poster && !title.poster_url && "capa",
    ].filter(Boolean);
    return missing.length
      ? [{
          id: `title-${title.id}`,
          severity: "informação" as const,
          category: "Catálogo",
          title: title.titulo || "Título sem nome",
          description: `Dados em falta: ${missing.join(", ")}.`,
          entityId: title.id,
        }]
      : [];
  });
}
