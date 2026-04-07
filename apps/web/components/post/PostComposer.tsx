"use client";

import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export function PostComposer() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) {
        throw new Error("Inicia sesión para publicar");
      }
      return apiFetch("/api/posts", {
        method: "POST",
        token: session.accessToken,
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      setContent("");
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  if (!session?.accessToken) {
    return null;
  }

  return (
    <form
      className="mb-8 rounded-lg border border-meliora-ink/10 bg-white p-4 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (content.trim().length === 0) return;
        mutation.mutate();
      }}
    >
      <label htmlFor="post-content" className="sr-only">
        Nuevo enunciado (máx. 280 caracteres)
      </label>
      <textarea
        id="post-content"
        maxLength={280}
        rows={3}
        value={content}
        onChange={(ev) => setContent(ev.target.value)}
        placeholder="Escribe un enunciado breve (sin respuestas directas)…"
        className="w-full resize-none rounded-md border border-meliora-ink/10 bg-meliora-paper/50 px-3 py-2 text-sm text-meliora-ink outline-none ring-meliora-accent focus:ring-2"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-meliora-muted">{content.length}/280</span>
        <button
          type="submit"
          disabled={mutation.isPending || content.trim().length === 0}
          className="rounded-md bg-meliora-accent px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {mutation.isPending ? "Publicando…" : "Publicar"}
        </button>
      </div>
      {mutation.isError ? (
        <p className="mt-2 text-xs text-red-700">
          {mutation.error instanceof Error ? mutation.error.message : "Error al publicar"}
        </p>
      ) : null}
    </form>
  );
}
