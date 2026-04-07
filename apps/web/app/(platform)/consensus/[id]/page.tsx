import Link from "next/link";
import { notFound } from "next/navigation";
import { ConsensusSpaceClient } from "@/components/consensus/ConsensusSpaceClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function ConsensusPage({ params }: PageProps) {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${base}/api/consensus/${id}`, { next: { revalidate: 0 } });
  if (res.status === 404) {
    notFound();
  }
  if (!res.ok) {
    return <p className="text-sm text-red-700">No se pudo cargar el espacio de consenso.</p>;
  }
  const data = (await res.json()) as {
    space: {
      id: string;
      status: string;
      anchorPostId: string;
      statements: {
        id: string;
        content: string;
        intent: string;
        author: { id: string; username: string };
      }[];
      document: { id: string; content: unknown; createdAt: string } | null;
    };
  };

  return (
    <div>
      <Link href="/feed" className="text-sm text-meliora-muted no-underline hover:text-meliora-ink">
        ← Feed
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-meliora-ink">Espacio de consenso</h1>
      <p className="mt-2 text-sm text-meliora-muted">
        Estado: <span className="font-medium text-meliora-ink">{data.space.status}</span> · Post
        ancla:{" "}
        <Link href={`/post/${data.space.anchorPostId}`} className="text-meliora-accent">
          ver enunciado
        </Link>
      </p>
      <ConsensusSpaceClient space={data.space} />
    </div>
  );
}
