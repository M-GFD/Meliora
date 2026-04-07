import Link from "next/link";
import { notFound } from "next/navigation";
import { ClusterMap } from "@/components/cluster/ClusterMap";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClusterPage({ params }: PageProps) {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${base}/api/clusters/${id}`, { next: { revalidate: 0 } });
  if (res.status === 404) {
    notFound();
  }
  if (!res.ok) {
    return <p className="text-sm text-red-700">No se pudo cargar el cluster.</p>;
  }
  const data = (await res.json()) as { cluster: { id: string; vectorSignature: unknown } };

  return (
    <div>
      <Link href="/feed" className="text-sm text-meliora-muted no-underline hover:text-meliora-ink">
        ← Feed
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-meliora-ink">Opinión en el mapa</h1>
      <p className="mt-2 text-sm text-meliora-muted">
        Los clusters no tienen nombre propio: se identifican por su firma en el espacio de votos.
      </p>
      <div className="mt-6">
        <ClusterMap clusterId={data.cluster.id} signature={data.cluster.vectorSignature} />
      </div>
    </div>
  );
}
