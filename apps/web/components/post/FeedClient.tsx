"use client";

import { useQuery } from "@tanstack/react-query";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";
import { apiFetch } from "@/lib/api";
import type { FeedPost } from "@/types/post";

type FeedResponse = { posts: FeedPost[] };

export function FeedClient({ accessToken }: { accessToken: string | null }) {
  const query = useQuery({
    queryKey: ["feed"],
    queryFn: () =>
      apiFetch<FeedResponse>("/api/posts/feed", {
        token: accessToken,
      }),
  });

  if (query.isLoading) {
    return <p className="text-sm text-meliora-muted">Cargando enunciados…</p>;
  }

  if (query.isError) {
    return (
      <p className="text-sm text-red-700">
        No se pudo cargar el feed. ¿Está la API en marcha?
      </p>
    );
  }

  const posts = query.data?.posts ?? [];

  return (
    <div>
      <PostComposer />
      <ul className="flex flex-col gap-4">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
      {posts.length === 0 ? (
        <p className="text-sm text-meliora-muted">Aún no hay enunciados. Sé el primero.</p>
      ) : null}
    </div>
  );
}
