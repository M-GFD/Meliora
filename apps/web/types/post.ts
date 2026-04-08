export type PostAuthor = { id: string; username: string };

export type FeedPost = {
  id: string;
  content: string;
  createdAt: string;
  author: PostAuthor;
  topic?: { id: string; name: string } | null;
  consensusSpace?: { id: string; status: "ACTIVE" | "MATURE" } | null;
};
