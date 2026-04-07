import { FeedClient } from "@/components/post/FeedClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  return (
    <div>
      <h1 className="text-xl font-semibold text-meliora-ink">Votación abierta</h1>
      <p className="mt-1 text-sm text-meliora-muted">
        Las reacciones no muestran totales hasta que participas — así se reduce el arrastre de manada.
      </p>
      <div className="mt-8">
        <FeedClient accessToken={session?.accessToken ?? null} />
      </div>
    </div>
  );
}
