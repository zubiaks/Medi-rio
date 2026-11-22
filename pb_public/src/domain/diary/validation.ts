/** Regras de validação e normalização do Diário e das avaliações. */
import type {
  DiaryEntryForm,
  DiaryEntryRecord,
  ReviewForm,
  ReviewRecord,
} from "./records";

export type DiaryEntryErrors = Partial<Record<keyof DiaryEntryForm, string>>;
export type ReviewErrors = Partial<Record<keyof ReviewForm, string>>;

function toLocalDateTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function createDiaryEntryForm(
  entry?: DiaryEntryRecord | null,
): DiaryEntryForm {
  return {
    titulo: entry?.titulo || "",
    temporada: entry?.temporada || "",
    episodio: entry?.episodio || "",
    iniciado_em: toLocalDateTime(entry?.iniciado_em) ||
      toLocalDateTime(new Date().toISOString()),
    terminado_em: toLocalDateTime(entry?.terminado_em),
    duracao_seg: entry?.duracao_seg ?? null,
    progresso_seg: entry?.progresso_seg ?? null,
    completo: Boolean(entry?.completo),
    revisualizacao: Boolean(entry?.revisualizacao),
    origem: entry?.origem || "",
    plataforma: entry?.plataforma || "",
    notas: entry?.notas || "",
  };
}

export function calculatePercentage(
  progress: number | null,
  duration: number | null,
  complete: boolean,
): number {
  if (complete) return 100;
  if (!duration || duration <= 0 || progress === null || progress <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((progress / duration) * 100)));
}

export function validateDiaryEntry(
  value: DiaryEntryForm,
): DiaryEntryErrors {
  const errors: DiaryEntryErrors = {};
  if (!value.titulo) errors.titulo = "Selecciona um título do catálogo.";
  if (!value.iniciado_em) errors.iniciado_em = "Indica a data e hora de início.";
  if (value.terminado_em && value.terminado_em < value.iniciado_em) {
    errors.terminado_em = "A conclusão não pode ser anterior ao início.";
  }
  if (value.duracao_seg !== null && value.duracao_seg < 0) {
    errors.duracao_seg = "A duração não pode ser negativa.";
  }
  if (value.progresso_seg !== null && value.progresso_seg < 0) {
    errors.progresso_seg = "O progresso não pode ser negativo.";
  }
  if (
    value.duracao_seg !== null &&
    value.progresso_seg !== null &&
    value.progresso_seg > value.duracao_seg
  ) {
    errors.progresso_seg = "O progresso não pode exceder a duração.";
  }
  if (value.notas.length > 5000) {
    errors.notas = "As notas não podem exceder 5000 caracteres.";
  }
  return errors;
}

export function createReviewForm(review?: ReviewRecord | null): ReviewForm {
  return {
    titulo: review?.titulo || "",
    titulo_review: review?.titulo_review || "",
    rating: review?.rating ?? null,
    texto: review?.texto || "",
    tem_spoilers: Boolean(review?.tem_spoilers),
    favorito: Boolean(review?.favorito),
    recomenda: Boolean(review?.recomenda),
    tags_review: review?.tags_review || [],
    estado_publicacao:
      review?.estado_publicacao === "Publicado" ||
      review?.estado_publicacao === "Arquivado"
        ? review.estado_publicacao
        : "Rascunho",
    data_visto: review?.data_visto?.slice(0, 10) || "",
    data_publicacao: review?.data_publicacao?.slice(0, 10) || "",
    revisao_numero: review?.revisao_numero || 1,
  };
}

export function validateReview(value: ReviewForm): ReviewErrors {
  const errors: ReviewErrors = {};
  if (!value.titulo) errors.titulo = "Selecciona um título do catálogo.";
  if (value.rating !== null && (value.rating < 0 || value.rating > 10)) {
    errors.rating = "A classificação deve ficar entre 0 e 10.";
  }
  if (value.titulo_review.length > 200) {
    errors.titulo_review = "O título da avaliação não pode exceder 200 caracteres.";
  }
  if (value.texto.length > 20_000) {
    errors.texto = "O texto não pode exceder 20 000 caracteres.";
  }
  if (value.estado_publicacao === "Publicado" && !value.texto.trim()) {
    errors.texto = "Escreve a avaliação antes de a publicar.";
  }
  if (value.data_publicacao && value.data_visto && value.data_publicacao < value.data_visto) {
    errors.data_publicacao = "A publicação não pode ser anterior à data de consumo.";
  }
  return errors;
}

export const hasErrors = (errors: object): boolean =>
  Object.keys(errors).length > 0;
