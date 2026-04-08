import type { FeedPost } from "@/types/post";
import Link from "next/link";
import { VotePanel } from "./VotePanel";

export function PostCard({ post }: { post: FeedPost }) {
  return (
    <article className="rounded-lg border border-meliora-ink/10 bg-white p-4 shadow-sm">
      <p className="whitespace-pre-wrap text-meliora-ink">{post.content}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-meliora-muted">
        <span>@{post.author.username}</span>
        <span aria-hidden>·</span>
        <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString()}</time>
      </div>
      {post.consensusSpace ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-meliora-accent/30 bg-meliora-accent/10 px-2.5 py-1 text-xs font-medium text-meliora-ink">
            Espacio {post.consensusSpace.status === "MATURE" ? "maduro" : "abierto"}
          </span>
          <Link
            href={`/consensus/${post.consensusSpace.id}`}
            className="rounded-full border border-meliora-ink/15 px-3 py-1 text-xs font-medium text-meliora-muted hover:border-meliora-accent hover:text-meliora-ink"
          >
            Entrar al espacio
          </Link>
        </div>
      ) : null}
      <VotePanel postId={post.id} authorId={post.author.id} />
    </article>
  );
}
