/** Mediário | ZIP 13B — notificações locais agregadas. */
import { pb } from "@/infrastructure/pocketbase/client";
import { loadListChangeNotices } from "@/domain/lists/listNotifications";

export type NotificationKind = "list" | "job" | "provider" | "backup";
export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  to: string;
  createdAt: string;
  read: boolean;
  severity: "info" | "warning" | "danger";
}

const READ_KEY = "mediario-notification-read-v1";
function readIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]")); }
  catch { return new Set(); }
}
function applyRead(items: AppNotification[]): AppNotification[] {
  const values = readIds();
  return items.map((item) => ({ ...item, read: values.has(item.id) }));
}

export async function loadAppNotifications(
  role?: string,
): Promise<AppNotification[]> {
  const items: AppNotification[] = loadListChangeNotices().map((notice) => ({
    id: `list:${notice.listId}:${notice.checkedAt}`,
    kind: "list",
    title: notice.listName,
    message: `${notice.added} novos e ${notice.removed} removidos.`,
    to: "/listas",
    createdAt: notice.checkedAt,
    read: notice.read,
    severity: notice.removed ? "warning" : "info",
  }));

  if (role === "admin" || role === "editor") {
    try {
      const jobs = await pb.collection("sync_jobs").getList(1, 20, {
        filter: 'estado = "falhou" || estado = "parcial"',
        sort: "-terminado_em,-updated",
        requestKey: "app-notifications-jobs",
      });
      for (const job of jobs.items as any[]) {
        items.push({
          id: `job:${job.id}:${job.updated}`,
          kind: "job",
          title: `Tarefa ${job.provider || "provider"} com problemas`,
          message: job.erro || `Estado: ${job.estado}`,
          to: "/manutencao",
          createdAt: job.terminado_em || job.updated,
          read: false,
          severity: job.estado === "falhou" ? "danger" : "warning",
        });
      }
    } catch { /* resultados de listas permanecem disponíveis */ }
  }

  if (role === "admin") {
    try {
      const response = await pb.send("/api/mediario/providers/admin/settings", { method: "GET" });
      for (const provider of response.providers || []) {
        if (!provider.credential_configured || provider.enabled === false) {
          items.push({
            id: `provider:${provider.provider}:${provider.credential_configured}:${provider.enabled}`,
            kind: "provider",
            title: `${provider.label} precisa de configuração`,
            message: !provider.credential_configured ? "Credencial em falta." : "Provider desativado.",
            to: "/administracao",
            createdAt: new Date().toISOString(),
            read: false,
            severity: "warning",
          });
        }
      }
    } catch { /* o painel administrativo continua acessível */ }
  }

  return applyRead(items)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 50);
}

export function markNotificationRead(id: string): void {
  const values = readIds();
  values.add(id);
  localStorage.setItem(READ_KEY, JSON.stringify([...values].slice(-200)));
}

export function markAllNotificationsRead(items: AppNotification[]): void {
  const values = readIds();
  for (const item of items) values.add(item.id);
  localStorage.setItem(READ_KEY, JSON.stringify([...values].slice(-200)));
}

export function unreadNotifications(items: AppNotification[]): number {
  return items.filter((item) => !item.read).length;
}
