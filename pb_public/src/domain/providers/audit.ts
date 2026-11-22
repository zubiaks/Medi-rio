/**
 * Escrita centralizada no `audit_log` sem dados sensíveis.
 */
import { auditLogRepository } from "./repository";
import type {
  AuditAction,
  AuditLogRecord,
  AuditOrigin,
} from "./records";

export interface AuditInput {
  entidade: string;
  entidade_id?: string;
  entidade_nome?: string;
  acao: AuditAction;
  origem: AuditOrigin;
  sucesso: boolean;
  erro?: string;
  detalhes?: Record<string, unknown>;
}

const sensitivePattern = /(api[_-]?key|token|password|secret|authorization)/i;

export function sanitizeAuditDetails(
  value: unknown,
  depth = 0,
): unknown {
  if (depth > 6) return "[profundidade limitada]";
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuditDetails(item, depth + 1));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        sensitivePattern.test(key)
          ? "[ocultado]"
          : sanitizeAuditDetails(item, depth + 1),
      ]),
    );
  }
  return value;
}

export async function writeAuditLog(
  input: AuditInput,
): Promise<AuditLogRecord> {
  return auditLogRepository.create({
    entidade: input.entidade.slice(0, 50),
    entidade_id: input.entidade_id?.slice(0, 50) || "",
    entidade_nome: input.entidade_nome?.slice(0, 255) || "",
    acao: input.acao,
    detalhes: sanitizeAuditDetails(input.detalhes || {}),
    user_info: "frontend-local",
    origem: input.origem,
    sucesso: input.sucesso,
    erro: input.erro?.slice(0, 2000) || "",
  });
}
