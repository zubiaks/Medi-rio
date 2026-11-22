/**
 * Projeto: Mediário
 * Ficheiro: src/domain/providers/repository.ts
 * Tipo: Repositórios PocketBase
 * Domínio: Providers e manutenção
 */
import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";
import type {
  AppSettingRecord,
  AuditLogRecord,
  ExternalSourceRecord,
  SyncJobRecord,
} from "./records";

export const externalSourceRepository =
  new PocketBaseRepository<ExternalSourceRecord>("fontes_externas");
export const syncJobRepository =
  new PocketBaseRepository<SyncJobRecord>("sync_jobs");
export const appSettingRepository =
  new PocketBaseRepository<AppSettingRecord>("app_settings");
export const auditLogRepository =
  new PocketBaseRepository<AuditLogRecord>("audit_log");
