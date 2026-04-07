"use client";

import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { DocumentViewer } from "./DocumentViewer";

type Statement = {
  id: string;
  content: string;
  intent: string;
  author: { id: string; username: string };
};

type Space = {
  id: string;
  status: string;
  anchorPostId: string;
  statements: Statement[];
  document: { id: string; content: unknown; createdAt: string } | null;
};

export function ConsensusSpaceClient({ space }: { space: Space }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [intent, setIntent] = useState<"EXPAND_AGREEMENT" | "EXPLORE_DISAGREEMENT">(
    "EXPAND_AGREEMENT",
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) {
        throw new Error("Inicia sesión para añadir un enunciado");
      }
      return apiFetch(`/api/consensus/${space.id}/statement`, {
        method: "POST",
        token: session.accessToken,
        body: JSON.stringify({ content, intent }),
      });
    },
    onSuccess: () => {
      setContent("");
      void queryClient.invalidateQueries({ queryKey: ["consensus", space.id] });
      router.refresh();
    },
  });

  return (
    <div className="mt-8 space-y-8">
      {space.document ? (
        <DocumentViewer document={space.document} />
      ) : (
        <p className="text-sm text-meliora-muted">
          Aún no hay documento de consenso generado para este espacio.
        </p>
      )}

      <section>
        <h2 className="text-sm font-semibold text-meliora-ink">Enunciados en el espacio</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {space.statements.map((s) => (
            <li
              key={s.id}
              className="rounded-md border border-meliora-ink/10 bg-white p-3 text-sm text-meliora-ink"
            >
              <p className="whitespace-pre-wrap">{s.content}</p>
              <p className="mt-2 text-xs text-meliora-muted">
                @{s.author.username} · {s.intent}
              </p>
            </li>
          ))}
        </ul>
        {space.statements.length === 0 ? (
          <p className="mt-2 text-sm text-meliora-muted">Sin enunciados todavía.</p>
        ) : null}
      </section>

      {session?.accessToken ? (
        <form
          className="rounded-lg border border-meliora-ink/10 bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!content.trim()) return;
            mutation.mutate();
          }}
        >
          <h2 className="text-sm font-semibold text-meliora-ink">Nuevo enunciado votable</h2>
          <label className="mt-3 block text-xs text-meliora-muted" htmlFor="intent">
            Intención
          </label>
          <select
            id="intent"
            value={intent}
            onChange={(ev) =>
              setIntent(ev.target.value as "EXPAND_AGREEMENT" | "EXPLORE_DISAGREEMENT")
            }
            className="mt-1 w-full rounded-md border border-meliora-ink/15 bg-meliora-paper/50 px-2 py-1 text-sm"
          >
            <option value="EXPAND_AGREEMENT">Ampliar acuerdo</option>
            <option value="EXPLORE_DISAGREEMENT">Explorar desacuerdo</option>
          </select>
          <textarea
            maxLength={280}
            rows={3}
            value={content}
            onChange={(ev) => setContent(ev.target.value)}
            className="mt-3 w-full resize-none rounded-md border border-meliora-ink/10 px-3 py-2 text-sm"
            placeholder="Enunciado (sin chat libre)…"
          />
          <button
            type="submit"
            disabled={mutation.isPending || !content.trim()}
            className="mt-2 rounded-md bg-meliora-accent px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            Enviar
          </button>
          {mutation.isError ? (
            <p className="mt-2 text-xs text-red-700">
              {mutation.error instanceof Error ? mutation.error.message : "Error"}
            </p>
          ) : null}
        </form>
      ) : (
        <p className="text-sm text-meliora-muted">
          <a href="/login">Inicia sesión</a> para proponer enunciados en este espacio.
        </p>
      )}
    </div>
  );
}
