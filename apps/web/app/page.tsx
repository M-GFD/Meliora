import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-meliora-muted">
          Meliora
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-meliora-ink">
          Ever better things
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-meliora-muted">
          Plataforma de deliberación cívica: consenso transversal, espacios de consenso y
          documentos compartidos — sin métricas de vanidad visibles antes de participar.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/feed"
          className="rounded-md bg-meliora-ink px-5 py-2.5 text-sm font-medium text-meliora-paper no-underline hover:bg-meliora-accent"
        >
          Explorar plataforma
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-meliora-ink/15 px-5 py-2.5 text-sm font-medium text-meliora-ink no-underline hover:border-meliora-accent hover:text-meliora-accent"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="rounded-md px-5 py-2.5 text-sm font-medium text-meliora-muted no-underline hover:text-meliora-ink"
        >
          Crear cuenta
        </Link>
      </div>
      <p className="text-sm text-meliora-muted">
        Puedes ver el feed y la mayoría de vistas sin cuenta; para publicar o votar necesitas iniciar
        sesión.
      </p>
    </main>
  );
}
