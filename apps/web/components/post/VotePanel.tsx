"use client";

import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import type { VoteType } from "@meliora/shared-types";

const OPTIONS: { value: VoteType; label: string }[] = [
  { value: "AGREE", label: "De acuerdo" },
  { value: "DISAGREE", label: "En desacuerdo" },
  { value: "PARTIALLY", label: "Parcialmente" },
  { value: "RELEVANT", label: "Relevante" },
  { value: "IRRELEVANT", label: "Irrelevante" },
  { value: "NEW_TO_ME", label: "Nuevo para mí" },
];

type VotePanelProps = {
  postId: string;
  authorId: string;
};

export function VotePanel({ postId, authorId }: VotePanelProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [localChoice, setLocalChoice] = useState<VoteType | null>(null);

  const mutation = useMutation({
    mutationFn: async (type: VoteType) => {
      if (!session?.accessToken) {
        throw new Error("Inicia sesión para votar");
      }
      return apiFetch<{ vote: { type: VoteType } }>(`/api/posts/${postId}/vote`, {
        method: "POST",
        token: session.accessToken,
        body: JSON.stringify({ type }),
      });
    },
    onMutate: async (type) => {
      setLocalChoice(type);
    },
    onError: () => {
      setLocalChoice(null);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  if (!session?.user?.id) {
    return <p className="text-xs text-meliora-muted">Inicia sesión para votar.</p>;
  }

  if (session.user.id === authorId) {
    return <p className="text-xs text-meliora-muted">No puedes votar tu propio enunciado.</p>;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={mutation.isPending}
          aria-pressed={localChoice === opt.value}
          onClick={() => mutation.mutate(opt.value)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            localChoice === opt.value
              ? "border-meliora-accent bg-meliora-accent/10 text-meliora-ink"
              : "border-meliora-ink/15 text-meliora-muted hover:border-meliora-accent hover:text-meliora-ink"
          }`}
        >
          {opt.label}
        </button>
      ))}
      {mutation.isError ? (
        <p className="w-full text-xs text-red-700">
          {mutation.error instanceof Error ? mutation.error.message : "Error al votar"}
        </p>
      ) : null}
      {localChoice ? (
        <p className="w-full text-xs text-meliora-muted">
          Tu reacción registrada:{" "}
          <span className="font-medium text-meliora-ink">{localChoice}</span>. Los totales no se
          muestran antes de participar en esta versión.
        </p>
      ) : null}
    </div>
  );
}
