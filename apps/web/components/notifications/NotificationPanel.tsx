"use client";

import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export function NotificationPanel() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    enabled: Boolean(session?.accessToken),
    queryFn: () =>
      apiFetch<{ notifications: NotificationItem[] }>("/api/notifications", {
        token: session!.accessToken!,
      }),
  });

  const markRead = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        token: session!.accessToken!,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (!session?.accessToken) {
    return <p className="text-sm text-meliora-muted">Inicia sesión para ver avisos.</p>;
  }

  if (query.isLoading) {
    return <p className="text-sm text-meliora-muted">Cargando…</p>;
  }

  if (query.isError) {
    return <p className="text-sm text-red-700">No se pudieron cargar los avisos.</p>;
  }

  const items = query.data?.notifications ?? [];

  return (
    <ul className="flex flex-col gap-3">
      {items.map((n) => (
        <li
          key={n.id}
          className={`rounded-lg border p-4 ${
            n.read ? "border-meliora-ink/10 bg-white" : "border-meliora-accent/40 bg-meliora-accent/5"
          }`}
        >
          <p className="font-medium text-meliora-ink">{n.title}</p>
          <p className="mt-1 text-sm text-meliora-muted">{n.body}</p>
          <p className="mt-2 text-xs text-meliora-muted">
            {new Date(n.createdAt).toLocaleString()}
          </p>
          {!n.read ? (
            <button
              type="button"
              onClick={() => markRead.mutate(n.id)}
              className="mt-3 text-xs font-medium text-meliora-accent"
            >
              Marcar leído
            </button>
          ) : null}
        </li>
      ))}
      {items.length === 0 ? (
        <p className="text-sm text-meliora-muted">No hay avisos por ahora.</p>
      ) : null}
    </ul>
  );
}
