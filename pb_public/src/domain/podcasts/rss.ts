/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 * See LICENSE.md.
 */
export interface ParsedPodcastEpisode {
  guid: string;
  titulo: string;
  descricao: string;
  audioUrl: string;
  audioType: string;
  duracaoSeg: number | null;
  publicadoEm: string;
  link: string;
  imagemUrl: string;
  numeroEpisodio: number | null;
  numeroTemporada: number | null;
  explicito: boolean | string | null;
}

const text = (node: ParentNode, selector: string): string =>
  node.querySelector(selector)?.textContent?.trim() || "";

function namespacedText(node: ParentNode, localName: string): string {
  const elements = node.getElementsByTagNameNS?.("*", localName);
  return elements?.[0]?.textContent?.trim() || "";
}

function parseDuration(value: string): number | null {
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number(value);
  const parts = value.split(":").map(Number);
  if (parts.some(Number.isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

function toPocketBaseDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function imageFrom(item: Element): string {
  const image = item.getElementsByTagNameNS("*", "image")[0];
  const href = image?.getAttribute("href");
  if (href) return href;
  const media = Array.from(item.getElementsByTagNameNS("*", "content"))
    .find((node) => node.getAttribute("medium") === "image");
  return media?.getAttribute("url") || text(item, "image url");
}

function explicitFrom(value: string): boolean | string | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (["yes", "true", "explicit", "1"].includes(normalized)) return true;
  if (["no", "false", "clean", "0"].includes(normalized)) return false;
  return value;
}

export function parsePodcastFeed(xml: string): ParsedPodcastEpisode[] {
  const documentValue = new DOMParser().parseFromString(xml, "application/xml");
  if (documentValue.querySelector("parsererror")) {
    throw new Error("O feed RSS devolveu XML inválido.");
  }

  return Array.from(documentValue.querySelectorAll("item, entry")).map((item) => {
    const enclosure = item.querySelector("enclosure") || item.querySelector("link[rel='enclosure']");
    const audioUrl = enclosure?.getAttribute("url") || enclosure?.getAttribute("href") || "";
    const audioType = enclosure?.getAttribute("type") || "";
    const linkElement = item.querySelector("link:not([rel]), link[rel='alternate']");
    const link = linkElement?.getAttribute("href") || linkElement?.textContent?.trim() || "";
    const title = text(item, "title") || "Episódio sem título";
    const published = text(item, "pubDate, published, updated");
    const guid = text(item, "guid, id") || link || audioUrl || `${title}-${published}`;

    return {
      guid,
      titulo: title,
      descricao: namespacedText(item, "encoded") || text(item, "description, summary, content"),
      audioUrl,
      audioType,
      duracaoSeg: parseDuration(namespacedText(item, "duration")),
      publicadoEm: toPocketBaseDate(published),
      link,
      imagemUrl: imageFrom(item),
      numeroEpisodio: Number(namespacedText(item, "episode")) || null,
      numeroTemporada: Number(namespacedText(item, "season")) || null,
      explicito: explicitFrom(namespacedText(item, "explicit")),
    };
  });
}
