/** Mediário | Indicadores locais de listas inteligentes alteradas. */
export interface ListChangeNotice {
  listId: string;
  listName: string;
  added: number;
  removed: number;
  checkedAt: string;
  read: boolean;
}

const KEY = "mediario-list-change-notices-v1";

export function loadListChangeNotices(): ListChangeNotice[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveListChangeNotice(
  notice: Omit<ListChangeNotice, "checkedAt" | "read">,
): ListChangeNotice[] {
  const value: ListChangeNotice = {
    ...notice,
    checkedAt: new Date().toISOString(),
    read: false,
  };
  const items = [
    value,
    ...loadListChangeNotices().filter((item) => item.listId !== notice.listId),
  ].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(items));
  return items;
}

export function markListNoticeRead(listId: string): ListChangeNotice[] {
  const items = loadListChangeNotices().map((item) =>
    item.listId === listId ? { ...item, read: true } : item,
  );
  localStorage.setItem(KEY, JSON.stringify(items));
  return items;
}

export function unreadListNoticeCount(): number {
  return loadListChangeNotices().filter((item) => !item.read).length;
}
