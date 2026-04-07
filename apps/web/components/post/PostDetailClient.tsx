"use client";

import { VotePanel } from "./VotePanel";

export function PostDetailClient({ postId, authorId }: { postId: string; authorId: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-meliora-ink">Tu reacción</h2>
      <VotePanel postId={postId} authorId={authorId} />
    </div>
  );
}
