/** Validação e normalização das fontes externas. */
import type {
  ExternalSourceForm,
  ExternalSourceRecord,
} from "./records";

export type ExternalSourceErrors = Partial<
  Record<keyof ExternalSourceForm, string>
>;

export function createExternalSourceForm(
  source?: ExternalSourceRecord | null,
): ExternalSourceForm {
  return {
    titulo: source?.titulo || "",
    provider: source?.provider || "",
    external_id: source?.external_id || "",
    external_url: source?.external_url || "",
    tipo_externo: source?.tipo_externo || "",
    principal: Boolean(source?.principal),
    ultima_sincronizacao: source?.ultima_sincronizacao?.slice(0, 16) || "",
    metadata_extra: source?.metadata_extra
      ? JSON.stringify(source.metadata_extra, null, 2)
      : "",
  };
}

export function validateExternalSource(
  value: ExternalSourceForm,
): ExternalSourceErrors {
  const errors: ExternalSourceErrors = {};
  if (!value.titulo) errors.titulo = "Selecciona um título do catálogo.";
  if (!value.provider) errors.provider = "Selecciona o provider.";
  if (!value.external_id.trim()) errors.external_id = "Indica o identificador externo.";
  if (value.external_id.length > 200) errors.external_id = "O identificador externo não pode exceder 200 caracteres.";
  if (value.external_url.length > 2000) errors.external_url = "O endereço externo não pode exceder 2000 caracteres.";
  if (value.external_url) {
    try { new URL(value.external_url); }
    catch { errors.external_url = "Indica um endereço HTTP ou HTTPS válido."; }
  }
  if (value.tipo_externo.length > 80) errors.tipo_externo = "O tipo externo não pode exceder 80 caracteres.";
  if (value.metadata_extra.trim()) {
    try { JSON.parse(value.metadata_extra); }
    catch { errors.metadata_extra = "Os metadados têm de conter JSON válido."; }
  }
  return errors;
}

export function externalSourceKey(
  value: Pick<ExternalSourceRecord, "provider" | "external_id" | "tipo_externo">,
): string {
  return [value.provider, value.external_id.trim(), value.tipo_externo?.trim() || ""]
    .join("::")
    .toLocaleLowerCase("pt-PT");
}

export function findExternalSourceDuplicate(
  value: ExternalSourceForm,
  records: ExternalSourceRecord[],
  excludeId = "",
): ExternalSourceRecord | undefined {
  const key = externalSourceKey({
    provider: value.provider as ExternalSourceRecord["provider"],
    external_id: value.external_id,
    tipo_externo: value.tipo_externo,
  });
  return records.find(
    (record) => record.id !== excludeId && externalSourceKey(record) === key,
  );
}
