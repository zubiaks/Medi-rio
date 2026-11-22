/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbLocalImages.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço TypeScript
 * Domínio: Providers / imagens locais
 * Finalidade: Transferir uma imagem TMDB selecionada para um campo file.
 */
import { pb } from "@/infrastructure/pocketbase/client";
import type { TmdbImageKind } from "./tmdbImages";

const limits: Record<TmdbImageKind, number> = {
  poster: 5 * 1024 * 1024,
  backdrop: 5 * 1024 * 1024,
  logo: 2 * 1024 * 1024,
};

export async function saveTmdbImageLocally(
  titleId: string,
  kind: TmdbImageKind,
  url: string,
): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao descarregar a imagem: HTTP ${response.status}.`);
  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) throw new Error("O ficheiro recebido não é uma imagem.");
  if (blob.size > limits[kind]) {
    throw new Error(`A imagem excede o limite de ${limits[kind] / 1024 / 1024} MB.`);
  }
  const extension = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
  const form = new FormData();
  form.append(kind, blob, `tmdb-${kind}.${extension}`);
  await pb.collection("titulos").update(titleId, form);
}
