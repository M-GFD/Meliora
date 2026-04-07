import Link from "next/link";

export function ClusterBadge({ clusterId }: { clusterId: string }) {
  return (
    <Link
      href={`/cluster/${clusterId}`}
      className="inline-flex items-center rounded-full border border-meliora-ink/15 px-2 py-0.5 text-xs text-meliora-muted no-underline hover:border-meliora-accent hover:text-meliora-ink"
    >
      Ver firma
    </Link>
  );
}
