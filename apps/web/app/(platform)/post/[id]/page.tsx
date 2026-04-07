import Link from "next/link";
import { notFound } from "next/navigation";
import { PostDetailClient } from "@/components/post/PostDetailClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${base}/api/posts/${id}`, { next: { revalidate: 0 } });
  if (res.status === 404) {
    notFound();
  }
  if (!res.ok) {
    return (
      <p className="text-sm text-red-700">
        No se pudo cargar el enunciado. Comprueba que la API esté en marcha.
      </p>
    );
  }
  const data = (await res.json()) as {
    post: {
      id: string;
      content: string;
      createdAt: string;
      author: { id: string; username: string };
    };
  };

  return (
    <div>
      <Link href="/feed" className="text-sm text-meliora-muted no-underline hover:text-meliora-ink">
        ← Volver al feed
      </Link>
      <article className="mt-6 rounded-lg border border-meliora-ink/10 bg-white p-6 shadow-sm">
        <p className="whitespace-pre-wrap text-lg text-meliora-ink">{data.post.content}</p>
        <p className="mt-4 text-sm text-meliora-muted">
          @{data.post.author.username} · {new Date(data.post.createdAt).toLocaleString()}
        </p>
      </article>
      <div className="mt-6">
        <PostDetailClient postId={data.post.id} authorId={data.post.author.id} />
      </div>
    </div>
  );
}
