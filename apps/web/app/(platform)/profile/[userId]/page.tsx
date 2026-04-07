import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ userId: string }> };

export default async function ProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${base}/api/users/${userId}`, { next: { revalidate: 0 } });
  if (res.status === 404) {
    notFound();
  }
  if (!res.ok) {
    return <p className="text-sm text-red-700">No se pudo cargar el perfil.</p>;
  }
  const data = (await res.json()) as { user: { id: string; username: string; createdAt: string } };

  return (
    <div>
      <Link href="/feed" className="text-sm text-meliora-muted no-underline hover:text-meliora-ink">
        ← Feed
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-meliora-ink">@{data.user.username}</h1>
      <p className="mt-2 text-sm text-meliora-muted">
        Sin contadores públicos de seguidores ni “likes” — solo identidad y participación en la
        plataforma.
      </p>
      <p className="mt-4 text-xs text-meliora-muted">
        Miembro desde {new Date(data.user.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
