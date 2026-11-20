import type { TitleRecord } from "@/types/records";
import { titleRepository } from "@/domain/repositories";

function localDateTime(): string {
  return new Date().toISOString().replace("T", " ").replace("Z", "Z");
}

export async function archiveTitle(id: string, reason = ""): Promise<TitleRecord> {
  return titleRepository.update(id, {
    apagado: true,
    apagado_em: localDateTime(),
    apagado_por: "local",
    motivo_eliminacao: reason.trim(),
  });
}

export async function restoreTitle(id: string): Promise<TitleRecord> {
  return titleRepository.update(id, {
    apagado: false,
    apagado_em: "",
    apagado_por: "",
    motivo_eliminacao: "",
  });
}

export async function permanentlyDeleteTitle(id: string): Promise<boolean> {
  return titleRepository.delete(id);
}
