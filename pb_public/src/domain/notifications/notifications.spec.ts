import { beforeEach, describe, expect, it } from "vitest";
import { markAllNotificationsRead, unreadNotifications } from "./notifications";
beforeEach(() => localStorage.clear());
describe("notificações", () => {
  it("conta e marca notificações", () => {
    const items = [{ id: "a", read: false }, { id: "b", read: true }] as any;
    expect(unreadNotifications(items)).toBe(1);
    markAllNotificationsRead(items);
    expect(JSON.parse(localStorage.getItem("mediario-notification-read-v1") || "[]")).toContain("a");
  });
});
