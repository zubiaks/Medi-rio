/** Agrupa registos do Diário por dia e produz uma vista mensal. */
import type { DiaryEntryRecord } from "./records";

export interface CalendarDay {
  date: string;
  day: number;
  inMonth: boolean;
  entries: DiaryEntryRecord[];
}

export function buildDiaryCalendar(
  year: number,
  month: number,
  entries: DiaryEntryRecord[],
): CalendarDay[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - mondayOffset);
  const totalCells = Math.ceil((mondayOffset + last.getDate()) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    return {
      date: key,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      entries: entries.filter(
        (entry) => entry.iniciado_em?.slice(0, 10) === key,
      ),
    };
  });
}
