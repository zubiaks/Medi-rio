import { beforeEach, describe, expect, it } from "vitest";
import {
  clearListActivity,
  loadListActivity,
  recordListActivity,
} from "./listActivity";
import {
  loadListChangeNotices,
  saveListChangeNotice,
  unreadListNoticeCount,
} from "./listNotifications";

beforeEach(() => localStorage.clear());

describe("Fase 10.3", () => {
  it("mantém até cem atividades", () => {
    clearListActivity();
    recordListActivity({
      type: "updated",
      listId: "l1",
      listName: "Clássicos",
      message: "Atualizada",
    });
    expect(loadListActivity()).toHaveLength(1);
  });

  it("substitui o aviso anterior da mesma lista", () => {
    saveListChangeNotice({ listId: "l1", listName: "Clássicos", added: 2, removed: 0 });
    saveListChangeNotice({ listId: "l1", listName: "Clássicos", added: 1, removed: 1 });
    expect(loadListChangeNotices()).toHaveLength(1);
    expect(unreadListNoticeCount()).toBe(1);
  });
});
