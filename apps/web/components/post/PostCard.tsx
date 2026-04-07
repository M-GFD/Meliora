import type { FeedPost } from "@/types/post";
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
      <VotePanel postId={post.id} authorId={post.author.id} />
    </article>
  );
}
