import Link from "next/link";

type PageProps = { params: Promise<{ clusterId: string }> };

export default async function CoordinationPage({ params }: PageProps) {
  const { clusterId } = await params;

  return (
    <div>
      <Link href={`/cluster/${clusterId}`} className="text-sm text-meliora-muted no-underline hover:text-meliora-ink">
        ← Firma del cluster
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-meliora-ink">Canal de coordinación</h1>
      <p className="mt-2 text-sm text-meliora-muted">
        Aquí va la planificación de acción dentro del cluster (no debate cruzado). Esta vista es un
        esqueleto: conecta mensajería o tareas según el producto.
      </p>
      <div className="mt-8 rounded-lg border border-dashed border-meliora-ink/20 bg-white p-8 text-center text-sm text-meliora-muted">
        Cluster <span className="font-mono text-meliora-ink">{clusterId}</span>
      </div>
    </div>
  );
}
