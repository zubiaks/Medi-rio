/**
 * Projeto: Mediário
 * Ficheiro: src/domain/diary/statistics.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Regras de domínio TypeScript puras
 * Domínio: Diário e avaliações — Estatísticas
 *
 * Finalidade:
 * Calcula totais, tendências mensais, distribuição por tipo de média,
 * classificações e sequências de utilização a partir dos records já
 * carregados. Não consulta directamente o PocketBase.
 *
 * Regras:
 * - A duração consumida usa progresso_seg; na ausência de progresso usa
 *   duracao_seg apenas quando a sessão está concluída.
 * - As datas são agrupadas segundo o calendário local pt-PT.
 * - Não inventa duração, classificação ou tipo de média em falta.
 */
import type { DiaryEntryRecord, ReviewRecord } from "./records";

export interface DiaryStatistics {
  totalEntries: number;
  completedEntries: number;
  rewatches: number;
  totalSeconds: number;
  totalHours: number;
  averageProgress: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  reviews: number;
  averageRating: number | null;
  recommendedReviews: number;
}

export interface MonthlyActivity {
  month: string;
  label: string;
  entries: number;
  completed: number;
  seconds: number;
  hours: number;
}

export interface MediaDistribution {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

function localDateKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function consumedSeconds(entry: DiaryEntryRecord): number {
  if (typeof entry.progresso_seg === "number" && entry.progresso_seg > 0) {
    return entry.progresso_seg;
  }

  if (entry.completo && typeof entry.duracao_seg === "number") {
    return Math.max(0, entry.duracao_seg);
  }

  return 0;
}

function calculateStreaks(dateKeys: string[], today: Date): {
  current: number;
  longest: number;
} {
  const unique = [...new Set(dateKeys)].sort();
  if (!unique.length) return { current: 0, longest: 0 };

  let longest = 1;
  let running = 1;

  for (let index = 1; index < unique.length; index += 1) {
    const previous = new Date(`${unique[index - 1]}T12:00:00`);
    const current = new Date(`${unique[index]}T12:00:00`);
    const difference = Math.round(
      (current.getTime() - previous.getTime()) / 86_400_000,
    );

    running = difference === 1 ? running + 1 : 1;
    longest = Math.max(longest, running);
  }

  const todayKey = localDateKey(today.toISOString());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = localDateKey(yesterday.toISOString());

  if (!unique.includes(todayKey) && !unique.includes(yesterdayKey)) {
    return { current: 0, longest };
  }

  let currentStreak = 0;
  const cursor = unique.includes(todayKey) ? new Date(today) : yesterday;

  while (unique.includes(localDateKey(cursor.toISOString()))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current: currentStreak, longest };
}

export function buildDiaryStatistics(
  entries: DiaryEntryRecord[],
  reviews: ReviewRecord[],
  today = new Date(),
): DiaryStatistics {
  const totalSeconds = entries.reduce(
    (total, entry) => total + consumedSeconds(entry),
    0,
  );
  const dateKeys = entries
    .map((entry) => entry.iniciado_em)
    .filter(Boolean)
    .map(localDateKey);
  const streaks = calculateStreaks(dateKeys, today);
  const ratings = reviews
    .map((review) => review.rating)
    .filter((rating): rating is number => typeof rating === "number");

  return {
    totalEntries: entries.length,
    completedEntries: entries.filter((entry) => entry.completo).length,
    rewatches: entries.filter((entry) => entry.revisualizacao).length,
    totalSeconds,
    totalHours: Math.round((totalSeconds / 3600) * 10) / 10,
    averageProgress: entries.length
      ? Math.round(
          entries.reduce(
            (total, entry) => total + (entry.percentagem || 0),
            0,
          ) / entries.length,
        )
      : 0,
    activeDays: new Set(dateKeys).size,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    reviews: reviews.length,
    averageRating: ratings.length
      ? Math.round(
          (ratings.reduce((total, rating) => total + rating, 0) /
            ratings.length) *
            10,
        ) / 10
      : null,
    recommendedReviews: reviews.filter((review) => review.recomenda).length,
  };
}

export function buildMonthlyActivity(
  entries: DiaryEntryRecord[],
  year: number,
): MonthlyActivity[] {
  return Array.from({ length: 12 }, (_, monthIndex) => {
    const month = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    const monthEntries = entries.filter((entry) =>
      localDateKey(entry.iniciado_em).startsWith(month),
    );
    const seconds = monthEntries.reduce(
      (total, entry) => total + consumedSeconds(entry),
      0,
    );

    return {
      month,
      label: new Intl.DateTimeFormat("pt-PT", { month: "short" }).format(
        new Date(year, monthIndex, 1),
      ),
      entries: monthEntries.length,
      completed: monthEntries.filter((entry) => entry.completo).length,
      seconds,
      hours: Math.round((seconds / 3600) * 10) / 10,
    };
  });
}

export function buildMediaDistribution(
  entries: DiaryEntryRecord[],
): MediaDistribution[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const entry of entries) {
    const title = entry.expand?.titulo;
    const key = title?.midia || "sem-tipo";
    const label = title?.midia || "Sem tipo de média";
    const current = counts.get(key) || { label, count: 0 };
    current.count += 1;
    counts.set(key, current);
  }

  return [...counts.entries()]
    .map(([key, value]) => ({
      key,
      label: value.label,
      count: value.count,
      percentage: entries.length
        ? Math.round((value.count / entries.length) * 100)
        : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-PT"));
}
