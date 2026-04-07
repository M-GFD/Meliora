import { NotificationPanel } from "@/components/notifications/NotificationPanel";

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-meliora-ink">Avisos</h1>
      <p className="mt-2 text-sm text-meliora-muted">
        Información sobre alcance entre grupos, no métricas de vanidad.
      </p>
      <div className="mt-8">
        <NotificationPanel />
      </div>
    </div>
  );
}
